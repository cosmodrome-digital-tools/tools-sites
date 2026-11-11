/**
 * Labeled SVG diagrams for the shared calculator frame. Dependency-free and
 * DOM-free: renderDiagram() returns an SVG string, so it runs at build time
 * (the default-dimension drawing is in the HTML, so the page isn't blank
 * without JavaScript) and again in the browser on every input.
 *
 * A tool's calculate() returns an optional `diagram` object (plain data):
 *
 *   { type: 'box', length: 10, width: 10, depth: 4, unit: 'ft', depthUnit: 'in' }
 *
 * Types (see docs/BUILDING-TOOLS.md for every field):
 *   box       slab / pad / layer in 3D: length x width x depth (optional layers)
 *   cylinder  round column / tube: diameter x height (optional count)
 *   plan      top view of one or more rectangles, a circle, or a ring, with an
 *             optional pattern (boards, grid, pavers, turf, hatch, shingles)
 *   triangle  rise / run / slope length with the angle and x/12 pitch
 *   stairs    stair stringer profile: risers, treads, total rise and run
 *   fence     a fence line: posts, sections, spacing, height
 *   wall      wall elevation with an optional gable, openings, and pattern
 *   room      a room box: length x width x height, walls and ceiling called out
 *   attic     roof cross-section: span, intake/exhaust vents, insulation depth
 *
 * Every number shown is written next to its dimension line with its unit, and
 * the SVG has role="img" plus an aria-label that states the dimensions.
 * Any label can be replaced with a ready-made string, e.g. lengthLabel: "12 ft 6 in".
 * Drawings are schematic: proportions follow the inputs within limits so thin
 * or huge values stay readable ("not to scale" is printed when clamped).
 */
import { formatNumber } from './numbers.js';

const W = 360;
const H = 240;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const f = (n) => (Math.round(n * 10) / 10).toString();
const num = (v) => (Number.isFinite(v) ? formatNumber(v, { decimals: Math.abs(v) >= 100 ? 0 : 2 }) : '?');
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const fin = (v, d = 0) => (Number.isFinite(v) && v > 0 ? v : d);

/** "10 ft", "4 in", or the explicit label if one was given. */
export const dimLabel = (value, unit, explicit) => explicit ?? `${num(value)}${unit ? ` ${unit}` : ''}`;

// ---- drawing primitives -------------------------------------------------
function text(x, y, s, { anchor = 'middle', size = 11, weight = 400, cls = 'dg-label' } = {}) {
  return `<text x="${f(x)}" y="${f(y)}" text-anchor="${anchor}" font-size="${size}"${weight !== 400 ? ` font-weight="${weight}"` : ''} class="${cls}">${esc(s)}</text>`;
}
function arrowHead(x, y, ux, uy) {
  const s = 6;
  const px = -uy;
  const py = ux;
  return `<polygon class="dg-arrow" points="${f(x)},${f(y)} ${f(x - ux * s + px * s * 0.45)},${f(y - uy * s + py * s * 0.45)} ${f(x - ux * s - px * s * 0.45)},${f(y - uy * s - py * s * 0.45)}"/>`;
}
/**
 * Dimension line between (x1,y1) and (x2,y2), pushed `off` px to the left of
 * the direction of travel, with extension lines, arrowheads, and a label.
 */
function dim(x1, y1, x2, y2, label, { off = 14, labelPos = 'center', size = 11 } = {}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = uy;
  const ny = -ux;
  const a = [x1 + nx * off, y1 + ny * off];
  const b = [x2 + nx * off, y2 + ny * off];
  let s = '';
  if (off) {
    const e = off > 0 ? 3 : -3;
    s += `<line class="dg-ext" x1="${f(x1 + nx * 2 * Math.sign(off))}" y1="${f(y1 + ny * 2 * Math.sign(off))}" x2="${f(a[0] + nx * e)}" y2="${f(a[1] + ny * e)}"/>`;
    s += `<line class="dg-ext" x1="${f(x2 + nx * 2 * Math.sign(off))}" y1="${f(y2 + ny * 2 * Math.sign(off))}" x2="${f(b[0] + nx * e)}" y2="${f(b[1] + ny * e)}"/>`;
  }
  s += `<line class="dg-dim" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"/>`;
  if (len > 14) s += arrowHead(b[0], b[1], ux, uy) + arrowHead(a[0], a[1], -ux, -uy);
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  // Label sits beside the line, on the outside, horizontal for readability.
  const side = Math.sign(off) || 1;
  let lx = mx + nx * 9 * side;
  let ly = my + ny * 9 * side + 4;
  let anchor = 'middle';
  if (Math.abs(nx) > 0.6) anchor = nx * side > 0 ? 'start' : 'end';
  if (Math.abs(ny) > 0.6 && ny * side > 0) ly += 4;
  if (labelPos === 'on') {
    lx = mx;
    ly = my + 4;
    anchor = 'middle';
  }
  s += text(lx, ly, label, { anchor, size, weight: 700, cls: 'dg-label dg-label--dim' });
  return s;
}
const poly = (pts, cls, extra = '') => `<polygon class="${cls}" points="${pts.map((p) => `${f(p[0])},${f(p[1])}`).join(' ')}"${extra}/>`;
const rect = (x, y, w, h, cls, extra = '') => `<rect class="${cls}" x="${f(x)}" y="${f(y)}" width="${f(Math.max(0, w))}" height="${f(Math.max(0, h))}"${extra}/>`;
const line = (x1, y1, x2, y2, cls = 'dg-line') => `<line class="${cls}" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;
const note = (s) => text(W - 6, H - 6, s, { anchor: 'end', size: 9.5, cls: 'dg-label dg-note' });

// Fill patterns (ids are scoped by a per-render prefix so several diagrams can share a page).
function patterns(p) {
  return `<defs>
<pattern id="${p}-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="dg-pat" x1="0" y1="0" x2="0" y2="8"/></pattern>
<pattern id="${p}-boards-h" width="40" height="7" patternUnits="userSpaceOnUse"><line class="dg-pat" x1="0" y1="6.5" x2="40" y2="6.5"/></pattern>
<pattern id="${p}-boards-v" width="7" height="40" patternUnits="userSpaceOnUse"><line class="dg-pat" x1="6.5" y1="0" x2="6.5" y2="40"/></pattern>
<pattern id="${p}-pavers" width="16" height="16" patternUnits="userSpaceOnUse"><path class="dg-pat" d="M0 .5H16M0 8.5H16M8 0V8M0 8V16M16 8V16" fill="none"/></pattern>
<pattern id="${p}-brick" width="16" height="8" patternUnits="userSpaceOnUse"><path class="dg-pat" d="M0 .5H16M0 4.5H16M8 0V4M0 4V8M16 4V8" fill="none"/></pattern>
<pattern id="${p}-block" width="32" height="14" patternUnits="userSpaceOnUse"><path class="dg-pat" d="M0 .5H32M0 7.5H32M16 0V7M0 7V14M32 7V14" fill="none"/></pattern>
<pattern id="${p}-siding" width="40" height="6" patternUnits="userSpaceOnUse"><line class="dg-pat" x1="0" y1="5.5" x2="40" y2="5.5"/></pattern>
<pattern id="${p}-turf" width="24" height="12" patternUnits="userSpaceOnUse"><path class="dg-pat" d="M0 .5H24M0 6.5H24M12 0V6M0 6V12M24 6V12" fill="none"/></pattern>
<pattern id="${p}-shingles" width="18" height="9" patternUnits="userSpaceOnUse"><path class="dg-pat" d="M0 .5H18M0 4.5H18M6 0V4M15 4V8" fill="none"/></pattern>
<pattern id="${p}-insul" width="12" height="10" patternUnits="userSpaceOnUse"><path class="dg-pat" d="M0 5 Q3 0 6 5 T12 5" fill="none"/></pattern>
</defs>`;
}
const fillOf = (p, pattern) => (pattern ? ` style="fill:url(#${p}-${pattern})"` : '');

// ---- diagram types -----------------------------------------------------
const TYPES = {};

TYPES.box = (d) => {
  const L = fin(d.length, 10);
  const Wd = clamp(fin(d.width, 10), L * 0.15, L * 4);
  const s = Math.min(230 / (L + Wd * 0.62), 118 / (Wd * 0.46));
  const lp = L * s;
  const wp = Wd * s;
  const ex = wp * 0.62;
  const ey = wp * 0.46;
  const dp = clamp(d.depthPx ?? 30, 18, 54);
  const ox = (W - (lp + ex)) / 2 - 6;
  const oy = Math.max(30, (H - 24 - (ey + dp)) / 2) + ey;
  const P = (x, y) => [ox + x, oy + y];
  let s2 = '';
  s2 += poly([P(0, 0), P(lp, 0), P(lp + ex, -ey), P(ex, -ey)], 'dg-shape dg-shape--top', fillOf(d._p, d.pattern));
  s2 += poly([P(lp, 0), P(lp + ex, -ey), P(lp + ex, -ey + dp), P(lp, dp)], 'dg-shape dg-shape--side');
  s2 += poly([P(0, 0), P(lp, 0), P(lp, dp), P(0, dp)], 'dg-shape dg-shape--front');
  const layers = Array.isArray(d.layers) ? d.layers.filter((l) => l && fin(l.depth)) : [];
  if (layers.length > 1) {
    const total = layers.reduce((a, l) => a + l.depth, 0);
    let acc = 0;
    layers.forEach((l, i) => {
      const y0 = (acc / total) * dp;
      acc += l.depth;
      const y1 = (acc / total) * dp;
      if (i > 0) s2 += line(P(0, y0)[0], P(0, y0)[1], P(lp, y0)[0], P(lp, y0)[1], 'dg-line dg-line--layer');
      s2 += text(P(lp + ex + 8, -ey + (y0 + y1) / 2)[0], P(0, -ey + (y0 + y1) / 2)[1] + 4, `${l.label ?? `Layer ${i + 1}`}: ${dimLabel(l.depth, d.depthUnit ?? 'in', l.depthLabel)}`, { anchor: 'start', size: 10 });
    });
  }
  s2 += dim(P(0, dp)[0], P(0, dp)[1], P(lp, dp)[0], P(lp, dp)[1], dimLabel(d.length, d.unit ?? 'ft', d.lengthLabel), { off: -16 });
  s2 += dim(P(0, 0)[0], P(0, 0)[1], P(ex, -ey)[0], P(ex, -ey)[1], dimLabel(d.width, d.unit ?? 'ft', d.widthLabel), { off: 16 });
  if (layers.length > 1) s2 += dim(P(0, 0)[0], P(0, 0)[1], P(0, dp)[0], P(0, dp)[1], dimLabel(d.depth, d.depthUnit ?? 'in', d.depthLabel), { off: 14 });
  else s2 += dim(P(lp + ex, -ey)[0], P(lp + ex, -ey)[1], P(lp + ex, -ey + dp)[0], P(lp + ex, -ey + dp)[1], dimLabel(d.depth, d.depthUnit ?? 'in', d.depthLabel), { off: -12 });
  if (d.caption) s2 += text(W / 2, 18, d.caption, { size: 11, weight: 700 });
  s2 += note('Depth drawn larger for clarity');
  const aria = `${d.name ?? 'Slab'}: ${dimLabel(d.length, d.unit ?? 'ft', d.lengthLabel)} long by ${dimLabel(d.width, d.unit ?? 'ft', d.widthLabel)} wide by ${dimLabel(d.depth, d.depthUnit ?? 'in', d.depthLabel)} deep${layers.length > 1 ? ` (${layers.map((l) => `${l.label}: ${dimLabel(l.depth, d.depthUnit ?? 'in', l.depthLabel)}`).join(', ')})` : ''}`;
  return { body: s2, aria };
};

TYPES.cylinder = (d) => {
  const D = fin(d.diameter, 12);
  const Hh = fin(d.height, 36);
  const s = Math.min(150 / D, 150 / Hh);
  const dw = clamp(D * s, 50, 150);
  const hh = clamp(Hh * s, 40, 150);
  const cx = W / 2 - 20;
  const top = 40;
  const ry = dw * 0.18;
  let b = '';
  b += `<path class="dg-shape dg-shape--front" d="M${f(cx - dw / 2)} ${f(top)} V${f(top + hh)} A${f(dw / 2)} ${f(ry)} 0 0 0 ${f(cx + dw / 2)} ${f(top + hh)} V${f(top)} Z"/>`;
  b += `<ellipse class="dg-shape dg-shape--top" cx="${f(cx)}" cy="${f(top)}" rx="${f(dw / 2)}" ry="${f(ry)}"/>`;
  b += dim(cx - dw / 2, top, cx + dw / 2, top, dimLabel(d.diameter, d.unit ?? 'in', d.diameterLabel), { off: 12 + ry });
  b += dim(cx + dw / 2, top, cx + dw / 2, top + hh, dimLabel(d.height, d.unit ?? 'in', d.heightLabel), { off: -16 });
  if (d.count > 1) b += text(cx, top + hh + ry + 22, `× ${num(d.count)} ${d.countLabel ?? 'identical pours'}`, { size: 11, weight: 700 });
  const aria = `${d.name ?? 'Round column'}: ${dimLabel(d.diameter, d.unit ?? 'in', d.diameterLabel)} diameter by ${dimLabel(d.height, d.unit ?? 'in', d.heightLabel)} high${d.count > 1 ? `, ${d.count} of them` : ''}`;
  return { body: b, aria };
};

TYPES.plan = (d) => {
  const unit = d.unit ?? 'ft';
  const shape = d.shape ?? 'rect';
  let b = '';
  let aria;
  const pat = fillOf(d._p, d.pattern);
  if (shape === 'circle' || shape === 'ring') {
    const r = 72;
    const cx = W / 2 - 10;
    const cy = 112;
    b += `<circle class="dg-shape dg-shape--top" cx="${cx}" cy="${cy}" r="${r}"${pat}/>`;
    if (shape === 'ring' && fin(d.innerDiameter)) {
      const ri = clamp((d.innerDiameter / fin(d.diameter, 1)) * r, 6, r - 10);
      b += `<circle class="dg-shape dg-hole" cx="${cx}" cy="${cy}" r="${f(ri)}"/>`;
      b += text(cx, cy + 4, d.innerLabel ?? `${dimLabel(d.innerDiameter, unit)} clear`, { size: 9.5 });
    }
    b += dim(cx - r, cy, cx + r, cy, dimLabel(d.diameter, unit, d.diameterLabel), { off: shape === 'ring' ? r + 14 : 0, labelPos: shape === 'ring' ? 'center' : 'on' });
    aria = `${d.name ?? 'Circle'} plan: ${dimLabel(d.diameter, unit, d.diameterLabel)} across${shape === 'ring' && d.innerDiameter ? `, ${dimLabel(d.innerDiameter, unit)} left clear in the middle` : ''}`;
  } else if (Array.isArray(d.areas) && d.areas.length > 1) {
    const areas = d.areas.slice(0, 6);
    const gap = 12;
    const totalL = areas.reduce((a, r) => a + fin(r.length, 1), 0);
    const maxW = Math.max(...areas.map((r) => fin(r.width, 1)));
    const s = Math.min((W - 40 - gap * (areas.length - 1)) / totalL, 140 / maxW);
    let x = (W - (totalL * s + gap * (areas.length - 1))) / 2;
    const yTop = 52;
    areas.forEach((r, i) => {
      const w = Math.max(fin(r.length, 1) * s, 24);
      const h = clamp(fin(r.width, 1) * s, 18, 150);
      b += rect(x, yTop, w, h, 'dg-shape dg-shape--top', pat);
      b += text(x + w / 2, yTop - 22, r.label ?? `Area ${i + 1}`, { size: 10, weight: 700 });
      b += text(x + w / 2, yTop - 9, `${dimLabel(r.length, unit, r.lengthLabel)} × ${dimLabel(r.width, unit, r.widthLabel)}`, { size: 9.5 });
      x += w + gap;
    });
    aria = `${d.name ?? 'Plan'}: ${areas.map((r, i) => `${r.label ?? `Area ${i + 1}`} ${dimLabel(r.length, unit, r.lengthLabel)} by ${dimLabel(r.width, unit, r.widthLabel)}`).join('; ')}`;
  } else {
    const a = Array.isArray(d.areas) && d.areas.length === 1 ? { ...d, ...d.areas[0] } : d;
    const L = fin(a.length, 10);
    const Wd = clamp(fin(a.width, 10), L * 0.12, L * 3);
    const s = Math.min(250 / L, 140 / Wd);
    const w = L * s;
    const h = Wd * s;
    const x = (W - w) / 2 + 8;
    const y = 40 + (140 - h) / 2;
    b += rect(x, y, w, h, 'dg-shape dg-shape--top', pat);
    if (d.joists) {
      // Framing under deck boards, drawn dashed across the board direction.
      const across = d.boardsRun === 'width';
      const n = clamp(Math.round((across ? Wd : L) * 12 / fin(d.joists, 16)), 2, 40);
      for (let i = 1; i < n; i++) {
        b += across ? line(x, y + (h * i) / n, x + w, y + (h * i) / n, 'dg-line dg-line--hidden') : line(x + (w * i) / n, y, x + (w * i) / n, y + h, 'dg-line dg-line--hidden');
      }
    }
    if (d.gridSpacing) {
      const n = clamp(Math.round((L * 12) / d.gridSpacing), 1, 40);
      const m = clamp(Math.round((Wd * 12) / d.gridSpacing), 1, 30);
      for (let i = 1; i < n; i++) b += line(x + (w * i) / n, y + 3, x + (w * i) / n, y + h - 3, 'dg-line dg-line--bar');
      for (let j = 1; j < m; j++) b += line(x + 3, y + (h * j) / m, x + w - 3, y + (h * j) / m, 'dg-line dg-line--bar');
      if (m > 1) b += dim(x + w, y, x + w, y + h / m, d.gridLabel ?? `${num(d.gridSpacing)} in o.c.`, { off: -10, size: 10 });
    }
    b += dim(x, y, x + w, y, dimLabel(a.length, unit, a.lengthLabel), { off: 14 });
    b += dim(x, y + h, x, y, dimLabel(a.width, unit, a.widthLabel), { off: 14 });
    if (d.arrow) b += text(x + w / 2, y + h / 2 + 4, d.arrow, { size: 10.5, weight: 700, cls: 'dg-label dg-label--on' });
    aria = `${d.name ?? 'Plan'}: ${dimLabel(a.length, unit, a.lengthLabel)} by ${dimLabel(a.width, unit, a.widthLabel)}${d.gridSpacing ? `, bars ${num(d.gridSpacing)} in on center` : ''}`;
  }
  if (d.depthNote) b += text(W / 2, H - 22, d.depthNote, { size: 11, weight: 700 });
  if (d.caption) b += text(W / 2, H - 8, d.caption, { size: 10 });
  if (d.depthNote) aria += `, ${d.depthNote}`;
  return { body: b, aria };
};

TYPES.triangle = (d) => {
  const run = fin(d.run, 12);
  const rise = Number.isFinite(d.rise) && d.rise >= 0 ? d.rise : 6;
  const s = Math.min(220 / run, 140 / Math.max(rise, 0.01));
  const rw = run * s;
  const rh = Math.max(rise * s, 4);
  const x0 = (W - rw) / 2 - 20;
  const yB = 190;
  const A = [x0, yB];
  const B = [x0 + rw, yB];
  const C = [x0 + rw, yB - rh];
  let b = poly([A, B, C], 'dg-shape dg-shape--top');
  b += line(A[0], A[1], C[0], C[1], 'dg-line dg-line--strong');
  // Right-angle mark.
  b += `<path class="dg-line" fill="none" d="M${f(B[0] - 10)} ${f(B[1])} V${f(B[1] - 10)} H${f(B[0])}"/>`;
  // Angle arc at the low corner.
  const ang = Math.atan2(rh, rw);
  const ar = 34;
  b += `<path class="dg-line dg-line--accent" fill="none" d="M${f(A[0] + ar)} ${f(A[1])} A${ar} ${ar} 0 0 0 ${f(A[0] + ar * Math.cos(ang))} ${f(A[1] - ar * Math.sin(ang))}"/>`;
  b += text(A[0] + ar + 6, A[1] - 6, d.angleLabel ?? `${num(d.angle)}°`, { anchor: 'start', size: 11, weight: 700 });
  b += dim(A[0], A[1], B[0], B[1], `${d.runName ?? 'Run'} ${dimLabel(d.run, d.unit ?? 'in', d.runLabel)}`, { off: -18 });
  b += dim(B[0], B[1], C[0], C[1], `${d.riseName ?? 'Rise'} ${dimLabel(rise, d.unit ?? 'in', d.riseLabel)}`, { off: -16 });
  const hyp = Math.hypot(d.run ?? run, rise);
  b += dim(A[0], A[1], C[0], C[1], `${d.slopeName ?? 'Rafter'} ${dimLabel(d.slope ?? hyp, d.unit ?? 'in', d.slopeLabel)}`, { off: 18 });
  if (Number.isFinite(d.pitch)) {
    b += rect(12, 12, 86, 40, 'dg-badge', ' rx="6"');
    b += text(55, 30, 'Pitch', { size: 10 });
    b += text(55, 46, `${num(d.pitch)} / 12`, { size: 14, weight: 700 });
  }
  const aria = `Right triangle: ${d.riseName ?? 'rise'} ${dimLabel(rise, d.unit ?? 'in', d.riseLabel)}, ${d.runName ?? 'run'} ${dimLabel(d.run, d.unit ?? 'in', d.runLabel)}, ${(d.slopeName ?? 'rafter').toLowerCase()} ${dimLabel(d.slope ?? hyp, d.unit ?? 'in', d.slopeLabel)}, angle ${d.angleLabel ?? `${num(d.angle)} degrees`}${Number.isFinite(d.pitch) ? `, pitch ${num(d.pitch)}/12` : ''}`;
  return { body: b, aria };
};

TYPES.stairs = (d) => {
  const n = clamp(Math.round(fin(d.risers, 8)), 1, 40);
  const r = fin(d.riserHeight, 7.5);
  const t = fin(d.treadDepth, 10);
  const treads = Math.max(n - 1, 0);
  const totalRun = treads * t || t;
  const totalRise = n * r;
  const x0 = 104;
  const s = Math.min((W - x0 - 150) / (totalRun + t), 150 / totalRise);
  const yB = 200;
  let path = `M${f(x0)} ${f(yB)}`;
  let x = x0;
  let y = yB;
  for (let i = 0; i < n; i++) {
    y -= r * s;
    path += ` V${f(y)}`;
    if (i < n - 1) {
      x += t * s;
      path += ` H${f(x)}`;
    }
  }
  const topX = x;
  const topY = y;
  // Upper floor / deck line.
  let b = `<path class="dg-shape dg-shape--top" d="${path} H${f(topX + 40)} V${f(topY + 10)} H${f(topX + 4)} L${f(x0 + 4)} ${f(yB)} Z"/>`;
  b += `<path class="dg-line dg-line--strong" fill="none" d="${path} H${f(topX + 40)}"/>`;
  b += text(topX + 22, topY - 6, d.topLabel ?? 'Deck / upper floor', { size: 9.5 });
  b += line(x0 - 20, yB, W - 10, yB, 'dg-line dg-line--ground');
  // Stringer line (bottom edge of the board).
  b += line(x0 + 4, yB, topX + 4, topY + 10, 'dg-line dg-line--accent');
  b += dim(x0, yB, x0, yB - r * s, `Riser ${dimLabel(d.riserHeight, 'in', d.riserLabel)}`, { off: 10, size: 10 });
  if (n > 1) b += dim(x0, yB - r * s, x0 + t * s, yB - r * s, `Tread ${dimLabel(d.treadDepth, 'in', d.treadLabel)}`, { off: 8, size: 10 });
  b += dim(topX + 40, yB, topX + 40, topY, `Total rise ${dimLabel(d.totalRise ?? totalRise, 'in', d.totalRiseLabel)}`, { off: -10, size: 10 });
  b += dim(x0, yB, topX, yB, `Total run ${dimLabel(d.totalRun ?? totalRun, 'in', d.totalRunLabel)}`, { off: -16, size: 10 });
  if (d.stringerLength) b += text((x0 + topX) / 2 + 18, (yB + topY) / 2 + 28, `Stringer ${dimLabel(d.stringerLength, 'in', d.stringerLabel)}`, { anchor: 'start', size: 10, weight: 700 });
  const aria = `Stair stringer profile: ${n} risers of ${dimLabel(d.riserHeight, 'in', d.riserLabel)} and ${treads} treads of ${dimLabel(d.treadDepth, 'in', d.treadLabel)}; total rise ${dimLabel(d.totalRise ?? totalRise, 'in', d.totalRiseLabel)}, total run ${dimLabel(d.totalRun ?? totalRun, 'in', d.totalRunLabel)}${d.stringerLength ? `, stringer about ${dimLabel(d.stringerLength, 'in', d.stringerLabel)}` : ''}`;
  return { body: b, aria };
};

TYPES.fence = (d) => {
  const posts = clamp(Math.round(fin(d.posts, 2)), 2, 999);
  const show = posts > 9 ? [0, 1, 2, 3, -1, posts - 2, posts - 1] : Array.from({ length: posts }, (_, i) => i);
  const slots = show.length - 1;
  const x0 = 50;
  const span = W - 80;
  const step = span / slots;
  const yG = 170;
  const hp = 90;
  let b = line(20, yG, W - 10, yG, 'dg-line dg-line--ground');
  const xs = show.map((p, i) => [p, x0 + i * step]);
  for (let i = 0; i < xs.length - 1; i++) {
    const [p, x] = xs[i];
    const [q, x2] = xs[i + 1];
    if (p === -1 || q === -1) continue;
    b += rect(x, yG - hp + 12, x2 - x, hp - 24, 'dg-shape dg-shape--front', fillOf(d._p, 'boards-v'));
  }
  for (const [p, x] of xs) {
    if (p === -1) b += text(x, yG - hp / 2, '…', { size: 18, weight: 700 });
    else b += rect(x - 4, yG - hp, 8, hp + 14, 'dg-post');
  }
  b += dim(xs[0][1], yG - hp, xs[1][1], yG - hp, `${dimLabel(d.spacing, d.unit ?? 'ft', d.spacingLabel)} o.c.`, { off: 14, size: 10 });
  b += dim(xs[0][1], yG, xs[0][1], yG - hp, dimLabel(d.height, d.unit ?? 'ft', d.heightLabel), { off: 16, size: 10 });
  b += dim(xs[0][1], yG + 14, xs[xs.length - 1][1], yG + 14, `${dimLabel(d.length, d.unit ?? 'ft', d.lengthLabel)} fence line`, { off: -14, size: 10 });
  b += text(W / 2, 22, `${num(posts)} posts${d.gates ? ` · ${num(d.gates)} gate${d.gates === 1 ? '' : 's'}` : ''}`, { size: 11, weight: 700 });
  const aria = `Fence elevation: ${dimLabel(d.length, d.unit ?? 'ft', d.lengthLabel)} long, ${dimLabel(d.height, d.unit ?? 'ft', d.heightLabel)} high, ${posts} posts about ${dimLabel(d.spacing, d.unit ?? 'ft', d.spacingLabel)} apart${d.gates ? `, ${d.gates} gate${d.gates === 1 ? '' : 's'}` : ''}`;
  return { body: b, aria };
};

TYPES.wall = (d) => {
  const L = fin(d.length, 20);
  const Hh = fin(d.height, 8);
  const gable = fin(d.gableRise);
  const Hg = Hh + gable;
  const s = Math.min(250 / L, 140 / Hg);
  const w = clamp(L * s, 80, 260);
  const h = clamp(Hh * s, 18, 140);
  const g = gable ? clamp(gable * s, 8, 90) : 0;
  const x = (W - w) / 2 + 6;
  const yB = clamp(122 + (h + g) / 2, 120, 188);
  const yT = yB - h;
  const pat = fillOf(d._p, d.pattern);
  let b = '';
  if (g) b += poly([[x, yT], [x + w, yT], [x + w / 2, yT - g]], 'dg-shape dg-shape--front', pat);
  b += rect(x, yT, w, h, 'dg-shape dg-shape--front', pat);
  const wins = clamp(Math.round(fin(d.windows)), 0, 6);
  const doors = clamp(Math.round(fin(d.doors)), 0, 3);
  const items = doors + wins;
  if (items) {
    const slot = w / (items + 1);
    for (let i = 0; i < items; i++) {
      const cx = x + slot * (i + 1);
      if (i < doors) b += rect(cx - 8, yB - Math.min(h * 0.8, 46), 16, Math.min(h * 0.8, 46), 'dg-shape dg-hole');
      else b += rect(cx - 9, yT + h * 0.25, 18, Math.min(h * 0.35, 24), 'dg-shape dg-hole');
    }
  }
  b += line(x - 16, yB, x + w + 16, yB, 'dg-line dg-line--ground');
  b += dim(x, yB, x + w, yB, dimLabel(d.length, d.unit ?? 'ft', d.lengthLabel), { off: -16 });
  b += dim(x, yB, x, yT, dimLabel(d.height, d.unit ?? 'ft', d.heightLabel), { off: -14 });
  if (g) b += dim(x + w / 2, yT, x + w / 2, yT - g, `Gable ${dimLabel(gable, d.unit ?? 'ft', d.gableLabel)}`, { off: -12, size: 10 });
  if (d.moduleLabel) b += text(W / 2, 20, d.moduleLabel, { size: 10.5, weight: 700 });
  if (d.caption) b += text(W / 2, H - 6, d.caption, { size: 10 });
  const aria = `${d.name ?? 'Wall'} elevation: ${dimLabel(d.length, d.unit ?? 'ft', d.lengthLabel)} long by ${dimLabel(d.height, d.unit ?? 'ft', d.heightLabel)} high${g ? `, gable ${dimLabel(gable, d.unit ?? 'ft', d.gableLabel)} high` : ''}${items ? `, ${doors} door${doors === 1 ? '' : 's'} and ${wins} window${wins === 1 ? '' : 's'}` : ''}${d.moduleLabel ? `. ${d.moduleLabel}` : ''}`;
  return { body: b, aria };
};

TYPES.room = (d) => {
  const L = fin(d.length, 12);
  const Wd = clamp(fin(d.width, 12), L * 0.25, L * 3);
  const Hh = clamp(fin(d.height, 8), L * 0.2, L * 1.2);
  const s = Math.min(200 / (L + Wd * 0.55), 150 / (Hh + Wd * 0.4));
  const lp = L * s;
  const wp = Wd * s;
  const hp = Hh * s;
  const ex = wp * 0.55;
  const ey = wp * 0.4;
  const ox = (W - (lp + ex)) / 2;
  const oy = 200;
  const P = (x, y) => [ox + x, oy + y];
  let b = '';
  // Floor, back wall, side wall, optional ceiling.
  b += poly([P(0, 0), P(lp, 0), P(lp + ex, -ey), P(ex, -ey)], 'dg-shape dg-floor');
  b += poly([P(ex, -ey), P(lp + ex, -ey), P(lp + ex, -ey - hp), P(ex, -ey - hp)], 'dg-shape dg-shape--front');
  b += poly([P(0, 0), P(ex, -ey), P(ex, -ey - hp), P(0, -hp)], 'dg-shape dg-shape--side');
  b += poly([P(lp, 0), P(lp + ex, -ey), P(lp + ex, -ey - hp), P(lp, -hp)], 'dg-shape dg-shape--side');
  if (d.ceiling) b += poly([P(0, -hp), P(lp, -hp), P(lp + ex, -ey - hp), P(ex, -ey - hp)], 'dg-shape dg-ceiling');
  else b += `<path class="dg-line dg-line--hidden" fill="none" d="M${P(0, -hp).map(f).join(' ')} L${P(lp, -hp).map(f).join(' ')} L${P(lp + ex, -ey - hp).map(f).join(' ')}"/>`;
  if (d.wallLabel) b += text(P(ex + lp / 2, 0)[0], P(0, -ey - 10)[1], d.wallLabel, { size: 10.5, weight: 700, cls: 'dg-label dg-label--on' });
  if (d.ceilingLabel && d.ceiling) b += text(P(ex / 2 + lp / 2, 0)[0], P(0, -hp - ey / 2)[1] + 4, d.ceilingLabel, { size: 10, weight: 700, cls: 'dg-label dg-label--on' });
  b += dim(P(0, 0)[0], P(0, 0)[1], P(lp, 0)[0], P(lp, 0)[1], dimLabel(d.length, d.unit ?? 'ft', d.lengthLabel), { off: -14 });
  b += dim(P(lp, 0)[0], P(lp, 0)[1], P(lp + ex, -ey)[0], P(lp + ex, -ey)[1], dimLabel(d.width, d.unit ?? 'ft', d.widthLabel), { off: -12 });
  b += dim(P(0, 0)[0], P(0, 0)[1], P(0, -hp)[0], P(0, -hp)[1], dimLabel(d.height, d.unit ?? 'ft', d.heightLabel), { off: -12 });
  const aria = `Room: ${dimLabel(d.length, d.unit ?? 'ft', d.lengthLabel)} by ${dimLabel(d.width, d.unit ?? 'ft', d.widthLabel)}, ${dimLabel(d.height, d.unit ?? 'ft', d.heightLabel)} walls${d.wallLabel ? `; ${d.wallLabel}` : ''}${d.ceiling && d.ceilingLabel ? `; ${d.ceilingLabel}` : ''}`;
  return { body: b, aria };
};

TYPES.attic = (d) => {
  const pitch = clamp(Number.isFinite(d.pitch) ? d.pitch : 6, 2, 14);
  const span = 250;
  const rise = clamp((span / 2) * (pitch / 12), 30, 110);
  const x0 = (W - span) / 2;
  const yC = 160;
  const ridge = [x0 + span / 2, yC - rise];
  const over = 22;
  const drop = (over * rise) / (span / 2);
  let b = '';
  b += poly([[x0, yC], [x0 + span, yC], ridge], 'dg-shape dg-shape--front');
  if (fin(d.insulationDepth)) {
    const ih = clamp(d.insulationDepth * 1.6, 6, 34);
    const k = ih / rise;
    b += poly([[x0 + (span / 2) * k, yC - ih], [x0 + span - (span / 2) * k, yC - ih], [x0 + span, yC], [x0, yC]], 'dg-shape dg-insul', fillOf(d._p, 'insul'));
    b += dim(x0 + span * 0.5, yC, x0 + span * 0.5, yC - ih, d.insulationLabel ?? dimLabel(d.insulationDepth, 'in'), { off: -8, size: 10 });
  }
  b += `<path class="dg-line dg-line--strong" fill="none" d="M${f(x0 - over)} ${f(yC + drop)} L${f(ridge[0])} ${f(ridge[1])} L${f(x0 + span + over)} ${f(yC + drop)}"/>`;
  b += line(x0, yC, x0 + span, yC, 'dg-line dg-line--strong');
  if (d.intakeLabel || d.exhaustLabel) {
    // Airflow: in at both soffits, up under the roof deck, out at the ridge.
    const flow = (sx, dir) => `<path class="dg-flow" fill="none" d="M${f(sx)} ${f(yC + 14)} L${f(sx + dir * 18)} ${f(yC - 6)} L${f(ridge[0] - dir * 26)} ${f(ridge[1] + 26)}"/>${arrowHead(ridge[0] - dir * 26, ridge[1] + 26, ((ridge[0] - dir * 26) - (sx + dir * 18)) / Math.hypot(ridge[0] - dir * 26 - sx - dir * 18, ridge[1] + 26 - yC + 6), (ridge[1] + 26 - (yC - 6)) / Math.hypot(ridge[0] - dir * 26 - sx - dir * 18, ridge[1] + 26 - yC + 6))}`;
    b += flow(x0 - 8, 1) + flow(x0 + span + 8, -1);
    b += `<path class="dg-flow" fill="none" d="M${f(ridge[0])} ${f(ridge[1] + 4)} V${f(ridge[1] - 18)}"/>${arrowHead(ridge[0], ridge[1] - 18, 0, -1)}`;
    if (d.exhaustLabel) b += text(ridge[0], 16, d.exhaustLabel, { size: 10.5, weight: 700 });
    if (d.intakeLabel) b += text(W / 2, yC + 28, d.intakeLabel, { size: 10.5, weight: 700 });
  }
  if (d.spanLabel) b += text(W / 2, yC + 50, d.spanLabel, { size: 10.5, weight: 700 });
  if (d.caption) b += text(W / 2, H - 4, d.caption, { size: 9.5 });
  const aria = `Attic cross-section${d.spanLabel ? `, ${d.spanLabel}` : ''}${d.intakeLabel ? `; ${d.intakeLabel}` : ''}${d.exhaustLabel ? `; ${d.exhaustLabel}` : ''}${fin(d.insulationDepth) ? `; insulation ${d.insulationLabel ?? dimLabel(d.insulationDepth, 'in')}` : ''}`;
  return { body: b, aria };
};

export const DIAGRAM_TYPES = Object.keys(TYPES);

/**
 * Render a diagram spec to an SVG string ('' when there is nothing to draw).
 * opts.title is prepended to the accessible name.
 */
export function renderDiagram(spec, { title = '', id = 'dg' } = {}) {
  if (!spec || typeof spec !== 'object' || !TYPES[spec.type]) return '';
  const p = String(id).replace(/[^a-z0-9-]/gi, '') || 'dg';
  let out;
  try {
    out = TYPES[spec.type]({ ...spec, _p: p });
  } catch {
    return '';
  }
  const label = `${title ? `${title}. ` : ''}${out.aria}`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}" class="tool-diagram tool-diagram--${esc(spec.type)}"><title>${esc(label)}</title>${patterns(p)}${out.body}</svg>`;
}
