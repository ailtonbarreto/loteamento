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

document.getElementById("gerar-reserva").addEventListener("click", () => {

    console.log("clicou");

    gerarPropostaDOCX({
        // nomeComprador: document.getElementById("nome_comprador").value,
        nomeComprador: "Nome Comprador",
        identificacaoLote: "Id do Lote",
        loteamento: "loteamento",
        cidadeUF: "cidade/UF",
        valorTotal: "R$ 0,00",
        // entrada: moeda(Number(document.getElementById("valor_entrada").value || 0)),
        entrada: "R$ 0,00",

        // saldoFinanciado: moeda(valorLote - Number(document.getElementById("valor_entrada").value || 0)),
        saldoFinanciado: "R$ 0,00",

        parcelas: "0",
        valorParcela: "R$ 0,00",
        diaVencimento: "DD/MM/AAAA",
        validade: "DD/MM/AAAA",
        vendedor: "corretor_nome",
        telefone: "xxxxxxxxxxxx",
        email: "teste@email.com"
    });

});

