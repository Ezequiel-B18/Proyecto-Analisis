import { useState, useCallback } from 'react';
import { parseFunction, evalAt, validateNonLinear } from '../utils/mathEngine';
import { criterioI, criterioII, criterioIII, computeError } from '../utils/stopCriteria';

/**
 * @typedef {Object} Iteration
 * @property {number} n
 * @property {number} xn
 * @property {number} fxn
 * @property {number} dfxn
 * @property {number|null} error
 */

/**
 * @typedef {'idle'|'success'|'max-iter'|'zero-derivative'|'parse-error'|'linear'} Status
 */

/**
 * @typedef {Object} NewtonResult
 * @property {Iteration[]} iterations
 * @property {Status} status
 * @property {number|null} root
 * @property {string} errorMessage
 * @property {string} derivativeExpr
 */

const STOP_FN = {
  I:   (fxn, xn, xPrev, tol) => criterioI(fxn, tol),
  II:  (fxn, xn, xPrev, tol) => criterioII(xn, xPrev, tol),
  III: (fxn, xn, xPrev, tol) => criterioIII(xn, xPrev, tol),
};

/**
 * Core Newton-Raphson hook.
 * Returns compute function + result state.
 */
export function useNewtonRaphson() {
  const [result, setResult] = useState(/** @type {NewtonResult} */ ({
    iterations: [],
    status: 'idle',
    root: null,
    errorMessage: '',
    derivativeExpr: '',
  }));

  const compute = useCallback(({ expr, x0, tol, criterio, nMax }) => {
    // --- Parse ---
    let parsed;
    try {
      parsed = parseFunction(expr);
    } catch (e) {
      setResult({ iterations: [], status: 'parse-error', root: null, errorMessage: `No se pudo parsear la función: ${e.message}`, derivativeExpr: '' });
      return;
    }

    // --- Linearity check ---
    const { isLinear, reason } = validateNonLinear(expr);
    if (isLinear) {
      setResult({ iterations: [], status: 'linear', root: null, errorMessage: reason, derivativeExpr: parsed.derivativeExpr });
      return;
    }

    const { fn, derivative, derivativeExpr, secondDerivative } = parsed;
    const stopFn = STOP_FN[criterio];
    const iterations = [];
    let xn = Number(x0);
    let xPrev = null;

    for (let n = 0; n < Number(nMax); n++) {
      let fxn, dfxn, d2fxn = null, gPrime = null;

      try {
        fxn  = evalAt(fn, xn);
        dfxn = evalAt(derivative, xn);
        if (secondDerivative) {
          d2fxn = evalAt(secondDerivative, xn);
          if (Math.abs(dfxn) > 1e-15) {
            gPrime = Math.abs((fxn * d2fxn) / (dfxn * dfxn));
          }
        }
      } catch (e) {
        setResult({ iterations, status: 'parse-error', root: xn, errorMessage: `Error al evaluar en x=${xn}: ${e.message}`, derivativeExpr });
        return;
      }

      const error = computeError(fxn, xn, xPrev, criterio);

      iterations.push({ n: n + 1, xn, fxn, dfxn, gPrime, error });

      // Check stop criterion (skip first iteration — no xPrev)
      if (xPrev !== null && stopFn(fxn, xn, xPrev, Number(tol))) {
        setResult({ iterations, status: 'success', root: xn, errorMessage: '', derivativeExpr });
        return;
      }

      // Zero derivative guard
      if (Math.abs(dfxn) < 1e-15) {
        setResult({ iterations, status: 'zero-derivative', root: xn, errorMessage: `La derivada f'(x) ≈ 0 en x = ${xn.toPrecision(8)}. La tangente es horizontal, el método no puede continuar.`, derivativeExpr });
        return;
      }

      xPrev = xn;
      xn = xn - fxn / dfxn;
    }

    // Reached max iterations
    setResult({ iterations, status: 'max-iter', root: xn, errorMessage: `Se alcanzó el máximo de ${nMax} iteraciones sin converger con la tolerancia pedida.`, derivativeExpr });
  }, []);

  return { result, compute };
}
