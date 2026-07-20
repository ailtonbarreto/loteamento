window.addEventListener("DOMContentLoaded", () => {

    const svg = document.getElementById("meuSvg");
    const tooltip = document.getElementById("tooltip");

    // URL do CSV
    const csvURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRGiVMZTopUoPycE7RZ-rH1F68nqeqlerv99ngjY4oy8FCe1D-2e5OqTSTn-kCNLS2yfYzVd25hfO3R/pub?gid=0&single=true&output=csv";

    let lotes = {};

    // --------- CARREGAR CSV ---------
    fetch(csvURL)
        .then(res => res.text())
        .then(csv => processarCSV(csv))
        .catch(err => console.error("Erro ao carregar CSV:", err));

    function parseCSVLine(line) {
        const result = [];
        let current = "";
        let insideQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const c = line[i];

            if (c === '"') {
                insideQuotes = !insideQuotes;
            } else if (c === ',' && !insideQuotes) {
                result.push(current.trim());
                current = "";
            } else {
                current += c;
            }
        }
        result.push(current.trim());
        return result;
    }

    function processarCSV(csv) {
        const linhas = csv.trim().split("\n");
        const cabecalho = parseCSVLine(linhas.shift());

        linhas.forEach(linha => {
            const valores = parseCSVLine(linha);
            const item = {};

            cabecalho.forEach((coluna, i) => {
                item[coluna.trim()] = valores[i] ? valores[i].trim().replace(/^"|"$/g, "") : "";
            });

            lotes[item.id] = item;
        });

        pintarLotes();
        configurarTooltip();
        configurarCliqueNosLotes();
        atualizarTotalVendido();
        atualizarTotalVendidos();
        atualizarTotalLotes();
        atualizarQtdReservados();
        atualizarQtdDisponivel();

    }

    // --------- PINTAR LOTES ---------
    function pintarLotes() {
        document.querySelectorAll("path[id^='lt']").forEach(path => {
            const id = path.id;
            const lote = lotes[id];
            if (!lote) return;

            const status = lote.status.toLowerCase();

            if (status === "disponível") {
                path.style.fill = "#29DE05";
                path.style.opacity = "0.5";
            } else if (status === "vendido") {
                path.style.fill = "#DE0505";
                path.style.opacity = "0.5";
            } else if (status === "reservado") {
                path.style.fill = "#DEAB05";
                path.style.opacity = "0.5";
            } else {
                path.style.fill = "none";
            }
        });
    }

    // --------- TOOLTIP ---------
    function configurarTooltip() {
        document.querySelectorAll("path[id^='lt']").forEach(path => {
            path.style.cursor = "pointer";

            path.addEventListener("mouseenter", () => {
                const id = path.id;
                const lote = lotes[id];
                if (!lote) return;

                const rect = path.getBoundingClientRect();

                tooltip.innerHTML = `
            <b>${lote.lote}</b><br>
            Valor: ${lote.valor}<br>
            Status: ${lote.status}
        `;

                tooltip.style.display = "block";
                tooltip.style.left = (rect.left + rect.width / 2) + "px";
                tooltip.style.top = (rect.top + rect.height / 2) + "px";
            });

            path.addEventListener("mouseleave", () => {
                tooltip.style.display = "none";
            });
        });
    }

    // --------- CLIQUE NO LOTE → ABRIR SIDEBAR ---------
    function configurarCliqueNosLotes() {
        document.querySelectorAll("path[id^='lt']").forEach(path => {
            path.addEventListener("click", () => {
                abrirSidebar(path.id);
            });
        });
    }

    function abrirSidebar(id) {
        const lote = lotes[id];

        document.getElementById("sb-lote").innerText = lote.lote || id;
        document.getElementById("sb-valor").innerText = lote.valor;

        const select = document.getElementById("sb-status-select");
        select.value = lote.status.toLowerCase();

        document.getElementById("sidebar").style.display = "flex";

        window.loteSelecionado = id;

        const btnContrato = document.getElementById("gerar_contrato");

        if (lote.status.toLowerCase() === "disponível") {
            btnContrato.style.display = "block";
            btnContrato.onclick = () => window.abrirPopupContrato({
                id,
                lote: lote.lote,
                valor: lote.valor
            });
        } else {
            btnContrato.style.display = "none";
        }

    }

    // --------- FECHAR SIDEBAR ---------
    document.getElementById("sidebar-close").addEventListener("click", () => {
        document.getElementById("sidebar").style.display = "none";
    });

    // --------- SALVAR STATUS ---------
    document.getElementById("btn-salvar-status").addEventListener("click", () => {
        const id = window.loteSelecionado;
        const lote = lotes[id];

        const novoStatus = document.getElementById("sb-status-select").value;

        lote.status = novoStatus;

        atualizarCorDoLote(id);
        atualizarTotalVendido();
        atualizarTotalVendidos();
        atualizarQtdReservados();
        atualizarQtdDisponivel();

        document.getElementById("sidebar").style.display = "none";
    });

    // --------- ATUALIZAR COR DO LOTE ---------
    function atualizarCorDoLote(id) {
        const lote = lotes[id];
        const path = document.getElementById(id);

        if (!path) return;

        const status = lote.status.toLowerCase();

        if (status === "disponível") {
            path.style.fill = "#29DE05";
        } else if (status === "vendido") {
            path.style.fill = "#DE0505";
        } else if (status === "reservado") {
            path.style.fill = "#DEAB05";
        }
    }

    // --------- PARSE VALOR ---------
    function parseValor(valorStr) {
        return Number(
            valorStr
                .replace("R$", "")
                .replace(/\s/g, "")
                .replace(/\./g, "")
                .replace(",", ".")
        );
    }

    // --------- TOTAL VENDIDO ---------
    function calcularTotalVendido() {
        let total = 0;

        for (const id in lotes) {
            const lote = lotes[id];
            if (!lote) continue;

            const status = lote.status.toLowerCase();

            if (status === "vendido") {
                const valor = parseValor(lote.valor);
                total += valor;
            }
        }

        return total;
    }

    function atualizarTotalVendido() {
        const total = calcularTotalVendido();

        document.getElementById("totalVendido").innerHTML =
            "R$ " + total.toLocaleString("pt-BR", {
                minimumFractionDigits: 2
            });
    }

    // --------- CONTAR LOTES ---------
    function contarLotes() {
        return Object.keys(lotes).length;
    }

    function atualizarTotalLotes() {
        const total = contarLotes();
        document.getElementById("totalLotes").innerHTML = total;
    }

    //-----------CONTAR LOTES VENDIDOS------

    function contarVendidos() {
        let vendidos = 0;

        for (const id in lotes) {
            const lote = lotes[id];
            if (!lote) continue;

            if (lote.status.toLowerCase() === "vendido") {
                vendidos++;
            }
        }

        return vendidos;
    }

    //---------ATUALIZAR LOTES VENDIDOS------

    function atualizarTotalVendidos() {
        const vendidos = contarVendidos();
        document.getElementById("totalVendidos").innerText = vendidos;
    }

    //--------CONTAR RESERVADOS-------------

    function contarReservados() {
        let reservado = 0;

        for (const id in lotes) {
            const lote = lotes[id];
            if (!lote) continue;

            if (lote.status.toLowerCase() === "reservado") {
                reservado++;
            }
        }

        return reservado;
    }

    //---------ATUALIZAR QTD LOTES------

    function atualizarQtdReservados() {
        const reservado = contarReservados();
        document.getElementById("reservado").innerText = reservado;
    }

    //--------CONTAR DISPONIVEL-------------

    function contarDisponivel() {
        let disponivel = 0;

        for (const id in lotes) {
            const lote = lotes[id];
            if (!lote) continue;

            if (lote.status.toLowerCase() === "disponível") {
                disponivel++;
            }
        }

        return disponivel;
    }

    //---------ATUALIZAR QTD DISPONIVEL------

    function atualizarQtdDisponivel() {
        const disponivel = contarDisponivel();
        document.getElementById("disponivel").innerText = disponivel;
    }

    // ------------------------------------------------------------
    // --------- ZOOM + PAN NO SVG ---------
    const vb = svg.viewBox.baseVal;

    let viewX = vb.x;
    let viewY = vb.y;
    let viewW = vb.width;
    let viewH = vb.height;

    updateViewBox();

    const imgW = vb.width;
    const imgH = vb.height;

    let isDragging = false;
    let startX, startY;

    function updateViewBox() {
        svg.setAttribute("viewBox", `${viewX} ${viewY} ${viewW} ${viewH}`);
    }

    svg.addEventListener("wheel", (e) => {
        e.preventDefault();

        const zoomFactor = 0.1;

        const rect = svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const relX = viewX + (mouseX / rect.width) * viewW;
        const relY = viewY + (mouseY / rect.height) * viewH;

        if (e.deltaY < 0) {
            viewW *= (1 - zoomFactor);
            viewH *= (1 - zoomFactor);
        } else {
            viewW *= (1 + zoomFactor);
            viewH *= (1 + zoomFactor);

            if (viewW > imgW) viewW = imgW;
            if (viewH > imgH) viewH = imgH;
        }

        viewX = relX - (mouseX / rect.width) * viewW;
        viewY = relY - (mouseY / rect.height) * viewH;

        if (viewX < 0) viewX = 0;
        if (viewY < 0) viewY = 0;
        if (viewX + viewW > imgW) viewX = imgW - viewW;
        if (viewY + viewH > imgH) viewY = imgH - viewH;

        updateViewBox();
    });

    svg.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
    });

    svg.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const rect = svg.getBoundingClientRect();
        const dx = (e.clientX - startX) * (viewW / rect.width);
        const dy = (e.clientY - startY) * (viewH / rect.height);

        viewX -= dx;
        viewY -= dy;

        if (viewX < 0) viewX = 0;
        if (viewY < 0) viewY = 0;
        if (viewX + viewW > imgW) viewX = imgW - viewW;
        if (viewY + viewH > imgH) viewY = imgH - viewH;

        startX = e.clientX;
        startY = e.clientY;

        updateViewBox();
    });

    svg.addEventListener("mouseup", () => isDragging = false);
    svg.addEventListener("mouseleave", () => isDragging = false);

})