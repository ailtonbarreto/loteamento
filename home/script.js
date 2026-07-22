window.addEventListener("DOMContentLoaded", () => {
    requestAnimationFrame(() => iniciarSistema());
});

function iniciarSistema() {
    const svg = document.getElementById("overlay");
    const wrapper = document.getElementById("mapa");
    const tooltip = document.getElementById("tooltip");


    fetch("https://api-lotes.onrender.com/loteamentos")
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro ao buscar os lotes.");
            }
            return response.json();
        })
        .then(data => {

            lotes = {};

            // AQUI ESTÁ O AJUSTE
            data.data.forEach(item => {
                lotes[item.id_lote] = item;
            });

            pintarLotes();
            configurarTooltip();
            configurarCliqueNosLotes();
            atualizarTotalVendido();
            atualizarDashboard();

            window.lotes = lotes;
            window.dispatchEvent(new Event("lotesCarregados"));

        })
        .catch(err => console.error(err));


    // ---------------- Pintar lotes ----------------

    function pintarLotes() {
        svg.querySelectorAll("path").forEach(path => {
            const id = path.id;
            const lote = lotes[id];

            if (!lote) {
                path.style.fill = "transparent";
                path.style.opacity = "1";
                return;
            }

            const status = lote.status.toLowerCase();

            if (status === "disponível") {
                path.style.fill = "#29DE05";
                path.style.opacity = "0.5";

            } else if (status === "vendido") {
                path.style.fill = "#02b1dd";
                path.style.opacity = "0.5";

            } else if (status === "reservado") {
                path.style.fill = "#DEAB05";
                path.style.opacity = "0.5";

            } else if (status === "bloqueado") {
                path.style.fill = "#de0505";
                path.style.opacity = "0.5";

            } else {
                path.style.fill = "transparent";
                path.style.opacity = "1";
            }
        });
    }



    // ---------------- Tooltip ----------------

    function configurarTooltip() {
        svg.querySelectorAll("path").forEach(path => {
            path.style.cursor = "pointer";

            path.addEventListener("mouseenter", () => {
                const id = path.id;
                const lote = lotes[id];

                if (!lote) return;

                const rect = path.getBoundingClientRect();

                tooltip.innerHTML = `
                <b>${lote.lote}</b><br>
                Valor: R$ ${lote.valor}<br>
                Metragem: ${lote.metragem}<br>
                Status: ${lote.status}
            `;

                tooltip.style.display = "block";

                tooltip.style.left = rect.left + rect.width / 2 + "px";
                tooltip.style.top = rect.top + rect.height / 2 + "px";
            });

            path.addEventListener("mouseleave", () => {
                tooltip.style.display = "none";
            });
        });
    }


    // ---------------- Clique → Sidebar ----------------

    function configurarCliqueNosLotes() {
        svg.querySelectorAll("path").forEach(path => {
            path.addEventListener("click", () => {
                abrirSidebar(path.id);
            });
        });
    }


    function abrirSidebar(id) {
        const lote = lotes[id];
        if (!lote) return;

        document.getElementById("sb-lote").innerText = lote.lote || id;
        document.getElementById("sb-valor").innerText = lote.valor;

        const select = document.getElementById("sb-status-select");
        select.value = lote.status.toLowerCase();

        document.getElementById("sidebar").style.display = "flex";

        window.loteSelecionado = id;

        const btnContrato = document.getElementById("gerar_contrato");
        if (lote.status.toLowerCase() === "disponível") {
            btnContrato.style.display = "block";
            btnContrato.onclick = () =>
                window.abrirPopupContrato({
                    id,
                    lote: lote.lote,
                    valor: lote.valor
                });
        } else {
            btnContrato.style.display = "none";
        }
    }

    // ---------------- Fechar sidebar ----------------
    document.getElementById("sidebar-close").addEventListener("click", () => {
        document.getElementById("sidebar").style.display = "none";
    });

    // ---------------- Salvar status ----------------

    document.getElementById("btn-salvar-status").addEventListener("click", () => {
        const id = window.loteSelecionado;
        const lote = lotes[id];
        if (!lote) return;

        const novoStatus = document.getElementById("sb-status-select").value;

        fetch(`https://api-lotes.onrender.com/loteamentos/${id}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: novoStatus })
        })
            .then(res => res.json())
            .then(data => {

                lote.status = novoStatus;
                atualizarCorDoLote(id);
                atualizarTotalVendido();
                atualizarDashboard();
                gerarGraficoStatus();

                alert(`Status do lote ${lote.lote} atualizado para: ${novoStatus}`);

                document.getElementById("sidebar").style.display = "none";
            })
            .catch(err => {
                console.error("Erro ao atualizar status:", err);

                alert("Erro ao atualizar o status. Tente novamente.");
            });
    });


    function atualizarCorDoLote(id) {
        const lote = lotes[id];
        const path = document.getElementById(id);

        if (!path || !lote) return;

        const status = lote.status.toLowerCase();

        if (status === "disponível") {
            path.style.fill = "#29DE05";
            path.style.opacity = "0.5";
        } else if (status === "vendido") {
            path.style.fill = "#02b1dd";
            path.style.opacity = "0.5";
        } else if (status === "reservado") {
            path.style.fill = "#DEAB05";
            path.style.opacity = "0.5";
        } else if (status === "bloqueado") {
            path.style.fill = "#de0505";
            path.style.opacity = "0.5";
        } else {
            path.style.fill = "transparent";
            path.style.opacity = "1";
        }
    }

    // ---------------- Valores e contadores ----------------

    function parseValor(valorStr) {
        return Number(valorStr);

        valorStr = valorStr.replace(",", ".");

        return Number(valorStr);
    }

    function calcularTotalVendido() {
        let total = 0;

        for (const id in lotes) {
            const lote = lotes[id];
            if (!lote) continue;

            const valor = parseValor(lote.valor);
            total += valor;
        }

        return total;
    }

    function atualizarTotalVendido() {
        const total = calcularTotalVendido();

        document.getElementById("totalVendido").innerHTML =
            "R$ " +
            total.toLocaleString("pt-BR", {
                minimumFractionDigits: 2
            });
    }

    // ---------------------------------------

    function contarLotes() {
        return Object.keys(lotes).length;
    }

    function contarStatus() {
        let disponiveis = 0;
        let reservados = 0;
        let vendidos = 0;
        let bloqueados = 0;

        for (const id in lotes) {
            const lote = lotes[id];
            if (!lote) continue;

            const status = lote.status.toLowerCase();

            if (status === "disponível") disponiveis++;
            if (status === "reservado") reservados++;
            if (status === "vendido") vendidos++;
            if (status === "bloqueado") bloqueados++;

        }

        return { disponiveis, reservados, vendidos, bloqueados };
    }

    function atualizarDashboard() {
        const total = contarLotes();
        const { disponiveis, reservados, vendidos, bloqueados } = contarStatus();

        const elTotal = document.getElementById("totalLotes");
        const elDisp = document.getElementById("totalDisponiveis");
        const elRes = document.getElementById("totalReservados");
        const elVend = document.getElementById("qtd_lotes");
        const elBloq = document.getElementById("qtd_bloqueados");

        if (elTotal) elTotal.innerText = total;
        if (elDisp) elDisp.innerText = disponiveis;
        if (elRes) elRes.innerText = reservados;
        if (elVend) elVend.innerText = vendidos;
        if (elBloq) elBloq.innerText = bloqueados;
    }


    // ----------------------------------------------------------

    // ---------------- Arrastar o mapa ----------------

    const container = document.getElementById("container");

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;

    container.addEventListener("mousedown", (e) => {

        isDragging = true;

        container.style.cursor = "grabbing";

        startX = e.pageX;
        startY = e.pageY;

        scrollLeft = container.scrollLeft;
        scrollTop = container.scrollTop;

        e.preventDefault();

    });

    container.addEventListener("mousemove", (e) => {

        if (!isDragging) return;

        const dx = e.pageX - startX;
        const dy = e.pageY - startY;

        container.scrollLeft = scrollLeft - dx;
        container.scrollTop = scrollTop - dy;

    });

    window.addEventListener("mouseup", () => {

        isDragging = false;

        container.style.cursor = "grab";

    });

    container.addEventListener("mouseleave", () => {

        isDragging = false;

        container.style.cursor = "grab";

    });

}
