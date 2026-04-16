<div align="center">
  <img width="180" alt="Logo institucional" src="./assets/logo_light_theme.png" />
  <h1>Ejercicio 2A - Red Electoral Colombia 2026</h1>
  <p>Analisis interactivo de grafos para estudiar comunidades, puentes y escenarios electorales.</p>
  <br/>
  <a href="https://ejercicio-2a-red-electoral-equipo-9.vercel.app/"><strong>Demo en vivo</strong></a>
</div>

---

## Tabla de contenidos

1. [Proposito del proyecto](#proposito-del-proyecto)
2. [Modelado del grafo](#modelado-del-grafo)
3. [Tecnologias](#tecnologias)
4. [Arquitectura del codigo](#arquitectura-del-codigo)
5. [Guia de la aplicacion](#guia-de-la-aplicacion)
   - [Barra lateral de controles](#barra-lateral-de-controles)
   - [Barra de metricas](#barra-de-metricas)
   - [Pestana Resumen](#pestana-resumen)
   - [Pestana Comunidades](#pestana-comunidades)
   - [Pestana Puentes](#pestana-puentes)
   - [Pestana Demografias](#pestana-demografias)
   - [Pestana Comparacion](#pestana-comparacion)
   - [Pantalla completa](#pantalla-completa)
6. [Principios de teoria de grafos aplicados](#principios-de-teoria-de-grafos-aplicados)
7. [Criterios de la rubrica](#criterios-de-la-rubrica)
8. [Retos innovadores](#retos-innovadores)
9. [Datos de entrada](#datos-de-entrada)
10. [Uso local](#uso-local)
11. [Analisis con IA](#analisis-con-ia)

---

## Proposito del proyecto

Esta aplicacion responde al Ejercicio 2A de la rubrica del Taller de Grafos. El objetivo es construir y analizar una red electoral de afinidades para la eleccion presidencial colombiana de 2026, identificando grupos naturales de votacion, nodos puente criticos y diferencias entre escenarios de analisis.

La red modela relaciones reales y estimadas entre candidatos, departamentos, franjas demograficas y medios de comunicacion. Las fuentes incluyen resultados de la Registraduria Nacional, analisis de El Tiempo y El Espectador, y datos de estratificacion del DANE.

---

## Modelado del grafo

La red se construye como un **grafo ponderado no dirigido** porque el objetivo principal es estudiar afinidades y cercanias entre actores, no la direccion del vinculo.

| Componente  | Descripcion                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------- |
| **Nodos**   | 60 actores: 6 candidatos, 34 departamentos (+exterior), 12 franjas demograficas, 8 medios de comunicacion     |
| **Aristas** | 404 relaciones de afinidad, cobertura, alcance y votacion                                                     |
| **Peso**    | Intensidad de la relacion (porcentaje de votos, indice de cobertura, alcance regional o afinidad demografica) |

**Por que no dirigido?** La eleccion prioriza la interpretacion estructural. Al usar aristas sin direccion, los algoritmos de deteccion de comunidades (Louvain, Girvan-Newman) operan sobre simetria de afinidad, lo que produce particiones mas interpretables. Como limitacion, se pierde la direccionalidad y temporalidad de los vinculos, pero se gana una lectura clara de comunidades, puentes y cohesion.

La construccion del grafo se realiza en [NetworkGraph.tsx:377-418](src/components/NetworkGraph.tsx#L377-L418), donde se instancia un `Graph` de Graphology con `type: "undirected"`, se filtran nodos segun la franja demografica seleccionada, se excluyen los nodos removidos del analisis de puentes, y se agregan solo las aristas cuyo peso supera el umbral minimo configurado por el usuario.

---

## Tecnologias

| Libreria                           | Rol en el proyecto                                           |
| ---------------------------------- | ------------------------------------------------------------ |
| **React 19**                       | Framework de interfaz de usuario                             |
| **TypeScript**                     | Tipado estatico para todos los componentes y algoritmos      |
| **Vite**                           | Bundler y servidor de desarrollo                             |
| **Tailwind CSS**                   | Estilos utilitarios para toda la interfaz                    |
| **Graphology**                     | Estructura de datos del grafo (nodos, aristas, atributos)    |
| **graphology-communities-louvain** | Deteccion de comunidades por optimizacion de modularidad     |
| **react-force-graph-2d**           | Renderizado del grafo con simulacion de fuerzas D3 en canvas |
| **PapaParse**                      | Parsing de archivos CSV para cargar nodos y aristas          |
| **Lucide React**                   | Iconografia de la interfaz                                   |

---

## Arquitectura del codigo

```
src/
  App.tsx                — Componente raiz: estado global, tabs, sidebar, carga de CSV
  types.ts               — Interfaces TypeScript: Nodo, Arista, GraphMetrics, CommunityInfo
  components/
    NetworkGraph.tsx     — Algoritmos de grafos + renderizado con ForceGraph2D
public/
  electoral_nodos.csv    — Catalogo de nodos
  electoral_aristas.csv  — Relaciones entre nodos
assets/
  logo_dark_theme.png    — Logo para sidebar (tema oscuro)
  logo_light_theme.png   — Logo para README (tema claro)
```

El archivo [types.ts](src/types.ts) define las interfaces centrales del proyecto: `Nodo` y `Arista` para los datos de entrada, `GraphMetrics` para las metricas globales (nodos, aristas, comunidades, modularidad, densidad, componentes, grado promedio, ranking de puentes), `CommunityInfo` para la informacion detallada de cada comunidad, y `BridgeRankingEntry` para el listado interactivo de nodos puente.

El componente [App.tsx](src/App.tsx) gestiona todo el estado de la aplicacion: parametros de filtrado (peso minimo, resolucion Louvain), franja demografica seleccionada, conjunto de nodos removidos (`Set<string>`), metricas baseline para comparacion de impacto, y modo comparacion dual. Tambien contiene la logica de construccion de subgrafos demograficos en las lineas [230-307](src/App.tsx#L230-L307).

El componente [NetworkGraph.tsx](src/components/NetworkGraph.tsx) es el nucleo algoritmico: contiene todas las funciones de teoria de grafos y el renderizado interactivo del grafo.

---

## Guia de la aplicacion

### Barra lateral de controles

La barra lateral izquierda concentra todos los controles que modifican el comportamiento del grafo. Se puede colapsar con el boton de flecha en la cabecera para dar mas espacio al grafo.

**Parametros de Red**

- **Peso Minimo** (slider 0-100): filtra aristas cuyo peso sea menor al umbral. Valores altos revelan solo las relaciones mas fuertes de la red, eliminando ruido. Por ejemplo, con peso minimo en 50, solo se muestran relaciones cuya intensidad de afinidad supera el 50%.
- **Resolucion Louvain** (slider 0.1-3.0): controla la granularidad de la deteccion de comunidades. Valores mayores a 1.0 producen comunidades mas pequenas y numerosas; valores menores agrupan nodos en bloques mas grandes.

Estos parametros se pasan al componente `NetworkGraph` y se usan en [NetworkGraph.tsx:412](src/components/NetworkGraph.tsx#L412) para filtrar aristas y en [NetworkGraph.tsx:449](src/components/NetworkGraph.tsx#L449) para configurar la resolucion de Louvain.

**Filtro Demografico**

- Selector desplegable con 12 franjas demograficas (edad, estrato, educacion, ruralidad, etnia) mas la opcion "Todas".
- Al seleccionar una franja, el grafo se reduce a candidatos + departamentos + esa franja especifica, permitiendo analizar como se comportan las afinidades cuando se aisla un segmento de poblacion.

La logica de filtrado demografico se aplica en [NetworkGraph.tsx:382-396](src/components/NetworkGraph.tsx#L382-L396).

**Analisis de Puentes**

- Muestra cuantos nodos han sido removidos del grafo y permite restaurarlos todos con un clic.
- Indica cual es el nodo puente principal (mayor centralidad de intermediacion).
- Dirige al usuario a la pestana Puentes para la gestion interactiva completa.

**Modo Comparacion**

- Toggle para activar la vista dual de grafos.
- Permite seleccionar el algoritmo del segundo grafo (Louvain o Girvan-Newman), su peso minimo y su resolucion o numero de comunidades objetivo.

### Barra de metricas

Una barra horizontal sobre las pestanas muestra las metricas globales del grafo actual en tiempo real:

| Metrica         | Significado                                                                |
| --------------- | -------------------------------------------------------------------------- |
| **Nodos**       | Cantidad de actores visibles en el grafo                                   |
| **Aristas**     | Cantidad de relaciones activas (que superan el peso minimo)                |
| **Comunidades** | Grupos detectados por el algoritmo seleccionado                            |
| **Modularidad** | Calidad de la particion: > 0.3 indica estructura comunitaria significativa |
| **Densidad**    | Proporcion de aristas existentes frente al maximo posible                  |
| **Componentes** | Subgrafos conectados (idealmente 1 si la red es cohesionada)               |

Estas metricas se calculan dentro de [NetworkGraph.tsx:445-548](src/components/NetworkGraph.tsx#L445-L548) y se emiten al componente padre mediante el callback `onMetricsChange`.

### Pestana Resumen

Vista principal que combina el grafo interactivo con un panel lateral de lectura rapida. El grafo usa una simulacion de fuerzas D3 donde cada nodo es repelido por los demas (fuerza de carga configurada en -300) y las aristas actuan como resortes (distancia de enlace en 80 pixeles). Esto se configura en [NetworkGraph.tsx:593-599](src/components/NetworkGraph.tsx#L593-L599).

Cada tipo de nodo tiene una forma visual distinta, dibujada en canvas mediante la funcion `paintNode` en [NetworkGraph.tsx:601-688](src/components/NetworkGraph.tsx#L601-L688):

| Forma                | Tipo de nodo          | Funcion de dibujo                                                                        |
| -------------------- | --------------------- | ---------------------------------------------------------------------------------------- |
| Estrella de 5 puntas | Candidato             | `drawStar()` en [NetworkGraph.tsx:759-781](src/components/NetworkGraph.tsx#L759-L781)    |
| Circulo              | Departamento          | Arco nativo de canvas                                                                    |
| Cuadrado             | Medio de comunicacion | Rectangulo nativo de canvas                                                              |
| Rombo                | Franja demografica    | `drawDiamond()` en [NetworkGraph.tsx:784-798](src/components/NetworkGraph.tsx#L784-L798) |

El tamano de cada nodo es proporcional a su centralidad de intermediacion (`val: 3 + btwScore * 50`), de modo que los nodos puente son visualmente mas grandes. Los nodos puente ademas tienen un halo dorado (#f59e0b) que los destaca.

La leyenda en la esquina inferior izquierda del grafo muestra las siluetas de cada forma sin relleno, usando solo borde, para mantener la consistencia visual.

El panel lateral "Lectura rapida" muestra grado promedio ponderado, componentes conectados y mayor intermediacion. Debajo, la lista de comunidades detectadas con su tamano, tipo dominante y miembros clave.

### Pestana Comunidades

Dedicada al analisis profundo de las comunidades detectadas por el algoritmo de Louvain. Muestra el grafo coloreado por comunidad y una tabla detallada con:

- **Tamano**: cantidad de nodos en cada comunidad.
- **Tipo dominante**: el tipo de nodo mas frecuente en la comunidad (ej. "departamento").
- **Miembros clave**: los primeros 5 nombres representativos.
- **Peso interno**: suma de pesos de aristas internas, calculada en [NetworkGraph.tsx:499-513](src/components/NetworkGraph.tsx#L499-L513). Valores altos indican alta cohesion.

El bloque narrativo explica que Louvain optimiza la funcion de modularidad Q agrupando nodos cuya densidad de conexiones internas supera la esperada en una red aleatoria equivalente. Al ajustar la resolucion, el usuario puede fragmentar comunidades grandes en subclusters mas finos.

### Pestana Puentes

Esta pestana implementa el **sistema interactivo de gestion de nodos puente**, la funcionalidad central del Reto Innovador 3 (analisis de resiliencia).

**Como funciona:**

1. El panel derecho muestra el **Top 5 de nodos puente**, ordenados por centralidad de intermediacion. Cada entrada muestra nombre, tipo y score.
2. Al hacer clic en un nodo del ranking (o directamente en el grafo), el nodo se **elimina** de la red y pasa a la lista de "Nodos Removidos".
3. El grafo se recalcula instantaneamente sin ese nodo: se recalculan comunidades, modularidad, componentes y nuevo ranking de puentes.
4. Los nodos removidos se pueden **restaurar** individualmente o todos a la vez.
5. El panel de **Impacto Acumulado** muestra en tiempo real:
   - Cantidad de nodos removidos vs. total original
   - Transicion de componentes conectados (ej. 1 -> 3)
   - Cambio en modularidad con indicador de tendencia
   - Nivel de fragmentacion (Baja / Media / Alta / Critica)

La logica de remocion y restauracion se gestiona en [App.tsx:188-213](src/App.tsx#L188-L213) usando un `Set<string>` para los IDs removidos y un arreglo de `BridgeRankingEntry` para mantener el historial. La funcion `getFragmentationLevel` en [App.tsx:215-224](src/App.tsx#L215-L224) calcula el nivel de fragmentacion comparando componentes actuales contra la linea base.

La centralidad de intermediacion se calcula con el **algoritmo de Brandes** implementado en [NetworkGraph.tsx:58-143](src/components/NetworkGraph.tsx#L58-L143). Este algoritmo usa caminos mas cortos ponderados (distancia = 1/peso) con Dijkstra, acumula dependencias en una pila, y normaliza el resultado por el factor `2 / ((n-1)(n-2))` para obtener valores entre 0 y 1.

### Pestana Demografias

Permite estudiar como cambia la estructura comunitaria cuando se aisla una franja demografica especifica. La logica construye subgrafos independientes para cada una de las 12 franjas en [App.tsx:230-307](src/App.tsx#L230-L307): por cada franja, crea un grafo con candidatos + departamentos + esa franja, ejecuta Louvain y mide modularidad.

La tabla resultante ordena las franjas de mayor a menor modularidad, respondiendo a la pregunta: **cual corte sociologico produce ecosistemas de afinidad con mayor cohesion?** La franja con mayor modularidad aparece destacada en verde.

Esta funcionalidad permite observar, por ejemplo, que la franja de "estrato bajo" puede generar una particion comunitaria muy diferente a la de "profesional universitario", revelando que ciertos segmentos demograficos polarizan mas la red electoral.

### Pestana Comparacion

Muestra dos grafos lado a lado, cada uno con su propia configuracion de parametros. Permite contrastar:

- **Louvain vs. Girvan-Newman**: comparar la particion aglomerativa contra la divisiva.
- **Diferentes umbrales de peso**: observar como cambia la topologia al podar aristas debiles.
- **Diferentes resoluciones**: ver la diferencia entre comunidades gruesas y finas.

La tabla comparativa debajo de los grafos cuantifica las diferencias: nodos, aristas, modularidad, comunidades, componentes y densidad para cada configuracion.

El algoritmo de **Girvan-Newman** esta implementado en [NetworkGraph.tsx:276-313](src/components/NetworkGraph.tsx#L276-L313). Funciona de manera divisiva: calcula el betweenness de cada arista (usando la funcion en [NetworkGraph.tsx:210-272](src/components/NetworkGraph.tsx#L210-L272)), elimina la arista con mayor valor, y repite hasta alcanzar el numero deseado de componentes.

### Pantalla completa

Cada pestana incluye un boton de expansion (icono Maximize2) en la esquina superior derecha del grafo. Al activarlo, el grafo ocupa toda la ventana del navegador, ocultando sidebar, metricas y pestanas. Un boton Minimize2 permite regresar a la vista normal. Esto se implementa en [App.tsx:638-667](src/App.tsx#L638-L667) con un overlay `fixed inset-0 z-50`.

---

## Principios de teoria de grafos aplicados

### Deteccion de comunidades (Louvain)

El algoritmo de Louvain es un metodo aglomerativo que optimiza la **funcion de modularidad Q**:

```
Q = (1/2m) * SUM[ Aij - (ki * kj)/(2m) ] * delta(ci, cj)
```

Donde `Aij` es el peso de la arista entre i y j, `ki` es el grado ponderado de i, `m` es la suma total de pesos, y `delta(ci, cj)` vale 1 si ambos nodos estan en la misma comunidad. Valores de Q > 0.3 indican estructura comunitaria robusta.

La implementacion usa la libreria `graphology-communities-louvain` invocada en [NetworkGraph.tsx:449](src/components/NetworkGraph.tsx#L449), y la modularidad se verifica con una implementacion propia en [NetworkGraph.tsx:147-179](src/components/NetworkGraph.tsx#L147-L179).

### Deteccion de comunidades (Girvan-Newman)

Algoritmo divisivo que identifica comunidades eliminando iterativamente las aristas que mas "intermedian" entre componentes. Calcula el betweenness de aristas mediante BFS, elimina la de mayor valor, y repite hasta fragmentar el grafo en el numero deseado de componentes.

Implementado en [NetworkGraph.tsx:276-313](src/components/NetworkGraph.tsx#L276-L313) con soporte para la funcion auxiliar `computeEdgeBetweenness` en [NetworkGraph.tsx:210-272](src/components/NetworkGraph.tsx#L210-L272).

### Centralidad de intermediacion (Brandes)

Mide con que frecuencia un nodo se encuentra en el camino mas corto entre cualquier par de nodos. Un nodo con alta intermediacion es un "puente" critico: si se elimina, la comunicacion entre partes de la red se degrada o se pierde.

La implementacion en [NetworkGraph.tsx:58-143](src/components/NetworkGraph.tsx#L58-L143) usa el algoritmo de Brandes con distancias ponderadas (distancia = 1/peso, linea 105), recorrido tipo Dijkstra con acumulacion de predecesores y retropropagacion de dependencias. El resultado se normaliza para grafos no dirigidos dividiendo por 2 y aplicando el factor `2/((n-1)(n-2))`.

### Componentes conectados

Un componente conectado es un subconjunto maximo de nodos donde existe un camino entre cualquier par. Detectar la cantidad de componentes revela si la red es cohesionada (1 componente) o fragmentada. Se calcula mediante BFS en [NetworkGraph.tsx:183-206](src/components/NetworkGraph.tsx#L183-L206) y la funcion de conteo en [NetworkGraph.tsx:316-333](src/components/NetworkGraph.tsx#L316-L333).

### Densidad

La densidad del grafo mide la proporcion entre aristas existentes y el maximo teorico: `D = 2E / (N * (N-1))`. Valores cercanos a 1 indican un grafo denso (muchas conexiones); valores cercanos a 0 indican un grafo disperso. Se calcula en [NetworkGraph.tsx:473-474](src/components/NetworkGraph.tsx#L473-L474).

---

## Criterios de la rubrica

### 1. Visualizacion del grafo

La aplicacion presenta una visualizacion interactiva completa:

- **Diferenciacion por tipo de nodo**: cada tipo tiene forma y tamaño distinto (estrella, circulo, cuadrado, rombo) en [NetworkGraph.tsx:615-629](src/components/NetworkGraph.tsx#L615-L629).
- **Leyenda visual**: ubicada en la esquina inferior izquierda del grafo en [NetworkGraph.tsx:729-753](src/components/NetworkGraph.tsx#L729-L753), con siluetas sin relleno para cada forma.
- **Panel de metricas**: barra superior con 6 metricas globales en tiempo real en [App.tsx:672-696](src/App.tsx#L672-L696).
- **Coloreado por comunidad**: paleta de 20 colores asignada por indice de comunidad en [NetworkGraph.tsx:33-54](src/components/NetworkGraph.tsx#L33-L54).
- **Cambios dinamicos**: los filtros de peso y resolucion recalculan el grafo instantaneamente.
- **Tooltips informativos**: al pasar sobre un nodo se muestra nombre, tipo, comunidad y centralidad en [NetworkGraph.tsx:703-711](src/components/NetworkGraph.tsx#L703-L711).
- **Tamano proporcional a intermediacion**: nodos puente se ven mas grandes.
- **Halo dorado en puentes**: resaltado visual de nodos criticos.
- **Modo pantalla completa**: para analisis detallado sin distracciones.

### 2. MVP funcional sin errores

La aplicacion cubre el ciclo completo:

- **Carga de datos**: parsing de CSV con PapaParse en [App.tsx:124-153](src/App.tsx#L124-L153).
- **Construccion del grafo**: instanciacion con Graphology, filtrado de nodos y aristas.
- **Deteccion de comunidades**: Louvain y Girvan-Newman disponibles.
- **Calculo de metricas**: modularidad, densidad, componentes, grado promedio, centralidad.
- **Filtrado interactivo**: peso minimo, resolucion, franja demografica.
- **Analisis de puentes**: ranking, remocion, restauracion, impacto acumulado.
- **Comparacion de escenarios**: vista dual con tabla comparativa.
- **Interfaz responsiva**: sidebar colapsable, fullscreen, scroll en paneles.

### 3. Modelado del grafo

El modelado esta justificado en la seccion [Modelado del grafo](#modelado-del-grafo). Se explica:

- **Tipo de grafo elegido**: ponderado no dirigido, con justificacion de por que la simetria es apropiada para estudiar afinidades.
- **Significado del peso**: porcentaje de votos, indice de cobertura, alcance regional o afinidad demografica segun el tipo de arista.
- **Limitaciones reconocidas**: perdida de direccionalidad y temporalidad.
- **Tipos de nodos y aristas**: documentados con su semantica electoral.

### 4. Exposicion

El codigo esta organizado para facilitar la explicacion:

- Cada funcion algorítmica tiene un comentario de cabecera que explica su proposito y el principio teorico que implementa (ej. lineas 56-57, 145-146, 181-182, 208-209, 274-275, 315 de NetworkGraph.tsx).
- Los bloques narrativos (`NarrativeBlock`) en cada pestana explican el contexto teorico al usuario final.
- Las interfaces en [types.ts](src/types.ts) documentan la estructura de datos completa.
- Este README funciona como guia de exposicion, conectando cada seccion de la interfaz con el principio de grafos que aplica y el archivo donde se implementa.

### 5. Retos innovadores

Ver seccion completa a continuacion.

---

## Retos innovadores

### Reto 1 — Comparacion de criterios de particion

**Estado: Implementado**

La pestana Comparacion permite contrastar Louvain (aglomerativo) vs. Girvan-Newman (divisivo) lado a lado con parametros independientes. La tabla comparativa muestra diferencias en modularidad, comunidades, componentes y densidad.

- **Louvain**: optimiza modularidad Q de manera bottom-up, fusionando nodos en comunidades. Implementado via `graphology-communities-louvain` en [NetworkGraph.tsx:449](src/components/NetworkGraph.tsx#L449).
- **Girvan-Newman**: funciona top-down eliminando aristas de mayor betweenness. Implementado manualmente en [NetworkGraph.tsx:276-313](src/components/NetworkGraph.tsx#L276-L313).
- **Comparacion cuantitativa**: la tabla en [App.tsx:1188-1266](src/App.tsx#L1188-L1266) permite al usuario evaluar cual metodo produce mejor modularidad o una particion mas interpretable para la red electoral.

### Reto 2 — Evolucion demografica

**Estado: Implementado**

La pestana Demografias construye un subgrafo independiente para cada franja demografica, ejecuta Louvain sobre cada uno, y presenta una tabla ordenada por modularidad. Esto permite:

- Identificar cual segmento sociologico genera los ecosistemas de afinidad mas diferenciados.
- Observar como la misma red produce particiones distintas al filtrar por edad, estrato, educacion, ruralidad o etnia.
- Responder la pregunta: cual franja demografica es la mas homogenea en sus preferencias electorales?

La logica de construccion de subgrafos esta en [App.tsx:230-307](src/App.tsx#L230-L307).

### Reto 3 — Analisis de resiliencia (nodos puente)

**Estado: Implementado**

La pestana Puentes permite eliminar progresivamente los nodos con mayor centralidad de intermediacion y observar en tiempo real como se fragmenta la red. El sistema incluye:

- **Ranking Top 5**: nodos puente ordenados por score de intermediacion.
- **Remocion acumulativa**: cada nodo eliminado se suma al conjunto de removidos (`Set<string>`) en [App.tsx:89](src/App.tsx#L89).
- **Restauracion individual o masiva**: permite deshacer eliminaciones para explorar diferentes secuencias.
- **Impacto acumulado**: panel que compara componentes, modularidad y nivel de fragmentacion contra la linea base capturada cuando no hay nodos removidos ([App.tsx:173-176](src/App.tsx#L173-L176)).
- **Nivel de fragmentacion**: clasificacion cualitativa (Baja/Media/Alta/Critica) basada en la proporcion de componentes actuales vs. originales ([App.tsx:215-224](src/App.tsx#L215-L224)).

Este reto responde a la pregunta: que tan resiliente es la red electoral frente a la perdida de actores criticos? Si un candidato o departamento puente desaparece del analisis, se fragmentan los bloques de afinidad?

---

## Datos de entrada

La app consume los CSV ubicados en `public/`:

| Archivo                 | Contenido                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `electoral_nodos.csv`   | 60 nodos con: ID, nombre, tipo, subtipo, 4 atributos descriptivos y region                           |
| `electoral_aristas.csv` | 404 aristas con: ID, origen, destino, tipo, peso, votos estimados, afinidad de bloque, fuente y nota |

Los tipos de nodos son: `candidato`, `departamento`, `franja_demografica` y `medio`. Los tipos de aristas son: `voto_candidato_departamento`, `cobertura_medio_candidato`, `alcance_medio_departamento` y `afinidad_franja_candidato`.

La descripcion metodologica completa del dataset esta en [electoral_README.txt](../electoral_README.txt).

---

## Uso local

### Requisitos

- Node.js 18 o superior
- npm 9 o superior

### 1. Clonar el repositorio

Si vas a trabajar desde cero, primero clona el proyecto y entra en la carpeta del repositorio:

```bash
git clone <URL-del-repositorio>
cd ejercicio-2a-red-electoral-equipo-9
```

Si ya tienes la carpeta abierta en VS Code, puedes saltar este paso.

### 2. Instalar dependencias

Instala las librerias necesarias del proyecto web:

```bash
npm install
```

Las dependencias principales que usa la aplicacion son React, Vite, TypeScript, Graphology, graphology-communities-louvain, react-force-graph-2d, PapaParse, Lucide React y @google/genai.

### 3. Configurar la clave de Gemini

Para activar el panel de analisis con IA, crea un archivo `.env` en la carpeta `zip/` y agrega una de estas variables:

```bash
VITE_GEMINI_API_KEY=tu_clave_de_gemini
```

Tambien es compatible con:

```bash
GEMINI_API_KEY=tu_clave_de_gemini
```

Si no configuras esta variable, la funcion de IA mostrara un mensaje de error al intentar ejecutarse.

### Ejecutar en desarrollo

```bash
npm run dev
```

La URL por defecto es `http://localhost:3000`.

### Build de produccion

```bash
npm run build
npm run preview
```

### API local opcional

Si quieres levantar la API local de apoyo, en otra terminal ejecuta:

```bash
npm run api:start
```

### Verificar funcionamiento

1. Abre la app en el navegador.
2. Confirma que los CSV de `public/` cargan correctamente.
3. Prueba la pestaña de analisis IA para validar que la clave de Gemini esta bien configurada.
4. Revisa la consola si aparece algun error de entorno o dependencias.

## Analisis con IA

La aplicacion incluye un panel de analisis automatico con Gemini. Para que funcione en local y en Vercel debes definir una clave valida de Gemini.

### Variables de entorno

El codigo prioriza `VITE_GEMINI_API_KEY` y mantiene compatibilidad con `GEMINI_API_KEY` como fallback. La forma recomendada es usar una variable con el prefijo de Vite:

```bash
VITE_GEMINI_API_KEY=tu_clave_de_gemini
```

Si prefieres reutilizar una configuracion existente, tambien puedes usar:

```bash
GEMINI_API_KEY=tu_clave_de_gemini
```

### Configuracion local

1. Crea un archivo `.env` en la carpeta `zip/`.
2. Agrega `VITE_GEMINI_API_KEY` o `GEMINI_API_KEY` con tu clave real.
3. Reinicia el servidor de desarrollo para que Vite cargue la variable.

### Configuracion en Vercel

1. Abre el proyecto en Vercel.
2. Ve a `Settings` > `Environment Variables`.
3. Agrega `VITE_GEMINI_API_KEY` con el valor de tu clave.
4. Vuelve a desplegar el proyecto.

Si la variable no esta definida, el boton de analisis IA mostrara un error indicando que falta la clave de Gemini.

---
