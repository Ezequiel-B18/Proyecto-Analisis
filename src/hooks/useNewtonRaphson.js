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

// Criterios de parada del metodo
const STOP_FN = {
  I:   (fxn, xn, xPrev, tol) => criterioI(fxn, tol),
  II:  (fxn, xn, xPrev, tol) => criterioII(xn, xPrev, tol),
  III: (fxn, xn, xPrev, tol) => criterioIII(xn, xPrev, tol),
};

/**
 * Principal calculo de Newton-Raphson.
 */
export function useNewtonRaphson() {
  const [result, setResult] = useState(/** @type {NewtonResult} */ ({
    iterations: [], //iteraciones del metodo
    status: 'idle', //estado del metodo
    root: null, //raiz de la funcion
    errorMessage: '', //mensaje de error
    derivativeExpr: '', //expresion de la derivada
  }));

  const compute = useCallback(({ expr, x0, tol, criterio, nMax }) => {
    // parsea la funcion para math.js
    let parsed;
    try {
      parsed = parseFunction(expr);
    } catch (e) {
      setResult({ iterations: [], status: 'parse-error', root: null, errorMessage: `No se pudo parsear la función: ${e.message}`, derivativeExpr: '' });
      return;
    }

// Chequea que no sea una funcion lineal
    const { isLinear, reason } = validateNonLinear(expr);
    if (isLinear) {
      setResult({ iterations: [], status: 'linear', root: null, errorMessage: reason, derivativeExpr: parsed.derivativeExpr });
      return;
    }

// Settea las expresiones, el criterio, las iteraciones y el primer valor y sus anteriores valores
    const { fn, derivative, derivativeExpr, secondDerivative } = parsed;
    const stopFn = STOP_FN[criterio];
    const iterations = [];
    let xn = Number(x0);
    let xPrev = null;

  // Evalua el metodo y calcula los valores del paso actual
    for (let n = 0; n < Number(nMax); n++) {
      let fxn, dfxn, d2fxn = null, gPrime = null;

      try {
        fxn  = evalAt(fn, xn); // f(xn)
        dfxn = evalAt(derivative, xn); // f'(xn)
        if (secondDerivative) {
          d2fxn = evalAt(secondDerivative, xn); // f''(xn)
          if (Math.abs(dfxn) > 1e-15) {
            gPrime = Math.abs((fxn * d2fxn) / (dfxn * dfxn)); // |g'(xn)|
          }
        }
      } catch (e) { 
        setResult({ iterations, status: 'parse-error', root: xn, errorMessage: `Error al evaluar en x=${xn}: ${e.message}`, derivativeExpr });
        return;
      }

// Calcula el error y frena el metodo si se cumple
      const error = computeError(fxn, xn, xPrev, criterio); 

      iterations.push({ n: n + 1, xn, fxn, dfxn, gPrime, error });

      // Check stop criterion (skip first iteration — no xPrev)
      if (xPrev !== null && stopFn(fxn, xn, xPrev, Number(tol))) {
        setResult({ iterations, status: 'success', root: xn, errorMessage: '', derivativeExpr });
        return;
      }

      // Se fija que la derivada no sea cero
      if (Math.abs(dfxn) < 1e-15) {
        setResult({ iterations, status: 'zero-derivative', root: xn, errorMessage: `La derivada f'(x) ≈ 0 en x = ${xn.toPrecision(8)}. La tangente es horizontal, el método no puede continuar.`, derivativeExpr });
        return;
      }

// Genera la proxima iteracion del metodo
      xPrev = xn;
      xn = xn - fxn / dfxn;
    }

    // Esto es en caso de que se alcance el max de iteraciones
    setResult({ iterations, status: 'max-iter', root: xn, errorMessage: `Se alcanzó el máximo de ${nMax} iteraciones sin converger con la tolerancia pedida.`, derivativeExpr });
  }, []);

  return { result, compute };
}
