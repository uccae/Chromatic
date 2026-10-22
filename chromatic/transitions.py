"""Single replaceable worker per light, rate limits and measurable error backoff."""

from __future__ import annotations

import asyncio
import time
from collections import deque
from collections.abc import Awaitable, Callable
from dataclasses import dataclass

from .color import Lab, distance, ease, mix


@dataclass(frozen=True)
class Decision:
    strategy: str
    reason: str
    hz: float


def decide(p: dict, supports_transition: bool, unstable: bool = False) -> Decision:
    requested = p["strategy"]
    hz = min(p["software_hz"], 10 if p["high_rate_confirmed"] else 5)
    if requested == "disabled":
        return Decision("disabled", "transition_disabled", 0)
    if requested == "software":
        return Decision("software", "software_explicit", hz)
    if supports_transition and not unstable:
        return Decision("hardware", "hardware_advertised_not_verified", 0)
    if requested == "hardware":
        return Decision(
            "disabled", "hardware_unstable" if unstable else "hardware_not_advertised", 0
        )
    if p["allow_software"]:
        return Decision(
            "software",
            "hardware_unstable_software_fallback" if unstable else "auto_software_fallback",
            hz,
        )
    return Decision(
        "disabled",
        "hardware_unstable_fallback_forbidden" if unstable else "auto_software_forbidden",
        0,
    )


class TransitionWorker:
    """One task and one service call at most. Replacing a goal awaits cancellation."""

    def __init__(
        self,
        send: Callable[..., Awaitable],
        current: Callable,
        changed: Callable,
        clock: Callable = time.monotonic,
    ) -> None:
        self.send = send
        self.current = current
        self.changed = changed
        self.clock = clock
        self.task: asyncio.Task | None = None
        self.last: tuple[Lab, float] | None = None
        self.last_sent = -float("inf")
        self.errors = 0
        self.total_errors = 0
        self.commands = 0
        self.timestamps: deque[float] = deque(maxlen=40)
        self.retry_at = 0.0
        self.unstable = False
        self.decision = Decision("disabled", "waiting", 0)
        self.effective_hz = 0.0
        self.closed = False
        self._lock = asyncio.Lock()

    async def cancel(self) -> None:
        if self.task and not self.task.done():
            self.task.cancel()
            await asyncio.gather(self.task, return_exceptions=True)
        self.task = None

    async def close(self) -> None:
        self.closed = True
        await self.cancel()

    async def move(
        self,
        goal: tuple[Lab, float],
        duration: float,
        p: dict,
        supports_transition: bool,
        *,
        sampler: Callable | None = None,
        stream_for: float = 0,
        blend: bool = True,
    ) -> None:
        async with self._lock:
            await self.cancel()
            if self.closed or self.clock() < self.retry_at:
                return
            self.decision = decide(p, supports_transition, self.unstable)
            self.effective_hz = self.decision.hz / max(1, 2**self.errors)
            self.task = asyncio.create_task(
                self._run(goal, duration, p, sampler, stream_for, blend),
                name="chromatic-transition",
            )

    async def _emit(
        self, value: tuple[Lab, float], transition: float | None, interval: float, threshold: float
    ) -> bool:
        if (
            self.last
            and distance(self.last[0], value[0]) < threshold
            and abs(self.last[1] - value[1]) < 0.8
        ):
            return True
        await asyncio.sleep(max(0, self.last_sent + interval - self.clock()))
        if self.closed:
            return False
        self.last_sent = self.clock()
        try:
            async with asyncio.timeout(8):
                await self.send(value[0], value[1], transition)
        except TimeoutError, OSError, RuntimeError, ValueError:
            self.errors += 1
            self.total_errors += 1
            self.retry_at = self.clock() + min(60, 2 ** min(self.errors, 6))
            if transition is not None:
                self.unstable = True
            self.changed()
            return False
        self.last = value
        self.commands += 1
        self.timestamps.append(self.clock())
        self.errors = max(0, self.errors - 1)
        self.changed()
        return True

    async def _run(
        self,
        goal: tuple[Lab, float],
        duration: float,
        p: dict,
        sampler: Callable | None = None,
        stream_for: float = 0,
        blend: bool = True,
    ) -> None:
        try:
            if self.decision.strategy != "software" or (duration <= 0 and sampler is None):
                transition = (
                    min(duration, p["hardware_max_duration"], 4)
                    if (self.decision.strategy == "hardware")
                    else None
                )
                await self._emit(goal, transition, p["hardware_interval"], p["min_delta"])
                return
            start = self.last or self.current() or goal
            started = self.clock()
            interval = 1 / max(0.1, self.effective_hz)
            span = max(stream_for, duration) if sampler else duration
            while not self.closed:
                elapsed = self.clock() - started
                moving = sampler() if sampler else goal
                # A live field is sampled at every software tick. Ease only the
                # entry into a new cover, never each short segment of its path.
                fraction = (
                    ease(min(1.0, elapsed / duration))
                    if duration > 0 and (blend or not sampler)
                    else 1
                )
                value = (
                    moving
                    if fraction == 1
                    else (
                        mix(start[0], moving[0], fraction),
                        start[1] + (moving[1] - start[1]) * fraction,
                    )
                )
                if not await self._emit(value, None, interval, p["min_delta"]):
                    return
                if elapsed >= span:
                    return
                # No catch-up bursts after slow services.
                await asyncio.sleep(interval)
        except asyncio.CancelledError:
            raise

    def diagnostics(self) -> dict:
        observed_hz = 0.0
        if len(self.timestamps) > 1:
            window = self.timestamps[-1] - self.timestamps[0]
            observed_hz = (len(self.timestamps) - 1) / window if window > 0 else 0
        return {
            "strategy": self.decision.strategy,
            "reason": self.decision.reason,
            "requested_hz": self.decision.hz,
            "effective_hz": self.effective_hz,
            "observed_hz": round(observed_hz, 2),
            "errors": self.total_errors,
            "consecutive_errors": self.errors,
            "commands": self.commands,
            "hardware_unstable": self.unstable,
            "backoff_seconds": max(0, round(self.retry_at - self.clock(), 1)),
        }
