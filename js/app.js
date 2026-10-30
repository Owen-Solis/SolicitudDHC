// ==========================================
// GENERADOR DE SOLICITUDES DE EMPLEO DCH
// El formulario llena una solicitud de 2 páginas dibujada en <canvas>.
// La vista previa y lo que se descarga (PDF / imágenes) son idénticos.
// ==========================================

const $ = (id) => document.getElementById(id);

// ------------------------------------------
// CONFIGURACIÓN DEL FORMULARIO
// tipo: text | date | tel | email | number | area | seg | herr
// mitad: ocupa media fila · lista: sugerencias · mem: recuerda lo usado
// ------------------------------------------
// Listas desplegables (se pueden editar o agregar opciones aquí)
// Empresa a la que aplica: NO se imprime en la solicitud, solo sirve para nombrar el archivo
const EMPRESAS = ["AMAZON", "NIDEC", "SANKO", "KN", "MELI"];
const ENTERADO = ["Facebook", "Instagram", "LinkedIn", "OCC", "Indeed"];
const PUESTOS = ["Ayudante general", "Almacenista", "Montacargas HP", "Montacargas HS", "Técnico mantenimiento CNC", "Inspector de calidad"];
// Expediente MELI: el orden es el que pide el cliente (así queda en el PDF).
// req: true  -> si no se sube, esa hoja sale con la marca "PENDIENTE DE ENTREGA"
// req: false -> si no se sube, simplemente no se incluye
// k: "SOLICITUD" -> aquí van las 2 páginas de la solicitud de empleo (se agregan solas)
const EXPEDIENTE_MELI = [
    { k: "acta", label: "Acta de nacimiento", req: true },
    { k: "csf", label: "Constancia de situación fiscal", nota: "actualizada 2026", req: true },
    { k: "rfc", label: "Validación RFC", req: true },
    { k: "curp", label: "CURP", req: true },
    { k: "nss", label: "Número de asignación social (NSS)", req: true },
    { k: "ine", label: "INE", req: true },
    { k: "edocta", label: "Estado de cuenta", req: true },
    { k: "cert", label: "Certificado de estudios", req: true },
    { k: "domicilio", label: "Comprobante de domicilio", req: true },
    { k: "infonavit", label: "Infonavit o Fonacot", req: false },
    { k: "SOLICITUD", label: "Solicitud de empleo" },
    { k: "carta", label: "Carta bienvenida MELI", req: false },
];
const DOCS = {}; // archivos subidos por documento: { clave: [File, ...] }
const esMeli = () => E.t.empresaApl === "MELI";

const ESTADOS = ["Nuevo León", "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"];
const GRADOS = ["Primaria", "Secundaria", "Preparatoria / Bachillerato", "Carrera técnica", "Licenciatura (trunca)", "Licenciatura", "Maestría"];
const CIVIL = ["Soltero(a)", "Casado(a)", "Unión libre", "Divorciado(a)", "Viudo(a)"];

const bloqueEmpleo = (n, titulo, abierta) => ({
    titulo,
    pag: 2,
    colapsable: true,
    abierta,
    campos: [
        { k: "emp" + n, label: "Empresa" },
        { k: "tel" + n, label: "Teléfono", tipo: "tel", mitad: true },
        { k: "jefe" + n, label: "Jefe inmediato", mitad: true },
        { k: "ing" + n, label: "Fecha de ingreso", ph: "MM/AAAA", mes: true, mitad: true },
        { k: "baj" + n, label: "Fecha de baja", ph: "MM/AAAA", mes: true, mitad: true },
        { k: "pue" + n, label: "Último puesto", mitad: true },
        { k: "area" + n, label: "Área", mitad: true },
        { k: "mot" + n, label: "Motivo de separación" },
    ],
});

const SECCIONES = [
    {
        titulo: "Datos de la solicitud",
        pag: 1,
        campos: [
            { k: "empresaApl", label: "Empresa a la que aplica", req: true, opciones: EMPRESAS },
            { k: "fecha", label: "Fecha", tipo: "date", mitad: true, req: false },
            { k: "entrevistador", label: "Entrevistador", mitad: true, req: true },
            { k: "enterado", label: "¿Cómo se enteró de la vacante?", opciones: ENTERADO },
            { k: "puesto", label: "Puesto solicitado", req: true, opciones: PUESTOS, otro: true, ph: "Escribe el puesto" },
            { k: "sueldo", label: "Sueldo mensual deseado", ph: "Ej. 12000", tipo: "text", inputmode: "decimal" },
        ],
    },
    {
        titulo: "Datos personales",
        pag: 1,
        campos: [
            { k: "nombre", label: "Nombre completo", req: true },
            { k: "fnac", label: "Fecha de nacimiento", tipo: "date", mitad: true },
            { k: "edad", label: "Edad", tipo: "number", mitad: true, ph: "Se calcula sola" },
            { k: "lnac", label: "Lugar de nacimiento", desplegable: ESTADOS, otro: true, ph: "Escribe el lugar de nacimiento" },
            { k: "telcasa", label: "Teléfono de casa", tipo: "tel", mitad: true },
            { k: "cel", label: "Celular", tipo: "tel", mitad: true },
            { k: "correo", label: "Correo", tipo: "email" },
            { k: "civil", label: "Estado civil", sug: CIVIL },
        ],
    },
    {
        titulo: "Dirección",
        pag: 1,
        campos: [
            { k: "calle", label: "Calle y número", direccion: true, ph: "Escribe la calle y elige una sugerencia" },
            { k: "colonia", label: "Colonia", mitad: true },
            { k: "municipio", label: "Municipio", mitad: true },
            { k: "infonavit", label: "¿Tiene crédito Infonavit?", tipo: "seg" },
            { k: "credito", label: "Número de crédito", ph: "Solo si tiene crédito" },
        ],
    },
    {
        titulo: "Preparación académica / profesional",
        pag: 1,
        campos: [
            { k: "grado", label: "Último grado de estudio", sug: GRADOS },
            { k: "titulo", label: "Título recibido" },
        ],
    },
    {
        titulo: "Conocimientos y experiencia",
        pag: 1,
        campos: [
            { k: "herr", label: "Herramienta o equipo que sabe utilizar", tipo: "herr" },
            { k: "otro", label: "Otro (describa)", tipo: "area" },
            { k: "turnos", label: "¿Puede rolar turnos?", tipo: "seg" },
            { k: "porque", label: "¿Por qué?", tipo: "area", ph: "Solo si contesta No" },
        ],
    },
    bloqueEmpleo(1, "Historial laboral · Empleo 1 (el más reciente)", true),
    bloqueEmpleo(2, "Historial laboral · Empleo 2", false),
    bloqueEmpleo(3, "Historial laboral · Empleo 3", false),
    {
        titulo: "Periodos sin empleo",
        pag: 2,
        campos: [{ k: "sinempleo", label: "Periodos sin empleo, fechas y ocupación", tipo: "area" }],
    },
    { titulo: "Firma del candidato", pag: 2, firma: true },
    {
        titulo: "Uso exclusivo de DCH",
        pag: 2,
        campos: [
            { k: "temporal", label: "¿Ha desempeñado trabajo temporal?", tipo: "seg" },
            { k: "tiempo", label: "¿Por cuánto tiempo?", mitad: true },
            { k: "reingresos", label: "¿Ha tenido reingresos?", mitad: true },
            { k: "paraquien", label: "¿Para quién trabajó?", mitad: true },
            { k: "asignada", label: "¿A qué empresa se le asignó?", mitad: true },
            { k: "pariente", label: "¿Trabaja algún pariente o conocido con nosotros?", tipo: "seg" },
            { k: "quien", label: "¿Quién es?" },
            { k: "sindicato", label: "¿Ha pertenecido a algún sindicato?", tipo: "seg" },
            { k: "cual", label: "¿Cuál?" },
        ],
    },
];

const HERRAMIENTAS = ["Patineta Hidráulica", "Montacargas", "Pulidor", "Soldadora", "Torno", "Fresadora"];
const TODOS = SECCIONES.flatMap((s) => s.campos || []);
const SEG = new Set(TODOS.filter((c) => c.tipo === "seg").map((c) => c.k));

// ------------------------------------------
// ESTADO
// ------------------------------------------
const E = { t: {}, herr: [], sig: [] };
let pagina = 1;
let edadManual = false;
const el = {}; // inputs por clave
const grp = {}; // grupos de botones de opción, por clave
const lst = {}; // listas desplegables (estados), por clave

// ------------------------------------------
// MEMORIA LOCAL
// ------------------------------------------
function leer(clave, defecto) {
    try {
        const v = localStorage.getItem(clave);
        return v === null ? defecto : JSON.parse(v);
    } catch (e) {
        return defecto;
    }
}
function guardar(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
    } catch (e) { /* sin almacenamiento: no pasa nada */ }
}
function recordar(clave, valor, max = 30) {
    valor = (valor || "").trim();
    if (!valor) return;
    const lista = leer(clave, []).filter((x) => x !== valor);
    lista.unshift(valor);
    guardar(clave, lista.slice(0, max));
}
function llenarLista(c) {
    const dl = $("dl-" + c.k);
    if (!dl) return;
    dl.innerHTML = "";
    const todos = [...(c.lista || []), ...(c.mem ? leer("dch_sol_" + c.k, []) : [])];
    [...new Set(todos)].forEach((v) => {
        const o = document.createElement("option");
        o.value = v;
        dl.appendChild(o);
    });
}

// ------------------------------------------
// CONSTRUIR FORMULARIO
// ------------------------------------------
function crear(tag, clase, html) {
    const n = document.createElement(tag);
    if (clase) n.className = clase;
    if (html !== undefined) n.innerHTML = html;
    return n;
}

// ---------- Fecha MM/AAAA: la diagonal se pone sola y también se puede elegir con el calendario ----------
function formatoMes(valor, borrando) {
    if (!/^[\d/]*$/.test(valor)) return valor; // si escribe texto (ej. "Actual"), se respeta
    let d = valor.replace(/\D/g, "").slice(0, 6);
    if (d.length === 1 && Number(d) > 1) d = "0" + d; // 9 -> 09
    if (d.length >= 2 && Number(d.slice(0, 2)) > 12) d = "0" + d.slice(0, 1) + d.slice(1); // 20 -> 02/0
    if (d.length < 2) return d;
    if (d.length === 2) return borrando ? d : d + "/";
    return d.slice(0, 2) + "/" + d.slice(2);
}

function activarMes(wrap, inp) {
    inp.inputMode = "numeric";
    inp.maxLength = 7;
    inp.addEventListener("input", (e) => {
        inp.value = formatoMes(inp.value, e.inputType && e.inputType.startsWith("delete"));
    });
    const caja = crear("div", "mes-wrap");
    caja.appendChild(inp);
    const probe = document.createElement("input");
    probe.type = "month";
    if (probe.type === "month" && inp.dataset.k !== undefined) {
        const pick = crear("input");
        pick.type = "month";
        pick.tabIndex = -1;
        pick.className = "mes-pick";
        pick.addEventListener("change", () => {
            if (!pick.value) return;
            const [a, m] = pick.value.split("-");
            inp.value = `${m}/${a}`;
            inp.dispatchEvent(new Event("input", { bubbles: true }));
        });
        const b = crear("button", "mes-btn", "📅");
        b.type = "button";
        b.setAttribute("aria-label", "Elegir mes y año");
        b.addEventListener("click", () => {
            try {
                pick.showPicker();
            } catch (e) {
                pick.focus();
            }
        });
        caja.appendChild(pick);
        caja.appendChild(b);
    }
    wrap.appendChild(caja);
}

// ---------- Dirección: sugerencias mientras escribe la calle (OpenStreetMap / Nominatim) ----------
function activarDireccion(wrap, inp) {
    wrap.classList.add("rel");
    const caja = crear("div", "dir-sugs");
    caja.hidden = true;
    wrap.appendChild(caja);
    wrap.appendChild(crear("p", "ayuda", "Al elegir una sugerencia se llenan solas la colonia y el municipio. Requiere internet."));
    let timer;
    let ctl;
    const cerrar = () => {
        caja.hidden = true;
        caja.innerHTML = "";
    };
    const msg = (t) => {
        caja.hidden = false;
        caja.innerHTML = "";
        caja.appendChild(crear("div", "dir-msg", t));
    };
    const limpia = (t) => (t || "").replace(/^(Municipio de|Colonia)\s+/i, "").trim();

    function aplicar(r, q) {
        const a = r.address || {};
        const road = a.road || a.pedestrian || a.residential || "";
        let num = a.house_number || "";
        if (!num) {
            const m = q.match(/(\d+\s?[A-Za-z]?)\s*$/);
            if (m && !road.endsWith(m[1])) num = m[1].trim();
        }
        poner("calle", road ? (road + " " + num).trim() : q);
        poner("colonia", limpia(a.suburb || a.neighbourhood || a.quarter || a.city_district || ""));
        poner("municipio", limpia(a.municipality || a.city || a.town || a.village || a.county || ""));
        cerrar();
        pintar();
    }

    async function buscar(q) {
        if (ctl) ctl.abort();
        ctl = new AbortController();
        msg("Buscando…");
        try {
            const url =
                "https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=mx&accept-language=es" +
                "&viewbox=-100.75,26.1,-99.85,25.3&q=" + encodeURIComponent(q);
            const resp = await fetch(url, { signal: ctl.signal });
            const datos = (await resp.json()).filter((r) => r.address && (r.address.road || r.address.pedestrian || r.address.residential));
            if (!datos.length) return msg("Sin coincidencias. Escribe la dirección a mano.");
            caja.innerHTML = "";
            datos.forEach((r) => {
                const a = r.address;
                const partes = [a.road || a.pedestrian || a.residential, a.suburb || a.neighbourhood || a.city_district, a.municipality || a.city || a.town, a.state].filter(Boolean);
                const b = crear("button", "dir-sug", partes.join(", "));
                b.type = "button";
                b.addEventListener("mousedown", (e) => e.preventDefault()); // que no se cierre antes de elegir
                b.addEventListener("click", () => aplicar(r, q));
                caja.appendChild(b);
            });
        } catch (e) {
            if (e.name !== "AbortError") msg("No se pudo buscar (¿sin internet?). Escribe la dirección a mano.");
        }
    }

    inp.addEventListener("input", () => {
        clearTimeout(timer);
        const q = inp.value.trim();
        if (q.length < 6) return cerrar();
        timer = setTimeout(() => buscar(q), 700);
    });
    inp.addEventListener("blur", () => setTimeout(cerrar, 200));
    inp.addEventListener("keydown", (e) => {
        if (e.key === "Escape") cerrar();
    });
}

function crearCampo(c) {
    const wrap = crear("div", "campo" + (c.mitad ? " mitad" : ""));
    const lab = crear("label", "", c.label + (c.req ? "" : ""));
    lab.htmlFor = (c.desplegable ? "s-" : "f-") + c.k;
    wrap.appendChild(lab);

    if (c.tipo === "seg") {
        const seg = crear("div", "seg");
        seg.dataset.k = c.k;
        ["Sí", "No"].forEach((v) => {
            const b = crear("button", "", v);
            b.type = "button";
            b.dataset.v = v;
            seg.appendChild(b);
        });
        lab.removeAttribute("for");
        wrap.appendChild(seg);
        return wrap;
    }

    if (c.tipo === "herr") {
        const g = crear("div", "chips");
        HERRAMIENTAS.forEach((h) => {
            const b = crear("button", "chip", h);
            b.type = "button";
            b.dataset.h = h;
            g.appendChild(b);
        });
        lab.removeAttribute("for");
        wrap.appendChild(g);
        return wrap;
    }

    if (c.sug) {
        const g = crear("div", "chips sug");
        c.sug.forEach((v) => {
            const b = crear("button", "chip", v);
            b.type = "button";
            b.dataset.sug = c.k;
            b.dataset.v = v;
            g.appendChild(b);
        });
        wrap.appendChild(g);
    }

    if (c.opciones) {
        const g = crear("div", "chips opciones");
        g.dataset.val = "";
        [...c.opciones, ...(c.otro ? ["Otro"] : [])].forEach((o) => {
            const b = crear("button", "chip", o);
            b.type = "button";
            b.dataset.opc = c.k;
            b.dataset.v = o;
            g.appendChild(b);
        });
        lab.removeAttribute("for");
        wrap.appendChild(g);
        grp[c.k] = g;
    }

    if (c.desplegable) {
        const sl = crear("select");
        sl.id = "s-" + c.k;
        sl.dataset.lst = c.k;
        sl.appendChild(new Option("Selecciona una opción", ""));
        c.desplegable.forEach((o) => sl.appendChild(new Option(o, o)));
        if (c.otro) sl.appendChild(new Option("Otro", "__otro"));
        wrap.appendChild(sl);
        lst[c.k] = sl;
    }

    let inp;
    if (c.tipo === "area") {
        inp = crear("textarea");
        inp.rows = 3;
    } else {
        inp = crear("input");
        inp.type = c.tipo || "text";
        if (c.inputmode) inp.inputMode = c.inputmode;
        if (c.tipo === "number") {
            inp.min = 14;
            inp.max = 99;
        }
    }
    inp.id = (c.opciones || c.desplegable ? "o-" : "f-") + c.k;
    if (c.opciones || c.desplegable) inp.hidden = true; // solo se muestra al elegir "Otro"
    inp.dataset.k = c.k;
    if (c.ph) inp.placeholder = c.ph;
    if (c.lista || c.mem) {
        inp.setAttribute("list", "dl-" + c.k);
        const dl = crear("datalist");
        dl.id = "dl-" + c.k;
        wrap.appendChild(dl);
    }
    if (c.mes) activarMes(wrap, inp);
    else wrap.appendChild(inp);
    if (c.direccion) activarDireccion(wrap, inp);
    el[c.k] = inp;
    return wrap;
}

function construirFormulario() {
    const form = $("formulario");
    SECCIONES.forEach((s) => {
        let caja;
        let cuerpo;
        if (s.colapsable) {
            caja = crear("details", "seccion bloque");
            caja.open = !!s.abierta;
            caja.appendChild(crear("summary", "", s.titulo));
            cuerpo = crear("div", "grid");
            caja.appendChild(cuerpo);
        } else {
            caja = crear("fieldset", "seccion");
            caja.appendChild(crear("legend", "", s.titulo));
            cuerpo = crear("div", "grid");
            caja.appendChild(cuerpo);
        }
        caja.dataset.pag = s.pag;

        if (s.firma) {
            cuerpo.appendChild(crearPadFirma());
        } else {
            s.campos.forEach((c) => cuerpo.appendChild(crearCampo(c)));
        }
        form.appendChild(caja);
    });
    TODOS.forEach(llenarLista);
    construirExpediente();
}

// ------------------------------------------
// EXPEDIENTE MELI (solo aparece al elegir MELI)
// ------------------------------------------
function construirExpediente() {
    const caja = crear("fieldset", "seccion expediente");
    caja.id = "expediente";
    caja.hidden = true;
    caja.appendChild(crear("legend", "", "Expediente MELI"));
    caja.appendChild(crear("p", "ayuda", "Sube cada documento (foto o PDF). El PDF final los junta en este orden y, si falta un documento obligatorio, esa hoja sale con la marca «PENDIENTE DE ENTREGA»."));
    caja.appendChild(crear("p", "exp-resumen"));
    const lista = crear("div", "exp-lista");
    EXPEDIENTE_MELI.forEach((d, i) => {
        const fila = crear("div", "doc");
        fila.dataset.doc = d.k;
        const sub = d.k === "SOLICITUD" ? "Se agrega automáticamente" : (d.req ? "Obligatorio" : "Opcional") + (d.nota ? " · " + d.nota : "");
        fila.innerHTML = `<div class="doc-cab"><span class="num">${i + 1}</span><div class="doc-tit"><b>${d.label}</b><small>${sub}</small></div><span class="estado"></span></div>`;
        if (d.k !== "SOLICITUD") {
            fila.appendChild(crear("div", "doc-archivos"));
            const lab = crear("label", "btn-subir", "Subir archivo");
            const inp = crear("input");
            inp.type = "file";
            inp.accept = "image/*,application/pdf";
            inp.multiple = true;
            inp.hidden = true;
            inp.dataset.subir = d.k;
            lab.appendChild(inp);
            fila.appendChild(lab);
        }
        lista.appendChild(fila);
    });
    caja.appendChild(lista);

    caja.addEventListener("change", (e) => {
        const k = e.target.dataset && e.target.dataset.subir;
        if (!k) return;
        DOCS[k] = [...(DOCS[k] || []), ...e.target.files];
        e.target.value = "";
        actualizarExpediente();
    });
    caja.addEventListener("click", (e) => {
        const b = e.target.closest("[data-quitar]");
        if (!b) return;
        const k = b.dataset.quitar;
        DOCS[k].splice(Number(b.dataset.i), 1);
        actualizarExpediente();
    });
    $("formulario").appendChild(caja);
}

function actualizarExpediente() {
    const caja = $("expediente");
    caja.hidden = !esMeli();
    if (!esMeli()) return;
    let faltan = 0;
    EXPEDIENTE_MELI.forEach((d) => {
        const fila = caja.querySelector(`[data-doc="${d.k}"]`);
        const est = fila.querySelector(".estado");
        if (d.k === "SOLICITUD") {
            est.textContent = "✔ Lista";
            est.className = "estado ok";
            return;
        }
        const files = DOCS[d.k] || [];
        const cont = fila.querySelector(".doc-archivos");
        cont.innerHTML = "";
        files.forEach((f, i) => {
            const it = crear("div", "archivo");
            if (f.type.startsWith("image/")) {
                const im = crear("img");
                im.src = URL.createObjectURL(f);
                im.onload = () => URL.revokeObjectURL(im.src);
                it.appendChild(im);
            } else {
                it.appendChild(crear("span", "pdf", "PDF"));
            }
            it.appendChild(crear("span", "nom", f.name));
            const q = crear("button", "quitar", "✕");
            q.type = "button";
            q.dataset.quitar = d.k;
            q.dataset.i = i;
            q.setAttribute("aria-label", "Quitar " + f.name);
            it.appendChild(q);
            cont.appendChild(it);
        });
        fila.querySelector(".btn-subir").firstChild.textContent = files.length ? "Agregar otro archivo" : "Subir archivo";
        if (files.length) {
            est.textContent = "✔ " + files.length + (files.length === 1 ? " archivo" : " archivos");
            est.className = "estado ok";
        } else if (d.req) {
            faltan++;
            est.textContent = "Pendiente";
            est.className = "estado falta";
        } else {
            est.textContent = "Opcional";
            est.className = "estado";
        }
    });
    caja.querySelector(".exp-resumen").textContent = faltan ? `Faltan ${faltan} documentos obligatorios` : "Documentos obligatorios completos ✔";
}

// ------------------------------------------
// FIRMA (opcional): se dibuja con el dedo o el mouse
// ------------------------------------------
let pad, padCtx;

function crearPadFirma() {
    const wrap = crear("div", "campo firma-wrap");
    wrap.innerHTML =
        '<p class="ayuda">Opcional. El candidato puede firmar aquí con el dedo o el mouse; si prefiere firmar en papel, déjalo vacío.</p>';
    pad = crear("canvas");
    pad.id = "padFirma";
    pad.width = 980;
    pad.height = Math.round((980 * Solicitud.FIRMA.h) / Solicitud.FIRMA.w);
    padCtx = pad.getContext("2d");
    wrap.appendChild(pad);
    const b = crear("button", "btn-limpiar chico", "Borrar firma");
    b.type = "button";
    b.addEventListener("click", () => {
        E.sig = [];
        pintarPad();
        pintar();
    });
    wrap.appendChild(b);

    let activo = null;
    const pos = (e) => {
        const r = pad.getBoundingClientRect();
        return [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))];
    };
    pad.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        pad.setPointerCapture(e.pointerId);
        activo = [pos(e)];
        E.sig.push(activo);
        pintarPad();
        pintar();
    });
    pad.addEventListener("pointermove", (e) => {
        if (!activo) return;
        activo.push(pos(e));
        pintarPad();
        pintar();
    });
    const fin = () => {
        activo = null;
    };
    pad.addEventListener("pointerup", fin);
    pad.addEventListener("pointercancel", fin);
    setTimeout(pintarPad, 0);
    return wrap;
}

function pintarPad() {
    if (!pad) return;
    padCtx.fillStyle = "#fff";
    padCtx.fillRect(0, 0, pad.width, pad.height);
    padCtx.strokeStyle = "#b9c6d4";
    padCtx.lineWidth = 2;
    padCtx.setLineDash([10, 8]);
    padCtx.beginPath();
    padCtx.moveTo(30, pad.height - 24);
    padCtx.lineTo(pad.width - 30, pad.height - 24);
    padCtx.stroke();
    padCtx.setLineDash([]);
    Solicitud.dibujarFirma(padCtx, E.sig, 0, 0, pad.width, pad.height, 7);
}

// ------------------------------------------
// VALORES QUE SE IMPRIMEN
// ------------------------------------------
const mayus = () => $("mayusculas").checked;

function fechaTxt(iso) {
    if (!iso) return "";
    const [a, m, d] = iso.split("-");
    return `${d}/${m}/${a}`;
}

function calcularEdad(iso) {
    if (!iso) return "";
    const [a, m, d] = iso.split("-").map(Number);
    const hoy = new Date();
    let e = hoy.getFullYear() - a;
    if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) e--;
    return e >= 0 && e < 120 ? String(e) : "";
}

function hoyISO() {
    const h = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${h.getFullYear()}-${p(h.getMonth() + 1)}-${p(h.getDate())}`;
}

function valores() {
    const V = {};
    Object.keys(E.t).forEach((k) => {
        let v = E.t[k] || "";
        if (k === "fecha" || k === "fnac") {
            V[k] = fechaTxt(v);
            return;
        }
        v = v.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
        if (k === "sueldo" && /^\d[\d,]*(\.\d+)?$/.test(v)) {
            const n = Number(v.replace(/,/g, ""));
            v = "$" + n.toLocaleString("en-US");
        }
        if (k === "correo") v = v.toLowerCase();
        else if (mayus() && !SEG.has(k)) v = v.toUpperCase();
        V[k] = v;
    });
    return V;
}

const logo = new Image();
let logoListo = false;
logo.onload = () => {
    logoListo = true;
    pintar();
};
logo.src = window.LOGO_DCH;

function datos() {
    return { t: valores(), herr: E.herr, sig: E.sig, logo: logoListo ? logo : null };
}

// ------------------------------------------
// VISTA PREVIA
// ------------------------------------------
const lienzos = { 1: $("lienzo1"), 2: $("lienzo2") };
let pendiente = false;

function pintar() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => {
        pendiente = false;
        const c = lienzos[pagina];
        Solicitud.dibujar(c.getContext("2d"), pagina, datos(), 1);
    });
}

function irAPagina(n) {
    pagina = n;
    Object.entries(lienzos).forEach(([k, c]) => (c.hidden = Number(k) !== n));
    document.querySelectorAll(".tab").forEach((t) => {
        const on = Number(t.dataset.pag) === n;
        t.classList.toggle("activo", on);
        t.setAttribute("aria-selected", on);
    });
    pintar();
}

document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => irAPagina(Number(t.dataset.pag))));

// Al tocar una sección, la vista previa salta a la página donde aparece
$("formulario").addEventListener("focusin", (e) => {
    const s = e.target.closest("[data-pag]");
    if (s && Number(s.dataset.pag) !== pagina) irAPagina(Number(s.dataset.pag));
});
$("formulario").addEventListener("toggle", (e) => {
    if (e.target.open && e.target.dataset && Number(e.target.dataset.pag) !== pagina) irAPagina(Number(e.target.dataset.pag));
}, true);

// Ampliar la vista previa
Object.values(lienzos).forEach((c) =>
    c.addEventListener("click", () => {
        $("zoomImg").src = c.toDataURL("image/png");
        $("zoom").hidden = false;
    })
);
$("zoom").addEventListener("click", () => ($("zoom").hidden = true));
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") $("zoom").hidden = true;
});

// ------------------------------------------
// EVENTOS DEL FORMULARIO
// ------------------------------------------
function poner(k, v) {
    E.t[k] = v;
    if (el[k]) el[k].value = v;
    if (typeof marcarSug === "function") marcarSug();
}

function sincronizar(e) {
    const k = e.target.dataset && e.target.dataset.k;
    if (!k || e.target.tagName === "DIV") return;
    e.target.classList.remove("error");
    E.t[k] = e.target.value;
    if (k === "fnac" && !edadManual) poner("edad", calcularEdad(E.t.fnac));
    if (k === "edad") {
        edadManual = e.target.value !== "";
        if (!edadManual) poner("edad", calcularEdad(E.t.fnac));
    }
    if (k === "entrevistador") guardar("dch_sol_entrevistador", e.target.value);
    marcarSug();
    pintar();
}
// "change" también: en el celular, elegir una sugerencia de la lista solo lanza este evento
$("formulario").addEventListener("input", sincronizar);
$("formulario").addEventListener("change", sincronizar);

// Lista de estados: al elegir "Otro" aparece un cuadro para escribir
$("formulario").addEventListener("change", (e) => {
    const k = e.target.dataset && e.target.dataset.lst;
    if (!k) return;
    const inp = el[k];
    const otro = e.target.value === "__otro";
    inp.hidden = !otro;
    if (otro) {
        E.t[k] = inp.value;
        inp.focus();
    } else {
        E.t[k] = e.target.value;
        inp.value = "";
    }
    pintar();
});

// Botones de opción: al tocar "Otro" aparece un cuadro para escribir; tocar otra vez quita la selección
function elegir(k, v) {
    const g = grp[k];
    const nuevo = g.dataset.val === v ? "" : v;
    g.dataset.val = nuevo;
    g.querySelectorAll("button").forEach((b) => b.classList.toggle("activo", b.dataset.v === nuevo));
    const inp = el[k];
    const otro = nuevo === "Otro";
    inp.hidden = !otro;
    if (otro) {
        E.t[k] = inp.value;
        inp.focus();
    } else {
        E.t[k] = nuevo;
        inp.value = "";
    }
    g.classList.remove("error");
    if (k === "empresaApl") {
        guardar("dch_sol_empresa", E.t[k]);
        actualizarExpediente();
    }
    pintar();
}

function marcarSug() {
    document.querySelectorAll("[data-sug]").forEach((b) => b.classList.toggle("activo", (E.t[b.dataset.sug] || "").trim() === b.dataset.v));
}

// Nombres: primera letra de cada palabra en mayúscula
$("formulario").addEventListener("focusout", (e) => {
    const k = e.target.dataset && e.target.dataset.k;
    if (!["nombre", "lnac", "colonia", "municipio", "emp1", "emp2", "emp3", "jefe1", "jefe2", "jefe3"].includes(k)) return;
    const v = e.target.value;
    if (v && v === v.toLowerCase()) {
        e.target.value = v.replace(/(^|\s)(\S)/g, (_, a, b) => a + b.toUpperCase());
        E.t[k] = e.target.value;
        pintar();
    }
});

// Sí / No (tocar otra vez para quitar) y herramientas (delegado: los botones se crean por código)
$("formulario").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const seg = b.closest(".seg");
    if (seg) {
        const k = seg.dataset.k;
        E.t[k] = E.t[k] === b.dataset.v ? "" : b.dataset.v;
        marcarSeg();
        pintar();
        return;
    }
    if (b.dataset.opc) {
        elegir(b.dataset.opc, b.dataset.v);
        return;
    }
    if (b.dataset.sug) {
        const k = b.dataset.sug;
        poner(k, E.t[k] === b.dataset.v ? "" : b.dataset.v);
        el[k].classList.remove("error");
        pintar();
        return;
    }
    if (b.classList.contains("chip")) {
        const h = b.dataset.h;
        E.herr = E.herr.includes(h) ? E.herr.filter((x) => x !== h) : [...E.herr, h];
        b.classList.toggle("activo", E.herr.includes(h));
        pintar();
    }
});

function marcarSeg() {
    document.querySelectorAll(".seg").forEach((seg) => {
        seg.querySelectorAll("button").forEach((b) => b.classList.toggle("activo", E.t[seg.dataset.k] === b.dataset.v));
    });
}

$("mayusculas").addEventListener("change", () => {
    guardar("dch_sol_mayusculas", $("mayusculas").checked);
    pintar();
});

$("btnLimpiar").addEventListener("click", () => {
    if (!confirm("¿Borrar todo el formulario?")) return;
    const entrev = E.t.entrevistador || "";
    const empresa = E.t.empresaApl || ""; // se queda igual, como el entrevistador
    Object.keys(el).forEach((k) => {
        el[k].value = "";
        el[k].classList.remove("error");
    });
    Object.keys(lst).forEach((k) => {
        lst[k].value = "";
        el[k].hidden = true;
    });
    Object.keys(grp).forEach((k) => {
        grp[k].dataset.val = "";
        grp[k].classList.remove("error");
        grp[k].querySelectorAll("button").forEach((b) => b.classList.remove("activo"));
        el[k].hidden = true;
    });
    E.t = {};
    E.herr = [];
    E.sig = [];
    edadManual = false;
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("activo"));
    marcarSeg();
    marcarSug();
    poner("fecha", hoyISO());
    poner("entrevistador", entrev);
    Object.keys(DOCS).forEach((k) => delete DOCS[k]);
    if (empresa) elegir("empresaApl", empresa);
    actualizarExpediente();
    pintarPad();
    avisar("");
    irAPagina(1);
    el.nombre.focus();
});

// ------------------------------------------
// DESCARGAR / COMPARTIR
// ------------------------------------------
const ESCALA = 1.5; // 2550 x 3300 px (carta a 300 dpi)

function avisar(texto) {
    $("aviso").textContent = texto;
}

function validar() {
    const req = TODOS.filter((c) => c.req);
    const faltan = req.filter((c) => !(E.t[c.k] || "").trim());
    const visible = (k) => (grp[k] && el[k].hidden ? grp[k] : el[k]);
    req.forEach((c) => visible(c.k).classList.toggle("error", faltan.includes(c)));
    if (faltan.length) {
        (visible(faltan[0].k).focus || (() => {})).call(visible(faltan[0].k));
        visible(faltan[0].k).scrollIntoView({ block: "center", behavior: "smooth" });
        avisar("Completa los campos marcados en rojo.");
        return false;
    }
    return true;
}

function nombreBase(prefijo = "solicitud") {
    const base = (E.t.nombre || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    const emp = (E.t.empresaApl || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    return `${prefijo}-${base || "candidato"}${emp ? "-" + emp : ""}`;
}

function aBlob(canvas, tipo, calidad) {
    return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("No se pudo crear la imagen"))), tipo, calidad));
}

// Dibuja una página en alta resolución y devuelve su imagen
async function renderPagina(n, tipo, calidad) {
    const c = document.createElement("canvas");
    c.width = Math.round(Solicitud.W * ESCALA);
    c.height = Math.round(Solicitud.H * ESCALA);
    Solicitud.dibujar(c.getContext("2d"), n, datos(), ESCALA);
    const blob = await aBlob(c, tipo, calidad);
    c.width = c.height = 0; // libera memoria
    return blob;
}

// PDF sencillo: una imagen JPEG por página, tamaño carta (612 x 792 pt)
async function crearPDF() {
    const enc = new TextEncoder();
    const partes = [];
    const offs = {};
    let pos = 0;
    const meter = (d) => {
        const u = typeof d === "string" ? enc.encode(d) : d;
        partes.push(u);
        pos += u.length;
    };
    const obj = (id, cuerpo) => {
        offs[id] = pos;
        meter(`${id} 0 obj\n`);
        meter(cuerpo);
        meter("\nendobj\n");
    };

    const imgs = [];
    for (const n of [1, 2]) {
        const b = await renderPagina(n, "image/jpeg", 0.94);
        imgs.push(new Uint8Array(await b.arrayBuffer()));
    }
    const pw = Math.round(Solicitud.W * ESCALA);
    const ph = Math.round(Solicitud.H * ESCALA);

    meter("%PDF-1.4\n");
    obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
    obj(2, "<< /Type /Pages /Kids [3 0 R 6 0 R] /Count 2 >>");
    imgs.forEach((bytes, i) => {
        const p = 3 + i * 3;
        obj(p, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im0 ${p + 2} 0 R >> >> /Contents ${p + 1} 0 R >>`);
        const flujo = "q 612 0 0 792 0 0 cm /Im0 Do Q";
        obj(p + 1, `<< /Length ${flujo.length} >>\nstream\n${flujo}\nendstream`);
        offs[p + 2] = pos;
        meter(`${p + 2} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pw} /Height ${ph} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`);
        meter(bytes);
        meter("\nendstream\nendobj\n");
    });
    const xref = pos;
    const total = 9;
    let tabla = `xref\n0 ${total + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= total; i++) tabla += String(offs[i]).padStart(10, "0") + " 00000 n \n";
    meter(tabla + `trailer\n<< /Size ${total + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
    return new Blob(partes, { type: "application/pdf" });
}

// Convierte una foto a JPEG ligero (respeta la rotación de la cámara)
async function fotoAJpeg(file) {
    let bmp;
    try {
        bmp = await createImageBitmap(file);
    } catch (e) {
        throw Object.assign(new Error("lectura"), { mensaje: `No se pudo leer "${file.name}". Sube la imagen en JPG o PNG, o un PDF.` });
    }
    const esc = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * esc);
    const h = Math.round(bmp.height * esc);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const x = c.getContext("2d");
    x.fillStyle = "#fff";
    x.fillRect(0, 0, w, h);
    x.drawImage(bmp, 0, 0, w, h);
    const bytes = new Uint8Array(await (await aBlob(c, "image/jpeg", 0.88)).arrayBuffer());
    c.width = c.height = 0;
    return { bytes, w, h };
}

// PDF del expediente: documentos en el orden del cliente + solicitud; lo obligatorio que falte lleva marca de agua
async function crearPDFExpediente() {
    const { PDFDocument, StandardFonts, rgb, degrees } = PDFLib;
    const pdf = await PDFDocument.create();
    const negrita = await pdf.embedFont(StandardFonts.HelveticaBold);
    const normal = await pdf.embedFont(StandardFonts.Helvetica);
    const faltan = [];
    const PW = 612;
    const PH = 792;

    const paginaPendiente = (titulo) => {
        const p = pdf.addPage([PW, PH]);
        const t = titulo.toUpperCase();
        const tam = Math.min(24, (PW - 80) / negrita.widthOfTextAtSize(t, 1));
        p.drawText(t, { x: (PW - negrita.widthOfTextAtSize(t, tam)) / 2, y: PH - 80, size: tam, font: negrita, color: rgb(0.1, 0.2, 0.4) });
        const sub = "Documento no entregado";
        p.drawText(sub, { x: (PW - normal.widthOfTextAtSize(sub, 14)) / 2, y: PH - 104, size: 14, font: normal, color: rgb(0.45, 0.45, 0.45) });
        // marca de agua en diagonal
        const m = "PENDIENTE DE ENTREGA";
        const ms = 58;
        const mw = negrita.widthOfTextAtSize(m, ms);
        const a = Math.PI / 4;
        p.drawText(m, {
            x: PW / 2 - (mw / 2) * Math.cos(a) + (ms * 0.35) * Math.sin(a),
            y: PH / 2 - (mw / 2) * Math.sin(a) - (ms * 0.35) * Math.cos(a),
            size: ms,
            font: negrita,
            color: rgb(0.85, 0.19, 0.15),
            opacity: 0.45,
            rotate: degrees(45),
        });
    };

    for (const d of EXPEDIENTE_MELI) {
        if (d.k === "SOLICITUD") {
            for (const n of [1, 2]) {
                const img = await pdf.embedJpg(new Uint8Array(await (await renderPagina(n, "image/jpeg", 0.94)).arrayBuffer()));
                pdf.addPage([PW, PH]).drawImage(img, { x: 0, y: 0, width: PW, height: PH });
            }
            continue;
        }
        const files = DOCS[d.k] || [];
        if (!files.length) {
            if (d.req) {
                faltan.push(d.label);
                paginaPendiente(d.label);
            }
            continue;
        }
        for (const f of files) {
            if (f.type === "application/pdf" || /\.pdf$/i.test(f.name)) {
                try {
                    const src = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
                    // cada página del PDF se acomoda en una hoja carta
                    const incrustadas = await pdf.embedPdf(src, src.getPageIndices());
                    for (const ep of incrustadas) {
                        const M = 20;
                        const k = Math.min((PW - 2 * M) / ep.width, (PH - 2 * M) / ep.height);
                        pdf.addPage([PW, PH]).drawPage(ep, { x: (PW - ep.width * k) / 2, y: (PH - ep.height * k) / 2, width: ep.width * k, height: ep.height * k });
                    }
                } catch (e) {
                    throw Object.assign(new Error("pdf"), { mensaje: `No se pudo leer el PDF "${f.name}".` });
                }
            } else {
                const { bytes, w, h } = await fotoAJpeg(f);
                const img = await pdf.embedJpg(bytes);
                const M = 28;
                const s = Math.min((PW - 2 * M) / w, (PH - 2 * M) / h);
                pdf.addPage([PW, PH]).drawImage(img, { x: (PW - w * s) / 2, y: (PH - h * s) / 2, width: w * s, height: h * s });
            }
        }
    }
    return { blob: new Blob([await pdf.save()], { type: "application/pdf" }), faltan };
}

// Según la empresa: PDF normal (solicitud) o expediente completo (MELI)
async function generarPDF() {
    if (esMeli()) {
        const r = await crearPDFExpediente();
        return { ...r, nombre: nombreBase("expediente") + ".pdf" };
    }
    return { blob: await crearPDF(), faltan: [], nombre: nombreBase() + ".pdf" };
}

function bajar(blob, nombre) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function recordarUsados() {
    TODOS.filter((c) => c.mem).forEach((c) => {
        recordar("dch_sol_" + c.k, E.t[c.k]);
        llenarLista(c);
    });
}

async function ocupado(boton, texto, tarea) {
    if (!validar()) return;
    const botones = document.querySelectorAll(".acciones button");
    botones.forEach((b) => (b.disabled = true));
    avisar(texto);
    try {
        await tarea();
        recordarUsados();
    } catch (e) {
        console.error(e);
        avisar(e.mensaje || "No se pudo generar la solicitud. Intenta de nuevo.");
    } finally {
        botones.forEach((b) => (b.disabled = false));
    }
}

$("btnPDF").addEventListener("click", () =>
    ocupado($("btnPDF"), "Generando PDF…", async () => {
        const r = await generarPDF();
        bajar(r.blob, r.nombre);
        avisar(r.faltan.length ? `PDF descargado ✔ · Pendientes de entrega: ${r.faltan.join(", ")}` : "PDF descargado ✔");
    })
);

$("btnImagen").addEventListener("click", () =>
    ocupado($("btnImagen"), "Generando imágenes…", async () => {
        for (const n of [1, 2]) {
            bajar(await renderPagina(n, "image/png"), `${nombreBase()}-pag${n}.png`);
            await new Promise((r) => setTimeout(r, 400));
        }
        avisar("Imágenes descargadas (2 páginas) ✔");
    })
);

// Compartir (WhatsApp, correo, etc.) solo si el navegador lo permite
if (navigator.canShare && navigator.share) {
    $("btnCompartir").hidden = false;
    $("btnCompartir").addEventListener("click", () =>
        ocupado($("btnCompartir"), "Preparando…", async () => {
            const r = await generarPDF();
            const pdf = new File([r.blob], r.nombre, { type: "application/pdf" });
            let archivos = [pdf];
            if (!navigator.canShare({ files: archivos })) {
                archivos = [];
                for (const n of [1, 2]) archivos.push(new File([await renderPagina(n, "image/png")], `${nombreBase()}-pag${n}.png`, { type: "image/png" }));
                if (!navigator.canShare({ files: archivos })) {
                    avisar("Tu dispositivo no permite compartir archivos desde aquí. Usa Descargar.");
                    return;
                }
            }
            try {
                await navigator.share({ files: archivos, title: "Solicitud de empleo" });
                avisar("");
            } catch (e) {
                if (e.name !== "AbortError") throw e;
                avisar("");
            }
        })
    );
}

// ------------------------------------------
// INICIO
// ------------------------------------------
function cargarFuentes() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([400, 600, 700, 800].map((p) => document.fonts.load(`${p} 30px "Montserrat Sol"`, "Aá¿Ñ0"))).catch(() => { });
}

construirFormulario();
poner("fecha", hoyISO());
poner("entrevistador", leer("dch_sol_entrevistador", ""));
{
    const emp = leer("dch_sol_empresa", "");
    if (EMPRESAS.includes(emp)) {
        elegir("empresaApl", emp);
    }
}
$("mayusculas").checked = leer("dch_sol_mayusculas", false);
marcarSeg();
irAPagina(1);
cargarFuentes().then(pintar);
