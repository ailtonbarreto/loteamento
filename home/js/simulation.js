(() => {

    let valorLote = 0;

    const moeda = (valor) =>
        valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    function calcular() {

        if (!valorLote) return;

        const taxa = Number(document.getElementById("taxa_juros").value);
        const parcelas = Number(document.getElementById("parcelas").value);
        const tipo = document.getElementById("tipo_financiamento").value;

        const entrada = Number(document.getElementById("valor_entrada").value) || 0;
        const saldo = valorLote - entrada;

        let html = `
            <h2>Simulação</h2>
            <hr>
            <p><strong>Valor do lote:</strong> ${moeda(valorLote)}</p>
            <p><strong>Entrada:</strong> ${moeda(entrada)}</p>
            <p><strong>Saldo financiado:</strong> ${moeda(saldo)}</p>
            <p><strong>Parcelas:</strong> ${parcelas}</p>
            <p><strong>Tipo:</strong> ${tipo.toUpperCase()}</p>
        `;

        // PRICE
        if (tipo === "price") {

            const parcela =
                saldo *
                (taxa * Math.pow(1 + taxa, parcelas)) /
                (Math.pow(1 + taxa, parcelas) - 1);

            html += `
                <p><strong>Valor da parcela:</strong> ${moeda(parcela)}</p>
            `;
        }

        // SAC
        if (tipo === "sac") {

            const amortizacao = saldo / parcelas;

            const jurosPrimeira = saldo * taxa;
            const parcelaPrimeira = amortizacao + jurosPrimeira;

            const jurosUltima = (saldo - amortizacao * (parcelas - 1)) * taxa;
            const parcelaUltima = amortizacao + jurosUltima;

            html += `
                <p><strong>Primeira parcela:</strong> ${moeda(parcelaPrimeira)}</p>
                <p><strong>Última parcela:</strong> ${moeda(parcelaUltima)}</p>
            `;
        }

        document.getElementById("simulacao").innerHTML = html;
    }

    function iniciarEventos() {

        document.getElementById("valor_entrada")
            .addEventListener("input", calcular);

        document.getElementById("taxa_juros")
            .addEventListener("change", calcular);

        document.getElementById("parcelas")
            .addEventListener("change", calcular);

        document.getElementById("tipo_financiamento")
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

function gerarPropostaDOCX({
    nomeComprador,
    identificacaoLote,
    loteamento,
    cidadeUF,
    valorTotal,
    entrada,
    saldoFinanciado,
    parcelas,
    valorParcela,
    diaVencimento,
    validade,
    vendedor,
    telefone,
    email
}) {

    const { Document, Packer, Paragraph, TextRun } = docx;

    const texto = [
        `Proposta de Venda de Lote`,
        ``,
        `Prezado(a) Sr.(a) ${nomeComprador},`,
        `Apresentamos a presente proposta para aquisição do lote ${identificacaoLote}, localizado em ${loteamento}, na cidade de ${cidadeUF}.`,
        `O valor total do lote é de ${valorTotal}. Para formalização da negociação, será paga uma entrada no valor de ${entrada}, no ato da assinatura do contrato ou conforme combinado entre as partes.`,
        `O saldo restante, no valor de ${saldoFinanciado}, será financiado em ${parcelas} parcelas mensais de ${valorParcela}, com vencimento todo dia ${diaVencimento} de cada mês.`,
        `As parcelas poderão ser reajustadas conforme o índice previsto em contrato, caso aplicável. Eventuais taxas, despesas de escritura, registro, impostos, transferências ou demais custos relacionados à regularização do imóvel serão de responsabilidade de comprador/vendedor/conforme negociação.`,
        `A venda ficará condicionada à análise cadastral do comprador, à disponibilidade do lote e à assinatura do contrato definitivo de compra e venda.`,
        `Esta proposta terá validade até ${validade}. Após esse prazo, os valores e condições poderão ser alterados sem aviso prévio.`,
        `Estando de acordo com as condições acima, solicitamos a confirmação do aceite para darmos continuidade ao processo de venda.`,
        ``,
        `Atenciosamente,`,
        `${vendedor}`,
        `${telefone}`,
        `${email}`
    ];

    const paragrafos = texto.map(linha => new Paragraph({
        children: [
            new TextRun({
                text: linha,
                size: 28
            })
        ],
        spacing: { after: 200 }
    }));


    const doc = new Document({
        sections: [{
            properties: {},
            children: paragrafos
        }]
    });

    Packer.toBlob(doc).then(blob => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "proposta.docx";
        link.click();
    });
}

// -------------------------------------------------------------------------------------
// ABRIR POPUP DE GERAR PROPOSTA

document.getElementById("popup-simulacao-close").addEventListener("click", () => {

    const popup_reserva = document.getElementById("popup-simulacao");
    popup_reserva.style.display = "none";

});

// -------------------------------------------------------------------------------------

document.getElementById("gerar-reserva").addEventListener("click", () => {

    const popup_reserva = document.getElementById("popup-simulacao");
    carregarClientes();
    popup_reserva.style.display = "flex";

});

// ------------------------------------------------------------------------------------

async function carregarClientes() {

    const comprador_select = document.getElementById("select-clientes-simulacao");

    comprador_select.innerHTML = `
        <option value="">Selecione um cliente</option>
    `;

    try {

        const response = await fetch("https://api-lotes.onrender.com/cliente");
        const json = await response.json();

        json.data.forEach(cliente => {

            const option = document.createElement("option");

            option.value = cliente.id_cliente;
            option.textContent = cliente.nome.toUpperCase();
            option.dataset.cliente = JSON.stringify(cliente);

            comprador_select.appendChild(option);

        });

    } catch (erro) {
        console.error(erro);
        alert("Erro ao carregar os clientes.");
    }
}

// ----------------------------------------------------------

document.getElementById("btn-gerar-simulacao").addEventListener("click", () => {

    const comprador_select = document.getElementById("select-clientes-simulacao");
    const option = comprador_select.selectedOptions[0];

    if (!option || !option.dataset.cliente) {
        alert("Selecione um cliente antes de gerar a proposta.");
        return;
    }

    const cliente = JSON.parse(option.dataset.cliente);

    const entrada = Number(document.getElementById("valor_entrada").value || 0);
    const taxa = Number(document.getElementById("taxa_juros").value);
    const parcelas = Number(document.getElementById("parcelas").value);
    const tipo = document.getElementById("tipo_financiamento").value;

    const textoValorLote = document.getElementById("sb-valor").innerText;
    const valorLote = Number(
        textoValorLote.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
    );

    const saldoFinanciado = valorLote - entrada;

    let valorParcela = 0;

    if (tipo === "price") {
        valorParcela =
            saldoFinanciado *
            (taxa * Math.pow(1 + taxa, parcelas)) /
            (Math.pow(1 + taxa, parcelas) - 1);
    }

    if (tipo === "sac") {
        const amortizacao = saldoFinanciado / parcelas;
        const jurosPrimeira = saldoFinanciado * taxa;
        valorParcela = amortizacao + jurosPrimeira;
    }

    const moeda = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    gerarPropostaDOCX({
        nomeComprador: cliente.nome,
        identificacaoLote: document.getElementById("sb-lote").innerText,
        loteamento: "Loteamento Horizontal",
        cidadeUF: `${cliente.cidade}/${cliente.uf}`,
        valorTotal: moeda(valorLote),
        entrada: moeda(entrada),
        saldoFinanciado: moeda(saldoFinanciado),
        parcelas,
        valorParcela: moeda(valorParcela),
        diaVencimento: "10",
        validade: "30 dias",
        vendedor: "Nome do corretor",
        telefone: cliente.telefone || "Não informado",
        email: cliente.email || "Não informado"
    });

    document.getElementById("popup-simulacao").style.display = "none";
});


