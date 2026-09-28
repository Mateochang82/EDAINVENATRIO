/* Datos ya calculados en el EDA. Aquí solo cambian la representación y la vista. */
(() => {
  "use strict";
  if (!window.Plotly) return; // Las siete imágenes y sus tablas siguen disponibles.
  const data = JSON.parse(document.getElementById("datos-graficos").textContent);
  const cards = [...document.querySelectorAll("[data-chart]")];
  const products = data.productos;
  const top10 = products.slice(0, 10);
  const variable = products.filter(p => p.meses_elegibles >= 12 && p.cv !== null);
  const months = data.mensual.map(m => m.mes);
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const navy = "#0f1460", teal = "#177e89", orange = "#ce7035", grid = "#eaecf2";
  const yearColors = {2023: teal, 2024: orange, 2025: "#8178b6", 2026: navy};
  const panel = new Map(data.panel.map(r => [r.cod_producto + "/" + r.mes, r]));
  const fmt = (n, decimals = 0) => Number(n).toLocaleString("es-CO", {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
  const esc = s => String(s).replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
  const labelMonth = m => monthNames[Number(m.slice(5)) - 1] + " " + m.slice(0, 4);
  const defaultState = () => ({unit: "unidades", product: "", year: "todos", years: [2023, 2024, 2025, 2026], series: ["S_F", "S_FJ"], points: false});
  const states = cards.map(defaultState);
  const config = {displayModeBar: false, responsive: true, scrollZoom: false, doubleClick: "reset", locale: "es", showTips: false};
  Plotly.register({moduleType: "locale", name: "es", dictionary: {}, format: {
    days: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
    shortDays: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
    months: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    shortMonths: monthNames, decimal: ",", thousands: ".", grouping: [3], date: "%d/%m/%Y"
  }});

  function wrap(s, width) {
    const lines = []; let line = "";
    for (const word of s.split(" ")) {
      if (line && line.length + word.length + 1 > width) { lines.push(line); line = ""; }
      line += (line ? " " : "") + word;
    }
    lines.push(line);
    return lines.map(esc).join("<br>");
  }
  function baseLayout(n, narrow) {
    return {
      height: [520, 440, 430, 440, 540, 410, 510][n - 1], autosize: true,
      margin: {l: narrow ? 48 : 66, r: 16, t: 22, b: 62}, paper_bgcolor: "#fff", plot_bgcolor: "#fff",
      font: {family: 'Jost, "Segoe UI", sans-serif', size: narrow ? 11 : 12, color: "#4a4e66"},
      separators: ",.", hovermode: "closest", dragmode: "zoom", hoverdistance: 24,
      hoverlabel: {bgcolor: navy, bordercolor: navy, font: {color: "white", size: 12}, align: "left", namelength: -1},
      xaxis: {gridcolor: grid, zeroline: false, automargin: true, tickformat: ",d", title: {standoff: 16}},
      yaxis: {gridcolor: grid, zeroline: false, automargin: true, tickformat: ",d", title: {standoff: 15}},
      showlegend: false, transition: {duration: 0}
    };
  }
  function figure(n, card) {
    const s = states[n - 1];
    const narrow = card.clientWidth < 620;
    const layout = baseLayout(n, narrow);
    const traces = [];
    const axisLabel = p => wrap(p.producto, narrow ? 15 : 27);
    if (n === 1) {
      const percent = s.unit === "porcentaje";
      traces.push({type: "bar", orientation: "h", y: top10.map(p => p.codigo),
        x: top10.map(p => percent ? p.pct_S_F : p.total_S_F),
        marker: {color: top10.map((p, i) => i === 0 ? navy : teal), line: {width: 0}},
        width: .64, text: top10.map(p => percent ? fmt(p.pct_S_F, 2) + " %" : fmt(p.total_S_F)),
        textposition: "outside", cliponaxis: false, textfont: {size: narrow ? 10 : 12, color: navy},
        customdata: top10.map(p => [esc(p.producto), p.codigo, fmt(p.total_S_F), fmt(p.pct_S_F, 2)]),
        hovertemplate: "<b>%{customdata[0]}</b><br>%{customdata[1]}<br>Unidades S_F: %{customdata[2]}<br>Participación: %{customdata[3]} %<extra></extra>"});
      Object.assign(layout.yaxis, {tickmode: "array", tickvals: top10.map(p => p.codigo), ticktext: top10.map(axisLabel), autorange: "reversed", fixedrange: true, showgrid: false});
      Object.assign(layout.xaxis, {title: {text: percent ? "Participación en S_F (%)" : "Unidades F003 + F005"}, range: [0, (percent ? top10[0].pct_S_F : top10[0].total_S_F) * 1.26], nticks: narrow ? 3 : 5, ticksuffix: percent ? " %" : ""});
      layout.margin.l = narrow ? 111 : 197;
      layout.margin.r = 24;
    } else if (n === 2) {
      const maximum = Math.max(...variable.map(p => p.total_S_F));
      traces.push({type: "scatter", mode: "markers", x: variable.map(p => p.pct_cero), y: variable.map(p => p.cv),
        marker: {size: variable.map(p => Math.sqrt(40 + 220 * p.total_S_F / maximum) * 2),
          color: variable.map(p => p.codigo === s.product ? orange : teal),
          opacity: variable.map(p => !s.product || p.codigo === s.product ? .82 : .18),
          line: {width: 1.5, color: "white"}},
        customdata: variable.map(p => [esc(p.producto), p.codigo, fmt(p.pct_cero, 2), fmt(p.cv, 3), p.meses_elegibles, fmt(p.total_S_F)]),
        hovertemplate: "<b>%{customdata[0]}</b><br>%{customdata[1]}<br>Meses sin salida F: %{customdata[2]} %<br>CV: %{customdata[3]}<br>Meses elegibles: %{customdata[4]}<br>Volumen S_F: %{customdata[5]}<extra></extra>"});
      Object.assign(layout.xaxis, {title: {text: narrow ? "% meses elegibles sin salida F" : "% de meses completos elegibles sin salida F"}, range: [-4, 100], ticksuffix: " %", dtick: 20});
      Object.assign(layout.yaxis, {title: {text: "CV · desviación / media"}, range: [-.15, Math.max(...variable.map(p => p.cv)) * 1.16], tickformat: ".1f"});
      const highlighted = s.product ? variable.filter(p => p.codigo === s.product) : variable.slice(0, 2);
      layout.annotations = highlighted.map((p, i) => ({x: p.pct_cero, y: p.cv, text: esc(p.producto),
        showarrow: true, arrowhead: 0, arrowcolor: "#a0a6b7", ax: p.pct_cero > 70 ? -35 : 22, ay: i ? -38 : 32,
        bgcolor: "#ffffffeb", borderpad: 3, font: {size: 10, color: navy}}));
      if (s.product) {
        const p = highlighted[0], index = variable.indexOf(p);
        traces.push({...traces[0], x: [p.pct_cero], y: [p.cv], customdata: [traces[0].customdata[index]],
          marker: {size: Math.sqrt(40 + 220 * p.total_S_F / maximum) * 2 + 5,
            color: orange, opacity: 1, symbol: "circle-open", line: {width: 2.5, color: orange}}});
      }
    } else if (n === 3) {
      const selected = data.mensual.filter(m => s.year === "todos" || m.mes.startsWith(s.year));
      for (const metric of s.series) {
        traces.push({type: "scatter", mode: "lines+markers", name: metric === "S_F" ? "S_F · salidas facturadas" : "S_FJ · escenario con J002",
          x: selected.map(m => m.mes + "-01"), y: selected.map(m => m[metric]),
          line: {color: metric === "S_F" ? teal : orange, width: metric === "S_F" ? 2.6 : 2, dash: metric === "S_F" ? "solid" : "dot"},
          marker: {size: selected.map(m => m.completo ? 5 : 9), symbol: selected.map(m => m.completo ? "circle" : "diamond-open")},
          customdata: selected.map(m => [labelMonth(m.mes), fmt(m[metric]), m.completo ? "Mes completo" : "Exportación incompleta"]),
          hovertemplate: "<b>%{customdata[0]} · " + metric + "</b><br>%{customdata[1]} unidades<br>%{customdata[2]}<extra></extra>"});
      }
      Object.assign(layout.xaxis, {type: "date", tickformat: "%b<br>%Y", nticks: narrow ? 5 : 9, title: {text: "Mes"}, range: [selected[0].mes + "-01", selected[selected.length - 1].mes + "-28"]});
      Object.assign(layout.yaxis, {title: {text: "Unidades registradas"}, rangemode: "tozero"});
      layout.shapes = selected.filter(m => !m.completo).map(m => ({type: "rect", xref: "x", yref: "paper", x0: m.mes + "-01", x1: m.mes + "-" + new Date(Number(m.mes.slice(0, 4)), Number(m.mes.slice(5)), 0).getDate(), y0: 0, y1: 1, fillcolor: "#c5cbd580", line: {width: 0}, layer: "below"}));
      if (!s.series.length) layout.annotations = [{xref: "paper", yref: "paper", x: .5, y: .5, text: "Activa una serie para verla", showarrow: false}];
    } else if (n === 4) {
      for (const year of s.years) {
        const selected = data.mensual.filter(m => m.mes.startsWith(String(year)));
        traces.push({type: "scatter", mode: "lines+markers", name: String(year), connectgaps: false,
          x: selected.map(m => Number(m.mes.slice(5))), y: selected.map(m => m.completo ? m.S_F : null),
          line: {color: yearColors[year], width: 2.4}, marker: {size: 7, symbol: ["circle", "square", "diamond", "triangle-up"][year - 2023]},
          customdata: selected.map(m => [labelMonth(m.mes), fmt(m.S_F)]),
          hovertemplate: "<b>%{customdata[0]}</b><br>%{customdata[1]} unidades F003 + F005<br>Mes completo<extra></extra>"});
      }
      Object.assign(layout.xaxis, {tickmode: "array", tickvals: monthNames.map((_, i) => i + 1), ticktext: monthNames, range: [.7, 12.3], fixedrange: true, title: {text: "Mes calendario"}, tickangle: narrow ? -45 : 0});
      Object.assign(layout.yaxis, {title: {text: "Unidades F003 + F005"}, rangemode: "tozero"});
      if (!s.years.length) layout.annotations = [{xref: "paper", yref: "paper", x: .5, y: .5, text: "Activa un año para verlo", showarrow: false}];
    } else if (n === 5) {
      const selected = months.filter(m => s.year === "todos" || m.startsWith(s.year));
      const rows = top10.map(p => selected.map(m => panel.get(p.codigo + "/" + m)));
      const text = rows.map((rs, i) => rs.map(r => "<b>" + esc(top10[i].producto) + "</b><br>" + top10[i].codigo + "<br>" + labelMonth(r.mes) + "<br>" +
        (r.elegible ? fmt(r.S_F) + " unidades F" + (r.S_F === 0 ? " · sin salidas registradas" : "") : "No elegible · " + (!r.completo ? "mes incompleto" : "fuera del intervalo observado"))));
      const shared = {type: "heatmap", x: selected, y: top10.map(p => p.codigo), text, hovertemplate: "%{text}<extra></extra>", xgap: 1, ygap: 2, showscale: false};
      traces.push({...shared, z: rows.map(rs => rs.map(() => 1)), colorscale: [[0, "#b8bec5"], [1, "#b8bec5"]]});
      traces.push({...shared, z: rows.map(rs => rs.map(r => r.elegible ? Math.log1p(r.S_F) : null)), hoverongaps: false, zmin: 0,
        zmax: Math.log1p(Math.max(...data.panel.filter(r => r.elegible).map(r => r.S_F))),
        colorscale: [[0, "#ffffff"], [.22, "#e3f2ef"], [.5, "#8dcbbf"], [.75, teal], [1, navy]],
        showscale: true, colorbar: {orientation: "h", x: .5, y: -.2, yanchor: "top", len: .8, thickness: 9, outlinewidth: 0,
          tickvals: [0, 10, 100, 1000, 4000].map(Math.log1p), ticktext: ["0", "10", "100", "1.000", "4.000"], title: {text: "Unidades · escala log(1 + unidades)", side: "bottom", font: {size: 11}}}});
      const step = s.year === "todos" ? (narrow ? 9 : 6) : (narrow ? 2 : 1);
      Object.assign(layout.xaxis, {type: "category", tickmode: "array", tickvals: selected.filter((_, i) => i % step === 0), ticktext: selected.filter((_, i) => i % step === 0).map(m => labelMonth(m).replace(" ", "<br>")), fixedrange: true, showgrid: false});
      Object.assign(layout.yaxis, {type: "category", tickmode: "array", tickvals: top10.map(p => p.codigo), ticktext: top10.map(axisLabel), autorange: "reversed", fixedrange: true, showgrid: false});
      layout.margin = {l: narrow ? 111 : 197, r: 6, t: 12, b: 125};
      layout.height = 600;
      layout.dragmode = false;
    } else if (n === 6) {
      traces.push({type: "bar", x: data.rezagos.map(r => r.rezago_meses), y: data.rezagos.map(r => r.r_pearson_descriptivo),
        width: .6, marker: {color: data.rezagos.map(r => r.rezago_meses === 12 ? navy : r.r_pearson_descriptivo < 0 ? "#aaaec7" : teal)},
        customdata: data.rezagos.map(r => [r.rezago_meses, fmt(r.r_pearson_descriptivo, 3), r.pares]),
        hovertemplate: "<b>Separación de %{customdata[0]} meses</b><br>Correlación: %{customdata[1]}<br>Pares disponibles: %{customdata[2]}<extra></extra>"});
      Object.assign(layout.xaxis, {title: {text: "Separación real en meses"}, dtick: 1, fixedrange: true});
      Object.assign(layout.yaxis, {title: {text: narrow ? "Correlación de pares" : "Correlación de pares disponibles"}, range: [-1, 1], dtick: .5, tickformat: ".1f", zeroline: true, zerolinecolor: "#9297ac"});
      layout.annotations = [{x: 12, y: data.rezagos[11].r_pearson_descriptivo, text: fmt(data.rezagos[11].r_pearson_descriptivo, 3), yshift: 16, showarrow: false, font: {color: navy, size: 13}}];
    } else if (n === 7) {
      products.slice(0, 6).forEach((p, i) => {
        const fence = data.cajas[i];
        const summary = "<b>" + esc(p.producto) + "</b><br>" + p.codigo + "<br>Q1: " + fmt(p.q1, 2) + " · Mediana: " + fmt(p.mediana, 2) + "<br>Q3: " + fmt(p.q3, 2) + "<br>Bigotes: " + fmt(fence.inferior) + "–" + fmt(fence.superior) + "<br>" + p.meses_elegibles + " meses elegibles";
        traces.push({type: "box", orientation: "h", y: [i], q1: [p.q1], median: [p.mediana], q3: [p.q3],
          lowerfence: [fence.inferior], upperfence: [fence.superior], width: .48,
          name: p.producto, text: [summary], hovertemplate: "%{text}<extra></extra>",
          line: {color: teal, width: 1.7}, fillcolor: "#d9eeea", boxpoints: false});
        const vals = data.panel.filter(r => r.cod_producto === p.codigo && r.elegible);
        const shown = s.points ? vals : vals.filter(r => r.S_F < fence.inferior || r.S_F > fence.superior);
        traces.push({type: "scatter", mode: "markers", x: shown.map(r => r.S_F), y: shown.map((_, j) => i + (s.points ? ((j % 7) - 3) * .045 : 0)),
          marker: {size: s.points ? 6 : 8, color: orange, opacity: .75, symbol: s.points ? "circle" : "circle-open"},
          customdata: shown.map(r => [esc(p.producto), p.codigo, labelMonth(r.mes), fmt(r.S_F)]),
          hovertemplate: "<b>%{customdata[0]}</b><br>%{customdata[1]}<br>%{customdata[2]}: %{customdata[3]} unidades F<extra></extra>"});
      });
      Object.assign(layout.xaxis, {title: {text: narrow ? "Unidades F / mes elegible" : "Unidades F por mes completo elegible"}, rangemode: "tozero", nticks: narrow ? 3 : 6});
      Object.assign(layout.yaxis, {tickmode: "array", tickvals: [0, 1, 2, 3, 4, 5], ticktext: products.slice(0, 6).map(axisLabel), range: [5.65, -.65], fixedrange: true, showgrid: false});
      layout.margin.l = narrow ? 111 : 197;
    }
    if (card.closest(".presentacion")) {
      layout.height = Math.max(n === 5 ? 385 : n === 1 ? 340 : 290, Math.min(layout.height, window.innerHeight - (narrow ? 390 : 345)));
      if (n === 5) layout.margin.b = 110;
    }
    return {data: traces, layout};
  }

  async function render(n) {
    const card = cards[n - 1], plot = card.querySelector(".grafico-lienzo");
    if (card._rendering) { await card._rendering; }
    const draw = async () => {
      plot.hidden = false;
      const spec = figure(n, card);
      try {
        await Plotly.react(plot, spec.data, spec.layout, config);
        card.dataset.ready = "true";
        if (!plot._selectionBound) {
          const detail = document.createElement("p");
          detail.className = "grafico-seleccion"; detail.hidden = true; detail.setAttribute("role", "status");
          plot.after(detail);
          plot.on("plotly_click", event => {
            const point = event.points[0], v = point.customdata;
            let text = "";
            if (n === 1 && v) text = `${v[0]} [${v[1]}] · ${v[2]} unidades S_F · ${v[3]} % del total`;
            if (n === 2 && v) text = `${v[0]} [${v[1]}] · ${v[2]} % de meses sin salida · CV ${v[3]} · ${v[4]} meses elegibles · ${v[5]} unidades S_F`;
            if (n === 3 && v) text = `${v[0]} · ${point.data.name} · ${v[1]} unidades · ${v[2]}`;
            if (n === 4 && v) text = `${v[0]} · ${v[1]} unidades F003 + F005 · mes completo`;
            if (n === 6 && v) text = `${v[0]} meses de separación · correlación ${v[1]} · ${v[2]} pares`;
            if (n === 7 && v) text = `${v[0]} [${v[1]}] · ${v[2]} · ${v[3]} unidades F`;
            if (!text && point.text) text = String(point.text);
            if (text) {
              const plain = document.createElement("span"); plain.innerHTML = text.replace(/<br\s*\/?>/gi, " · ");
              detail.textContent = plain.textContent; detail.hidden = false;
            }
          });
          plot._selectionBound = true;
        }
        card.querySelector(".grafico-seleccion").hidden = true;
      } catch (error) {
        plot.hidden = true;
        delete card.dataset.ready;
        console.error("No se pudo mostrar el gráfico " + n, error);
      }
    };
    card._rendering = draw();
    await card._rendering;
    card._rendering = null;
  }
  function selectControl(container, title, values, selected, onChange) {
    const label = document.createElement("label"); label.textContent = title + " ";
    const select = document.createElement("select"); select.setAttribute("aria-label", title);
    values.forEach(([value, text]) => { const option = new Option(text, value); option.selected = String(selected) === String(value); select.add(option); });
    select.addEventListener("change", () => onChange(select.value));
    label.append(select); container.append(label);
  }
  function checkbox(container, title, checked, color, onChange) {
    const label = document.createElement("label"), input = document.createElement("input");
    input.type = "checkbox"; input.checked = checked;
    if (color) { input.style.accentColor = color; label.style.color = color; }
    input.addEventListener("change", () => onChange(input.checked));
    label.append(input, document.createTextNode(title)); container.append(label);
  }
  function controls(n) {
    const card = cards[n - 1], area = card.querySelector(".grafico-controles"), s = states[n - 1];
    area.replaceChildren();
    const update = (key, value) => { s[key] = value; render(n); };
    if (n === 1) selectControl(area, "Mostrar", [["unidades", "Unidades"], ["porcentaje", "% del total S_F"]], s.unit, value => update("unit", value));
    if (n === 2) selectControl(area, "Resaltar", [["", "Todas las referencias"], ...variable.map(p => [p.codigo, p.producto + " [" + p.codigo + "]"])], s.product, value => update("product", value));
    if ([3, 5].includes(n)) selectControl(area, "Periodo", [["todos", "Todo el periodo"], ...[2023, 2024, 2025, 2026].map(y => [String(y), String(y)])], s.year, value => update("year", value));
    if (n === 3) ["S_F", "S_FJ"].forEach(key => checkbox(area, key === "S_F" ? "S_F · facturadas" : "S_FJ · con J002", s.series.includes(key), key === "S_F" ? teal : orange, checked => update("series", ["S_F", "S_FJ"].filter(k => k === key ? checked : s.series.includes(k)))));
    if (n === 4) [2023, 2024, 2025, 2026].forEach(year => checkbox(area, String(year), s.years.includes(year), yearColors[year], checked => update("years", [2023, 2024, 2025, 2026].filter(y => y === year ? checked : s.years.includes(y)))));
    if (n === 7) checkbox(area, "Mostrar todos los meses", s.points, teal, checked => update("points", checked));
    const reset = document.createElement("button"); reset.type = "button"; reset.className = "grafico-restablecer"; reset.textContent = "Restablecer vista ↺";
    reset.addEventListener("click", () => { states[n - 1] = defaultState(); controls(n); render(n); card.querySelector(".grafico-restablecer").focus({preventScroll: true}); });
    area.append(reset);
  }

  const dialog = document.querySelector(".presentacion"), slot = dialog.querySelector(".presentacion-contenido");
  const previous = dialog.querySelector(".grafico-anterior"), next = dialog.querySelector(".grafico-siguiente");
  let active = -1, placeholder = null, returnFocus = null;
  function restoreCard() {
    if (active < 0 || !placeholder) return;
    const index = active, card = cards[index]; placeholder.replaceWith(card); placeholder = null;
    if (card.dataset.ready) requestAnimationFrame(() => render(index + 1));
  }
  function show(index, trigger) {
    if (index < 0 || index >= cards.length) return;
    if (!dialog.open) {
      returnFocus = trigger || document.activeElement;
      dialog.showModal(); document.body.classList.add("en-presentacion");
    }
    restoreCard(); active = index;
    const card = cards[index]; placeholder = document.createElement("div");
    placeholder.className = "grafico-espacio"; placeholder.style.height = card.offsetHeight + "px";
    card.replaceWith(placeholder); slot.append(card);
    const focusWasNavigation = document.activeElement === previous || document.activeElement === next;
    previous.disabled = index === 0; next.disabled = index === cards.length - 1;
    if (focusWasNavigation || !dialog.contains(document.activeElement)) {
      (next.disabled ? previous : next).focus({preventScroll: true});
    }
    dialog.querySelector(".presentacion-cuenta").textContent = String(index + 1).padStart(2, "0") + " / 07";
    dialog.scrollTop = 0;
    render(index + 1);
  }
  previous.addEventListener("click", () => show(active - 1));
  next.addEventListener("click", () => show(active + 1));
  dialog.querySelector(".cerrar-presentacion").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    const oldIndex = active;
    restoreCard(); active = -1;
    document.body.classList.remove("en-presentacion");
    if (returnFocus && returnFocus.isConnected) returnFocus.focus({preventScroll: true});
    requestAnimationFrame(() => render(oldIndex + 1));
  });
  dialog.addEventListener("keydown", event => {
    if (["INPUT", "SELECT", "SUMMARY"].includes(event.target.tagName) || event.target.closest(".tabla-grafico")) return;
    if (event.key === "ArrowRight") { event.preventDefault(); show(active + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); show(active - 1); }
  });
  window.addEventListener("beforeprint", () => {
    if (dialog.open) { restoreCard(); dialog.close(); }
  });
  document.querySelector(".abrir-presentacion").addEventListener("click", event => show(0, event.currentTarget));
  cards.forEach((card, i) => {
    controls(i + 1);
    card.querySelector(".grafico-ampliar").addEventListener("click", event => show(i, event.currentTarget));
  });
  document.documentElement.classList.add("graficos-listos");
  // Siete figuras: dibujarlas al inicio mantiene estables los saltos del índice.
  cards.forEach((_, i) => render(i + 1));
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(entries => entries.forEach(({target, contentRect}) => {
      const width = Math.round(contentRect.width);
      if (target._width === width) return;
      target._width = width;
      if (target.dataset.ready) {
        clearTimeout(target._resizeTimer);
        target._resizeTimer = setTimeout(() => render(Number(target.dataset.chart)), 120);
      }
    }));
    cards.forEach(card => observer.observe(card));
  }
})();
