import * as math from 'mathjs';

/**
 * Parses a function expression string and returns a compiled evaluable object.
 * @param {string} expr - e.g. "x^3 - 3*x - 1"
 * @returns {{ fn: math.EvalFunction, derivative: math.EvalFunction, derivativeExpr: string }}
 */
export function parseFunction(expr) {
  // Compile the function
  const compiled = math.compile(expr);

  // Compute symbolic derivative w.r.t. x
  const derivativeNode = math.derivative(expr, 'x');
  const derivativeExpr = derivativeNode.toString();
  const compiledDerivative = derivativeNode.compile();

  return {
    fn: compiled,
    derivative: compiledDerivative,
    derivativeExpr,
  };
}

/**
 * Evaluates a compiled expression at x.
 * @param {math.EvalFunction} compiled
 * @param {number} x
 * @returns {number}
 */
export function evalAt(compiled, x) {
  return compiled.evaluate({ x });
}

/**
 * Validates that the function is non-linear (derivative is not a constant).
 * @param {string} expr
 * @returns {{ isLinear: boolean, reason: string }}
 */
export function validateNonLinear(expr) {
  try {
    const d1 = math.derivative(expr, 'x');
    const d2 = math.derivative(d1, 'x');
    // If second derivative simplifies to 0, f is linear or constant
    const d2Value = d2.toString().trim();
    if (d2Value === '0') {
      return { isLinear: true, reason: 'La función es lineal (la derivada es constante). Newton-Raphson no tiene sentido para funciones lineales.' };
    }
    return { isLinear: false, reason: '' };
  } catch {
    // If we can't compute, assume it's fine and let the algorithm catch errors
    return { isLinear: false, reason: '' };
  }
}
