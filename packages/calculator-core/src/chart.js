/**
 * Tiny dependency-free SVG chart helper. Returns an SVG string so it can be
 * unit-tested without a DOM. Colors come from the tool's CSS tokens
 * (--chart-palette-1..4), so each tool's tool.css controls the palette.
 *
 * data: [{ label: string, value: number, highlight?: boolean, highlightLabel?: string }]  (values >= 0)
 * style: 'bar' | 'line' | 'donut' | 'none'
 *
 * Highlight (optional, opt-in per row): mark the row that matches the
 * visitor's own result with highlight: true. It is never shown by color
 * alone: the bar/point/slice gets a thick outline in the tool's ink color
 * (--tool-ink, which already passes contrast on the tool surface), a text
 * marker ("Yours" by default, or highlightLabel) and bold label, and the
 * chart's accessible title names it. Rows without highlight render exactly
 * as before.
 */
const PALETTE = [1, 2, 3, 4].map((i) => `var(--chart-palette-${i})`);

const INK = 'var(--tool-ink, currentColor)';
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function renderChart(style, data, { title = 'Chart', width = 320, height = 180 } = {}) {
  const rows = (data ?? []).filter((d) => Number.isFinite(d?.value) && d.value >= 0);
  if (style === 'none' || rows.length === 0) return '';
  const max = Math.max(...rows.map((d) => d.value)) || 1;
  const open = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}" class="tool-chart tool-chart--${style}">`;
  const marker = (d) => (d.highlightLabel ? String(d.highlightLabel) : 'Yours');
  const desc = `<title>${esc(title)}: ${rows
    .map((d) => `${esc(d.label)} ${d.value}${d.highlight ? ` (${esc(marker(d))})` : ''}`)
    .join(', ')}</title>`;
  const weight = (d) => (d.highlight ? ' font-weight="700"' : '');
  let body = '';

  if (style === 'bar') {
    const gap = 12;
    const barW = (width - gap * (rows.length + 1)) / rows.length;
    rows.forEach((d, i) => {
      const h = Math.round((d.value / max) * (height - 30));
      const x = gap + i * (barW + gap);
      const hl = d.highlight ? ` stroke="${INK}" stroke-width="3" class="tool-chart__hl"` : '';
      body += `<rect x="${x.toFixed(1)}" y="${height - 20 - h}" width="${barW.toFixed(1)}" height="${h}" rx="3" fill="${PALETTE[i % 4]}"${hl}/>`;
      if (d.highlight) {
        body += `<text x="${(x + barW / 2).toFixed(1)}" y="${Math.max(11, height - 24 - h)}" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" class="tool-chart__marker">▼ ${esc(marker(d))}</text>`;
      }
      body += `<text x="${(x + barW / 2).toFixed(1)}" y="${height - 6}" text-anchor="middle" font-size="11" fill="currentColor"${weight(d)}>${esc(d.label)}</text>`;
    });
  } else if (style === 'line') {
    const step = rows.length > 1 ? (width - 40) / (rows.length - 1) : 0;
    const pts = rows.map((d, i) => [20 + i * step, height - 20 - (d.value / max) * (height - 40)]);
    body += `<polyline fill="none" stroke="${PALETTE[0]}" stroke-width="3" points="${pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ')}"/>`;
    pts.forEach((p, i) => {
      const d = rows[i];
      if (d.highlight) {
        body += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="8" fill="${PALETTE[1]}" stroke="${INK}" stroke-width="3" class="tool-chart__hl"/>`;
        const anchor = p[0] < 40 ? 'start' : p[0] > width - 40 ? 'end' : 'middle';
        const ty = p[1] > 30 ? p[1] - 13 : p[1] + 22;
        body += `<text x="${p[0].toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="${anchor}" font-size="11" font-weight="700" fill="currentColor" class="tool-chart__marker">${esc(marker(d))}</text>`;
      } else {
        body += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" fill="${PALETTE[1]}"/>`;
      }
      body += `<text x="${p[0].toFixed(1)}" y="${height - 4}" text-anchor="middle" font-size="11" fill="currentColor"${weight(d)}>${esc(d.label)}</text>`;
    });
  } else if (style === 'donut') {
    const total = rows.reduce((s, d) => s + d.value, 0) || 1;
    const r = Math.min(width * 0.6, height) / 2 - 20;
    const cx = r + 24;
    const c = 2 * Math.PI * r;
    let offset = 0;
    rows.forEach((d, i) => {
      const len = (d.value / total) * c;
      body += `<circle cx="${cx.toFixed(1)}" cy="${height / 2}" r="${r.toFixed(1)}" fill="none" stroke="${PALETTE[i % 4]}" stroke-width="${d.highlight ? 32 : 24}"${d.highlight ? ' class="tool-chart__hl"' : ''} stroke-dasharray="${len.toFixed(2)} ${(c - len).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 ${cx.toFixed(1)} ${height / 2})"/>`;
      // legend
      const ly = 24 + i * 22;
      const box = d.highlight ? ` stroke="${INK}" stroke-width="2"` : '';
      body += `<rect x="${(cx + r + 28).toFixed(1)}" y="${ly - 10}" width="12" height="12" rx="2" fill="${PALETTE[i % 4]}"${box}/>`;
      body += `<text x="${(cx + r + 46).toFixed(1)}" y="${ly}" font-size="12" fill="currentColor"${weight(d)}>${esc(d.label)}${d.highlight ? ` (${esc(marker(d))})` : ''}</text>`;
      offset += len;
    });
  } else {
    return '';
  }
  return `${open}${desc}${body}</svg>`;
}
