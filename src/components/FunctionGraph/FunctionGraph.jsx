import { useEffect, useRef, useMemo } from 'react';
import styles from './FunctionGraph.module.css';

/**
 * Evaluates a compiled math.js function over a range of x values.
 * Returns { xs, ys } with nulls on discontinuities.
 */
function sampleFunction(fn, xMin, xMax, points = 400) {
  const xs = [];
  const ys = [];
  const step = (xMax - xMin) / points;
  for (let i = 0; i <= points; i++) {
    const x = xMin + i * step;
    try {
      const y = fn.evaluate({ x });
      xs.push(x);
      ys.push(isFinite(y) ? y : null);
    } catch {
      xs.push(x);
      ys.push(null);
    }
  }
  return { xs, ys };
}

/**
 * Builds tangent line traces: from each (xn, f(xn)) to the x-axis intersection.
 */
function buildTangentTraces(iterations) {
  return iterations.slice(0, -1).map((iter, i) => {
    const { xn, fxn, dfxn } = iter;
    if (Math.abs(dfxn) < 1e-15) return null;
    const xNext = xn - fxn / dfxn;
    return {
      x: [xn, xNext],
      y: [fxn, 0],
      mode: 'lines',
      type: 'scatter',
      line: { color: `hsl(${30 + i * 40}, 90%, 60%)`, width: 1.5, dash: 'dot' },
      name: `Tangente n=${i + 1}`,
      showlegend: false,
      hoverinfo: 'skip',
    };
  }).filter(Boolean);
}

export default function FunctionGraph({ parsedFn, iterations, x0, root, status }) {
  const containerRef = useRef(null);

  const traces = useMemo(() => {
    if (!parsedFn) return null;

    const center = root ?? (x0 !== null ? Number(x0) : 0);
    const span = Math.max(5, Math.abs(center) * 1.5);
    const xMin = center - span;
    const xMax = center + span;

    const { xs, ys } = sampleFunction(parsedFn, xMin, xMax);

    const result = [
      // x-axis reference line
      {
        x: [xMin, xMax],
        y: [0, 0],
        mode: 'lines',
        type: 'scatter',
        line: { color: 'rgba(255,255,255,0.15)', width: 1 },
        showlegend: false,
        hoverinfo: 'skip',
      },
      // Function curve
      {
        x: xs,
        y: ys,
        mode: 'lines',
        type: 'scatter',
        name: 'f(x)',
        line: { color: '#e8a045', width: 2.5 },
        connectgaps: false,
      },
    ];

    // Tangent lines
    if (iterations.length > 1) {
      result.push(...buildTangentTraces(iterations));
    }

    // x₀ marker
    if (x0 !== null && x0 !== undefined) {
      let y0 = 0;
      try { y0 = parsedFn.evaluate({ x: Number(x0) }); } catch {}
      result.push({
        x: [Number(x0)],
        y: [y0],
        mode: 'markers',
        type: 'scatter',
        name: 'x₀',
        marker: { color: '#5b9cf6', size: 11, symbol: 'circle' },
      });
    }

    // Root marker
    if (status === 'success' && root !== null) {
      result.push({
        x: [root],
        y: [0],
        mode: 'markers',
        type: 'scatter',
        name: 'α (raíz)',
        marker: { color: '#48c774', size: 14, symbol: 'star', line: { color: '#fff', width: 1 } },
      });
    }

    return { traces: result, xMin, xMax };
  }, [parsedFn, iterations, x0, root, status]);

  useEffect(() => {
    if (!containerRef.current || !traces) return;

    let Plotly;
    import('plotly.js/dist/plotly').then((mod) => {
      Plotly = mod.default ?? mod;

      const layout = {
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'rgba(255,255,255,0.03)',
        font: { color: '#b0b0b0', family: 'Inter, sans-serif', size: 11 },
        margin: { t: 20, r: 20, b: 40, l: 50 },
        xaxis: {
          gridcolor: 'rgba(255,255,255,0.07)',
          zerolinecolor: 'rgba(255,255,255,0.2)',
          color: '#888',
        },
        yaxis: {
          gridcolor: 'rgba(255,255,255,0.07)',
          zerolinecolor: 'rgba(255,255,255,0.2)',
          color: '#888',
        },
        legend: {
          bgcolor: 'rgba(30,30,30,0.7)',
          bordercolor: 'rgba(255,255,255,0.1)',
          borderwidth: 1,
          font: { size: 11 },
        },
        hovermode: 'closest',
      };

      const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['sendDataToCloud', 'editInChartStudio'],
        displaylogo: false,
        scrollZoom: true,
      };

      Plotly.react(containerRef.current, traces.traces, layout, config);
    });

    return () => {
      if (Plotly && containerRef.current) {
        Plotly.purge(containerRef.current);
      }
    };
  }, [traces]);

  if (!parsedFn) {
    return (
      <div className={styles.empty}>
        <p>El gráfico aparecerá aquí una vez que ingreses una función válida y presiones <strong>Ir</strong>.</p>
      </div>
    );
  }

  return <div className={styles.wrapper} ref={containerRef} />;
}
