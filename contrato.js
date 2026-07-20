window.abrirPopupContrato = function (lote) {
    document.getElementById("popup-contrato").style.display = "flex";
    window.loteParaContrato = lote;
};

window.addEventListener("DOMContentLoaded", () => {

    // FECHAR POPUP
    document.getElementById("popup-close").addEventListener("click", () => {
        document.getElementById("popup-contrato").style.display = "none";
    });

    // GERAR PDF
    document.getElementById("btn-gerar-contrato-final").addEventListener("click", () => {

        const nomeComprador = document.getElementById("comprador-nome").value.trim();
        const cpfComprador = document.getElementById("comprador-cpf").value.trim();
        const rgComprador = document.getElementById("comprador-rg").value.trim();
        const enderecoComprador = document.getElementById("comprador-endereco").value.trim();

        if (!nomeComprador || !cpfComprador || !rgComprador || !enderecoComprador) {
            alert("Preencha todos os dados do comprador.");
            return;
        }

        const lote = window.loteParaContrato;

        const vendedor = {
            nome: "FULANO DE TAL",
            cpf: "XXX",
            rg: "XXX",
            endereco: "Rua XXXX nº XXX, Bairro - Ubatuba/SP"
        };

        const texto = `
INSTRUMENTO PARTICULAR DE COMPROMISSO DE COMPRA E VENDA

VENDEDOR:
${vendedor.nome}, RG ${vendedor.rg}, CPF ${vendedor.cpf},
residente em ${vendedor.endereco}.

COMPRADOR:
${nomeComprador}, RG ${rgComprador}, CPF ${cpfComprador},
residente em ${enderecoComprador}.

OBJETO:
Lote ${lote.lote} (ID interno ${lote.id}), valor ${lote.valor},
localizado no CONDOMÍNIO PARK TABATINGA, UBATUBA/SP.

PREÇO:
O comprador pagará ao vendedor o valor total de ${lote.valor}.

ARREPENDIMENTO:
Contrato firmado com renúncia de arrependimento.

POSSE:
A posse será transmitida após pagamento integral.

DESPESAS:
Todas as despesas cartoriais são responsabilidade do comprador.

MULTA DE MORA:
Atraso implica multa de 20%.

RESCISÃO:
Não pagamento permite rescisão com multa de 20%.

MULTAS:
Descumprimento implica multa de 20% sobre o valor total.

FORO:
Comarca de São Paulo/SP.

Ubatuba, ${new Date().toLocaleDateString("pt-BR")}

VENDEDOR: ${vendedor.nome}
COMPRADOR: ${nomeComprador}

TESTEMUNHAS:
__________________________
__________________________
`;

        // GERAR PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        const linhas = pdf.splitTextToSize(texto, 180);
        pdf.text(linhas, 15, 15);

        pdf.save(`Contrato_${lote.id}.pdf`);

        document.getElementById("popup-contrato").style.display = "none";
    });

});
