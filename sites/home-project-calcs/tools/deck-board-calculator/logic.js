// Boards, joists, and face screws for a rectangular deck.
// Purchase counts round up. The spacing check uses 2021 IRC Table R507.7 for
// wood and the 2026 Trex span chart for composite. End gaps are not subtracted.
import { INCHES_PER_FOOT, ceilTo, round, validateNumber, withWaste } from '@tools/calculator-core';

const MATERIALS = ['composite', 'fiveQuarter', 'twoBy'];
const DIRECTIONS = ['perpendicular', 'diagonal'];
const SPAN_TYPES = ['multiple', 'single'];
const BOARD_LENGTHS = [12, 16, 20];
const JOIST_SPACINGS = [12, 16, 24];
const CHART_SPANS = [16, 24];

// 2021 IRC Table R507.7, maximum on-center joist spacing in inches.
// Footnote c: two joists = single span, three or more = multiple span.
const WOOD_LIMITS = {
  fiveQuarter: {
    perpendicular: { single: 12, multiple: 16 },
    diagonal: { single: 8, multiple: 12 },
  },
  twoBy: {
    perpendicular: { single: 24, multiple: 24 },
    diagonal: { single: 18, multiple: 24 },
  },
};

// Trex 2026 guide: width-to-width gap is 3/16 in at every temperature.
const TREX_MIN_GAP_IN = 0.1875;
// Trex 2026 guide: at 45°, maximum joist spanning is 4 in less than the chart.
const TREX_DIAGONAL_REDUCTION_IN = 4;

function readChoice(raw, name, allowed, message) {
  const value = String(raw?.[name] ?? '').trim();
  if (!allowed.includes(value)) return { error: message };
  return { value };
}

function readNumber(raw, name, rule, errors) {
  const result = validateNumber(raw?.[name], rule);
  if (!result.ok) errors[name] = result.message;
  return result.value;
}

function toInches(feet) {
  return round(feet * INCHES_PER_FOOT, 4);
}

function ceilCount(value) {
  const nearest = round(value, 6);
  return Math.ceil(nearest - 1e-9);
}

function roundUpToWhole(value) {
  return round(ceilTo(value, 1), 0);
}

function spacingLimitIn(material, direction, spanType, chartSpan) {
  if (material === 'composite') {
    return direction === 'diagonal' ? chartSpan - TREX_DIAGONAL_REDUCTION_IN : chartSpan;
  }
  const span = spanType === 'single' ? 'single' : 'multiple';
  return WOOD_LIMITS[material][direction][span];
}

// How many stock boards cover `rows`, and how many butt joints each row has.
// A stick longer than the run is cut into whole rows. A longer run is spliced.
// When the offcut is at least as long as the leftover piece, two rows share it.
function stockPlan(rows, runIn, stockIn) {
  if (runIn <= stockIn + 1e-4) {
    const pieces = Math.max(1, Math.floor(round(stockIn / runIn, 6) + 1e-9));
    return { boardsExact: rows / pieces, jointsPerRow: 0 };
  }
  const fullSticks = Math.floor(round(runIn / stockIn, 6) + 1e-9);
  const remainder = round(runIn - fullSticks * stockIn, 4);
  if (remainder <= 1e-4) {
    return { boardsExact: rows * fullSticks, jointsPerRow: Math.max(0, fullSticks - 1) };
  }
  const offcut = round(stockIn - remainder, 4);
  const jointsPerRow = fullSticks;
  if (offcut + 1e-4 >= remainder) {
    const pairs = Math.floor(rows / 2);
    const leftover = rows % 2;
    const boardsExact = pairs * (2 * fullSticks + 1) + leftover * (fullSticks + 1);
    return { boardsExact, jointsPerRow };
  }
  return { boardsExact: rows * (fullSticks + 1), jointsPerRow };
}

export function calculate(raw) {
  const errors = {};
  const material = readChoice(raw, 'material', MATERIALS, 'Choose a decking material.');
  const direction = readChoice(raw, 'direction', DIRECTIONS, 'Choose perpendicular or diagonal.');
  const spanType = readChoice(raw, 'spanType', SPAN_TYPES, 'Choose multiple span or single span.');
  const boardLength = readChoice(
    raw,
    'boardLength',
    BOARD_LENGTHS.map(String),
    'Choose a board length of 12, 16, or 20 ft.',
  );
  const joistSpacing = readChoice(
    raw,
    'joistSpacing',
    JOIST_SPACINGS.map(String),
    'Choose a joist spacing of 12, 16, or 24 in.',
  );
  const chartSpan = readChoice(
    raw,
    'chartSpan',
    CHART_SPANS.map(String),
    'Choose a Trex chart span of 16 or 24 in.',
  );
  if (material.error) errors.material = material.error;
  if (direction.error) errors.direction = direction.error;
  if (spanType.error) errors.spanType = spanType.error;
  if (boardLength.error) errors.boardLength = boardLength.error;
  if (joistSpacing.error) errors.joistSpacing = joistSpacing.error;
  if (chartSpan.error) errors.chartSpan = chartSpan.error;

  const length = readNumber(raw, 'length', { label: 'Deck length', min: 4, max: 40 }, errors);
  const width = readNumber(raw, 'width', { label: 'Deck width', min: 4, max: 40 }, errors);
  const boardWidth = readNumber(raw, 'boardWidth', { label: 'Board width', min: 3, max: 8 }, errors);
  const sideGap = readNumber(raw, 'sideGap', { label: 'Side gap', min: 0.0625, max: 0.5 }, errors);
  const screwsPer = readNumber(
    raw,
    'screwsPer',
    { label: 'Screws per board per joist', min: 1, max: 3 },
    errors,
  );
  const waste = readNumber(raw, 'waste', { label: 'Waste', min: 0, max: 25 }, errors);
  if (screwsPer !== undefined && !Number.isInteger(screwsPer)) {
    errors.screwsPer = 'Screws per board per joist must be a whole number.';
  }

  if (Object.keys(errors).length) return { ok: false, errors };

  const lengthIn = toInches(length);
  const widthIn = toInches(width);
  const stockIn = Number(boardLength.value) * INCHES_PER_FOOT;
  const spacingIn = Number(joistSpacing.value);
  const chartIn = Number(chartSpan.value);
  const pitch = boardWidth + sideGap;
  const diagonal = direction.value === 'diagonal';

  const joists = ceilCount(lengthIn / spacingIn) + 1;
  const projectedIn = diagonal ? (lengthIn + widthIn) * Math.SQRT1_2 : widthIn;
  const boardRows = ceilCount((projectedIn + sideGap) / pitch);

  let boardsExact;
  let jointsPerRow;
  let totalBoardIn;
  if (!diagonal) {
    const plan = stockPlan(boardRows, lengthIn, stockIn);
    boardsExact = plan.boardsExact;
    jointsPerRow = plan.jointsPerRow;
    totalBoardIn = boardRows * lengthIn;
  } else {
    // Centerline length of 45° strips spaced one board-plus-gap apart.
    totalBoardIn = (lengthIn * widthIn) / pitch;
    boardsExact = totalBoardIn / stockIn;
    jointsPerRow = 0;
  }

  const boardsToBuy = roundUpToWhole(withWaste(boardsExact, waste));
  const layoutBoards = roundUpToWhole(boardsExact);
  const linearFeet = boardsToBuy * Number(boardLength.value);

  let screws;
  if (!diagonal) {
    screws = boardRows * (joists + jointsPerRow) * screwsPer;
  } else {
    const alongBoard = spacingIn * Math.SQRT2;
    screws = ceilCount(totalBoardIn / alongBoard) * screwsPer;
  }

  const limit = spacingLimitIn(material.value, direction.value, spanType.value, chartIn);
  const inchesOver = Math.max(0, spacingIn - limit);
  const threeJoistShort = material.value === 'composite' && spanType.value === 'single' ? 1 : 0;
  const gapShort = material.value === 'composite' && sideGap < TREX_MIN_GAP_IN - 1e-6 ? 1 : 0;
  const spacingWarning = inchesOver > 0 || threeJoistShort === 1 ? 1 : 0;
  const area = length * width;

  const chart = [{ label: 'Layout', value: layoutBoards }];
  const extraBoards = boardsToBuy - layoutBoards;
  if (extraBoards > 0) chart.push({ label: 'Extra', value: extraBoards });

  return {
    ok: true,
    results: {
      boardsToBuy,
      joists,
      screws,
      spacingWarning,
      boardRows,
      linearFeet,
      spacingLimit: limit,
      inchesOver,
      threeJoistShort,
      gapShort,
      screwsPerSqFt: round(screws / area, 2),
    },
    chart,
  };
}
