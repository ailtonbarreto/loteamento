window.addEventListener("DOMContentLoaded", () => {

    const spinner = document.getElementById('spinner');

    const popupCadastro = document.getElementById('popup_cadastro');
    const popupAlert = document.querySelector('.popup_alert');

    const closePopup = document.getElementById('close-cadastro');

    const closeAlert = document.getElementById('close_sucess');

    const popupAlertTitle = document.getElementById('popup_title');
    const iconIndicator = document.getElementById('icon_indicator');


    // -------------------------------------------------------------
    // FUNCOES AUXILIARES

    function showPopup(popup) {
        popup.style.display = "flex";
    }

    function hidePopup(popup) {
        popup.style.display = "none";
    }

    function showAlert(icon, color, message) {
        iconIndicator.innerHTML = icon;
        iconIndicator.style.color = color;
        popupAlertTitle.innerHTML = message;
        showPopup(popupAlert);
    }

    function resetForm(id) {
        document.getElementById(id).reset();
    }

    function formatarMoeda(valor) {
        if (!valor) return "R$ 0,00";

        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(Number(valor));
    }

    // -------------------------------------------------------------
    // ABRIR / FECHAR POPUP

    closeAlert.addEventListener("click", () => {
        hidePopup(popupAlert);
    });

    // -------------------------------------------------------------
    // CADASTRAR CLIENTE

    document.getElementById("formCadastro").addEventListener("submit", async function (e) {
        e.preventDefault();

        spinner.style.display = 'flex';

        const dados = {
            nome: nome.value,
            cpf: cpf.value,
            sexo: sexo.value,
            estado_civil: estado_civil.value,
            email: email.value,
            telefone: telefone.value,
            logradouro: endereco.value,
            numero: numero.value,
            complemento: complemento.value,
            bairro: bairro.value,
            cidade: cidade.value,
            uf: estado.value,
            cep: cep.value,
            profissao: profissao.value,
            renda: renda.value,
            id_corretor: id_corretor.value
        };

        try {
            const resposta = await fetch("https://api-lotes.onrender.com/insert_cliente", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                spinner.style.display = 'none';
                showAlert("check", "#04f755", "Cadastrado com Sucesso!");
                resetForm("formCadastro");

            } else {
                spinner.style.display = 'none';
                showAlert("close", "red", resultado.detalhe || resultado.erro);
            }

        } catch (erro) {
            alert("Erro no servidor!");
            console.error(erro);
        }
    });

});
