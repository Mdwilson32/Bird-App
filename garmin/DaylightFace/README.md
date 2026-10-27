# Daylight Face — Garmin Instinct 2 watch face

```
                 ┌─────┐
   ᛒ ✉3 🔔        │ TUE │   ← date in the round sub-window
                 │ 27  │
                 └─────┘
          7:29
     SUNSET IN 2:14
   ━━━━━━━━──────────────    ← divider = progress to step goal
   👣 5460    ◑    ▭ 11d
   ♥ 62           65° 💧20%
      ▲6:58  ▼5:57
```

| Area | Shows |
|---|---|
| Sub-window | Day of week + date |
| Top left | Phone connected, unread notifications, alarm set (each hides when off) |
| Center | Time (follows the watch's 12/24-hour setting) |
| Under time | Countdown to the next sunrise or sunset |
| Divider | Thick part = progress toward today's step goal |
| Left column | Steps, heart rate |
| Middle | Moon phase |
| Right column | Battery days remaining, temperature + chance of rain |
| Bottom | Today's sunrise and sunset |

Sunrise/sunset use the watch's last known position (GPS from an activity, or the
weather location from your phone). The face saves that position, so it keeps
working when you're away from your phone. If it shows **SUN: NEED GPS FIX**, start
any GPS activity for a minute (or sync with Garmin Connect) and it will fill in.

## Build and install

1. Install [VS Code](https://code.visualstudio.com/) and the **Monkey C** extension (by Garmin).
2. Install the [Connect IQ SDK Manager](https://developer.garmin.com/connect-iq/sdk/),
   sign in, download the latest SDK, and under **Devices** download *Instinct 2* (and *2S* if needed).
3. In VS Code: `Ctrl+Shift+P` → **Monkey C: Generate a Developer Key** (one time).
4. Open this `DaylightFace` folder in VS Code.
5. **Try it in the simulator:** `Ctrl+Shift+P` → **Monkey C: Run** → pick *Instinct 2*.
   In the simulator, use *Simulation → Set Position* so sunrise/sunset appear, and
   *Simulation → Activity Data* / *Weather* to fill in steps, heart rate, and temperature.
6. **Put it on the watch:** `Ctrl+Shift+P` → **Monkey C: Build for Device** → *Instinct 2*.
   That makes a `.prg` file. Plug the watch into your PC by USB, copy the `.prg`
   into the watch's `GARMIN\APPS` folder, then unplug.
7. On the watch: hold **UP (Menu)** → **Watch Face** → pick **Daylight Face**.

## Tweaking the layout

Every position is a constant at the top of `source/DaylightFaceView.mc`
(`TIME_Y`, `ROW1_Y`, etc.) given as a fraction of the screen. If something
overlaps or sits too close to the edge in the simulator, nudge those numbers
and run again.
