// US customary unit conversions used across home-project tools.
export const INCHES_PER_FOOT = 12;
export const SQ_FT_PER_SQ_YD = 9;
export const CU_FT_PER_CU_YD = 27;

export const inchesToFeet = (inches) => inches / INCHES_PER_FOOT;
export const feetToInches = (feet) => feet * INCHES_PER_FOOT;
export const sqFtToSqYd = (sqFt) => sqFt / SQ_FT_PER_SQ_YD;
export const cuFtToCuYd = (cuFt) => cuFt / CU_FT_PER_CU_YD;
export const cuYdToCuFt = (cuYd) => cuYd * CU_FT_PER_CU_YD;

/** Feet plus inches (e.g. 10 ft 6 in) to decimal feet. */
export const feetAndInches = (feet = 0, inches = 0) => feet + inches / INCHES_PER_FOOT;

/** Add a waste allowance given as a percent (10 -> +10%). */
export const withWaste = (quantity, wastePercent = 0) => quantity * (1 + wastePercent / 100);
