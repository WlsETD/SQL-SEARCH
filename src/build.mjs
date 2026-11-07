// 產生 index.html：node src/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TABLES, RELATIONS, QUERIES, COMPARES, ROWS, TRY } from './data.mjs';
import { run, seedSQL } from './engine.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const key = r => JSON.stringify(r);

// ---------- 預期結果 ----------
const queries = [];
for (const q of QUERIES) {
  const r = await run(q.sql);
  if (r.error) throw new Error(`${q.id}: ${r.error}`);
  queries.push({ ...q, try: TRY[q.id], expected: r });
}

// ---------- 比較說明（數字由實際結果填入） ----------
const fillers = {
  c1: ([a, b]) => {
    const inA = new Set(a.values.map(v => v[0]));
    return { missing: b.values.map(v => v[0]).filter(x => !inA.has(x)).join('、'), rowsA: a.values.length, rowsB: b.values.length };
  },
  c2: ([a, b]) => {
    const A = new Set(a.values.map(v => v[0])), B = new Set(b.values.map(v => v[0]));
    return { extraInA: [...A].filter(x => !B.has(x)).join('、'), missingInA: [...B].filter(x => !A.has(x)).join('、') };
  },
  c3: ([a, b]) => {
    const fa = a.values.find(v => v[0] === '豪華海景房'), fb = b.values.find(v => v[0] === '豪華海景房');
    const n = x => Number(x).toLocaleString('en-US');
    return { dlxA: fa[1], dlxB: fb[1], dlxDiff: n(fa[2] - fb[2]), dlxA2: n(fa[2]), dlxB2: n(fb[2]) };
  },
  c4: async ([a, b]) => {
    const A = new Set(a.values.map(v => v[0]));
    return { rowsA: a.values.length, rowsB: b.values.length, missing: b.values.filter(v => !A.has(v[0])).map(v => v[1]).join('、') };
  },
  c5: async ([a, b]) => {
    const g = await run(`SELECT COUNT(DISTINCT b.guest_id) FROM booking b JOIN facility_order fo ON fo.booking_id=b.booking_id`);
    return { errA: a.error, rowsB: b.values.length, groups: g.values[0][0] };
  },
};
const compares = [];
for (const c of COMPARES) {
  const results = [];
  for (const v of c.variants) results.push(await run(v.sql));
  const vals = await fillers[c.id](results);
  const explain = c.explainTpl.replace(/\{(\w+)\}/g, (_, k) => {
    if (!(k in vals)) throw new Error(`${c.id} missing ${k}`);
    return vals[k];
  });
  compares.push({ id: c.id, ref: c.ref, title: c.title, question: c.question, variants: c.variants, explain });
}

// ---------- ERD (SVG) ----------
const POS = {
  guest: [20, 20], booking: [360, 20], room: [700, 20],
  facility: [20, 330], facility_order: [360, 330], room_type: [700, 330],
};
const W = 250, HEAD = 36, ROW = 25;
const box = name => {
  const t = TABLES.find(t => t.name === name);
  const [x, y] = POS[name];
  return { t, x, y, h: HEAD + t.cols.length * ROW + 8, rowY: col => y + HEAD + 4 + t.cols.findIndex(c => c[0] === col) * ROW + ROW / 2 };
};
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let svg = '';
for (const name of Object.keys(POS)) {
  const b = box(name);
  svg += `<g class="erd-table" data-table="${name}">
  <rect class="erd-box" x="${b.x}" y="${b.y}" width="${W}" height="${b.h}" rx="10"/>
  <path class="erd-head" d="M${b.x} ${b.y + HEAD}V${b.y + 10}a10 10 0 0 1 10-10h${W - 20}a10 10 0 0 1 10 10V${b.y + HEAD}Z"/>
  <text class="erd-title" x="${b.x + 14}" y="${b.y + 24}">${name}<tspan class="erd-zh" dx="8">${esc(b.t.zh)}</tspan></text>`;
  b.t.cols.forEach(([col, type, k], i) => {
    const cy = b.y + HEAD + 4 + i * ROW + ROW / 2;
    if (i) svg += `<line class="erd-sep" x1="${b.x + 10}" x2="${b.x + W - 10}" y1="${cy - ROW / 2}" y2="${cy - ROW / 2}"/>`;
    const tag = k ? `<text class="erd-key erd-key-${k.toLowerCase()}" x="${b.x + 14}" y="${cy + 4}">${k}</text>` : '';
    svg += `${tag}<text class="erd-col${k === 'PK' ? ' is-pk' : ''}" x="${b.x + 46}" y="${cy + 4}">${col}</text><text class="erd-type" x="${b.x + W - 14}" y="${cy + 4}" text-anchor="end">${type}</text>`;
  });
  svg += `</g>\n`;
}
// 連線：子表(FK) → 父表(PK)
const links = {
  'booking.guest_id': () => { const c = box('booking'), p = box('guest'); const y1 = c.rowY('guest_id'), y2 = p.rowY('guest_id'); return `M${c.x} ${y1}H${c.x - 40}V${y2}H${p.x + W}`; },
  'booking.room_no': () => { const c = box('booking'), p = box('room'); const y1 = c.rowY('room_no'), y2 = p.rowY('room_no'); return `M${c.x + W} ${y1}H${c.x + W + 40}V${y2}H${p.x}`; },
  'room.type_id': () => { const c = box('room'), p = box('room_type'); const x = c.x + W / 2; return `M${x} ${c.y + c.h}V${p.y}`; },
  'facility_order.booking_id': () => { const c = box('facility_order'), p = box('booking'); const x = c.x + W / 2; return `M${x} ${c.y}V${p.y + p.h}`; },
  'facility_order.facility_id': () => { const c = box('facility_order'), p = box('facility'); const y1 = c.rowY('facility_id'), y2 = p.rowY('facility_id'); return `M${c.x} ${y1}H${c.x - 40}V${y2}H${p.x + W}`; },
};
let lines = '';
for (const [ct, cc, pt, pc, label] of RELATIONS) {
  lines += `<path class="erd-link" data-from="${ct}" data-to="${pt}" d="${links[`${ct}.${cc}`]()}" marker-start="url(#many)" marker-end="url(#one)"><title>${ct}.${cc} → ${pt}.${pc}：${esc(label)}</title></path>\n`;
}
const erd = `<svg class="erd" viewBox="0 0 970 520" role="img" aria-label="渡假村資料庫 ERD">
<defs>
  <marker id="many" viewBox="0 0 14 14" refX="14" refY="7" markerWidth="14" markerHeight="14" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path class="erd-mk" d="M0 7L14 1M0 7L14 7M0 7L14 13"/></marker>
  <marker id="one" viewBox="0 0 14 14" refX="14" refY="7" markerWidth="14" markerHeight="14" orient="auto" markerUnits="userSpaceOnUse"><path class="erd-mk" d="M6 1V13M10 1V13"/></marker>
</defs>
${lines}${svg}</svg>`;

// ---------- 輸出 ----------
const DATA = {
  seed: seedSQL(),
  tables: TABLES.map(t => ({ ...t, rows: ROWS[t.name] })),
  relations: RELATIONS,
  queries, compares,
  totalRows: Object.values(ROWS).reduce((s, r) => s + r.length, 0),
};
const tpl = fs.readFileSync(path.join(root, 'src/template.html'), 'utf8');
const html = tpl
  .replace('/*__DATA__*/null', () => JSON.stringify(DATA).replace(/</g, '\\u003c'))
  .replace('<!--__ERD__-->', () => erd);
fs.writeFileSync(path.join(root, 'index.html'), html);
fs.mkdirSync(path.join(root, 'lib'), { recursive: true });
for (const f of ['sql-wasm.js', 'sql-wasm.wasm'])
  fs.copyFileSync(path.join(root, 'node_modules/sql.js/dist', f), path.join(root, 'lib', f));
console.log(`index.html written (${(html.length / 1024).toFixed(1)} KB), ${queries.length} queries, ${compares.length} compares`);
