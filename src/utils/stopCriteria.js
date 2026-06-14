/**
 * Stopping criteria for Newton-Raphson iteration.
 * Each function returns true when the stop condition is met.
 */

/**
 * Criterion I — by image: |f(xn)| < tol
 * @param {number} fxn - f(xn)
 * @param {number} tol
 * @returns {boolean}
 */
export function criterioI(fxn, tol) {
  return Math.abs(fxn) < tol;
}

/**
 * Criterion II — by absolute difference: |xn - xPrev| < tol
 * @param {number} xn
 * @param {number} xPrev
 * @param {number} tol
 * @returns {boolean}
 */
export function criterioII(xn, xPrev, tol) {
  return Math.abs(xn - xPrev) < tol;
}

/**
 * Criterion III — by relative error: |xn - xPrev| / |xn| < tol
 * Only valid when xn !== 0.
 * @param {number} xn
 * @param {number} xPrev
 * @param {number} tol
 * @returns {boolean}
 */
export function criterioIII(xn, xPrev, tol) {
  if (Math.abs(xn) === 0) return false; // undefined, can't use this criterion
  return Math.abs(xn - xPrev) / Math.abs(xn) < tol;
}

/**
 * Computes the error value displayed in the table for each criterion.
 * @param {number} fxn
 * @param {number} xn
 * @param {number} xPrev
 * @param {'I'|'II'|'III'} criterio
 * @returns {number}
 */
export function computeError(fxn, xn, xPrev, criterio) {
  if (xPrev === null) return null;
  switch (criterio) {
    case 'I':   return Math.abs(fxn);
    case 'II':  return Math.abs(xn - xPrev);
    case 'III': return Math.abs(xn) !== 0 ? Math.abs(xn - xPrev) / Math.abs(xn) : null;
    default:    return null;
  }
}
