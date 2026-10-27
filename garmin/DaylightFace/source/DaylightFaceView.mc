import Toybox.Activity;
import Toybox.ActivityMonitor;
import Toybox.Application;
import Toybox.Graphics;
import Toybox.Lang;
import Toybox.Math;
import Toybox.Position;
import Toybox.System;
import Toybox.Time;
import Toybox.Time.Gregorian;
import Toybox.Weather;
import Toybox.WatchUi;

// Layout, as fractions of screen height/width so it scales from the
// Instinct 2 (176x176) to the 2S (156x156). Tune these in the simulator.
const STATUS_Y    = 0.20;  // BT / notifications / alarm row (left of the circle)
const STATUS_X    = 0.24;
const TIME_Y      = 0.46;  // vertical center of the big time
const COUNTDOWN_Y = 0.635; // "SUNSET IN 2:14"
const DIVIDER_Y   = 0.69;  // divider line, doubles as the step-goal bar
const ROW1_Y      = 0.75;  // steps | battery
const ROW2_Y      = 0.835; // heart rate | temp + rain chance
const BOTTOM_Y    = 0.92;  // sunrise / sunset times
const LEFT_X      = 0.17;
const RIGHT_X     = 0.83;

// A known new moon (2000-01-06 18:14 UTC) and the synodic month, in days
const NEW_MOON_EPOCH = 947182440;
const SYNODIC_MONTH  = 29.530588853;

class DaylightFaceView extends WatchUi.WatchFace {

    var _w = 176;
    var _h = 176;
    var _sub = null;        // Graphics.BoundingBox of the top-right circle

    var _lat = null;        // last known position, persisted across restarts
    var _lon = null;

    var _sunKey = null;     // day + location the cached sun times belong to
    var _sunrise = null;
    var _sunset = null;
    var _sunriseTomorrow = null;

    function initialize() {
        WatchFace.initialize();
        _lat = Application.Storage.getValue("lat");
        _lon = Application.Storage.getValue("lon");
    }

    function onLayout(dc as Graphics.Dc) as Void {
        _w = dc.getWidth();
        _h = dc.getHeight();
        if (WatchUi has :getSubscreen) {
            _sub = WatchUi.getSubscreen();
        }
    }

    function onUpdate(dc as Graphics.Dc) as Void {
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_BLACK);
        dc.clear();

        var now = Time.now();
        var settings = System.getDeviceSettings();

        updateLocation();
        updateSunTimes(now);

        drawDate(dc, now);
        drawStatus(dc, settings);
        drawTime(dc, now, settings);
        drawCountdown(dc, now);
        drawStepsDivider(dc);
        drawRow1(dc);
        drawRow2(dc, settings);
        drawMoon(dc, _w / 2, ((ROW1_Y + ROW2_Y) / 2 * _h).toNumber(), (_h * 0.035).toNumber() + 1, now);
        drawSunTimes(dc, settings);
    }

    // ---- Data ---------------------------------------------------------------

    // Remember the most recent GPS (or weather station) position so sunrise and
    // sunset keep working when the phone is away and no activity is running.
    function updateLocation() as Void {
        var loc = null;
        var ai = Activity.getActivityInfo();
        if (ai != null && ai.currentLocation != null) {
            loc = ai.currentLocation;
        } else {
            var cond = Weather.getCurrentConditions();
            if (cond != null && cond.observationLocationPosition != null) {
                loc = cond.observationLocationPosition;
            }
        }
        if (loc == null) {
            return;
        }
        var deg = loc.toDegrees();
        var lat = deg[0].toFloat();
        var lon = deg[1].toFloat();
        if (_lat == null || _lon == null || (lat - _lat).abs() > 0.01 || (lon - _lon).abs() > 0.01) {
            _lat = lat;
            _lon = lon;
            Application.Storage.setValue("lat", lat);
            Application.Storage.setValue("lon", lon);
        }
    }

    // Sun times only change daily, so compute them once per day/location.
    function updateSunTimes(now as Time.Moment) as Void {
        if (_lat == null || _lon == null || !(Weather has :getSunrise)) {
            return;
        }
        var info = Gregorian.info(now, Time.FORMAT_SHORT);
        var key = info.year + "-" + info.month + "-" + info.day + "@" + _lat + "," + _lon;
        if (key.equals(_sunKey)) {
            return;
        }
        var loc = new Position.Location({:latitude => _lat, :longitude => _lon, :format => :degrees});
        _sunrise = Weather.getSunrise(loc, now);
        _sunset = Weather.getSunset(loc, now);
        _sunriseTomorrow = Weather.getSunrise(loc, now.add(new Time.Duration(Gregorian.SECONDS_PER_DAY)));
        _sunKey = key;
    }

    function getHeartRate() {
        var ai = Activity.getActivityInfo();
        if (ai != null && ai.currentHeartRate != null) {
            return ai.currentHeartRate;
        }
        if (ActivityMonitor has :getHeartRateHistory) {
            var sample = ActivityMonitor.getHeartRateHistory(1, true).next();
            if (sample != null && sample.heartRate != ActivityMonitor.INVALID_HR_SAMPLE) {
                return sample.heartRate;
            }
        }
        return null;
    }

    // ---- Drawing: top half --------------------------------------------------

    function drawDate(dc as Graphics.Dc, now as Time.Moment) as Void {
        var info = Gregorian.info(now, Time.FORMAT_MEDIUM);
        var dow = info.day_of_week.toUpper();
        var day = info.day.format("%d");

        if (_sub == null) {
            dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
            dc.drawText(_w / 2, (_h * 0.10).toNumber(), Graphics.FONT_XTINY, dow + " " + day,
                Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
            return;
        }

        // White disc with black text, like the stock Instinct faces
        var cx = _sub.x + _sub.width / 2;
        var cy = _sub.y + _sub.height / 2;
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.fillCircle(cx, cy, _sub.width / 2);
        dc.setColor(Graphics.COLOR_BLACK, Graphics.COLOR_TRANSPARENT);
        dc.drawText(cx, cy - _sub.height / 5, Graphics.FONT_XTINY, dow,
            Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
        dc.drawText(cx, cy + _sub.height / 8, Graphics.FONT_MEDIUM, day,
            Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
    }

    function drawStatus(dc as Graphics.Dc, settings) as Void {
        var y = (STATUS_Y * _h).toNumber();
        var x = (STATUS_X * _w).toNumber();
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);

        if (settings.phoneConnected) {
            drawBluetoothIcon(dc, x, y);
            x += 14;
        }
        if (settings.notificationCount > 0) {
            drawEnvelopeIcon(dc, x + 5, y);
            dc.drawText(x + 13, y, Graphics.FONT_XTINY, settings.notificationCount.format("%d"),
                Graphics.TEXT_JUSTIFY_LEFT | Graphics.TEXT_JUSTIFY_VCENTER);
            x += 16 + dc.getTextWidthInPixels(settings.notificationCount.format("%d"), Graphics.FONT_XTINY) + 6;
        }
        if (settings.alarmCount > 0) {
            drawBellIcon(dc, x + 5, y);
        }
    }

    function drawTime(dc as Graphics.Dc, now as Time.Moment, settings) as Void {
        var info = Gregorian.info(now, Time.FORMAT_SHORT);
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.drawText(_w / 2, (TIME_Y * _h).toNumber(), Graphics.FONT_NUMBER_HOT,
            formatClock(info.hour, info.min, settings),
            Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
    }

    // Counts down to whichever comes next: sunrise, sunset, or tomorrow's sunrise.
    function drawCountdown(dc as Graphics.Dc, now as Time.Moment) as Void {
        var text;
        if (_sunrise == null || _sunset == null) {
            text = (_lat == null) ? "SUN: NEED GPS FIX" : "NO SUNRISE/SUNSET";
        } else {
            var label;
            var target;
            if (now.value() < _sunrise.value()) {
                label = "SUNRISE";
                target = _sunrise;
            } else if (now.value() < _sunset.value()) {
                label = "SUNSET";
                target = _sunset;
            } else {
                label = "SUNRISE";
                target = _sunriseTomorrow;
            }
            if (target == null) {
                text = "--";
            } else {
                var secs = target.value() - now.value();
                var h = secs / 3600;
                var m = (secs % 3600) / 60;
                text = label + " IN " + h.format("%d") + ":" + m.format("%02d");
            }
        }
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.drawText(_w / 2, (COUNTDOWN_Y * _h).toNumber(), Graphics.FONT_XTINY, text,
            Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
    }

    // ---- Drawing: bottom half -----------------------------------------------

    // Thin divider across the face; the thick part shows progress to the step goal.
    function drawStepsDivider(dc as Graphics.Dc) as Void {
        var y = (DIVIDER_Y * _h).toNumber();
        var x1 = (_w * 0.14).toNumber();
        var x2 = (_w * 0.86).toNumber();
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.drawLine(x1, y, x2, y);

        var am = ActivityMonitor.getInfo();
        if (am.steps != null && am.stepGoal != null && am.stepGoal > 0) {
            var pct = am.steps.toFloat() / am.stepGoal;
            if (pct > 1.0) {
                pct = 1.0;
            }
            dc.fillRectangle(x1, y - 1, ((x2 - x1) * pct).toNumber(), 3);
        }
    }

    // Steps | battery days
    function drawRow1(dc as Graphics.Dc) as Void {
        var y = (ROW1_Y * _h).toNumber();
        var lx = (LEFT_X * _w).toNumber();
        var rx = (RIGHT_X * _w).toNumber();
        var font = Graphics.FONT_XTINY;
        var left = Graphics.TEXT_JUSTIFY_LEFT | Graphics.TEXT_JUSTIFY_VCENTER;
        var right = Graphics.TEXT_JUSTIFY_RIGHT | Graphics.TEXT_JUSTIFY_VCENTER;
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);

        var steps = ActivityMonitor.getInfo().steps;
        drawFootprintIcon(dc, lx + 4, y);
        dc.drawText(lx + 11, y, font, steps == null ? "--" : steps.format("%d"), left);

        var stats = System.getSystemStats();
        var batt = (stats has :batteryInDays && stats.batteryInDays != null)
            ? stats.batteryInDays.toNumber().format("%d") + "d"
            : stats.battery.toNumber().format("%d") + "%";
        dc.drawText(rx, y, font, batt, right);
        drawBatteryIcon(dc, rx - dc.getTextWidthInPixels(batt, font) - 20, y, stats.battery);
    }

    // Heart rate | temperature + chance of rain
    function drawRow2(dc as Graphics.Dc, settings) as Void {
        var y = (ROW2_Y * _h).toNumber();
        var lx = (LEFT_X * _w).toNumber();
        var rx = (RIGHT_X * _w).toNumber();
        var font = Graphics.FONT_XTINY;
        var left = Graphics.TEXT_JUSTIFY_LEFT | Graphics.TEXT_JUSTIFY_VCENTER;
        var right = Graphics.TEXT_JUSTIFY_RIGHT | Graphics.TEXT_JUSTIFY_VCENTER;
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);

        var hr = getHeartRate();
        drawHeartIcon(dc, lx + 4, y);
        dc.drawText(lx + 11, y, font, hr == null ? "--" : hr.format("%d"), left);

        var cond = Weather.getCurrentConditions();
        if (cond == null) {
            dc.drawText(rx, y, font, "--", right);
            return;
        }
        var x = rx;
        if (cond.precipitationChance != null) {
            var rain = cond.precipitationChance.format("%d") + "%";
            dc.drawText(x, y, font, rain, right);
            x -= dc.getTextWidthInPixels(rain, font) + 6;
            drawDropIcon(dc, x, y);
            x -= 6;
        }
        if (cond.temperature != null) {
            var t = cond.temperature.toFloat();  // always Celsius
            if (settings.temperatureUnits == System.UNIT_STATUTE) {
                t = t * 9 / 5 + 32;
            }
            dc.drawText(x, y, font, Math.round(t).toNumber().format("%d") + "°", right);
        }
    }

    function drawSunTimes(dc as Graphics.Dc, settings) as Void {
        var font = Graphics.FONT_XTINY;
        var sunriseStr = (_sunrise == null) ? "--:--" : formatMoment(_sunrise, settings);
        var sunsetStr = (_sunset == null) ? "--:--" : formatMoment(_sunset, settings);
        var y = (BOTTOM_Y * _h).toNumber();
        var w1 = dc.getTextWidthInPixels(sunriseStr, font);
        var w2 = dc.getTextWidthInPixels(sunsetStr, font);
        var total = 10 + w1 + 8 + 10 + w2;
        var x = _w / 2 - total / 2;
        var left = Graphics.TEXT_JUSTIFY_LEFT | Graphics.TEXT_JUSTIFY_VCENTER;

        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.fillPolygon([[x, y + 3], [x + 8, y + 3], [x + 4, y - 3]]);
        dc.drawText(x + 10, y, font, sunriseStr, left);
        x += 10 + w1 + 8;
        dc.fillPolygon([[x, y - 3], [x + 8, y - 3], [x + 4, y + 3]]);
        dc.drawText(x + 10, y, font, sunsetStr, left);
    }

    // Moon phase, drawn one scanline at a time: lit on the right while waxing,
    // on the left while waning.
    function drawMoon(dc as Graphics.Dc, cx as Number, cy as Number, r as Number, now as Time.Moment) as Void {
        var days = (now.value() - NEW_MOON_EPOCH) / 86400.0;
        var p = days / SYNODIC_MONTH;
        p = p - p.toNumber();
        var c = Math.cos(2 * Math.PI * p);

        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        for (var dy = -r; dy <= r; dy++) {
            var hw = Math.sqrt(r * r - dy * dy);
            var t = hw * c;
            var x1 = (p < 0.5) ? t : -hw;
            var x2 = (p < 0.5) ? hw : -t;
            if (x2 > x1) {
                dc.drawLine(cx + x1.toNumber(), cy + dy, cx + x2.toNumber() + 1, cy + dy);
            }
        }
        dc.drawCircle(cx, cy, r);
    }

    // ---- Icons (all centered on x, y; roughly 10px tall) --------------------

    function drawBluetoothIcon(dc as Graphics.Dc, x as Number, y as Number) as Void {
        dc.drawLine(x, y - 5, x, y + 6);
        dc.drawLine(x, y - 5, x + 3, y - 2);
        dc.drawLine(x + 3, y - 2, x - 3, y + 3);
        dc.drawLine(x, y + 5, x + 3, y + 2);
        dc.drawLine(x + 3, y + 2, x - 3, y - 3);
    }

    function drawEnvelopeIcon(dc as Graphics.Dc, x as Number, y as Number) as Void {
        dc.drawRectangle(x - 5, y - 4, 11, 8);
        dc.drawLine(x - 5, y - 4, x, y);
        dc.drawLine(x + 5, y - 4, x, y);
    }

    function drawBellIcon(dc as Graphics.Dc, x as Number, y as Number) as Void {
        dc.fillCircle(x, y - 2, 3);
        dc.fillRectangle(x - 3, y - 2, 7, 4);
        dc.drawLine(x - 5, y + 2, x + 6, y + 2);
        dc.fillCircle(x, y + 4, 1);
    }

    function drawFootprintIcon(dc as Graphics.Dc, x as Number, y as Number) as Void {
        dc.fillEllipse(x - 2, y + 2, 2, 3);
        dc.fillEllipse(x + 2, y - 2, 2, 3);
    }

    function drawHeartIcon(dc as Graphics.Dc, x as Number, y as Number) as Void {
        dc.fillCircle(x - 2, y - 1, 2);
        dc.fillCircle(x + 2, y - 1, 2);
        dc.fillPolygon([[x - 4, y], [x + 5, y], [x, y + 5]]);
    }

    function drawDropIcon(dc as Graphics.Dc, x as Number, y as Number) as Void {
        dc.fillCircle(x, y + 1, 3);
        dc.fillPolygon([[x - 3, y], [x + 4, y], [x, y - 5]]);
    }

    function drawBatteryIcon(dc as Graphics.Dc, x as Number, y as Number, pct) as Void {
        dc.drawRectangle(x, y - 4, 14, 9);
        dc.fillRectangle(x + 14, y - 2, 2, 5);
        var fill = (10 * pct / 100.0).toNumber();
        if (fill > 0) {
            dc.fillRectangle(x + 2, y - 2, fill, 5);
        }
    }

    // ---- Formatting ---------------------------------------------------------

    function formatClock(hour as Number, min as Number, settings) as String {
        if (!settings.is24Hour) {
            hour = hour % 12;
            if (hour == 0) {
                hour = 12;
            }
            return hour.format("%d") + ":" + min.format("%02d");
        }
        return hour.format("%02d") + ":" + min.format("%02d");
    }

    function formatMoment(m as Time.Moment, settings) as String {
        var info = Gregorian.info(m, Time.FORMAT_SHORT);
        return formatClock(info.hour, info.min, settings);
    }
}
