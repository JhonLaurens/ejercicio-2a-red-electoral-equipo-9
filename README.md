<div align="center">
  <img width="180" alt="Logo institucional" src="./assets/logo_light_theme.png" />
  <h1>Ejercicio 2A - Red Electoral 2026</h1>
  <p>Proyecto académico de análisis de grafos para estudiar comunidades, puentes y escenarios electorales.</p>
</div>

## Propósito del proyecto

Esta aplicación responde al Ejercicio 2A de la rúbrica del Taller de Grafos. El objetivo es construir y analizar una red electoral de afinidades para identificar grupos naturales, nodos puente y diferencias entre escenarios de análisis.

## Tecnologías usadas

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Graphology
- graphology-communities-louvain
- react-force-graph-2d
- PapaParse
- Lucide React

## Qué hace la aplicación

La aplicación visualiza una red electoral con:

- comunidades detectadas por Louvain
- comparación con Girvan-Newman
- métricas globales de la red
- análisis de nodos puente por centralidad de intermediación
- comparación de escenarios por umbral de peso y resolución
- filtros por franja demográfica

## Preguntas analíticas que responde

La interfaz está orientada a producir evidencia visual y numérica para responder:

- Qué departamentos tienen un perfil de votación similar entre sí.
- Si los grupos detectados coinciden con regiones geográficas o bloques ideológicos.
- Qué medios de comunicación comparten ecosistema de influencia con qué candidatos.
- Qué franja demográfica es la más homogénea en sus preferencias electorales.
- Qué tan pronunciada es la separación entre los grupos encontrados.

## Retos innovadores cubiertos

La aplicación incluye tres extensiones pensadas para la nota máxima:

- Análisis de puentes: identifica nodos bisagra entre grupos y permite simular el efecto de eliminarlos.
- Evolución demográfica: compara subgrafos por franja demográfica y observa cómo cambia la partición.
- Comparación de parámetros: muestra dos configuraciones del análisis lado a lado con sus métricas.

## Modelado del grafo

La red se modela como un grafo ponderado no dirigido, porque el objetivo principal es estudiar afinidades y cercanías entre actores.

- Nodos: candidatos, departamentos, franjas demográficas y medios.
- Aristas: relaciones de afinidad, cobertura o influencia medidas por peso.
- Peso: representa fuerza de relación o intensidad de conexión.

Esta elección prioriza la interpretación estructural de la red. Como limitación, se pierde parte de la direccionalidad y de la temporalidad de los vínculos, pero se gana una lectura clara de comunidades, puentes y cohesión.

## Criterios de evaluación cubiertos

La implementación está alineada con los criterios de la rúbrica:

- Visualización del grafo: diferenciación por tipo de nodo, leyenda, panel de métricas y cambios dinámicos con parámetros.
- MVP funcional sin errores: carga de datos, filtrado, análisis y comparación de escenarios.
- Modelado del grafo: justificación del tipo de grafo y del significado del peso.
- Exposición: el código está organizado para explicar decisiones de diseño y análisis.
- Retos innovadores: puentes, evolución demográfica y comparación de parámetros.

## Archivos de datos

La app consume los CSV ubicados en `public/`:

- `electoral_nodos.csv`
- `electoral_aristas.csv`

## Requisitos

- Node.js 18 o superior
- npm 9 o superior

## Uso local

1. Instalar dependencias:
   `npm install`
2. Iniciar el entorno de desarrollo:
   `npm run dev`
3. Abrir la URL indicada por Vite, normalmente:
   `http://localhost:3000`

## Build de producción

1. Generar la compilación:
   `npm run build`
2. Previsualizar el resultado:
   `npm run preview`

## Nota sobre el logo

Los logos institucionales se encuentran en `zip/assets/` y se usan dentro de la interfaz y esta documentación.
