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

    const texto = `

INSTRUMENTO PARTICULAR DE COMPROMISSO DE COMPRA E VENDA

PULAR UMA LINHA

${vendedora.nome}, inscrita no CNPJ nº ${vendedora.cnpj} com sede à ${vendedora.endereco} 
doravante denominado(a) COMPROMITENTE VENDEDORA ou simplesmente VENDEDORA;

PULAR UMA LINHA

E, de outro lado,

PULAR UMA LINHA

${cliente.nome}, Brasileiro, ESTADO CIVIL, ${cliente.profissao}, portador do RG: ${cliente.rg},
CPF: ${cliente.cpf}, residente e ${cliente.logradouro}, ${cliente.numero}, ${cliente.bairro}, 
${cliente.cidade}/${cliente.uf}, aqui denominado, neste ato denominado de “COMPROMISSÁRIO COMPRADOR” ou, simplesmente,
"COMPRADOR", têm entre si justo e firmado o que a seguir avençam e põe em termo.

PULAR UMA LINHA

DO OBJETO DO CONTRATO

PULAR UMA LINHA

CLÁUSULA PRIMEIRA – A COMPROMITENTE VENDEDORA, na qualidade de legítima possuidora 
e proprietária, compromete-se a vender ao COMPROMISSÁRIO COMPRADOR o bem imóvel a seguir descrito:

PULAR UMA LINHA

DESCRIÇÃO TERRENO ,  LOCALIZADO NO ENDEREÇO TAL, METRAGEM..

PULAR UMA LINHA

DO PREÇO E FORMA DE PAGAMENTO

PULAR UMA LINHA

CLÁUSULA SEGUNDA – Fica ajustado o preço líquido e certo de VALOR (VALOR POR EXTENSO) 
a serem pagos pelo COMPRADOR para aquisição do objeto do presente instrumento, sendo o valor de VALOR ENTRADA 
(VALOR ENTRADA POR EXTENSO) de entrada a ser pago no ato da assinatura com o banco, e o valor residual de VALOR RESTANTE ,
(VALOR RESTANTE POR EXTENSO) será obtido através de financiamento bancário a ser feito pelo comprador.
PARÁGRAFO PRIMEIRO - A transferência do imóvel será realizada tão logo for feita a assinatura da minuta de crédito 
imobiliário perante a instituição financeira escolhida pelo comprador. O imóvel deverá ser entregue livre e desembaraçado 
de quaisquer ônus, hipotecas, encargos ou gravames, quites de impostos, taxas e contribuições, hipotecas legais ou convencionais, 
débitos de IPTU (Imposto Territorial Urbano), condomínio, água, luz, gás, entre outras dívidas provenientes do imóvel em si ou de seu uso.

PULAR UMA LINHA

DA POSSE

PULAR UMA LINHA

CLÁUSULA TERCEIRA – A escritura definitiva de venda e compra, em cumprimento ao presente compromisso, será 
outorgada ao COMPROMISSÁRIO COMPRADOR 
pela COMPROMITENTE VENDEDORA, na data da liberação dos valores de financiamento junto ao órgão financiado.

PULAR UMA LINHA


DO BEM

PULAR UMA LINHA

CLÁUSULA QUARTA – O COMPRADOR está ciente da estrutura física do imóvel objeto deste contrato, e receberá o 
imóvel sem que sejam executadas quaisquer intervenções estruturais que fujam as garantias de 
produto e prazos estipulados no Código Civil.

PULAR UMA LINHA

PULAR UMA LINHA

DOS ENCARGOS TRIBUTÁRIOS

PULAR UMA LINHA

CLÁUSULA QUINTA – O COMPRADOR passará a ser responsável pelo pagamento dos encargos 
vinculados ao imóvel objeto deste contrato, tais como 
tributos, taxas, rateio de despesas condominiais, IPTU, após a posse do imóvel, 
sendo que os débitos anteriores à entrega da posse serão 
suportados exclusivamente pela VENDEDORA.

PULAR UMA LINHA

DOS HONORÁRIOS DA INTERMEDIAÇÃO

PULAR UMA LINHA

CLÁUSULA SEXTA – A comissão de corretagem a ser paga pelo COMPRADOR será de VALOR COMISSÃO 
(VALOR COMISSÃO POR EXTENSO) no ato da compra, 
a serem depositados como pagamento de comissão do negócio na conta:

PULAR UMA LINHA

BANCO - Ag. XXX-X
PULAR UMA LINHA

Conta Corrente: XXXXXX-X
PULAR UMA LINHA

CHAVE PIX: XXXXXXX.
PULAR UMA LINHA

NOME IMOBILIÁRIA.

PULAR UMA LINHA

DA RESPONSABILIDADE DAS PARTES

PULAR UMA LINHA

CLÁUSULA SÉTIMA – O COMPRADOR ficará responsável pelas despesas da escritura e da 
transferência do registro do imóvel, 
bem como pelo trâmite do financiamento bancário em instituição de sua escolha.

PULAR UMA LINHA

PARÁGRAFO ÚNICO: No caso de descumprimento de qualquer cláusula deste contrato, ficará a 
parte inadimplente sujeita à multa de 10% (dez por cento), calculada sobre o valor 
total da venda constante na cláusula 
segunda do presente Instrumento Particular de Compromisso de Compra e Venda, bem 
como, ao pagamento dos honorários devidos à imobiliária intermediadora do negócio, 
além da restituição dos valores pagos, 
corrigidos monetariamente. Salvo exceção de impedimento bancário.

PULAR UMA LINHA

DO FORO

PULAR UMA LINHA

CLÁUSULA OITAVA – As partes contratantes elegem o Foro da cidade de CIDADE/UF 
para dirimir quaisquer questões relativas ao 
presente contrato, com a exclusão de qualquer outro, por mais privilegiado que seja. 
E por estarem assim justos e contratados, 
as partes firmam o presente contrato digitalmente, na presença de duas testemunhas, 
para que surta seus efeitos legais e de direito.

PULAR UMA LINHA

CIDADE, DATA.

PULAR UMA LINHA

${vendedora.nome}
PULAR UMA LINHA
${vendedora.cnpj} 

PULAR UMA LINHA
          
${cliente.nome}
PULAR UMA LINHA
${cliente.cpf}
PULAR UMA LINHA

CORRETOR:
PULAR UMA LINHA

TESTEMUNHAS:
PULAR UMA LINHA
Nome completo: NOME TESTEMUNHA 1
PULAR UMA LINHA
CPF: XXX.XXX.XXX-XX.
PULAR UMA LINHA
Nome completo: NOME TESTEMUNHA 2
PULAR UMA LINHA
CPF: XXX.XXX.XXX-XX.
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

    const nomeArquivo = `Contrato_${lote.id} - ${cliente.nome}.docx`;

    Packer.toBlob(doc).then(blob => {

        const link = document.createElement("a");

        link.href = URL.createObjectURL(blob);

        link.download = nomeArquivo;

        link.click();

        URL.revokeObjectURL(link.href);

    });

    document.getElementById("popup-contrato").style.display = "none";

});