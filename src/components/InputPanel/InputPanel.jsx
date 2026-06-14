import { useState, useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import styles from './InputPanel.module.css';

const SYMBOL_BUTTONS = [
  { label: 'CLR', value: 'CLR', special: true },
  { label: '+',   value: '+' },
  { label: '−',   value: '-' },
  { label: '×',   value: '*' },
  { label: '÷',   value: '/' },
  { label: '^',   value: '^' },
  { label: '√',   value: 'sqrt(' },
  { label: 'f(x)',value: '', special: true, label2: 'sin(' },
  { label: 'sin', value: 'sin(' },
  { label: 'cos', value: 'cos(' },
  { label: 'ln',  value: 'log(' },
  { label: 'π',   value: 'pi' },
  { label: 'e',   value: 'e' },
  { label: '(',   value: '(' },
  { label: ')',   value: ')' },
];

const CRITERIA = [
  { value: 'I',   label: 'Criterio I — |f(xₙ)| < Tol' },
  { value: 'II',  label: 'Criterio II — |xₙ − xₙ₋₁| < Tol' },
  { value: 'III', label: 'Criterio III — Error relativo < Tol' },
];

export default function InputPanel({ onCompute }) {
  const [expr, setExpr]       = useState('x^3 - 3*x - 1');
  const [x0, setX0]           = useState('2');
  const [tol, setTol]         = useState('1e-6');
  const [criterio, setCriterio] = useState('I');
  const [nMax, setNMax]       = useState('50');
  const [katexHtml, setKatexHtml] = useState('');
  const inputRef = useRef(null);

  // Render KaTeX preview
  useEffect(() => {
    try {
      // Simple replacements to make math.js syntax render nicely in KaTeX
      const latexExpr = expr
        .replace(/\*/g, ' \\cdot ')
        .replace(/pi/g, '\\pi')
        .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
        .replace(/sin\(/g, '\\sin(')
        .replace(/cos\(/g, '\\cos(')
        .replace(/log\(/g, '\\ln(')
        .replace(/\^(\d+)/g, '^{$1}');
      setKatexHtml(katex.renderToString(`f(x) = ${latexExpr}`, { throwOnError: false, displayMode: true }));
    } catch {
      setKatexHtml('');
    }
  }, [expr]);

  const insertSymbol = (value) => {
    if (value === 'CLR') {
      setExpr('');
      return;
    }
    const input = inputRef.current;
    if (!input) { setExpr(prev => prev + value); return; }
    const start = input.selectionStart;
    const end   = input.selectionEnd;
    const next  = expr.substring(0, start) + value + expr.substring(end);
    setExpr(next);
    // Restore cursor after React re-render
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + value.length, start + value.length);
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCompute({ expr, x0, tol, criterio, nMax });
  };

  return (
    <div className={styles.panel}>
      <h1 className={styles.title}>
        Calcula la raíz de <span className={styles.accent}>f(x)</span> con Newton-Raphson
      </h1>

      {/* Symbol buttons */}
      <div className={styles.symbolBar}>
        {SYMBOL_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            type="button"
            className={`${styles.symbolBtn} ${btn.special ? styles.specialBtn : ''}`}
            onClick={() => insertSymbol(btn.value)}
            title={btn.label}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Function input */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputRow}>
          <label className={styles.label} htmlFor="expr-input">f(x) =</label>
          <input
            id="expr-input"
            ref={inputRef}
            className={styles.exprInput}
            type="text"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            placeholder="ej. x^3 - 3*x - 1"
            spellCheck={false}
            autoComplete="off"
          />
          <button className={styles.goBtn} type="submit">Ir</button>
        </div>

        {/* KaTeX preview */}
        {katexHtml && (
          <div
            className={styles.preview}
            dangerouslySetInnerHTML={{ __html: katexHtml }}
          />
        )}

        <p className={styles.hint}>
          Usá paréntesis cuando sea necesario. Sintaxis: <code>x^2</code>, <code>sin(x)</code>, <code>sqrt(x)</code>, <code>log(x)</code> (= ln).
        </p>

        {/* Numeric params */}
        <div className={styles.params}>
          <div className={styles.paramGroup}>
            <label htmlFor="x0-input" className={styles.paramLabel}>x₀ (aprox. inicial)</label>
            <input id="x0-input" className={styles.paramInput} type="number" step="any" value={x0} onChange={e => setX0(e.target.value)} required />
          </div>

          <div className={styles.paramGroup}>
            <label htmlFor="tol-input" className={styles.paramLabel}>Tolerancia</label>
            <input id="tol-input" className={styles.paramInput} type="text" value={tol} onChange={e => setTol(e.target.value)} placeholder="1e-6" required />
          </div>

          <div className={styles.paramGroup}>
            <label htmlFor="nmax-input" className={styles.paramLabel}>N<sub>max</sub></label>
            <input id="nmax-input" className={styles.paramInput} type="number" min="1" max="1000" value={nMax} onChange={e => setNMax(e.target.value)} required />
          </div>

          <div className={`${styles.paramGroup} ${styles.full}`}>
            <label htmlFor="criterio-select" className={styles.paramLabel}>Criterio de parada</label>
            <select id="criterio-select" className={styles.paramSelect} value={criterio} onChange={e => setCriterio(e.target.value)}>
              {CRITERIA.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
      </form>
    </div>
  );
}
