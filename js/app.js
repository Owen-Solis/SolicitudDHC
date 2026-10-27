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
const ENTERADO = ["Facebook", "Instagram", "LinkedIn", "OCC", "Indeed"];
const PUESTOS = ["Ayudante general", "Almacenista", "Monta", "HP HS", "Técnico mantenimiento CNC", "Inspector de calidad"];
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
        { k: "ing" + n, label: "Fecha de ingreso", ph: "Ej. 03/2022", mitad: true },
        { k: "baj" + n, label: "Fecha de baja", ph: "Ej. 08/2024", mitad: true },
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
            { k: "lnac", label: "Lugar de nacimiento", mem: true },
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
            { k: "calle", label: "Calle y número" },
            { k: "colonia", label: "Colonia", mem: true, mitad: true },
            { k: "municipio", label: "Municipio", mem: true, mitad: true },
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
const sel = {}; // listas desplegables por clave

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

function crearCampo(c) {
    const wrap = crear("div", "campo" + (c.mitad ? " mitad" : ""));
    const lab = crear("label", "", c.label + (c.req ? "" : ""));
    lab.htmlFor = "f-" + c.k;
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
        const s = crear("select");
        s.id = "f-" + c.k;
        s.dataset.sel = c.k;
        s.appendChild(new Option("Selecciona una opción", ""));
        c.opciones.forEach((o) => s.appendChild(new Option(o, o)));
        if (c.otro) s.appendChild(new Option("Otro", "__otro"));
        wrap.appendChild(s);
        sel[c.k] = s;
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
    inp.id = (c.opciones ? "o-" : "f-") + c.k;
    if (c.opciones) inp.hidden = true; // solo se muestra al elegir "Otro"
    inp.dataset.k = c.k;
    if (c.ph) inp.placeholder = c.ph;
    if (c.lista || c.mem) {
        inp.setAttribute("list", "dl-" + c.k);
        const dl = crear("datalist");
        dl.id = "dl-" + c.k;
        wrap.appendChild(dl);
    }
    wrap.appendChild(inp);
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

// Lista desplegable: al elegir "Otro" aparece un cuadro para escribir
function selCambio(e) {
    const s = e.target;
    const k = s.dataset && s.dataset.sel;
    if (!k) return;
    const otro = s.value === "__otro";
    const inp = el[k];
    inp.hidden = !otro;
    if (otro) {
        E.t[k] = inp.value;
        inp.focus();
    } else {
        E.t[k] = s.value;
        inp.value = "";
    }
    s.classList.remove("error");
    pintar();
}
$("formulario").addEventListener("change", selCambio);

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
    Object.keys(el).forEach((k) => {
        el[k].value = "";
        el[k].classList.remove("error");
    });
    Object.keys(sel).forEach((k) => {
        sel[k].value = "";
        sel[k].classList.remove("error");
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
    const visible = (k) => (sel[k] && el[k].hidden ? sel[k] : el[k]);
    req.forEach((c) => visible(c.k).classList.toggle("error", faltan.includes(c)));
    if (faltan.length) {
        visible(faltan[0].k).focus();
        avisar("Completa los campos marcados en rojo.");
        return false;
    }
    return true;
}

function nombreBase() {
    const base = (E.t.nombre || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    return `solicitud-${base || "candidato"}`;
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
        avisar("No se pudo generar la solicitud. Intenta de nuevo.");
    } finally {
        botones.forEach((b) => (b.disabled = false));
    }
}

$("btnPDF").addEventListener("click", () =>
    ocupado($("btnPDF"), "Generando PDF…", async () => {
        bajar(await crearPDF(), nombreBase() + ".pdf");
        avisar("PDF descargado ✔");
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
            const pdf = new File([await crearPDF()], nombreBase() + ".pdf", { type: "application/pdf" });
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
$("mayusculas").checked = leer("dch_sol_mayusculas", false);
marcarSeg();
irAPagina(1);
cargarFuentes().then(pintar);
