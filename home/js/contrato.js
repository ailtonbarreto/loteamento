window.loteParaContrato = null;
window.clienteSelecionado = null;

// ----------------------------------------------------------
// Abre o popup

window.abrirPopupContrato = async function (lote) {

    window.loteParaContrato = lote;

    document.getElementById("popup-contrato").style.display = "flex";

    await carregarClientes();

};

// ----------------------------------------------------------
// Fecha popup

document.getElementById("popup-close").addEventListener("click", () => {

    document.getElementById("popup-contrato").style.display = "none";

});

// ----------------------------------------------------------
// Carrega clientes

async function carregarClientes() {

    const select = document.getElementById("select-clientes");
    const corretor_id = JSON.parse(sessionStorage.getItem("usuarioId"));
    const user_tipo = JSON.parse(sessionStorage.getItem("usuarioTipo"));

    select.innerHTML = `
        <option value="">Selecione um cliente</option>
    `;

    try {

        const url = `https://api-lotes.onrender.com/cliente?tipo=${user_tipo}&id=${corretor_id}`;

        const response = await fetch(url);
        const json = await response.json();

        json.data.forEach(cliente => {

            const option = document.createElement("option");
            option.value = cliente.id_cliente;
            option.textContent = cliente.nome.toUpperCase();
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

document.getElementById("btn-gerar-contrato-final").addEventListener("click", () => {

    const lote = window.loteParaContrato;
    const cliente = window.clienteSelecionado;
    const entrada = Number(document.getElementById("valor_entrada").value || 0);
    const saldoFinanciado = lote.valor - entrada;

    if (!lote) {
        alert("Nenhum lote selecionado.");
        return;
    }

    if (!cliente) {
        alert("Selecione um cliente.");
        return;
    }

    const vendedora = {
        nome: "LOTEADORA NOME",
        cnpj: "XX.XXX.XXX/XXXX-XX",
        endereco: "NOME DA RUA, NÚMERO, BAIRRO, CIDADE/UF, CEP: XXXXXX-XXX"
    };

    const {
        Document,
        Packer,
        Paragraph,
        TextRun,
        AlignmentType,
        LineRuleType
    } = docx;

    const paragrafos = [

        // TÍTULO
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 500 },
            children: [
                new TextRun({
                    text: "INSTRUMENTO PARTICULAR DE COMPROMISSO DE COMPRA E VENDA",
                    bold: true,
                    font: "Times New Roman",
                    size: 28
                })
            ]
        }),

        // VENDEDORA
        new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { firstLine: 720 },
            spacing: { line: 360, lineRule: LineRuleType.AUTO, after: 250 },
            children: [
                new TextRun({
                    text: `${vendedora.nome}, inscrita no CNPJ nº ${vendedora.cnpj} com sede à ${vendedora.endereco} doravante denominado(a) COMPROMITENTE VENDEDORA ou simplesmente VENDEDORA;`,
                    font: "Times New Roman",
                    size: 24
                })
            ]
        }),


        // "E, de outro lado,"
        new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { firstLine: 720 },
            spacing: { line: 360, lineRule: LineRuleType.AUTO, after: 250 },
            children: [
                new TextRun({
                    text: "E, de outro lado,",
                    font: "Times New Roman",
                    size: 24
                })
            ]
        }),

        // COMPRADOR
        new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { firstLine: 720 },
            spacing: { line: 360, lineRule: LineRuleType.AUTO, after: 250 },
            children: [
                new TextRun({
                    text: `${cliente.nome.toUpperCase()}, brasileiro, ESTADO CIVIL, ${cliente.profissao}, portador do CPF: ${cliente.cpf}, residente e ${cliente.logradouro}, ${cliente.numero}, ${cliente.bairro}, ${cliente.cidade}/${cliente.uf}, neste ato denominado de “COMPROMISSÁRIO COMPRADOR” ou, simplesmente, "COMPRADOR", têm entre si justo e firmado o que a seguir avençam e põe em termo.`,
                    font: "Times New Roman",
                    size: 24
                })
            ]
        }),

        // LINHA EM BRANCO
        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),

        // DO OBJETO DO CONTRATO
        new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 250 },
            children: [
                new TextRun({
                    text: "DO OBJETO DO CONTRATO",
                    bold: true,
                    font: "Times New Roman",
                    size: 26
                })
            ]
        }),

        // LINHA EM BRANCO
        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),

        // CLÁUSULA PRIMEIRA
        new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { firstLine: 720 },
            spacing: { line: 360, lineRule: LineRuleType.AUTO, after: 250 },
            children: [
                new TextRun({
                    text: "CLÁUSULA PRIMEIRA – A COMPROMITENTE VENDEDORA, na qualidade de legítima possuidora e proprietária, compromete-se a vender ao COMPROMISSÁRIO COMPRADOR o bem imóvel a seguir descrito:",
                    font: "Times New Roman",
                    size: 24
                })
            ]
        }),

        // LINHA EM BRANCO
        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),

        // DESCRIÇÃO TERRENO
        new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { firstLine: 720 },
            spacing: { line: 360, lineRule: LineRuleType.AUTO, after: 250 },
            children: [
                new TextRun({
                    text: "DESCRIÇÃO TERRENO ,  LOCALIZADO NO ENDEREÇO TAL, METRAGEM..",
                    font: "Times New Roman",
                    size: 24
                })
            ]
        }),

        // LINHA EM BRANCO
        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),

        // DO PREÇO E FORMA DE PAGAMENTO
        new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 250 },
            children: [
                new TextRun({
                    text: "DO PREÇO E FORMA DE PAGAMENTO",
                    bold: true,
                    font: "Times New Roman",
                    size: 26
                })
            ]
        }),

        // LINHA EM BRANCO
        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),

        // CLÁUSULA SEGUNDA
        new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { firstLine: 720 },
            spacing: { line: 360, lineRule: LineRuleType.AUTO, after: 250 },
            children: [
                new TextRun({
                    text: `CLÁUSULA SEGUNDA – Fica ajustado o preço líquido e certo de ${lote.valor} a serem pagos pelo COMPRADOR para aquisição do objeto do presente instrumento, sendo o valor de ${entrada} de entrada a ser pago no ato da assinatura com o banco, e o valor residual de ${saldoFinanciado}, será obtido através de financiamento bancário a ser feito pelo comprador.`,
                    font: "Times New Roman",
                    size: 24
                }),
            ]
        }),

        // LINHA EM BRANCO
        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),

        new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { firstLine: 720 },
            spacing: { line: 360, lineRule: LineRuleType.AUTO, after: 250 },
            children: [
                new TextRun({
                    text: "PARÁGRAFO PRIMEIRO - A transferência do imóvel será realizada tão logo for feita a assinatura da minuta de crédito imobiliário perante a instituição financeira escolhida pelo comprador. O imóvel deverá ser entregue livre e desembaraçado de quaisquer ônus, hipotecas, encargos ou gravames, quites de impostos, taxas e contribuições, hipotecas legais ou convencionais, débitos de IPTU (Imposto Territorial Urbano), condomínio, água, luz, gás, entre outras dívidas provenientes do imóvel em si ou de seu uso.",
                    font: "Times New Roman",
                    size: 24
                })
            ]
        }),

        // LINHA EM BRANCO
        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),

        // DA POSSE
        new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 250 },
            children: [
                new TextRun({
                    text: "DA POSSE",
                    bold: true,
                    font: "Times New Roman",
                    size: 26
                })
            ]
        }),

        // LINHA EM BRANCO
        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),

        // CLÁUSULA TERCEIRA
        new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { firstLine: 720 },
            spacing: { line: 360, lineRule: LineRuleType.AUTO, after: 250 },
            children: [
                new TextRun({
                    text: "CLÁUSULA TERCEIRA – A escritura definitiva de venda e compra, em cumprimento ao presente compromisso, será outorgada ao COMPROMISSÁRIO COMPRADOR pela COMPROMITENTE VENDEDORA, na data da liberação dos valores de financiamento junto ao órgão financiado.",
                    font: "Times New Roman",
                    size: 24
                })
            ]
        }),

        // LINHA EM BRANCO
        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),

        // DO BEM
        new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 250 },
            children: [
                new TextRun({
                    text: "DO BEM",
                    bold: true,
                    font: "Times New Roman",
                    size: 26
                })
            ]
        }),

        // LINHA EM BRANCO
        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),

        // CLÁUSULA QUARTA
        new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { firstLine: 720 },
            spacing: { line: 360, lineRule: LineRuleType.AUTO, after: 250 },
            children: [
                new TextRun({
                    text: "CLÁUSULA QUARTA – O COMPRADOR está ciente da estrutura física do imóvel objeto deste contrato, e receberá o imóvel sem que sejam executadas quaisquer intervenções estruturais que fujam as garantias de produto e prazos estipulados no Código Civil.",
                    font: "Times New Roman",
                    size: 24
                })
            ]
        }),

        // LINHA EM BRANCO DUPLA

        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),


        new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 250 },
            children: [
                new TextRun({
                    text: "DOS ENCARGOS TRIBUTÁRIOS",
                    bold: true,
                    font: "Times New Roman",
                    size: 26
                })
            ]
        }),

        // LINHA EM BRANCO
        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),

        // CLÁUSULA QUINTA
        new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { firstLine: 720 },
            spacing: { line: 360, lineRule: LineRuleType.AUTO, after: 250 },
            children: [
                new TextRun({
                    text: "CLÁUSULA QUINTA – O COMPRADOR passará a ser responsável pelo pagamento dos encargos vinculados ao imóvel objeto deste contrato, tais como tributos, taxas, rateio de despesas condominiais, IPTU, após a posse do imóvel, sendo que os débitos anteriores à entrega da posse serão suportados exclusivamente pela VENDEDORA.",
                    font: "Times New Roman",
                    size: 24
                })
            ]
        }),

        // LINHA EM BRANCO
        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),

        // DOS HONORÁRIOS DA INTERMEDIAÇÃO
        new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 250 },
            children: [
                new TextRun({
                    text: "DOS HONORÁRIOS DA INTERMEDIAÇÃO",
                    bold: true,
                    font: "Times New Roman",
                    size: 26
                })
            ]
        }),

        // LINHA EM BRANCO
        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),

        // CLÁUSULA SEXTA
        new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { firstLine: 720 },
            spacing: { line: 360, lineRule: LineRuleType.AUTO, after: 250 },
            children: [
                new TextRun({
                    text: "CLÁUSULA SEXTA – A comissão de corretagem a ser paga pelo COMPRADOR será de VALOR COMISSÃO (VALOR COMISSÃO POR EXTENSO) no ato da compra, a serem depositados como pagamento de comissão do negócio na conta:",
                    font: "Times New Roman",
                    size: 24
                })
            ]
        }),

        // LINHA EM BRANCO
        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),

        // DADOS BANCÁRIOS
        new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { firstLine: 720 },
            children: [
                new TextRun({
                    text: "BANCO - Ag. XXX-X",
                    font: "Times New Roman",
                    size: 24
                })
            ]
        }),
        // new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),
        new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { firstLine: 720 },
            children: [
                new TextRun({
                    text: "Conta Corrente: XXXXXX-X",
                    font: "Times New Roman",
                    size: 24
                })
            ]
        }),
        // new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),
        new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { firstLine: 720 },
            children: [
                new TextRun({
                    text: "CHAVE PIX: XXXXXXX.",
                    font: "Times New Roman",
                    size: 24
                })
            ]
        }),
        // new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),
        new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { firstLine: 720 },
            children: [
                new TextRun({
                    text: "NOME BENEFICIADO.",
                    font: "Times New Roman",
                    size: 24
                })
            ]
        }),

        // LINHA EM BRANCO
        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),

        // DA RESPONSABILIDADE DAS PARTES
        new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 250 },
            children: [
                new TextRun({
                    text: "DA RESPONSABILIDADE DAS PARTES",
                    bold: true,
                    font: "Times New Roman",
                    size: 26
                })
            ]
        }),

        // LINHA EM BRANCO
        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),

        // CLÁUSULA SÉTIMA
        new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { firstLine: 720 },
            spacing: { line: 360, lineRule: LineRuleType.AUTO, after: 250 },
            children: [
                new TextRun({
                    text: "CLÁUSULA SÉTIMA – O COMPRADOR ficará responsável pelas despesas da escritura e da transferência do registro do imóvel, bem como pelo trâmite do financiamento bancário em instituição de sua escolha.",
                    font: "Times New Roman",
                    size: 24
                }),
            ]
        }),

        new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { firstLine: 720 },
            spacing: { line: 360, lineRule: LineRuleType.AUTO, after: 250 },
            children: [

                new TextRun({
                    text: " PARÁGRAFO ÚNICO: No caso de descumprimento de qualquer cláusula deste contrato, ficará a parte inadimplente sujeita à multa de 10% (dez por cento), calculada sobre o valor total da venda constante na cláusula segunda do presente Instrumento Particular de Compromisso de Compra e Venda, bem como, ao pagamento dos honorários devidos à imobiliária intermediadora do negócio, além da restituição dos valores pagos, corrigidos monetariamente. Salvo exceção de impedimento bancário.",
                    font: "Times New Roman",
                    size: 24
                })
            ]
        }),

        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),

        // DO FORO
        new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 250 },
            children: [
                new TextRun({
                    text: "DO FORO",
                    bold: true,
                    font: "Times New Roman",
                    size: 26
                })
            ]
        }),

        // LINHA EM BRANCO
        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),

        // CLÁUSULA OITAVA
        new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { firstLine: 720 },
            spacing: { line: 360, lineRule: LineRuleType.AUTO, after: 250 },
            children: [
                new TextRun({
                    text: "CLÁUSULA OITAVA – As partes contratantes elegem o Foro da cidade de CIDADE/UF para dirimir quaisquer questões relativas ao presente contrato, com a exclusão de qualquer outro, por mais privilegiado que seja. E por estarem assim justos e contratados, as partes firmam o presente contrato digitalmente, na presença de duas testemunhas, para que surta seus efeitos legais e de direito.",
                    font: "Times New Roman",
                    size: 24
                })
            ]
        }),

        // LINHA EM BRANCO
        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),

        // CIDADE, DATA.
        new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
                new TextRun({
                    text: "CIDADE, DATA.",
                    font: "Times New Roman",
                    size: 24
                })
            ]
        }),

        // LINHA EM BRANCO
        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),

        // ASSINATURAS
        new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
                new TextRun({
                    text: vendedora.nome,
                    font: "Times New Roman",
                    size: 24
                })
            ]
        }),
        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),
        new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
                new TextRun({
                    text: vendedora.cnpj,
                    font: "Times New Roman",
                    size: 24
                })
            ]
        }),
        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),
        new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
                new TextRun({
                    text: cliente.nome.toUpperCase() + " - CPF: " + cliente.cpf,
                    font: "Times New Roman",
                    size: 24
                })
            ]
        }),

        new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman", size: 24 })] }),

        new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
                new TextRun({
                    text: "CORRETOR:",
                    font: "Times New Roman",
                    size: 24
                })
            ]
        }),

    ];

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: paragrafos
            }
        ]
    });

    const nomeArquivo = `Contrato Lote ${lote.id} - ${cliente.nome}.docx`;

    Packer.toBlob(doc).then(blob => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = nomeArquivo;
        link.click();
        URL.revokeObjectURL(link.href);
    });

    document.getElementById("popup-contrato").style.display = "none";
});

