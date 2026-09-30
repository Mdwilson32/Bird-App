# Bird Logbook

A mobile-friendly web app for logging game bird harvests. You can browse about 80 North American game birds, mark the ones you've taken, and keep a logbook entry for each hunt with the date, number of birds, location, notes and photos.

Everything is stored on your device in the browser (IndexedDB). There are no accounts and no server, and the app works offline once it has loaded.

## Features

- **Species**: browse by group (dabbling ducks, diving ducks, sea ducks, geese, upland, turkey subspecies, doves, cranes and rails, and more). You can search by common or scientific name, filter by *Harvested* or *Not yet*, and see your progress (e.g. "12 of 80 species").
- **Species page**: total birds, number of entries, first harvest date, a link to Cornell's All About Birds guide, and every log entry for that species.
- **Log a harvest**: species, date, number of birds (with a stepper), an optional location (with a 📍 button for GPS and suggestions from places you've used before), notes and photos. Photos are shrunk on the device to save storage.
- **Logbook**: all entries by month with totals and search. Tap an entry to view, edit or delete it.
- **Data**:
  - a full JSON backup that includes photos, and restoring from it
  - a CSV export for Excel
  - a button that asks the browser not to clear your data

## Running it

It's a static site with no build step. Serve the folder with any web server:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

To use it on your phone, host it on any static host (GitHub Pages, Netlify, Cloudflare Pages). Open it in Safari or Chrome and choose **Add to Home Screen**. The site needs HTTPS for offline mode and GPS to work.

## Important: back up your data

Your data lives only in this browser on this device. If you clear site data, uninstall the browser or lose the phone, the log is gone. Use **Data → Download full backup** from time to time.

## Project layout

```
index.html            app shell
styles.css            styles (light and dark mode)
js/app.js             views, routing, forms, export/import
js/db.js              IndexedDB storage
js/species.js         species list and groups
sw.js                 service worker for offline use (bump CACHE when shipping changes)
manifest.webmanifest  install-to-home-screen metadata
icons/                app icons
```

To add a species, add a line to `js/species.js`. Each species `id` is stored in your log entries, so don't rename existing IDs.

*Hunting legality varies by state, season and species. Always check current regulations.*
