import initSqlJs from 'sql.js';
import { SCHEMA, ROWS } from './data.mjs';

export function seedSQL() {
  const esc = v => v === null ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
  let out = SCHEMA.trim() + '\n\n';
  for (const [t, rows] of Object.entries(ROWS)) {
    out += `INSERT INTO ${t} VALUES\n` + rows.map(r => `  (${r.map(esc).join(', ')})`).join(',\n') + ';\n\n';
  }
  return out;
}

let SQL;
export async function run(sql) {
  SQL ??= await initSqlJs();
  const db = new SQL.Database();
  db.exec(seedSQL());
  try {
    const res = db.exec(sql);
    const last = res[res.length - 1] || { columns: [], values: [] };
    return { columns: last.columns, values: last.values };
  } catch (e) {
    return { error: e.message };
  } finally { db.close(); }
}
