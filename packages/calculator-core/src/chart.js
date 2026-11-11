/**
 * Tiny dependency-free SVG chart helper. Returns an SVG string so it can be
 * unit-tested without a DOM. Colors come from the tool's CSS tokens
 * (--chart-palette-1..4), so each tool's tool.css controls the palette.
 *
 * data:  [{ label: string, value: number, highlight?: boolean, highlightLabel?: string }]  (values >= 0)
 * style: 'bar' | 'line' | 'donut' | 'none'
 * opts:  { title, unit, xLabel, width, height }
 *   unit   value-axis unit, e.g. "bags" or "degrees" (meta.json "chartUnit")
 *   xLabel category-axis label, e.g. "Slab thickness" (meta.json "chartXLabel")
 *
 * Bar and line charts are drawn with a value axis (line, ticks, gridlines and
 * tick labels), the unit written on the value axis, a category axis with its
 * label, and every value printed on or next to its bar/point, so a visitor can
 * read the chart without guessing. Donut charts print each value, its share,
 * and the total with the unit.
 *
 * Highlight (optional, opt-in per row): mark the row that matches the
 * visitor's own result with highlight: true. It is never shown by color
 * alone: the bar/point/slice gets a thick outline in the tool's ink color
 * (--tool-ink), a text marker ("Yours" by default, or highlightLabel) and a
 * bold label, and the chart's accessible title names it.
 */
import { formatNumber } from './numbers.js';

const PALETTE = [1, 2, 3, 4].map((i) => `var(--chart-palette-${i})`);
const INK = 'var(--tool-ink, currentColor)';
const GRID = 'var(--chart-grid, rgba(31, 35, 40, 0.14))';
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fx = (n) => n.toFixed(1);
const fmt = (v) => formatNumber(v, { decimals: Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2 });

/** A "nice" axis: max rounded up and a step of 1, 2, 2.5 or 5 x 10^n, about 4 ticks. */
export function niceAxis(max, ticks = 4) {
  if (!(max > 0)) return { max: 1, step: 0.25, ticks: [0, 0.25, 0.5, 0.75, 1] };
  const raw = max / ticks;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw - 1e-12);
  const top = Math.ceil(Number((max / step).toPrecision(12))) * step;
  const list = [];
  for (let v = 0; v <= top + step / 2; v += step) list.push(Number(v.toPrecision(12)));
  return { max: top, step, ticks: list };
}

export function renderChart(style, data, { title = 'Chart', unit = '', xLabel = '', width = 360, height = 230 } = {}) {
  const rows = (data ?? []).filter((d) => Number.isFinite(d?.value) && d.value >= 0);
  if (style === 'none' || rows.length === 0 || !['bar', 'line', 'donut'].includes(style)) return '';
  const u = unit ? ` ${unit}` : '';
  const marker = (d) => (d.highlightLabel ? String(d.highlightLabel) : 'Yours');
  const desc = `<title>${esc(title)}: ${rows
    .map((d) => `${esc(d.label)} ${esc(fmt(d.value))}${esc(u)}${d.highlight ? ` (${esc(marker(d))})` : ''}`)
    .join(', ')}</title>`;
  const weight = (d) => (d.highlight ? ' font-weight="700"' : '');
  const open = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}" class="tool-chart tool-chart--${style}">`;
  let body = '';

  if (style === 'donut') {
    const total = rows.reduce((s, d) => s + d.value, 0) || 1;
    const r = Math.min(height / 2 - 26, 70);
    const cx = r + 22;
    const cy = height / 2;
    const c = 2 * Math.PI * r;
    let offset = 0;
    rows.forEach((d, i) => {
      const len = (d.value / total) * c;
      body += `<circle cx="${fx(cx)}" cy="${fx(cy)}" r="${fx(r)}" fill="none" stroke="${PALETTE[i % 4]}" stroke-width="${d.highlight ? 30 : 22}"${d.highlight ? ' class="tool-chart__hl"' : ''} stroke-dasharray="${len.toFixed(2)} ${(c - len).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 ${fx(cx)} ${fx(cy)})"/>`;
      offset += len;
    });
    body += `<text x="${fx(cx)}" y="${fx(cy - 2)}" text-anchor="middle" font-size="17" font-weight="700" fill="currentColor">${esc(fmt(total))}</text>`;
    body += `<text x="${fx(cx)}" y="${fx(cy + 14)}" text-anchor="middle" font-size="10" fill="currentColor">${esc(unit ? `${unit} total` : 'total')}</text>`;
    const lx = cx + r + 30;
    const rowH = Math.min(30, (height - 16) / rows.length);
    const ly0 = cy - (rowH * (rows.length - 1)) / 2;
    rows.forEach((d, i) => {
      const ly = ly0 + i * rowH;
      const box = d.highlight ? ` stroke="${INK}" stroke-width="2"` : '';
      const pct = Math.round((d.value / total) * 100);
      body += `<rect x="${fx(lx)}" y="${fx(ly - 10)}" width="12" height="12" rx="2" fill="${PALETTE[i % 4]}"${box}/>`;
      body += `<text x="${fx(lx + 18)}" y="${fx(ly)}" font-size="11" fill="currentColor"${weight(d)}>${esc(d.label)}${d.highlight ? ` (${esc(marker(d))})` : ''}</text>`;
      body += `<text x="${fx(lx + 18)}" y="${fx(ly + 12)}" font-size="10" fill="currentColor" class="tool-chart__sub">${esc(fmt(d.value))}${esc(u)} · ${pct}%</text>`;
    });
    return `${open}${desc}${body}</svg>`;
  }

  // Bar and line: plot area with axes.
  const m = { top: 30, right: 12, bottom: xLabel ? 44 : 28, left: 46 };
  const pw = width - m.left - m.right;
  const ph = height - m.top - m.bottom;
  const axis = niceAxis(Math.max(...rows.map((d) => d.value)));
  const y = (v) => m.top + ph - (v / axis.max) * ph;
  const x0 = m.left;
  const yBase = m.top + ph;

  // Gridlines, ticks and tick labels on the value axis.
  for (const t of axis.ticks) {
    const ty = y(t);
    body += `<line x1="${x0}" x2="${x0 + pw}" y1="${fx(ty)}" y2="${fx(ty)}" stroke="${GRID}" stroke-width="1"/>`;
    body += `<line x1="${x0 - 4}" x2="${x0}" y1="${fx(ty)}" y2="${fx(ty)}" stroke="currentColor" stroke-width="1"/>`;
    body += `<text x="${x0 - 7}" y="${fx(ty + 3.5)}" text-anchor="end" font-size="10" fill="currentColor" class="tool-chart__tick">${esc(fmt(t))}</text>`;
  }
  // Axis lines.
  body += `<line x1="${x0}" x2="${x0}" y1="${m.top - 4}" y2="${yBase}" stroke="currentColor" stroke-width="1.25" class="tool-chart__axis"/>`;
  body += `<line x1="${x0}" x2="${x0 + pw}" y1="${yBase}" y2="${yBase}" stroke="currentColor" stroke-width="1.25" class="tool-chart__axis"/>`;
  // Axis labels.
  if (unit) body += `<text x="${x0 - 40}" y="12" font-size="10" font-weight="700" fill="currentColor" class="tool-chart__unit">${esc(unit)}</text>`;
  if (xLabel) body += `<text x="${fx(x0 + pw / 2)}" y="${height - 6}" text-anchor="middle" font-size="10.5" font-weight="700" fill="currentColor" class="tool-chart__xlabel">${esc(xLabel)}</text>`;

  const slot = pw / rows.length;
  const cxOf = (i) => x0 + slot * i + slot / 2;
  const labelY = yBase + 15;
  const small = rows.length > 8 ? 9.5 : 10.5;

  if (style === 'bar') {
    const barW = Math.min(slot * 0.62, 56);
    rows.forEach((d, i) => {
      const cx = cxOf(i);
      const top = y(d.value);
      const h = Math.max(0, yBase - top);
      const hl = d.highlight ? ` stroke="${INK}" stroke-width="3" class="tool-chart__hl"` : '';
      body += `<rect x="${fx(cx - barW / 2)}" y="${fx(top)}" width="${fx(barW)}" height="${fx(h)}" rx="2" fill="${PALETTE[i % 4]}"${hl}/>`;
      body += `<text x="${fx(cx)}" y="${fx(top - 5)}" text-anchor="middle" font-size="10.5" font-weight="700" fill="currentColor" class="tool-chart__value">${esc(fmt(d.value))}</text>`;
      if (d.highlight) {
        body += `<text x="${fx(cx)}" y="${fx(Math.max(10, top - 18))}" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor" class="tool-chart__marker">▼ ${esc(marker(d))}</text>`;
      }
      body += `<text x="${fx(cx)}" y="${fx(labelY)}" text-anchor="middle" font-size="${small}" fill="currentColor"${weight(d)}>${esc(d.label)}</text>`;
    });
  } else {
    const pts = rows.map((d, i) => [cxOf(i), y(d.value)]);
    body += `<polyline fill="none" stroke="${PALETTE[0]}" stroke-width="2.5" stroke-linejoin="round" points="${pts.map((p) => `${fx(p[0])},${fx(p[1])}`).join(' ')}"/>`;
    const every = rows.length > 8 ? 2 : 1;
    pts.forEach((p, i) => {
      const d = rows[i];
      if (d.highlight) {
        body += `<circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="7" fill="${PALETTE[1]}" stroke="${INK}" stroke-width="3" class="tool-chart__hl"/>`;
        // Marker goes below-right of the point (under a rising line), or
        // below-left near the right edge; its value label replaces the plain one.
        const right = p[0] < x0 + pw - 90;
        const ty = Math.min(p[1] + 20, yBase - 6);
        body += `<text x="${fx(p[0] + (right ? 9 : -9))}" y="${fx(ty)}" text-anchor="${right ? 'start' : 'end'}" font-size="10.5" font-weight="700" fill="currentColor" class="tool-chart__marker">${esc(marker(d))}: ${esc(fmt(d.value))}</text>`;
      } else {
        body += `<circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="3.5" fill="${PALETTE[1]}"/>`;
        if (i % every === 0 || i === pts.length - 1) {
          body += `<text x="${fx(p[0])}" y="${fx(p[1] - 8)}" text-anchor="middle" font-size="9.5" fill="currentColor" class="tool-chart__value">${esc(fmt(d.value))}</text>`;
        }
      }
      body += `<text x="${fx(p[0])}" y="${fx(labelY)}" text-anchor="middle" font-size="${small}" fill="currentColor"${weight(d)}>${esc(d.label)}</text>`;
    });
  }
  return `${open}${desc}${body}</svg>`;
}
