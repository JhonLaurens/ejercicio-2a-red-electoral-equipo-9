# Auditoría Técnica y UX/UI: Dashboard de Análisis de Grafos

Este informe detalla los hallazgos tras la auditoría interactiva completa de la aplicación en `http://localhost:3000/`. Se ha recorrido cada pestaña y se han simulado interacciones con el sidebar y los propios grafos.

---

## A) Bugs y Errores Funcionales

### 1. Error de Escala Crítico en Pestaña "Comunidades"
- **Paso para reproducir:** Navegar a la pestaña "Comunidades" desde el menú superior.
- **Comportamiento Observado:** El grafo se renderiza como un punto minúsculo (aprox. 10x10px) en el centro del contenedor, o agrupado de forma extraña. Hace que parezca inoperable hasta que se manipula el zoom extremo o se resetea la vista repetidamente.
- **Comportamiento Esperado:** El grafo debe adoptar una escala inicial adecuada ("fit-to-screen") y ocupar el área visible del contenedor central de forma distribuida para facilitar la lectura.
- **Archivo/Línea Probable:** `NetworkGraph.tsx`. El `viewBox` del SVG, la configuración inicial del zoom (`d3.zoomIdentity`), o la fuerza de repulsión (`forceManyBody`) y centrado (`forceCenter`) dentro de la inicialización de `d3-force` podrían requerir que las dimensiones dependan estrictamente del contenedor padre, y no de valores estáticos.

### 2. Desplazamiento (Offset) u Ocultamiento Indeseado en Pestañas ("Demografías" / "Puentes")
- **Paso para reproducir:** Cambiar desde el "Resumen" directamente a estas pestañas y aplicar un filtro (como seleccionar el rango de edad `18-25`).
- **Comportamiento Observado:** En ciertos escenarios de resolución o expansión, parte de la red puede inicializarse cortada, o la visualización vertical se centra incorrectamente.
- **Comportamiento Esperado:** El punto `(0,0)` o el centro del grafo debe corresponderse dinámicamente con el centro del SVG activo para que los nodos no queden por fuera del viewport y requieran drag forzado para ser vistos.
- **Archivo/Línea Probable:** `App.tsx` (estilos relacionados con el layout, como overflow en div contenedores) o `NetworkGraph.tsx` en sus cálculos de actualización de dimensiones (handlers de `resize`).

### 3. Falta de Persistencia en Estado de la Red
- **Paso para reproducir:** En la pestaña "Puentes", clicar en un nodo (ej. Paloma Valencia) para eliminarlo o seleccionarlo. Luego navegar a "Demografías" y regresar a "Puentes".
- **Comportamiento Observado:** El estado interactivo del grafo (nodo previamente seleccionado, poda local aplicada, zoom específico) se reinicia por completo. Las etiquetas UI superiores de "Puente detectado" persisten mientras el nodo reaparece, causando inconsistencia de estado.
- **Comportamiento Esperado:** Dependiendo de la arquitectura de la aplicación, el estado de los filtros y poda visual debe compartirse o ser "limpiado" correctamente al desmontar el componente de la pestaña.
- **Archivo/Línea Probable:** Gestión de estado con `useState` en `App.tsx` que no resetea la información dependiente al cambiar de pestaña. O, correlativamente, falta alzar el estado del grafo a un contexto general `NetworkContext`.

---

## B) Problemas de Diseño y UX

### 1. Colisión de Elementos y Jerarquía Visual en el Header y Sidebar
- **Problema Observado:** En resoluciones más pequeñas, los controles de "sidebar" o los indicadores como el _div_ de "Puente Detectado" colisionan. Además, títulos y _labels_ secundarios no destacan bien y textos de leyenda grises se pierden con fondos claros.
- **Impacto:** Dificulta la legibilidad para usuarios con debilidad visual y empeora drásticamente la jerarquía visual de los controles.
- **Recomendación Visual:** Mejorar el contraste de las leyendas y usar un z-index / flex-wrap adecuado para el Header.

### 2. Baja Interacción (Affordance) y Carencia de Tooltips Claros en Nodos Individuales
- **Problema Observado:** Al hacer *hover* sobre los nodos del panel principal, no existe un feedback visual robusto e inmediato. La información subyacente exige un clic directo.
- **Impacto y Mejora:** La exploración de redes complejas con cientos de nodos (el caso de una red electoral) es farragosa. Se debería mostrar un Tooltip en mouseover y opacar levemente los nodos no conectados.

---

## C) Recomendaciones Priorizadas

### 📌 1. Corrección de Escala Crítica del SGV (Prioridad: ALTA, Esfuerzo: MEDIO)
**Problema que resuelve:** Arregla el bug crítico donde el grafo de "Comunidades" se ve minúsculo.
**Cambio de código a realizar:**
Añadir una rutina que ajuste la simulación en `NetworkGraph.tsx` (o equivalente).
```typescript
// En useEffect de NetworkGraph.tsx (después de inicializar d3)
const bounds = svg.select('g.container').node().getBBox();
const fullWidth = width, fullHeight = height;
const widthScale = fullWidth / bounds.width;
const heightScale = fullHeight / bounds.height;
const scale = 0.85 * Math.min(widthScale, heightScale); // Margen
svg.transition().call(
  zoom.transform, 
  d3.zoomIdentity.translate(fullWidth/2, fullHeight/2)
  .scale(scale)
  .translate(-bounds.x - bounds.width/2, -bounds.y - bounds.height/2)
);
```

### 📌 2. Implementación de Tooltips Interactivos (Prioridad: MEDIA, Esfuerzo: BAJO)
**Problema que resuelve:** Permite al usuario entender los datos rápidamente (exploración en superficie).
**Cambio de código a realizar:**
```typescript
// En renderizado de nodos de d3:
node.on("mouseover", (event, d) => {
    d3.select("#tooltip")
      .style("opacity", 1)
      .html(`<b>${d.id}</b><br/>Valor: ${d.val}`)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 10) + "px");
})
.on("mouseout", () => {
    d3.select("#tooltip").style("opacity", 0);
});
```

### 📌 3. Refactorización de Estilos del Sidebar (Prioridad: BAJA, Esfuerzo: BAJO)
**Problema que resuelve:** Resuelve la legibilidad de etiquetas en las herramientas de manipulación temporal de la red (Filtros Demográficos, Resolución).
**Cambio de código a realizar:**
Cambiar las clases de Tailwind (u hojas de estilo). Reemplazar colores tenues estáticos por alto contraste:
```tsx
// App.tsx
// Antes: <span className="text-slate-500 text-sm">
// Después: <span className="text-slate-800 dark:text-slate-200 font-medium text-sm mb-1 block">
```
