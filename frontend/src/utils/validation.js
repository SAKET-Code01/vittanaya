/**
 * Client-side input validation helpers.
 */

export const isValidAmount = (val) => {
  const num = Number(val);
  return !isNaN(num) && num !== 0 && isFinite(num);
};

export const isPositiveAmount = (val) => {
  const num = Number(val);
  return !isNaN(num) && num > 0 && isFinite(num);
};

export const isValidDate = (dateString) => {
  if (!dateString) return false;
  const d = new Date(dateString);
  return !isNaN(d.getTime());
};

export const isNonEmptyString = (str, minLength = 1) => {
  return typeof str === 'string' && str.trim().length >= minLength;
};
