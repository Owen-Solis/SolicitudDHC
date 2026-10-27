// ==========================================
// PLANTILLA DE LA SOLICITUD DCH (2 páginas, tamaño carta)
// La solicitud se dibuja por completo con código (vectorial), así se ve
// nítida a cualquier tamaño y se puede exportar en alta resolución.
// Lienzo base: 1700 x 2200 px (carta a 200 dpi). Al exportar se escala.
// ==========================================
(function () {
    "use strict";

    const W = 1700;
    const H = 2200;
    const FUENTE = '"Montserrat Sol", Montserrat, "Segoe UI", Arial, sans-serif';

    const COL = {
        campo: "#d6e6f8",
        etiqueta: "#2f6fb0",
        valor: "#0f1c2b",
        naranja: "#f7941d",
        titulo: "#0b73c9",
        suave: "#5d82aa",
        marca: "#0b4f8a",
        texto: "#33475b",
    };

    // ------------------------------------------
    // CONVERSIÓN DE MEDIDAS
    // Las cajas se tomaron de las fotos de la solicitud original
    // (pág. 1: 1118 x 1459 px, pág. 2: 997 x 1303 px) y se escalan al lienzo.
    // ------------------------------------------
    const sx1 = W / 1118;
    const sy1 = 1.508;
    const b1 = (x1, y1, x2, y2) => ({ x: x1 * sx1, y: y1 * sy1, w: (x2 - x1) * sx1, h: (y2 - y1) * sy1 });

    const sx2 = W / 997;
    const Ya = (y) => y * 1.6; // parte superior de la pág. 2
    const Yb = (y) => y * 1.6 + 105; // parte inferior (deja espacio para la firma)
    const b2 = (x1, y1, x2, y2, f = Ya) => ({ x: x1 * sx2, y: f(y1), w: (x2 - x1) * sx2, h: f(y2) - f(y1) });

    const campo = (k, label, box, extra) => Object.assign({ t: "campo", k, label }, box, extra);
    const barra = (txt, y, h, x2, tx) => ({ t: "barra", txt, y: y * sy1, h: h * sy1, x2: x2 * sx1, tx: tx * sx1 });

    // ------------------------------------------
    // PÁGINA 1  ·  Solicitud de empleo
    // ------------------------------------------
    const P1 = [
        { t: "texto", txt: "Solicitud de Empleo", x: 138 * sx1, y: 97 * sy1, ancho: 469 * sx1, peso: 800, color: COL.titulo, exacto: true },
        { t: "texto", txt: "(Servicios Especializados)", x: 163 * sx1, y: 138 * sy1, ancho: 420 * sx1, peso: 400, color: COL.suave, exacto: true },
        { t: "logo", x: 1040, y: 60, w: 420 },

        campo("fecha", "Fecha:", b1(60, 202, 310, 262)),
        campo("entrevistador", "Entrevistador:", b1(322, 202, 663, 262)),
        campo("enterado", "¿Cómo se enteró de la vacante?", b1(674, 202, 1074, 262)),
        campo("puesto", "Puesto solicitado:", b1(182, 273, 524, 333)),
        campo("sueldo", "Sueldo mensual deseado:", b1(537, 273, 880, 333)),
        { t: "texto", txt: "Los datos aquí requeridos únicamente son solicitados para fines estadísticos y no serán considerados", x: 560 * sx1, y: 362 * sy1, tam: 19, peso: 600, color: COL.etiqueta, align: "center" },
        { t: "texto", txt: "como condiciones que impliquen discriminación para conseguir un empleo.", x: 560 * sx1, y: 381 * sy1, tam: 19, peso: 600, color: COL.etiqueta, align: "center" },

        barra("Datos Personales", 405, 52, 527, 143),
        campo("nombre", "Nombre completo:", b1(50, 478, 663, 538)),
        campo("fnac", "Fecha de nacimiento:", b1(50, 549, 356, 609)),
        campo("edad", "Edad:", b1(366, 549, 511, 609)),
        campo("lnac", "Lugar de nacimiento:", b1(522, 549, 829, 609)),
        campo("telcasa", "Tel. casa:", b1(843, 549, 1072, 609)),
        campo("cel", "Celular:", b1(50, 620, 371, 680)),
        campo("correo", "Correo:", b1(381, 620, 730, 680)),
        campo("civil", "Estado civil:", b1(740, 620, 1072, 680)),

        barra("Dirección", 699, 52, 527, 143),
        campo("calle", "Calle y número:", b1(50, 764, 371, 824)),
        campo("colonia", "Colonia:", b1(383, 764, 730, 824)),
        campo("municipio", "Municipio:", b1(740, 764, 1072, 824)),
        { t: "siNo", k: "infonavit", label: "¿Tienes crédito infonavit?:", lx: 137 * sx1, cy: 869 * sy1, siX: 447 * sx1, siBox: 510 * sx1, noX: 571 * sx1, noBox: 641 * sx1 },
        campo("credito", "Número de crédito:", b1(711, 835, 1072, 895)),

        barra("Preparación Académica / Profesional", 916, 52, 864, 143),
        campo("grado", "Último grado de estudio:", b1(50, 984, 535, 1044)),
        campo("titulo", "Título recibido:", b1(549, 984, 1072, 1044)),

        barra("Conocimientos y Experiencia", 1067, 52, 703, 143),
        { t: "texto", txt: "Marque con “x” la herramienta o equipo que sepa utilizar", x: 147 * sx1, y: 1148 * sy1, tam: 26, peso: 600, color: COL.etiqueta },
        { t: "herr", v: "Patineta Hidráulica", cx: 120 * sx1, cy: 1190 * sy1, lx: 153 * sx1 },
        { t: "herr", v: "Montacargas", cx: 120 * sx1, cy: 1224 * sy1, lx: 153 * sx1 },
        { t: "herr", v: "Pulidor", cx: 120 * sx1, cy: 1258 * sy1, lx: 153 * sx1 },
        { t: "herr", v: "Soldadora", cx: 416 * sx1, cy: 1190 * sy1, lx: 449 * sx1 },
        { t: "herr", v: "Torno", cx: 416 * sx1, cy: 1224 * sy1, lx: 449 * sx1 },
        { t: "herr", v: "Fresadora", cx: 416 * sx1, cy: 1258 * sy1, lx: 449 * sx1 },
        campo("otro", "Otro (describa):", b1(600, 1171, 1074, 1273), { multi: true }),
        { t: "siNo", k: "turnos", label: "¿Puedes rolar turnos?:", lx: 146 * sx1, cy: 1317 * sy1, siX: 405 * sx1, siBox: 468 * sx1, noX: 518 * sx1, noBox: 589 * sx1 },
        campo("porque", "¿Por qué?:", b1(640, 1287, 1074, 1350), { multi: true }),
    ];

    // ------------------------------------------
    // PÁGINA 2  ·  Historial laboral
    // ------------------------------------------
    const TXT_PRIVACIDAD =
        "Aviso de privacidad: Declaro que toda la información que he proporcionado es verdadera y correcta en todos sus aspectos. " +
        "Autorizo a DCH Servicios Especializados y sus razones sociales o a cualquier representante de esta, a llevar a cabo la revisión de mis " +
        "antecedentes penales, crediticios, académicos y laborales con el objeto de validar la información que he proporcionado. Entiendo que " +
        "el puesto para el cual estoy participando no será confirmado hasta que la información haya sido verificada por la misma, entiendo que " +
        "si he proporcionado información falsa durante el proceso de contratación (CV, entrevista, formularios), podría tener como consecuencia " +
        "que se retire la oferta de empleo en DCH Servicios Especializados y sus razones sociales, y si ya ha comenzado dicho empleo, puede ser " +
        "causal de rescisión de contrato sin responsabilidad para la empresa de acuerdo al Art 47°. " +
        "“Artículo 47.- Son causas de rescisión de la relación de trabajo, sin responsabilidad para el patrón: 1. Engañarlo el trabajador o en su " +
        "caso, el sindicato que lo hubiese propuesto o recomendado con certificados falsos o referencias en los que se atribuyan al trabajador " +
        "capacidad, aptitudes o facultades de que carezca. Esta causa de rescisión dejará de tener efecto después de treinta días de prestar sus " +
        "servicios el trabajador.” “Doy mi consentimiento para que los datos que he proporcionado sean procesados y almacenados en el formato " +
        "que sea considerado oportuno por el departamento de Recursos Humanos. Entiendo que firmando esta autorización estoy de acuerdo en que " +
        "los representantes designados por DCH Servicios Especializados y sus razones sociales pueden transferir los datos recogidos a otros " +
        "representantes o grupos para que sean procesados y almacenados en el formato apropiado por el departamento de Recursos Humanos. " +
        "Entiendo que mis datos seguirán siendo tratados de acuerdo con las regulaciones existentes sobre protección de datos personales y que " +
        "los datos serán archivados de manera confidencial.";

    const TXT_MANIFIESTO =
        "Manifiesto bajo protesta de decir la verdad que la información registrada en esta solicitud es real, y entiendo y comprendo todas y cada " +
        "una de las prestaciones que me fueron explicadas durante el proceso de selección.";

    const P2 = [
        { t: "barra", txt: "Historial Laboral", y: Ya(25), h: Ya(50), x2: 478 * sx2, tx: 133 * sx2 },
        { t: "texto", txt: "Registrar del más reciente al más antiguo", x: 117 * sx2, y: Ya(103), tam: 29, peso: 600, color: COL.marca },
    ];

    for (let i = 0; i < 3; i++) {
        const o = i * 191;
        const n = i + 1;
        P2.push(
            campo("emp" + n, "Empresa:", b2(35, 114 + o, 585, 170 + o)),
            campo("tel" + n, "Teléfono:", b2(592, 114 + o, 948, 170 + o)),
            campo("ing" + n, "Fecha ingreso:", b2(35, 180 + o, 299, 236 + o)),
            campo("baj" + n, "Fecha baja:", b2(308, 180 + o, 585, 236 + o)),
            campo("jefe" + n, "Jefe inmediato:", b2(592, 180 + o, 948, 236 + o)),
            campo("pue" + n, "Último puesto:", b2(35, 244 + o, 373, 300 + o)),
            campo("area" + n, "Área:", b2(381, 244 + o, 585, 300 + o)),
            campo("mot" + n, "Motivo de separación:", b2(593, 244 + o, 948, 300 + o))
        );
    }

    P2.push(
        campo("sinempleo", "Periodos en los cuales ha permanecido sin empleo, proporcionar fechas y ocupación:", b2(40, 692, 947, 782), { multi: true }),
        { t: "parrafo", txt: TXT_PRIVACIDAD, x: 60, y: Ya(792), w: 1556, tam: 16, lh: 21, color: COL.texto, justificar: true },
        { t: "firma" },
        { t: "linea", x1: 372 * sx2, x2: 612 * sx2, y: Yb(952) + 120 },
        { t: "texto", txt: "Firma del candidato", x: 492 * sx2, y: Yb(973) + 120, tam: 27, peso: 600, color: COL.texto, align: "center" },
        { t: "parrafo", txt: TXT_MANIFIESTO, x: 60, y: Yb(990) + 120, w: 1556, tam: 17, lh: 23, color: COL.texto, justificar: true }
    );

    const PAGINAS = { 1: P1, 2: P2 };

    // Zona donde se imprime la firma (pág. 2), encima de la línea
    const FIRMA = { x: 595, y: 1606, w: 490, h: 143 };

    // ------------------------------------------
    // UTILIDADES DE DIBUJO
    // ------------------------------------------
    function rr(ctx, x, y, w, h, r) {
        r = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    const fuente = (peso, tam) => `${peso} ${tam}px ${FUENTE}`;

    // Baja el tamaño de letra hasta que el texto quepa en "ancho".
    function ajustar(ctx, txt, peso, max, min, ancho) {
        let t = max;
        while (t > min) {
            ctx.font = fuente(peso, t);
            if (ctx.measureText(txt).width <= ancho) break;
            t -= 1;
        }
        ctx.font = fuente(peso, t);
        return t;
    }

    // Parte un texto en renglones que quepan en "ancho" (respeta saltos de línea).
    function envolver(ctx, txt, ancho) {
        const out = [];
        String(txt).split("\n").forEach((par) => {
            let linea = "";
            par.split(/\s+/).filter(Boolean).forEach((p) => {
                const prueba = linea ? linea + " " + p : p;
                if (!linea || ctx.measureText(prueba).width <= ancho) linea = prueba;
                else {
                    out.push(linea);
                    linea = p;
                }
            });
            out.push(linea);
        });
        return out;
    }

    function marcaX(ctx, cx, cy, r) {
        ctx.save();
        ctx.strokeStyle = COL.marca;
        ctx.lineWidth = 7;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(cx - r, cy - r);
        ctx.lineTo(cx + r, cy + r);
        ctx.moveTo(cx + r, cy - r);
        ctx.lineTo(cx - r, cy + r);
        ctx.stroke();
        ctx.restore();
    }

    function casilla(ctx, cx, cy, w, h, marcada) {
        ctx.fillStyle = COL.campo;
        rr(ctx, cx - w / 2, cy - h / 2, w, h, 14);
        ctx.fill();
        if (marcada) marcaX(ctx, cx, cy, Math.min(w, h) * 0.27);
    }

    // ------------------------------------------
    // ELEMENTOS
    // ------------------------------------------
    function dCampo(ctx, it, d) {
        let { x, y, w, h } = it;
        if (h < 88) {
            y -= (88 - h) / 2;
            h = 88;
        }
        ctx.fillStyle = COL.campo;
        rr(ctx, x, y, w, h, 16);
        ctx.fill();

        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = COL.etiqueta;
        ajustar(ctx, it.label, 600, 21, 14, w - 40);
        ctx.fillText(it.label, x + 22, y + 31);

        const v = d.t[it.k];
        if (!v) return;
        ctx.fillStyle = COL.valor;

        if (it.multi) {
            const alto = h - 42 - 12;
            const ancho = w - 44;
            let t = 30;
            let lineas;
            for (; t >= 17; t--) {
                ctx.font = fuente(600, t);
                lineas = envolver(ctx, v, ancho);
                if (lineas.length * t * 1.25 <= alto) break;
            }
            lineas.forEach((l, i) => ctx.fillText(l, x + 22, y + 42 + t + i * t * 1.25 - 4));
        } else {
            ajustar(ctx, v, 600, 34, 17, w - 44);
            ctx.fillText(v, x + 22, y + h - 20);
        }
    }

    function dBarra(ctx, it) {
        const r = it.h / 2;
        ctx.fillStyle = COL.naranja;
        ctx.beginPath();
        ctx.moveTo(-20, it.y);
        ctx.lineTo(it.x2 - r, it.y);
        ctx.arc(it.x2 - r, it.y + r, r, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(-20, it.y + it.h);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = fuente(700, 44);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(it.txt, it.tx, it.y + it.h / 2 + 15);
    }

    function dTexto(ctx, it) {
        ctx.fillStyle = it.color || COL.texto;
        ctx.textAlign = it.align || "left";
        ctx.textBaseline = "alphabetic";
        let tam = it.tam || 26;
        if (it.exacto) {
            ctx.font = fuente(it.peso || 600, 100);
            tam = (100 * it.ancho) / ctx.measureText(it.txt).width;
        }
        ctx.font = fuente(it.peso || 600, tam);
        ctx.fillText(it.txt, it.x, it.y);
    }

    function dParrafo(ctx, it) {
        ctx.fillStyle = it.color;
        ctx.textBaseline = "alphabetic";
        ctx.textAlign = "left";
        ctx.font = fuente(400, it.tam);
        const lineas = envolver(ctx, it.txt, it.w);
        lineas.forEach((l, i) => {
            const base = it.y + it.tam + i * it.lh;
            const ultima = i === lineas.length - 1;
            const pals = l.split(" ");
            if (!it.justificar || ultima || pals.length < 2) {
                ctx.fillText(l, it.x, base);
                return;
            }
            const suma = pals.reduce((a, p) => a + ctx.measureText(p).width, 0);
            const hueco = (it.w - suma) / (pals.length - 1);
            let cx = it.x;
            pals.forEach((p) => {
                ctx.fillText(p, cx, base);
                cx += ctx.measureText(p).width + hueco;
            });
        });
    }

    function dSiNo(ctx, it, d) {
        const base = it.cy + 9;
        ctx.fillStyle = COL.etiqueta;
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ajustar(ctx, it.label, 600, 26, 16, it.siX - it.lx - 18);
        ctx.fillText(it.label, it.lx, base);
        ctx.font = fuente(600, 26);
        ctx.fillText("Sí", it.siX, base);
        ctx.fillText("No", it.noX, base);
        const v = d.t[it.k];
        casilla(ctx, it.siBox, it.cy, 56, 48, v === "Sí");
        casilla(ctx, it.noBox, it.cy, 56, 48, v === "No");
    }

    function dHerr(ctx, it, d) {
        const marcada = (d.herr || []).indexOf(it.v) >= 0;
        casilla(ctx, it.cx, it.cy, 46, 44, marcada);
        ctx.fillStyle = COL.etiqueta;
        ctx.font = fuente(600, 26);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(it.v, it.lx, it.cy + 9);
    }

    function dLogo(ctx, it, d) {
        const img = d.logo;
        if (!img || !img.complete || !img.naturalWidth) return;
        ctx.drawImage(img, it.x, it.y, it.w, (it.w * img.naturalHeight) / img.naturalWidth);
    }

    // Trazos de la firma: cada trazo es una lista de puntos [x, y] entre 0 y 1.
    function dibujarFirma(ctx, trazos, x, y, w, h, grosor) {
        if (!trazos || !trazos.length) return;
        ctx.save();
        ctx.strokeStyle = "#10243e";
        ctx.fillStyle = "#10243e";
        ctx.lineWidth = grosor;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        trazos.forEach((tz) => {
            if (!tz.length) return;
            const P = tz.map((p) => [x + p[0] * w, y + p[1] * h]);
            if (P.length < 3) {
                ctx.beginPath();
                ctx.arc(P[0][0], P[0][1], grosor / 2, 0, Math.PI * 2);
                ctx.fill();
                return;
            }
            ctx.beginPath();
            ctx.moveTo(P[0][0], P[0][1]);
            for (let i = 1; i < P.length - 1; i++) {
                const mx = (P[i][0] + P[i + 1][0]) / 2;
                const my = (P[i][1] + P[i + 1][1]) / 2;
                ctx.quadraticCurveTo(P[i][0], P[i][1], mx, my);
            }
            ctx.lineTo(P[P.length - 1][0], P[P.length - 1][1]);
            ctx.stroke();
        });
        ctx.restore();
    }

    const DIBUJO = {
        campo: dCampo,
        barra: dBarra,
        texto: dTexto,
        parrafo: dParrafo,
        siNo: dSiNo,
        herr: dHerr,
        logo: dLogo,
        linea: (ctx, it) => {
            ctx.strokeStyle = COL.texto;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(it.x1, it.y);
            ctx.lineTo(it.x2, it.y);
            ctx.stroke();
        },
        firma: (ctx, it, d) => dibujarFirma(ctx, d.sig, FIRMA.x, FIRMA.y, FIRMA.w, FIRMA.h, 4.5),
    };

    // datos = { t: {clave: texto}, herr: [..], sig: [..trazos..], logo: Image }
    function dibujar(ctx, pagina, datos, escala) {
        ctx.save();
        ctx.setTransform(escala, 0, 0, escala, 0, 0);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, W, H);
        PAGINAS[pagina].forEach((it) => DIBUJO[it.t](ctx, it, datos));
        ctx.restore();
    }

    window.Solicitud = { W, H, FUENTE, FIRMA, dibujar, dibujarFirma };
})();
