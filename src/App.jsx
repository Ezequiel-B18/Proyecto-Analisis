import { useState, useMemo } from 'react';
import InputPanel from './components/InputPanel/InputPanel';
import InfoPanel from './components/InfoPanel/InfoPanel';
import ResultPanel from './components/ResultPanel/ResultPanel';
import IterationTable from './components/IterationTable/IterationTable';
import FunctionGraph from './components/FunctionGraph/FunctionGraph';
import { useNewtonRaphson } from './hooks/useNewtonRaphson';
import { parseFunction } from './utils/mathEngine';
import styles from './App.module.css';

const TABS = [
  { id: 'info',      label: 'Info' },
  { id: 'resultado', label: 'Resultado' },
  { id: 'tabla',     label: 'Tabla' },
  { id: 'grafico',   label: 'Gráfico' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('info');
  const [lastParams, setLastParams] = useState(null);
  const { result, compute } = useNewtonRaphson();

  // Keep a parsed version of the function for the graph
  const parsedFn = useMemo(() => {
    if (!lastParams?.expr) return null;
    try {
      const { fn } = parseFunction(lastParams.expr);
      return fn;
    } catch {
      return null;
    }
  }, [lastParams?.expr]);

  const handleCompute = (params) => {
    setLastParams(params);
    compute(params);
    setActiveTab('resultado');
  };

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <span className={styles.headerTitle}>Newton-Raphson</span>
        <span className={styles.headerSub}>Método numérico de búsqueda de raíces</span>
      </header>

      {/* Main layout: two columns */}
      <main className={styles.main}>
        {/* Left panel */}
        <aside className={styles.left}>
          <InputPanel onCompute={handleCompute} />
        </aside>

        {/* Right panel with tabs */}
        <section className={styles.right}>
          {/* Tab bar */}
          <div className={styles.tabBar}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {tab.id === 'tabla' && result.iterations.length > 0 && (
                  <span className={styles.tabBadge}>{result.iterations.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className={styles.tabContent}>
            {activeTab === 'info' && <InfoPanel />}
            {activeTab === 'resultado' && (
              <ResultPanel
                status={result.status}
                root={result.root}
                errorMessage={result.errorMessage}
                derivativeExpr={result.derivativeExpr}
                iterations={result.iterations}
              />
            )}
            {activeTab === 'tabla' && (
              <IterationTable iterations={result.iterations} />
            )}
            {activeTab === 'grafico' && (
              <FunctionGraph
                parsedFn={parsedFn}
                iterations={result.iterations}
                x0={lastParams?.x0 !== undefined ? Number(lastParams.x0) : null}
                root={result.root}
                status={result.status}
              />
            )}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        Análisis Numérico — Método de Newton-Raphson - Hecho por Ezequiel Blajevitch y Nahuel Quiroga
      </footer>
    </div>
  );
}
