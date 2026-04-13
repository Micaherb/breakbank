# Break Bank

A browser-based time tracker that helps you earn and manage break time while working.

## How it works

Start the work timer and earn break time at a configurable rate (default: 1/3 of time worked). When you've banked enough, switch to break mode and your earned time counts down. An alarm sounds when your break runs out.

The work timer resets after each break, so it always shows time since your last break.

## Features

- **Work timer** with pause/resume
- **Break bank** that accrues while working at a configurable multiplier
- **Break mode** with countdown and alarm when depleted
- **History log** of work and break sessions (with hide/show per entry)
- **Alerts & Timers** panel with four types:
  - Countdown timers (independent of break bank)
  - Clock alarms (fire at a specific time of day)
  - Bank threshold alerts (fire when break bank reaches X minutes)
  - "Lasts until" alerts (fire when your break bank would last until a target time)
- **Strict Mode** plays a persistent alarm if the timer is idle during a scheduled work period
- **Settings** for break time multiplier with presets (1/5, 1/4, 1/3, 1/2, 1/1)
- **Different alarm sounds** for each event type
- All state persists in localStorage across page refreshes
- Running timer shown in the browser tab title
