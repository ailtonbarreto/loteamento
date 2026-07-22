window.abrirPopupContrato = function (lote) {
    document.getElementById("popup-contrato").style.display = "flex";
    window.loteParaContrato = lote;
};

// ===============================
// CARREGAR CLIENTES NO SELECT
// ===============================
async function carregarClientes() {
    try {
        const response = await fetch("https://api-lotes.onrender.com/cliente");
        const json = await response.json();

        const clientes = json.data;
        const select = document.getElementById("select-clientes");

        select.innerHTML = `<option value="">Selecione um cliente</option>`;

        clientes.forEach(cliente => {
            const option = document.createElement("option");
            option.value = cliente.id_cliente;
            option.textContent = cliente.nome;
            select.appendChild(option);
        });

    } catch (err) {
        console.error("Erro ao carregar clientes:", err);
    }
}

// ===============================
// AO SELECIONAR CLIENTE → MOSTRAR NOME
// ===============================
document.getElementById("select-clientes").addEventListener("change", async (e) => {
    const id = e.target.value;

    if (!id) {
        document.getElementById("cliente").textContent = "Gerar Contrato no Nome de";
        return;
    }

    const response = await fetch(`https://api-lotes.onrender.com/cliente/${id}`);
    const json = await response.json();

    const cliente = json.data;

    // Exibe o nome no título
    document.getElementById("cliente").textContent = `Gerar Contrato no Nome de: ${cliente.nome}`;

    // Guarda o cliente para o contrato
    window.clienteSelecionado = cliente;
});

// ===============================
// INICIAR AO CARREGAR A PÁGINA
// ===============================
window.addEventListener("DOMContentLoaded", () => {

    carregarClientes();

    // FECHAR POPUP
    document.getElementById("popup-close").addEventListener("click", () => {
        document.getElementById("popup-contrato").style.display = "none";
    });

    // GERAR PDF
    document.getElementById("btn-gerar-contrato-final").addEventListener("click", () => {

        const lote = window.loteParaContrato;
        const cliente = window.clienteSelecionado;

        if (!cliente) {
            alert("Selecione um cliente antes de gerar o contrato.");
            return;
        }

        const vendedora = {
            nome: "VMV INCORPORAÇÕES IMOBILIÁRIAS LTDA",
            cnpj: "46.155.250/0001-00",
            endereco: "Rua Rio Solimões 833, Sala 23, Residencial Amazonas, Franca/SP, CEP 14406-012"
        };

        const texto = `
INSTRUMENTO PARTICULAR DE COMPROMISSO DE COMPRA E VENDA

${vendedora.nome}, inscrita no CNPJ nº ${vendedora.cnpj}, com sede à ${vendedora.endereco}, doravante denominada COMPROMITENTE VENDEDORA ou simplesmente VENDEDORA;

COMPRADOR:
${cliente.nome}

DO OBJETO DO CONTRATO
CLÁUSULA PRIMEIRA – A COMPROMITENTE VENDEDORA compromete-se a vender ao COMPRADOR o imóvel descrito:
Lote ${lote.lote}, ID interno ${lote.id}, localizado no CONDOMÍNIO PARK TABATINGA, UBATUBA/SP.

DO PREÇO E FORMA DE PAGAMENTO
CLÁUSULA SEGUNDA – O comprador pagará o valor total de ${lote.valor}.

PARÁGRAFO PRIMEIRO – A transferência será realizada após assinatura da minuta de crédito imobiliário.

DA POSSE
CLÁUSULA TERCEIRA – A escritura definitiva será outorgada após liberação dos valores do financiamento.

DO BEM
CLÁUSULA QUARTA – O imóvel será entregue conforme estrutura física existente.

DOS ENCARGOS TRIBUTÁRIOS
CLÁUSULA QUINTA – Encargos passam a ser responsabilidade do comprador após a posse.

DOS HONORÁRIOS DA INTERMEDIAÇÃO
CLÁUSULA SEXTA – Comissão conforme acordado entre as partes.

DA RESPONSABILIDADE DAS PARTES
CLÁUSULA SÉTIMA – O comprador arcará com despesas de escritura e registro.

PARÁGRAFO ÚNICO – Descumprimento implica multa de 10% sobre o valor total da venda.

DO FORO
CLÁUSULA OITAVA – Fica eleito o foro de Ubatuba/SP.

Ubatuba, ${new Date().toLocaleDateString("pt-BR")}

VENDEDORA: ${vendedora.nome}
COMPRADOR: ${cliente.nome}

____________________________________
____________________________________
`;

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: "mm", format: "a4" });

        const linhas = pdf.splitTextToSize(texto, 180);
        pdf.text(linhas, 15, 15);

        pdf.save(`Contrato_${lote.id}_${cliente.nome}.pdf`);

        document.getElementById("popup-contrato").style.display = "none";
    });

});
