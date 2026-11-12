// node src/build.mjs  ->  index.html (one self-contained file for GitHub Pages)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { TABLES, RELATIONS, QUERIES, COMPARES, ROWS, TRY } from './data.mjs';
import { run, seedSQL } from './engine.mjs';

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = p => fs.readFileSync(path.join(root, p), 'utf8');

/* ---------- icons: lucide (the kit's ui: set) + simple-icons brand marks ---------- */
const lucide = require('@iconify-json/lucide/icons.json');
const icon = (name, cls = 'ic') => {
  const i = lucide.icons[name];
  if (!i) throw new Error('no icon ' + name);
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${i.body}</svg>`;
};
const si = name => {
  const svg = fs.readFileSync(require.resolve(`simple-icons/icons/${name}.svg`), 'utf8');
  return svg.match(/ d="([^"]+)"/)[1];
};
const BRAND = {
  sqlite: `<svg class="brand brand--sqlite" viewBox="0 0 24 24" role="img" aria-label="SQLite"><path fill="#003B57" d="${si('sqlite')}"/></svg>`,
  github: `<svg class="brand ic-ink" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="${si('github')}"/></svg>`,
};
const UI_ICONS = ['play', 'rotate-ccw', 'circle-check', 'circle-x', 'triangle-alert', 'lightbulb', 'concierge-bell',
  'chart-column', 'receipt-text', 'megaphone', 'table-2', 'key-round', 'link-2', 'check', 'x', 'info', 'terminal', 'chevron-left', 'chevron-right'];
const ICONS = Object.fromEntries(UI_ICONS.map(n => [n, icon(n)]));

/* ---------- expected results, computed by real SQLite ---------- */
const queries = [];
for (const q of QUERIES) {
  const r = await run(q.sql);
  if (r.error) throw new Error(`${q.id}: ${r.error}`);
  queries.push({ ...q, try: TRY[q.id], expected: r });
}
const fillers = {
  c1: ([a, b]) => { const A = new Set(a.values.map(v => v[0])); return { missing: b.values.map(v => v[0]).filter(x => !A.has(x)).join('、'), rowsA: a.values.length, rowsB: b.values.length }; },
  c2: ([a, b]) => { const A = new Set(a.values.map(v => v[0])), B = new Set(b.values.map(v => v[0])); return { extraInA: [...A].filter(x => !B.has(x)).join('、'), missingInA: [...B].filter(x => !A.has(x)).join('、') }; },
  c3: ([a, b]) => { const fa = a.values.find(v => v[0] === '豪華海景房'), fb = b.values.find(v => v[0] === '豪華海景房'); const n = x => Number(x).toLocaleString('en-US'); return { dlxA: fa[1], dlxB: fb[1], dlxDiff: n(fa[2] - fb[2]), dlxA2: n(fa[2]), dlxB2: n(fb[2]) }; },
  c4: ([a, b]) => { const A = new Set(a.values.map(v => v[0])); return { rowsA: a.values.length, rowsB: b.values.length, missing: b.values.filter(v => !A.has(v[0])).map(v => v[1]).join('、') }; },
  c5: async ([a, b]) => { const g = await run(`SELECT COUNT(DISTINCT b.guest_id) FROM booking b JOIN facility_order fo ON fo.booking_id=b.booking_id`); return { errA: a.error, rowsB: b.values.length, groups: g.values[0][0] }; },
};
const compares = [];
for (const c of COMPARES) {
  const results = [];
  for (const v of c.variants) results.push(await run(v.sql));
  const vals = await fillers[c.id](results);
  const explain = c.explainTpl.replace(/\{(\w+)\}/g, (_, k) => { if (!(k in vals)) throw new Error(`${c.id} ${k}`); return vals[k]; });
  compares.push({ id: c.id, ref: c.ref, title: c.title, question: c.question, variants: c.variants, explain });
}

/* ---------- ERD ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const HEAD = 40, ROW = 26;
function erd(pos, W, vbW, vbH, linkFn, cls) {
  const box = name => {
    const t = TABLES.find(t => t.name === name); const [x, y] = pos[name];
    return { t, x, y, h: HEAD + t.cols.length * ROW + 6, rowY: col => y + HEAD + 3 + t.cols.findIndex(c => c[0] === col) * ROW + ROW / 2 };
  };
  let g = '';
  for (const name of Object.keys(pos)) {
    const b = box(name);
    g += `<g class="erd-t" data-table="${name}" tabindex="0" role="button" aria-label="${name}（${esc(b.t.zh)}）：看欄位與樣本資料">
<rect class="erd-box" x="${b.x}" y="${b.y}" width="${W}" height="${b.h}" rx="12"/>
<path class="erd-head" d="M${b.x} ${b.y + HEAD}V${b.y + 12}a12 12 0 0 1 12-12h${W - 24}a12 12 0 0 1 12 12V${b.y + HEAD}Z"/>
<text class="erd-name" x="${b.x + 16}" y="${b.y + 26}">${name}</text><text class="erd-zh" x="${b.x + W - 16}" y="${b.y + 26}" text-anchor="end">${esc(b.t.zh)}</text>`;
    b.t.cols.forEach(([col, type, k], i) => {
      const cy = b.y + HEAD + 3 + i * ROW + ROW / 2;
      if (k) g += `<rect class="erd-k erd-k--${k.toLowerCase()}" x="${b.x + 12}" y="${cy - 9}" width="26" height="18" rx="5"/><text class="erd-kt erd-kt--${k.toLowerCase()}" x="${b.x + 25}" y="${cy + 4}" text-anchor="middle">${k}</text>`;
      g += `<text class="erd-col${k === 'PK' ? ' is-pk' : ''}" x="${b.x + 46}" y="${cy + 4.5}">${col}</text><text class="erd-type" x="${b.x + W - 16}" y="${cy + 4.5}" text-anchor="end">${type}</text>`;
    });
    g += '</g>';
  }
  let l = '';
  RELATIONS.forEach(([ct, cc, pt, pc, label], i) => {
    l += `<path class="erd-link" data-from="${ct}" data-to="${pt}" d="${linkFn(box, ct, cc, pt, pc, i)}" marker-start="url(#${cls}-many)" marker-end="url(#${cls}-one)"/>`;
  });
  return `<svg class="erd ${cls}" viewBox="0 0 ${vbW} ${vbH}" role="group" aria-label="資料庫 ERD：6 張資料表與 5 個一對多關聯">
<defs><marker id="${cls}-many" viewBox="0 0 16 16" refX="16" refY="8" markerWidth="16" markerHeight="16" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path class="erd-mk" d="M0 8L16 2M0 8L16 8M0 8L16 14"/></marker>
<marker id="${cls}-one" viewBox="0 0 16 16" refX="16" refY="8" markerWidth="16" markerHeight="16" orient="auto" markerUnits="userSpaceOnUse"><path class="erd-mk" d="M7 2V14M11 2V14"/></marker></defs>
${l}${g}</svg>`;
}
// desktop: three columns across the 1280 wrap
const W1 = 268, X = [0, 506, 1012];
const posD = { guest: [X[0], 0], booking: [X[1], 0], room: [X[2], 0], facility: [X[0], 312], facility_order: [X[1], 312], room_type: [X[2], 312] };
const linksD = {
  'booking.guest_id': b => { const c = b('booking'), p = b('guest'); const y1 = c.rowY('guest_id'), y2 = p.rowY('guest_id'), mx = (p.x + W1 + c.x) / 2; return `M${c.x} ${y1}H${mx}V${y2}H${p.x + W1}`; },
  'booking.room_no': b => { const c = b('booking'), p = b('room'); const y1 = c.rowY('room_no'), y2 = p.rowY('room_no'), mx = (c.x + W1 + p.x) / 2; return `M${c.x + W1} ${y1}H${mx}V${y2}H${p.x}`; },
  'room.type_id': b => { const c = b('room'), p = b('room_type'); const x = c.x + W1 / 2; return `M${x} ${c.y + c.h}V${p.y}`; },
  'facility_order.booking_id': b => { const c = b('facility_order'), p = b('booking'); const x = c.x + W1 / 2; return `M${x} ${c.y}V${p.y + p.h}`; },
  'facility_order.facility_id': b => { const c = b('facility_order'), p = b('facility'); const y1 = c.rowY('facility_id'), y2 = p.rowY('facility_id'), mx = (p.x + W1 + c.x) / 2; return `M${c.x} ${y1}H${mx}V${y2}H${p.x + W1}`; },
};
const erdD = erd(posD, W1, 1280, 488, (b, ct, cc) => linksD[`${ct}.${cc}`](b), 'erd--wide');
// phone: one column, links in lanes on the right
const W2 = 286, order = ['facility', 'facility_order', 'booking', 'guest', 'room', 'room_type'];
const posM = {}; let yy = 0;
for (const n of order) { posM[n] = [0, yy]; yy += HEAD + TABLES.find(t => t.name === n).cols.length * ROW + 6 + 36; }
const erdM = erd(posM, W2, 342, yy - 36 + 2, (b, ct, cc, pt, pc, i) => {
  const c = b(ct), p = b(pt); const lane = W2 + 12 + i * 9; return `M${W2} ${c.rowY(cc)}H${lane}V${p.rowY(pc)}H${W2}`;
}, 'erd--tall');

// tablet: two columns, every link through its own lane in the gutter
const W3 = 286, GX = 354, posT = { guest: [0, 0], booking: [GX, 0], facility: [0, 290], facility_order: [GX, 290], room: [0, 502], room_type: [GX, 502] };
const erdT = erd(posT, W3, 640, 680, (b, ct, cc, pt, pc, i) => {
  const c = b(ct), p = b(pt), lane = W3 + 10 + i * 12;
  const side = bx => bx.x === 0 ? W3 : GX;
  return `M${side(c)} ${c.rowY(cc)}H${lane}V${p.rowY(pc)}H${side(p)}`;
}, 'erd--mid');

/* ---------- page ---------- */
const DATA = {
  seed: seedSQL(),
  tables: TABLES.map(t => ({ ...t, rows: ROWS[t.name] })),
  relations: RELATIONS, queries, compares, icons: ICONS,
};
const kitCSS = ['assets/system.css', 'assets/motion/motion.css', 'assets/layout/layout.css'].map(rd).join('\n');
const kitJS = ['assets/system.js', 'assets/motion/motion.js'].map(rd).map(s => s.replace(/<\/(script)/gi, '<\\/$1'));
let html = rd('src/template.html');
html = html
  .replace('/*__KITCSS__*/', () => kitCSS)
  .replace('/*__SYSTEMJS__*/', () => kitJS[0])
  .replace('/*__MOTIONJS__*/', () => kitJS[1])
  .replace('/*__DATA__*/null', () => JSON.stringify(DATA).replace(/</g, '\\u003c'))
  .replace('<!--__ERD__-->', () => erdD)
  .replace('<!--__ERD_M__-->', () => erdT + erdM)
  .replace(/\{\{brand:(\w+)\}\}/g, (_, n) => BRAND[n])
  .replace(/\{\{si:(\w+)\}\}/g, (_, n) => si(n))
  .replace(/\{\{ic:([\w-]+)\}\}/g, (_, n) => icon(n));
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log(`index.html ${(html.length / 1024).toFixed(0)} KB`);
