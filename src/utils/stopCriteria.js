/**
 * Criterios de parada del metodo Newton-Raphson.
 * Cada funcion retorna true cuando se cumple la condicion de parada.
 */

/**
 * Criterio I — por imagen: |f(xn)| < tol
 */
export function criterioI(fxn, tol) {
  return Math.abs(fxn) < tol;
}

/**
 * Criterio II — por diferencia absoluta: |xn - xPrev| < tol
 */
export function criterioII(xn, xPrev, tol) {
  return Math.abs(xn - xPrev) < tol;
}

/**
 * Criterio III — por error relativo: |xn - xPrev| / |xn| < tol
 * Solo valido cuando xn !== 0.
 */
export function criterioIII(xn, xPrev, tol) {
  if (Math.abs(xn) === 0) return false;
  return Math.abs(xn - xPrev) / Math.abs(xn) < tol;
}

/**
 * Calcula el error que se muestra en la tabla para cada criterio.
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
