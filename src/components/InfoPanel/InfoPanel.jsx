import styles from './InfoPanel.module.css';

export default function InfoPanel() {
  return (
    <div className={styles.panel}>
      <p className={styles.footer}>Basados en el diseño de Calculadora de Derivadas</p>
      <h2 className={styles.sectionTitle}>¿Cómo usar la calculadora?</h2>
      <p className={styles.intro}>
        El <strong>método de Newton-Raphson</strong> encuentra raíces de funciones no lineales
        construyendo tangentes sucesivas hasta converger al valor donde <em>f(x) = 0</em>.
      </p>

      <hr className={styles.divider} />

      <h3 className={styles.subTitle}>Parámetros de entrada</h3>

      <div className={styles.paramList}>
        <div className={styles.paramCard}>
          <span className={styles.paramName}>x₀ — Aproximación inicial</span>
          <p className={styles.paramDesc}>
            El punto de partida del método. El algoritmo traza la tangente a <em>f(x)</em> en ese punto
            y busca dónde cruza el eje X para obtener una mejor aproximación.
            Elegí un valor cercano a la raíz que querés encontrar para asegurar convergencia.
          </p>
        </div>

        <div className={styles.paramCard}>
          <span className={styles.paramName}>Tol — Tolerancia</span>
          <p className={styles.paramDesc}>
            Define qué tan preciso debe ser el resultado. El método se detiene cuando el error
            cae por debajo de este valor. Valores típicos: <code>1e-6</code> (alta precisión)
            o <code>0.0001</code> (más rápido). Valores muy pequeños pueden requerir más iteraciones.
          </p>
        </div>

        <div className={styles.paramCard}>
          <span className={styles.paramName}>N<sub>max</sub> — Cota máxima de iteraciones</span>
          <p className={styles.paramDesc}>
            Límite de seguridad: si el método no converge en este número de pasos, se detiene
            e informa que no hubo convergencia. Evita bucles infinitos en casos de divergencia.
            Valores típicos: <code>50</code> o <code>100</code>.
          </p>
        </div>
      </div>

      <hr className={styles.divider} />

      <h3 className={styles.subTitle}>Criterios de parada</h3>
      <p className={styles.criteriaIntro}>
        Determinan cuándo el método considera que encontró la raíz con suficiente precisión:
      </p>

      <div className={styles.criteriaList}>
        <div className={styles.criteriaCard}>
          <div className={styles.criteriaHeader}>
            <span className={styles.criteriaLabel}>Criterio I</span>
            <span className={styles.criteriaTag}>Por imagen</span>
          </div>
          <div className={styles.criteriaFormula}>|f(xₙ)| &lt; Tol</div>
          <p className={styles.criteriaDesc}>
            Se detiene cuando el valor de la función en la aproximación actual es menor que la tolerancia.
            Controla directamente <em>qué tan cerca está f(xₙ) de cero</em>.
            Es el criterio más intuitivo: si la función vale casi cero, estamos en la raíz.
          </p>
        </div>

        <div className={styles.criteriaCard}>
          <div className={styles.criteriaHeader}>
            <span className={styles.criteriaLabel}>Criterio II</span>
            <span className={styles.criteriaTag}>Por diferencia absoluta</span>
          </div>
          <div className={styles.criteriaFormula}>|xₙ − xₙ₋₁| &lt; Tol</div>
          <p className={styles.criteriaDesc}>
            Se detiene cuando dos aproximaciones consecutivas son muy cercanas entre sí.
            Controla <em>cuánto se mueve el método</em> en cada paso. Útil cuando la función
            tiene derivada grande cerca de la raíz.
          </p>
        </div>

        <div className={styles.criteriaCard}>
          <div className={styles.criteriaHeader}>
            <span className={styles.criteriaLabel}>Criterio III</span>
            <span className={styles.criteriaTag}>Por error relativo</span>
          </div>
          <div className={styles.criteriaFormula}>|xₙ − xₙ₋₁| / |xₙ| &lt; Tol</div>
          <p className={styles.criteriaDesc}>
            Igual que el Criterio II pero normalizado por el valor actual. Mide el error en términos
            <em> relativos</em> al tamaño de la aproximación. Más adecuado cuando la raíz es un número
            grande. No aplica si xₙ = 0.
          </p>
        </div>
      </div>

      <hr className={styles.divider} />

      <p className={styles.footer}>
        El método puede fallar si <strong>f&apos;(xₙ) = 0</strong> en alguna iteración
        (tangente horizontal) o si la función no converge desde el x₀ elegido.
        En ambos casos la calculadora muestra un mensaje explicativo.
      </p>
    </div>
  );
}
