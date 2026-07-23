// ==========================================================
// CONTRATO.JS
// ==========================================================

window.loteParaContrato = null;
window.clienteSelecionado = null;

// ----------------------------------------------------------
// Abre o popup
// ----------------------------------------------------------
window.abrirPopupContrato = async function (lote) {

    window.loteParaContrato = lote;

    document.getElementById("popup-contrato").style.display = "flex";

    await carregarClientes();

};

// ----------------------------------------------------------
// Fecha popup
// ----------------------------------------------------------
document.getElementById("popup-close").addEventListener("click", () => {

    document.getElementById("popup-contrato").style.display = "none";

});

// ----------------------------------------------------------
// Carrega clientes
// ----------------------------------------------------------
async function carregarClientes() {

    const select = document.getElementById("select-clientes");

    select.innerHTML = `
        <option value="">Selecione um cliente</option>
    `;

    try {

        const response = await fetch("https://api-lotes.onrender.com/cliente");

        const json = await response.json();

        json.data.forEach(cliente => {

            const option = document.createElement("option");

            option.value = cliente.id_cliente;

            option.textContent = `${cliente.nome} - CPF ${cliente.cpf}`;

            option.dataset.cliente = JSON.stringify(cliente);

            select.appendChild(option);

        });

    } catch (erro) {

        console.error(erro);

        alert("Erro ao carregar os clientes.");

    }

}

// ----------------------------------------------------------
// Cliente selecionado
// ----------------------------------------------------------
document.getElementById("select-clientes").addEventListener("change", function () {

    if (!this.value) {

        window.clienteSelecionado = null;

        return;

    }

    window.clienteSelecionado = JSON.parse(
        this.selectedOptions[0].dataset.cliente
    );

});

// ----------------------------------------------------------
// Gerar contrato
// ----------------------------------------------------------
document.getElementById("btn-gerar-contrato-final").addEventListener("click", () => {

    const lote = window.loteParaContrato;
    const cliente = window.clienteSelecionado;

    if (!lote) {

        alert("Nenhum lote selecionado.");

        return;

    }

    if (!cliente) {

        alert("Selecione um cliente.");

        return;

    }

    const vendedora = {

        nome: "VMV INCORPORAÇÕES IMOBILIÁRIAS LTDA",
        cnpj: "46.155.250/0001-00",
        endereco: "Rua Rio Solimões 833, Sala 23, Residencial Amazonas, Franca/SP, CEP 14406-012"

    };

    const texto = `
INSTRUMENTO PARTICULAR DE COMPROMISSO DE COMPRA E VENDA

VENDEDORA

${vendedora.nome}

CNPJ: ${vendedora.cnpj}

Endereço:
${vendedora.endereco}

------------------------------------------------------------

COMPRADOR

Nome: ${cliente.nome}

CPF: ${cliente.cpf}

RG: ${cliente.rg}

Profissão: ${cliente.profissao}

Endereço:

${cliente.logradouro}, ${cliente.numero}

${cliente.bairro}

${cliente.cidade}/${cliente.uf}

CEP: ${cliente.cep}

------------------------------------------------------------

OBJETO

Lote: ${lote.lote}

ID Interno: ${lote.id}

Empreendimento:
CONDOMÍNIO PARK TABATINGA
UBATUBA/SP

------------------------------------------------------------

VALOR

${lote.valor}

------------------------------------------------------------

POSSE

A escritura será outorgada após a liberação dos valores do financiamento.

------------------------------------------------------------

FORO

Ubatuba/SP

${new Date().toLocaleDateString("pt-BR")}

------------------------------------------------------------

VENDEDORA

${vendedora.nome}

______________________________________________________

COMPRADOR

${cliente.nome}

______________________________________________________
`;

    const { Document, Packer, Paragraph } = docx;

    const doc = new Document({

        sections: [

            {

                children: [

                    new Paragraph(texto)

                ]

            }

        ]

    });

    const nomeArquivo = `Contrato_${lote.id}_${cliente.nome}.docx`;

    Packer.toBlob(doc).then(blob => {

        const link = document.createElement("a");

        link.href = URL.createObjectURL(blob);

        link.download = nomeArquivo;

        link.click();

        URL.revokeObjectURL(link.href);

    });

    document.getElementById("popup-contrato").style.display = "none";

});