import * as math from 'mathjs';

/**
 * Parsea una funcion y retorna un objeto con la funcion compilada, 
 * la derivada compilada y la expresion de la derivada.
 */
export function parseFunction(expr) {
  // Compila la funcion
  const compiled = math.compile(expr);

  // Calcula la primer derivada respecto a x
  const derivativeNode = math.derivative(expr, 'x');
  const derivativeExpr = derivativeNode.toString();
  const compiledDerivative = derivativeNode.compile();

  // Calcula la segunda derivada respecto a x
  let compiledSecondDerivative = null;
  try {
    const secondDerivativeNode = math.derivative(derivativeNode, 'x');
    compiledSecondDerivative = secondDerivativeNode.compile();
  } catch {
    compiledSecondDerivative = null;
  }
// Retorna las funciones
  return {
    fn: compiled,
    derivative: compiledDerivative,
    derivativeExpr,
    secondDerivative: compiledSecondDerivative,
  };
}

/**
 * Evalua la funcion en un x.
 */
export function evalAt(compiled, x) {
  return compiled.evaluate({ x });
}

/**
 * Valida que la funcion no sea lineal.
 */
export function validateNonLinear(expr) {
  try {
    const d1 = math.derivative(expr, 'x');
    const d2 = math.derivative(d1, 'x');
    // Si la segunda derivada es 0, f es lineal o constante
    const d2Value = d2.toString().trim();
    if (d2Value === '0') {
      return { isLinear: true, reason: 'La función es lineal (la derivada es constante). Newton-Raphson no tiene sentido para funciones lineales.' };
    }
    return { isLinear: false, reason: '' };
  } catch {
    // Si no se puede calcular, se asume que esta bien y se deja que el algoritmo atrape los errores
    return { isLinear: false, reason: '' };
  }
}
