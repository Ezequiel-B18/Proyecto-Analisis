import styles from './ResultPanel.module.css';

// Aca definimos los estados que puede tener el componente dados por el hook
const STATUS_CONFIG = {
  idle: null,
  success: {
    icon: '✓',
    label: 'Raíz encontrada',
    className: 'success',
  },
  'max-iter': {
    icon: '⚠',
    label: 'Máximo de iteraciones alcanzado',
    className: 'warning',
  },
  'zero-derivative': {
    icon: '✗',
    label: 'Derivada nula — método interrumpido',
    className: 'error',
  },
  'parse-error': {
    icon: '✗',
    label: 'Error en la expresión',
    className: 'error',
  },
  linear: {
    icon: '⚠',
    label: 'La función es lineal',
    className: 'warning',
  },
};

export default function ResultPanel({ status, root, errorMessage, derivativeExpr, iterations }) {
  const config = STATUS_CONFIG[status];

  if (status === 'idle') {
    return (
      <div className={styles.idle}>
        <p>Ingresá los parámetros y presioná <strong>Ir</strong> para calcular.</p>
        <p className={styles.idleHint}>El resultado, la tabla de iteraciones y el gráfico aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      {/* Status */}
      <div className={`${styles.badge} ${styles[config.className]}`}>
        <span className={styles.badgeIcon}>{config.icon}</span>
        <span>{config.label}</span>
      </div>

      {/* Mensaje de error */}
      {errorMessage && (
        <div className={styles.errorMsg}>{errorMessage}</div>
      )}

      {/* Valor de la raiz */}
      {root !== null && (
        <div className={styles.rootCard}>
          <span className={styles.rootLabel}>Raíz aproximada (α)</span>
          <span className={styles.rootValue}>{root.toPrecision(10)}</span>
        </div>
      )}

      {/* Derivada */}
      {derivativeExpr && (
        <div className={styles.derivCard}>
          <span className={styles.derivLabel}>Derivada calculada</span>
          <code className={styles.derivValue}>f&apos;(x) = {derivativeExpr}</code>
        </div>
      )}

      {/* Resumen de iteraciones */}
      {iterations.length > 0 && (
        <div className={styles.summary}>
          Convergió en <strong>{iterations.length}</strong> iteración{iterations.length !== 1 ? 'es' : ''}.
        </div>
      )}
    </div>
  );
}
