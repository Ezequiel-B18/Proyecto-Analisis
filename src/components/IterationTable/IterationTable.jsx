import styles from './IterationTable.module.css';

const fmt = (n, decimals = 8) => {
  if (n === null || n === undefined) return '—';
  if (!isFinite(n)) return String(n);
  return n.toPrecision(decimals);
};

export default function IterationTable({ iterations }) {
  if (!iterations || iterations.length === 0) {
    return <p className={styles.empty}>No hay iteraciones para mostrar.</p>;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>n</th>
            <th className={styles.th}>xₙ</th>
            <th className={styles.th}>f(xₙ)</th>
            <th className={styles.th}>f&apos;(xₙ)</th>
            <th className={styles.th}>|g&apos;(xₙ)|</th>
            <th className={styles.th}>Error</th>
          </tr>
        </thead>
        <tbody>
          {iterations.map((row) => (
            <tr key={row.n} className={styles.tr}>
              <td className={`${styles.td} ${styles.n}`}>{row.n}</td>
              <td className={`${styles.td} ${styles.mono}`}>{fmt(row.xn)}</td>
              <td className={`${styles.td} ${styles.mono}`}>{fmt(row.fxn)}</td>
              <td className={`${styles.td} ${styles.mono}`}>{fmt(row.dfxn)}</td>
              <td className={`${styles.td} ${styles.mono}`}>{fmt(row.gPrime)}</td>
              <td className={`${styles.td} ${styles.mono} ${styles.errorCol}`}>
                {row.error !== null ? fmt(row.error) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
