# Sitio del análisis exploratorio — GitHub Pages

Esta carpeta contiene todo lo necesario para publicar el análisis exploratorio de inventario como sitio
estático en formato libro: portada con el logo, índice lateral, capítulos, figuras y código plegable.

| Archivo | Qué es |
|---|---|
| `index.html` | El sitio completo, en una sola página. Es lo que GitHub Pages sirve. |
| `assets/` | Logo, ícono, favicon y las 7 figuras del análisis (`assets/figuras/`). |
| `.nojekyll` | Indica a GitHub Pages que publique los archivos tal cual, sin procesarlos. |
| `plantilla.html` | Diseño del libro (estilos y estructura). |
| `construir_sitio.py` | Regenera `index.html` a partir del notebook de presentación. |

No contiene datos: ni los `.xlsx`, ni los caches, ni la columna `DESCRIPCION`. Solo publica las tablas y
figuras agregadas que ya muestra el notebook. Las rutas locales del computador se reemplazan por una etiqueta
neutra.

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

   `construir_sitio.py` y `plantilla.html` pueden subirse o no; el sitio no los necesita.
3. En el repositorio: Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch:
   `main`, carpeta `/ (root)` → Save.
4. Después de uno o dos minutos el sitio queda en `https://USUARIO.github.io/eda-inventario-infectologos/`.

Antes de subir se puede revisar localmente abriendo `index.html` con un servidor sencillo desde esta
carpeta (`python -m http.server`). Si se abre el archivo con doble clic, algunos navegadores no cargan las
imágenes.

## Si cambia el notebook

Desde la raíz del proyecto, con el intérprete del proyecto:

```bash
python GITHUB_PAGES_EDA/construir_sitio.py
```

El script lee `analisis/ANALISIS_EXPLORATORIO_INVENTARIO_PRESENTACION.ipynb` tal como está guardado. No lo
ejecuta ni recalcula nada. Si el notebook se vuelve a ejecutar, conviene regenerar el sitio para que las
salidas coincidan.
