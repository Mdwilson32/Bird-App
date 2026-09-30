import { SPECIES, CATEGORIES, speciesById, categoryById, guideUrl } from './species.js';
import * as db from './db.js';

const view = document.getElementById('view');
const titleEl = document.getElementById('title');
const backBtn = document.getElementById('back');

// Object URLs created for photo previews; revoked on every re-render.
let objectUrls = [];
const photoUrl = (blob) => {
  const url = URL.createObjectURL(blob);
  objectUrls.push(url);
  return url;
};

// Browse-screen state survives navigation within the session.
const browse = { query: '', category: 'all', filter: 'all' };
const logbook = { query: '' };

// ---------- helpers ----------

const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const today = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const fmtDate = (iso, opts = { month: 'short', day: 'numeric', year: 'numeric' }) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, opts);

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('show'), 2200);
}

function setHeader(title, back) {
  titleEl.textContent = title;
  document.title = title === 'Species' ? 'Bird Logbook' : `${title} · Bird Logbook`;
  backBtn.hidden = !back;
  backBtn.dataset.href = back || '';
}

function setTab(name) {
  document.querySelectorAll('.tabbar a').forEach((a) => a.classList.toggle('active', a.dataset.tab === name));
}

const sortEntries = (list) =>
  list.sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0));

function statsBySpecies(entries) {
  const map = new Map();
  for (const e of entries) {
    const st = map.get(e.speciesId) || { birds: 0, hunts: 0, first: e.date, last: e.date };
    st.birds += e.count;
    st.hunts += 1;
    if (e.date < st.first) st.first = e.date;
    if (e.date > st.last) st.last = e.date;
    map.set(e.speciesId, st);
  }
  return map;
}

function catChip(catId) {
  const c = categoryById.get(catId);
  return `<span class="chip" style="--c:${c.color}">${esc(c.name)}</span>`;
}

function entryCard(e, { showSpecies = true } = {}) {
  const sp = speciesById.get(e.speciesId);
  const thumb = e.photos?.length
    ? `<img class="thumb" src="${photoUrl(e.photos[0])}" alt="">`
    : `<div class="thumb placeholder" style="--c:${categoryById.get(sp?.category)?.color || '#777'}">${esc((sp?.name || '?')[0])}</div>`;
  return `
    <a class="entry" href="#/entry/${encodeURIComponent(e.id)}">
      ${thumb}
      <div class="entry-body">
        <div class="entry-top">
          <strong>${showSpecies ? esc(sp?.name || 'Unknown species') : fmtDate(e.date)}</strong>
          <span class="count">×${e.count}</span>
        </div>
        <div class="muted small">${showSpecies ? fmtDate(e.date) : ''}${showSpecies && e.location ? ' · ' : ''}${esc(e.location || '')}</div>
        ${e.notes ? `<div class="small notes-preview">${esc(e.notes)}</div>` : ''}
      </div>
    </a>`;
}

// ---------- views ----------

async function renderSpeciesList() {
  setHeader('Species');
  setTab('species');
  const stats = statsBySpecies(await db.getAllEntries());
  const harvested = SPECIES.filter((sp) => stats.has(sp.id)).length;
  const pct = Math.round((harvested / SPECIES.length) * 100);

  view.innerHTML = `
    <section class="progress-card">
      <div class="progress-top">
        <div><span class="big">${harvested}</span> <span class="muted">of ${SPECIES.length} species harvested</span></div>
        <span class="muted">${pct}%</span>
      </div>
      <div class="bar"><div style="width:${pct}%"></div></div>
    </section>
    <input id="q" class="search" type="search" placeholder="Search species…" value="${esc(browse.query)}" autocomplete="off">
    <div class="seg" role="group" aria-label="Harvest filter">
      ${['all', 'harvested', 'not'].map((f) => `<button data-filter="${f}" class="${browse.filter === f ? 'on' : ''}">${{ all: 'All', harvested: 'Harvested', not: 'Not yet' }[f]}</button>`).join('')}
    </div>
    <div class="chips-scroll">
      <button class="fchip ${browse.category === 'all' ? 'on' : ''}" data-cat="all">All groups</button>
      ${CATEGORIES.map((c) => `<button class="fchip ${browse.category === c.id ? 'on' : ''}" data-cat="${c.id}" style="--c:${c.color}">${esc(c.name)}</button>`).join('')}
    </div>
    <div id="list"></div>`;

  const list = view.querySelector('#list');
  const draw = () => {
    const q = browse.query.trim().toLowerCase();
    const items = SPECIES.filter(
      (sp) =>
        (browse.category === 'all' || sp.category === browse.category) &&
        (browse.filter === 'all' || (browse.filter === 'harvested') === stats.has(sp.id)) &&
        (!q || sp.name.toLowerCase().includes(q) || sp.sci.toLowerCase().includes(q)),
    );
    if (!items.length) {
      list.innerHTML = `<p class="empty">No species match.</p>`;
      return;
    }
    list.innerHTML = CATEGORIES.map((c) => {
      const group = items.filter((sp) => sp.category === c.id);
      if (!group.length) return '';
      return `
        <h2 class="group-title" style="--c:${c.color}">${esc(c.name)}</h2>
        <div class="species-list">
          ${group
            .map((sp) => {
              const st = stats.get(sp.id);
              return `
              <a class="species ${st ? 'got' : ''}" href="#/species/${sp.id}">
                <span class="check" aria-hidden="true">${st ? '✓' : ''}</span>
                <span class="sp-names"><strong>${esc(sp.name)}</strong><em>${esc(sp.sci)}</em></span>
                ${st ? `<span class="badge">${st.birds}</span>` : ''}
              </a>`;
            })
            .join('')}
        </div>`;
    }).join('');
  };
  draw();

  view.querySelector('#q').addEventListener('input', (e) => {
    browse.query = e.target.value;
    draw();
  });
  view.querySelectorAll('[data-filter]').forEach((b) =>
    b.addEventListener('click', () => {
      browse.filter = b.dataset.filter;
      view.querySelectorAll('[data-filter]').forEach((x) => x.classList.toggle('on', x === b));
      draw();
    }),
  );
  view.querySelectorAll('[data-cat]').forEach((b) =>
    b.addEventListener('click', () => {
      browse.category = b.dataset.cat;
      view.querySelectorAll('[data-cat]').forEach((x) => x.classList.toggle('on', x === b));
      draw();
    }),
  );
}

async function renderSpeciesDetail(id) {
  const sp = speciesById.get(id);
  if (!sp) return renderNotFound();
  setHeader(sp.name, '#/species');
  setTab('species');
  const entries = sortEntries((await db.getAllEntries()).filter((e) => e.speciesId === id));
  const st = statsBySpecies(entries).get(id);

  view.innerHTML = `
    <section class="hero" style="--c:${categoryById.get(sp.category).color}">
      <h1>${esc(sp.name)}</h1>
      <p class="sci">${esc(sp.sci)}</p>
      ${catChip(sp.category)}
      <a class="ext" href="${guideUrl(sp)}" target="_blank" rel="noopener">Species guide at All About Birds ↗</a>
    </section>
    <section class="stats">
      <div><span class="big">${st?.birds || 0}</span><span class="muted small">birds</span></div>
      <div><span class="big">${st?.hunts || 0}</span><span class="muted small">log entries</span></div>
      <div><span class="big small-date">${st ? fmtDate(st.first, { month: 'short', year: 'numeric' }) : '—'}</span><span class="muted small">first harvest</span></div>
    </section>
    <a class="btn primary block" href="#/new?species=${sp.id}">＋ Log a harvest</a>
    <h2 class="section-title">Your log</h2>
    ${entries.length ? `<div class="entries">${entries.map((e) => entryCard(e, { showSpecies: false })).join('')}</div>` : `<p class="empty">No harvests logged for this species yet.</p>`}`;
}

async function renderLogbook() {
  setHeader('Logbook');
  setTab('log');
  const all = sortEntries(await db.getAllEntries());
  if (!all.length) {
    view.innerHTML = `
      <div class="empty big-empty">
        <p>Your logbook is empty.</p>
        <a class="btn primary" href="#/new">＋ Log your first harvest</a>
      </div>`;
    return;
  }
  const totalBirds = all.reduce((n, e) => n + e.count, 0);
  const speciesCount = new Set(all.map((e) => e.speciesId)).size;
  view.innerHTML = `
    <section class="stats">
      <div><span class="big">${totalBirds}</span><span class="muted small">birds</span></div>
      <div><span class="big">${speciesCount}</span><span class="muted small">species</span></div>
      <div><span class="big">${all.length}</span><span class="muted small">entries</span></div>
    </section>
    <input id="q" class="search" type="search" placeholder="Search species, location, notes…" value="${esc(logbook.query)}" autocomplete="off">
    <div id="list"></div>`;

  const list = view.querySelector('#list');
  const draw = () => {
    objectUrls.forEach(URL.revokeObjectURL);
    objectUrls = [];
    const q = logbook.query.trim().toLowerCase();
    const items = all.filter((e) => {
      if (!q) return true;
      const sp = speciesById.get(e.speciesId);
      return [sp?.name, e.location, e.notes].some((v) => v && v.toLowerCase().includes(q));
    });
    if (!items.length) {
      list.innerHTML = `<p class="empty">No entries match.</p>`;
      return;
    }
    const groups = new Map();
    for (const e of items) {
      const key = e.date.slice(0, 7);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(e);
    }
    list.innerHTML = [...groups]
      .map(
        ([month, es]) => `
        <h2 class="section-title">${fmtDate(`${month}-01`, { month: 'long', year: 'numeric' })}</h2>
        <div class="entries">${es.map((e) => entryCard(e)).join('')}</div>`,
      )
      .join('');
  };
  draw();
  view.querySelector('#q').addEventListener('input', (e) => {
    logbook.query = e.target.value;
    draw();
  });
}

async function renderEntry(id) {
  const e = await db.getEntry(id);
  if (!e) return renderNotFound();
  const sp = speciesById.get(e.speciesId);
  setHeader('Harvest', sp ? `#/species/${sp.id}` : '#/log');
  setTab('log');
  view.innerHTML = `
    <section class="hero" style="--c:${categoryById.get(sp?.category)?.color || '#777'}">
      <h1>${esc(sp?.name || 'Unknown species')}</h1>
      <p class="sci">${esc(sp?.sci || '')}</p>
    </section>
    <dl class="details">
      <div><dt>Date</dt><dd>${fmtDate(e.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</dd></div>
      <div><dt>Birds</dt><dd>${e.count}</dd></div>
      ${e.location ? `<div><dt>Location</dt><dd>${esc(e.location)}</dd></div>` : ''}
    </dl>
    ${e.notes ? `<h2 class="section-title">Notes</h2><p class="notes">${esc(e.notes)}</p>` : ''}
    ${
      e.photos?.length
        ? `<h2 class="section-title">Photos</h2><div class="photo-grid">${e.photos
            .map((p) => {
              const url = photoUrl(p);
              return `<a href="${url}" target="_blank" rel="noopener"><img src="${url}" alt="Harvest photo"></a>`;
            })
            .join('')}</div>`
        : ''
    }
    <div class="actions">
      <a class="btn" href="#/edit/${encodeURIComponent(e.id)}">Edit</a>
      <button class="btn danger" id="del">Delete</button>
    </div>`;
  view.querySelector('#del').addEventListener('click', async () => {
    if (!confirm('Delete this log entry? This cannot be undone.')) return;
    await db.deleteEntry(e.id);
    toast('Entry deleted');
    location.hash = sp ? `#/species/${sp.id}` : '#/log';
  });
}

// Downscale photos so the on-device logbook stays small.
async function compressPhoto(file, max = 1600, quality = 0.82) {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close?.();
    return await new Promise((res) => canvas.toBlob((b) => res(b || file), 'image/jpeg', quality));
  } catch {
    return file; // e.g. HEIC on browsers that can't decode it — keep the original
  }
}

async function renderForm(id, params) {
  const existing = id ? await db.getEntry(id) : null;
  if (id && !existing) return renderNotFound();
  const entry = existing || {
    speciesId: params.get('species') || '',
    date: today(),
    count: 1,
    location: '',
    notes: '',
    photos: [],
  };
  const photos = [...(entry.photos || [])];
  const back = existing ? `#/entry/${encodeURIComponent(existing.id)}` : entry.speciesId ? `#/species/${entry.speciesId}` : '#/log';
  setHeader(existing ? 'Edit harvest' : 'Log harvest', back);
  setTab(existing ? 'log' : 'new');

  view.innerHTML = `
    <form id="form" class="form" novalidate>
      <label>Species
        <select name="speciesId" required>
          <option value="">Choose a species…</option>
          ${CATEGORIES.map(
            (c) => `<optgroup label="${esc(c.name)}">${SPECIES.filter((sp) => sp.category === c.id)
              .map((sp) => `<option value="${sp.id}" ${sp.id === entry.speciesId ? 'selected' : ''}>${esc(sp.name)}</option>`)
              .join('')}</optgroup>`,
          ).join('')}
        </select>
      </label>
      <div class="row">
        <label>Date <input type="date" name="date" value="${esc(entry.date)}" max="${today()}" required></label>
        <label class="narrow">Birds
          <div class="stepper">
            <button type="button" data-step="-1" aria-label="Fewer">−</button>
            <input type="number" name="count" min="1" max="999" inputmode="numeric" value="${entry.count}" required>
            <button type="button" data-step="1" aria-label="More">+</button>
          </div>
        </label>
      </div>
      <label>Location <span class="muted">(optional)</span>
        <div class="with-btn">
          <input type="text" name="location" value="${esc(entry.location)}" placeholder="e.g. Gray Lodge WA, blind 12" list="places">
          <button type="button" class="btn" id="gps" title="Use current location">📍</button>
        </div>
        <datalist id="places"></datalist>
      </label>
      <label>Notes <span class="muted">(optional)</span>
        <textarea name="notes" rows="4" placeholder="Weather, dog work, how the birds worked…">${esc(entry.notes)}</textarea>
      </label>
      <div class="field">
        <span>Photos <span class="muted">(optional)</span></span>
        <div class="photo-grid editable" id="photos"></div>
        <label class="btn block file-btn">📷 Add photos
          <input type="file" accept="image/*" multiple hidden id="file">
        </label>
      </div>
      <p class="error" id="err" hidden></p>
      <button class="btn primary block" type="submit">${existing ? 'Save changes' : 'Save to logbook'}</button>
    </form>`;

  const form = view.querySelector('#form');
  const photosEl = view.querySelector('#photos');

  // Suggest previously used locations.
  db.getAllEntries().then((all) => {
    const places = [...new Set(all.map((e) => e.location).filter(Boolean))].sort();
    view.querySelector('#places').innerHTML = places.map((p) => `<option value="${esc(p)}">`).join('');
  });

  const drawPhotos = () => {
    photosEl.innerHTML = photos
      .map((p, i) => `<div class="ph"><img src="${photoUrl(p)}" alt=""><button type="button" data-rm="${i}" aria-label="Remove photo">×</button></div>`)
      .join('');
  };
  drawPhotos();
  photosEl.addEventListener('click', (e) => {
    const i = e.target.dataset.rm;
    if (i !== undefined) {
      photos.splice(Number(i), 1);
      drawPhotos();
    }
  });
  view.querySelector('#file').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    for (const f of files) photos.push(await compressPhoto(f));
    drawPhotos();
  });

  view.querySelectorAll('[data-step]').forEach((b) =>
    b.addEventListener('click', () => {
      const input = form.elements.count;
      input.value = Math.max(1, (parseInt(input.value, 10) || 1) + Number(b.dataset.step));
    }),
  );

  view.querySelector('#gps').addEventListener('click', () => {
    if (!navigator.geolocation) return toast('Location not available');
    toast('Getting location…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const loc = form.elements.location;
        const pt = `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
        loc.value = loc.value ? `${loc.value} (${pt})` : pt;
        toast('Location added');
      },
      () => toast('Could not get location'),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  });

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const f = form.elements;
    const count = parseInt(f.count.value, 10);
    const err = view.querySelector('#err');
    const problem = !f.speciesId.value
      ? 'Choose a species.'
      : !f.date.value
        ? 'Enter a date.'
        : !(count >= 1)
          ? 'Enter at least 1 bird.'
          : '';
    if (problem) {
      err.textContent = problem;
      err.hidden = false;
      return;
    }
    const now = Date.now();
    const saved = {
      ...entry,
      id: existing?.id || db.newId(),
      speciesId: f.speciesId.value,
      date: f.date.value,
      count,
      location: f.location.value.trim(),
      notes: f.notes.value.trim(),
      photos,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    try {
      await db.putEntry(saved);
    } catch (e) {
      err.textContent = `Could not save: ${e?.message || e}. Your device may be out of storage.`;
      err.hidden = false;
      return;
    }
    toast(existing ? 'Changes saved' : 'Harvest logged');
    location.hash = `#/entry/${encodeURIComponent(saved.id)}`;
  });
}

// ---------- data (backup / export) ----------

const blobToDataUrl = (blob) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(blob);
  });

const dataUrlToBlob = (url) => fetch(url).then((r) => r.blob());

function download(name, blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

async function renderData() {
  setHeader('Data');
  setTab('data');
  const all = await db.getAllEntries();
  const photoCount = all.reduce((n, e) => n + (e.photos?.length || 0), 0);
  let usage = '';
  if (navigator.storage?.estimate) {
    const { usage: u } = await navigator.storage.estimate();
    if (u) usage = ` · about ${(u / 1024 / 1024).toFixed(1)} MB used`;
  }
  const persisted = navigator.storage?.persisted ? await navigator.storage.persisted() : false;

  view.innerHTML = `
    <section class="card">
      <h2>Your data</h2>
      <p class="muted">${plural(all.length, 'entry')}, ${plural(photoCount, 'photo')}${usage}. Everything is stored only on this device.</p>
      ${
        persisted
          ? `<p class="ok small">✓ Storage is protected from automatic browser cleanup.</p>`
          : `<button class="btn block" id="persist">Protect storage from browser cleanup</button>`
      }
    </section>
    <section class="card">
      <h2>Backup</h2>
      <p class="muted small">A full backup includes photos. Save it somewhere safe (cloud drive, email to yourself) and restore it on a new phone.</p>
      <button class="btn primary block" id="backup">Download full backup (.json)</button>
      <label class="btn block file-btn">Restore from backup
        <input type="file" accept="application/json,.json" hidden id="restore">
      </label>
    </section>
    <section class="card">
      <h2>Spreadsheet export</h2>
      <p class="muted small">All log entries as a CSV for Excel or Google Sheets (photos not included).</p>
      <button class="btn block" id="csv">Export CSV</button>
    </section>
    <section class="card">
      <h2>Danger zone</h2>
      <button class="btn danger block" id="wipe">Delete all entries</button>
    </section>
    <p class="muted small center">Species legal status varies by state and season. Always check current regulations.</p>`;

  view.querySelector('#persist')?.addEventListener('click', async () => {
    const ok = await navigator.storage.persist();
    toast(ok ? 'Storage protected' : 'Browser declined — try installing the app to your home screen');
    renderData();
  });

  view.querySelector('#backup').addEventListener('click', async () => {
    const entries = await db.getAllEntries();
    const out = [];
    for (const e of entries) out.push({ ...e, photos: await Promise.all((e.photos || []).map(blobToDataUrl)) });
    const json = JSON.stringify({ app: 'bird-logbook', version: 1, exportedAt: new Date().toISOString(), entries: out });
    download(`bird-logbook-backup-${today()}.json`, new Blob([json], { type: 'application/json' }));
  });

  view.querySelector('#restore').addEventListener('change', async (ev) => {
    const file = ev.target.files[0];
    ev.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (data.app !== 'bird-logbook' || !Array.isArray(data.entries)) throw new Error('Not a Bird Logbook backup file');
      const entries = [];
      for (const e of data.entries) {
        if (!e.id || !e.speciesId || !e.date) continue;
        entries.push({ ...e, count: Number(e.count) || 1, photos: await Promise.all((e.photos || []).map(dataUrlToBlob)) });
      }
      if (!confirm(`Restore ${plural(entries.length, 'entry')}? Entries with the same ID will be overwritten; others are kept.`)) return;
      await db.putEntries(entries);
      toast(`Restored ${plural(entries.length, 'entry')}`);
      renderData();
    } catch (e) {
      alert(`Restore failed: ${e.message || e}`);
    }
  });

  view.querySelector('#csv').addEventListener('click', async () => {
    const entries = sortEntries(await db.getAllEntries()).reverse();
    const rows = [['Date', 'Species', 'Scientific name', 'Group', 'Birds', 'Location', 'Notes', 'Photos']];
    for (const e of entries) {
      const sp = speciesById.get(e.speciesId);
      rows.push([e.date, sp?.name || e.speciesId, sp?.sci || '', categoryById.get(sp?.category)?.name || '', e.count, e.location, e.notes, e.photos?.length || 0]);
    }
    const csv = rows.map((r) => r.map(csvCell).join(',')).join('\r\n');
    download(`bird-logbook-${today()}.csv`, new Blob(['﻿' + csv], { type: 'text/csv' }));
  });

  view.querySelector('#wipe').addEventListener('click', async () => {
    if (!confirm('Delete ALL log entries and photos? Download a backup first if you want to keep them.')) return;
    if (!confirm('Are you sure? This cannot be undone.')) return;
    await db.clearEntries();
    toast('All entries deleted');
    renderData();
  });
}

function renderNotFound() {
  setHeader('Not found', '#/species');
  view.innerHTML = `<p class="empty">That page doesn't exist. <a href="#/species">Back to species</a></p>`;
}

// ---------- router ----------

async function route() {
  objectUrls.forEach(URL.revokeObjectURL);
  objectUrls = [];
  const [path, qs] = (location.hash.slice(1) || '/species').split('?');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  const params = new URLSearchParams(qs || '');
  window.scrollTo(0, 0);
  switch (parts[0]) {
    case 'species':
      return parts[1] ? renderSpeciesDetail(parts[1]) : renderSpeciesList();
    case 'log':
      return renderLogbook();
    case 'entry':
      return renderEntry(parts[1]);
    case 'new':
      return renderForm(null, params);
    case 'edit':
      return renderForm(parts[1], params);
    case 'data':
      return renderData();
    default:
      return renderNotFound();
  }
}

backBtn.addEventListener('click', () => {
  location.hash = backBtn.dataset.href || '#/species';
});
const safeRoute = () =>
  route().catch((e) => {
    view.innerHTML = `<p class="error">Something went wrong: ${esc(e.message || e)}</p>`;
  });
window.addEventListener('hashchange', safeRoute);
safeRoute();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
