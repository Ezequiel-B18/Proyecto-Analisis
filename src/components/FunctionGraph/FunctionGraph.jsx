import { useEffect, useRef, useMemo } from 'react';
import styles from './FunctionGraph.module.css';

/**
 * Este archivo es el que se encarga de renderizar el grafico interactivo de 
 * la función f(x) y sus tangentes. Utiliza la librería Plotly.js para renderizar el gráfico.
 * Referencias:
 * parsedFn: es la funcion ingresada parseada por la libreria de math.js,
 * iterations: es un arreglo de objetos que contiene todos los valores para cada iteracion,
 * x0: es el valor inicial de la iteracion,
 * root: es la raiz de la funcion (si es que la encontro)
 * status: es el estado del metodo, osea si lo encontro, si llego al maximo de iteraciones, etc.
 */

// Muestrea la funcion f para los valores de x en el rango [xMin, xMax].
function sampleFunction(fn, xMin, xMax, points = 400) {
  const xs = []; // Las x que vamos a usar para graficar
  const ys = []; // Las y que vamos a usar para graficar
  const step = (xMax - xMin) / points; // El paso entre cada x
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

// Obtiene los datos necesarios para graficar las rectas tangentes
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
      line: { color: 'rgba(0, 229, 255, 0.5)', width: 1.5 }, // Línea sólida cian translúcida
      name: 'Recta Tangente',
      showlegend: i === 0, // Solo mostramos la primera en la leyenda para no duplicar
      hoverinfo: 'skip',
    };
  }).filter(Boolean);
}

export default function FunctionGraph({ parsedFn, iterations, x0, root, status }) {
  const containerRef = useRef(null);

  const traces = useMemo(() => {
    if (!parsedFn) return null;

    const center = root ?? (x0 !== null ? Number(x0) : 0); // Donde se centrara la vista, en la raiz o x0
    
    // Define el ancho total del grafico, para que se vea todo el recorrido por el que paso el metodo 
    // para encontrar la raiz.
    let xMin = center - 5;
    let xMax = center + 5;
    if (iterations && iterations.length > 0) {
      const xValues = [Number(x0), ...iterations.map(it => it.xn)].filter(x => x !== null && !isNaN(x));
      if (root !== null) xValues.push(root);
      const minIterX = Math.min(...xValues);
      const maxIterX = Math.max(...xValues);
      const width = maxIterX - minIterX;
      // Agregamos un margen mínimo de 1.5 o 1.5 veces el ancho del trayecto
      const margin = Math.max(1.5, width * 1.5);
      xMin = minIterX - margin;
      xMax = maxIterX + margin;
    }

    const { xs, ys } = sampleFunction(parsedFn, xMin, xMax);

    // Define la altura del grafico para que se puedan ver bien las tangentes
    let yMinVal = -5;
    let yMaxVal = 5;
    if (iterations && iterations.length > 0) {
      const yValues = iterations.map(it => it.fxn);
      if (x0 !== null && x0 !== undefined) {
        try {
          yValues.push(parsedFn.evaluate({ x: Number(x0) }));
        } catch {}
      }
      const maxAbsY = Math.max(...yValues.map(Math.abs));
      const margin = Math.max(2, maxAbsY * 1.5);
      yMinVal = -margin;
      yMaxVal = margin;
    }

// En esta parte se define el grafico, donde se muestra la funcion y las tangentes.
    const result = [
      // Linea de referencia del eje x
      {
        x: [xMin, xMax],
        y: [0, 0],
        mode: 'lines',
        type: 'scatter',
        line: { color: 'rgba(255,255,255,0.15)', width: 1 },
        showlegend: false,
        hoverinfo: 'skip',
      },
      // Curva de la funcion
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

    // Lineas tangentes
    if (iterations.length > 1) {
      result.push(...buildTangentTraces(iterations));
    }

    // Marcador x₀
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

    // Marcador de la raiz
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

    return { traces: result, xMin, xMax, yMin: yMinVal, yMax: yMaxVal };
  }, [parsedFn, iterations, x0, root, status]);

// Esta parte es la que se encarga de renderizar el grafico, 
// donde se muestra la funcion y las tangentes.
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
          range: [traces.yMin, traces.yMax],
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
