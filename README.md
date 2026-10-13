# Sitio del análisis exploratorio — GitHub Pages

Esta carpeta contiene todo lo necesario para publicar el análisis exploratorio de inventario como sitio
estático en formato libro: portada con el logo, índice lateral, capítulos, figuras y código plegable.

**Enfoque vigente desde el 13 de octubre de 2026:** política de compra y reposición por referencia para alcanzar un nivel de abastecimiento acordado y reducir costos y pérdidas. El sitio conserva el EDA y su evidencia histórica.

| Archivo | Qué es |
|---|---|
| `index.html` | El sitio completo, en una sola página. Es lo que GitHub Pages sirve. |
| `assets/` | Identidad visual, gráficos interactivos y las 7 imágenes originales como respaldo e impresión. |
| `assets/graficos.js` / `assets/graficos.css` | Interacciones y presentación visual. |
| `assets/vendor/` | Plotly.js 2.35.2, incluido localmente con su licencia MIT. |
| `assets/procedencia-graficos.json` | Fuente y huella SHA-256 de los agregados utilizados. |
| `.nojekyll` | Indica a GitHub Pages que publique los archivos tal cual, sin procesarlos. |
| `plantilla.html` | Diseño del libro (estilos y estructura). |
| `construir_sitio.py` | Regenera `index.html` a partir del notebook de presentación. |
| `graficos_interactivos.py` | Selecciona los agregados guardados y genera las tarjetas y tablas accesibles. |
| `requirements-sitio.txt` | Dependencias para regenerar el sitio; no se necesitan para abrirlo. |

No incluye los `.xlsx`, los caches ni valores de la columna `DESCRIPCION`. Contiene las tablas y figuras
del notebook y los agregados necesarios para explorar los siete gráficos. Las rutas locales del computador
se reemplazan por una etiqueta neutra.

## Explorar y presentar

- La portada permite saltar a cualquiera de los siete gráficos o abrir el **Modo presentación**.
- **Ampliar** abre una figura en el visor; **Anterior**, **Siguiente** y las flechas del teclado recorren las figuras. **Esc** cierra el visor.
- Al pasar el cursor aparecen los valores. Al hacer clic o tocar un dato, su lectura queda debajo del gráfico.
- Concentración permite alternar unidades y porcentaje; regularidad permite resaltar una referencia.
- La serie mensual y el mapa de calor se pueden acotar a un año. Los perfiles anuales y las series S_F/S_FJ se activan individualmente.
- Las distribuciones permiten mostrar todos los meses elegibles, conservando los extremos.
- **Restablecer vista** recupera los filtros y el encuadre iniciales. Cada figura tiene una tabla de datos plegable, con todos sus periodos.

Los textos, tablas originales, código y resultados del EDA se conservan. Los cuatro meses incompletos,
los ceros y los periodos no elegibles mantienen sus reglas originales. Los filtros cambian la vista, no
recalculan los resultados. Las cajas usan los cuartiles guardados y los bigotes de 1,5 RIC de los mismos
meses elegibles; no dependen del estimador de cuartiles por defecto del navegador.

Los gráficos funcionan sin conexión porque la librería y los datos están incluidos. Las fuentes de Google
ya usadas por el diseño son opcionales: sin conexión se utilizan las fuentes del sistema. Si JavaScript no
está disponible, se muestran las imágenes originales y las tablas de datos. Al imprimir se usan las imágenes.

## Antes de publicar

1. **Autorización de la empresa.** El sitio muestra nombres de vacunas, volúmenes mensuales y documentos de
   Infectólogos y Asociados. En una cuenta gratuita, GitHub Pages es público aunque el repositorio sea
   privado. Publiquen solo con autorización de la empresa y del docente. La página incluye
   `noindex, nofollow` para desalentar su indexación en buscadores, pero eso no la vuelve privada.
2. **No usar el repositorio actual del proyecto.** El repositorio `analisis-inventario-infectologos` tiene en
   su historial los cuatro Excel originales, que contienen nombres de personas. Si se vuelve público para
   activar Pages, esos archivos quedan descargables. Publiquen desde un repositorio nuevo que contenga
   solo esta carpeta.

## Cómo publicar (repositorio nuevo, solo esta carpeta)

1. En GitHub, creen un repositorio nuevo y vacío, por ejemplo `eda-inventario-infectologos`.
2. Suban el contenido de esta carpeta, sin la carpeta misma: `index.html`, `assets/` y `.nojekyll` deben quedar
   en la raíz del repositorio. Pueden hacerlo desde la web (Add file → Upload files) o con git:

   ```bash
   cd GITHUB_PAGES_EDA
   git init -b main
   git add index.html .nojekyll assets README.md
   git commit -m "Publicar análisis exploratorio de inventario"
   git remote add origin https://github.com/USUARIO/eda-inventario-infectologos.git
   git push -u origin main
   ```

   Los scripts Python, `plantilla.html` y `requirements-sitio.txt` pueden subirse o no; el sitio no los necesita.
3. En el repositorio: Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch:
   `main`, carpeta `/ (root)` → Save.
4. Después de uno o dos minutos el sitio queda en `https://USUARIO.github.io/eda-inventario-infectologos/`.

Antes de subir se puede revisar localmente abriendo `index.html` con doble clic, conservando `assets/`
al lado, o con un servidor sencillo desde esta carpeta (`python -m http.server`).

## Si cambia el notebook

Desde la raíz del proyecto, con el intérprete del proyecto:

```bash
python GITHUB_PAGES_EDA/construir_sitio.py
```

El script lee `analisis/ANALISIS_EXPLORATORIO_INVENTARIO_PRESENTACION.ipynb` tal como está guardado y
`docs/tablas_inventario/evidencia_resultados.json`, exportado por ese mismo EDA. No ejecuta el notebook ni
lee movimientos individuales. Ambos archivos deben pertenecer a la misma ejecución; si se actualiza el
notebook, exportar también su evidencia y regenerar el sitio. La construcción verifica los totales S_F/S_FJ,
el calendario, los volúmenes y el número de meses elegibles de las diez referencias principales.

Para preparar otro intérprete: `python -m pip install -r GITHUB_PAGES_EDA/requirements-sitio.txt`.

Referencia de la librería incluida: [Plotly.js v2.35.2](https://github.com/plotly/plotly.js/releases/tag/v2.35.2).
