(() => {

    let valorLote = 0;

    const moeda = (valor) =>
        valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    function calcular() {

        if (!valorLote) return;

        const entradaPercentual = Number(document.getElementById("percentual_entrada").value);
        const taxa = Number(document.getElementById("taxa_juros").value);
        const parcelas = Number(document.getElementById("parcelas").value);

        const entrada = valorLote * entradaPercentual;

        const saldo = valorLote - entrada;

        // PRICE
        const parcela =
            saldo *
            (taxa * Math.pow(1 + taxa, parcelas)) /
            (Math.pow(1 + taxa, parcelas) - 1);

        const totalPago = parcela * parcelas;

        const juros = totalPago - saldo;


        document.getElementById("simulacao").innerHTML = `

            <h2>Simulação</h2>

            <hr>

            <p><strong>Valor do lote:</strong> ${moeda(valorLote)}</p>

            <p><strong>Entrada:</strong> ${moeda(entrada)}</p>

            <p><strong>Saldo financiado:</strong> ${moeda(saldo)}</p>

            <p><strong>Parcelas:</strong> ${parcelas}</p>

            <p><strong>Valor da parcela:</strong> ${moeda(parcela)}</p>


        `;

    }

    function iniciarEventos() {

        document.getElementById("percentual_entrada")
            .addEventListener("change", calcular);

        document.getElementById("taxa_juros")
            .addEventListener("change", calcular);

        document.getElementById("parcelas")
            .addEventListener("change", calcular);

    }

    function descobrirValorLote() {

        const texto = document.getElementById("sb-valor").innerText;

        valorLote = Number(
            texto
                .replace("R$", "")
                .replace(/\./g, "")
                .replace(",", ".")
                .trim()
        );

        calcular();

    }

    // Sempre que o sidebar abrir
    const observer = new MutationObserver(() => {

        const sidebar = document.getElementById("sidebar");

        if (sidebar.style.display === "flex") {

            setTimeout(descobrirValorLote, 50);

        }

    });

    window.addEventListener("DOMContentLoaded", () => {

        iniciarEventos();

        observer.observe(
            document.getElementById("sidebar"),
            {
                attributes: true,
                attributeFilter: ["style"]
            }
        );

    });

})();