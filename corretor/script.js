window.addEventListener("DOMContentLoaded", () => {

    const spinner = document.getElementById('spinner');

    const popupCadastro = document.getElementById('popup_cadastro');
    const popupEdit = document.getElementById('popup_edit_cadastro');
    const popupAlert = document.querySelector('.popup_alert');

    const openPopup = document.getElementById('open_popup');
    const closePopup = document.getElementById('close-cadastro');
    const closeEdit = document.getElementById('close-edit');
    const closeAlert = document.getElementById('close_sucess');

    const popupAlertTitle = document.getElementById('popup_title');
    const iconIndicator = document.getElementById('icon_indicator');

    const tabelaCorretor = document.querySelector("#tabelaCorretor tbody");

    const searchInput = document.getElementById("search_name");

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
    // CARREGAR CORRETORES

    async function carregarCorretores() {
        const tipo = sessionStorage.getItem("usuarioTipo");

        spinner.style.display = 'flex';

        try {
            const resposta = await fetch(`https://api-lotes.onrender.com/corretores?tipo=${tipo}`);
            const dados = await resposta.json();

            tabelaCorretor.innerHTML = "";

            if (!Array.isArray(dados.data)) {
                spinner.style.display = 'none';
                return;
            }

            dados.data.sort((a, b) => a.nome_completo.localeCompare(b.nome_completo));

            dados.data.forEach(corretor => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                <td>${corretor.nome_completo}</td>
                <td class="hide_mobile">${corretor.creci}</td>
                <td>${corretor.status == 1 ? "ATIVO" : "INATIVO"}</td>


                <td>
                    <span class="material-symbols-outlined btn-editar" data-id="${corretor.id}">edit</span>
                    <span class="material-symbols-outlined btn-delete" data-id="${corretor.id}">delete</span>
                </td>
            `;

                tabelaCorretor.appendChild(tr);
            });

            spinner.style.display = 'none';

        } catch (erro) {
            console.error("Erro ao carregar corretores:", erro);
            spinner.style.display = 'none';
        }
    }


    // -------------------------------------------------------------
    // FILTRAR TABELA PELO SEARCH

    searchInput.addEventListener("keyup", () => {
        const filtro = searchInput.value.toLowerCase();
        const linhas = tabelaCorretor.querySelectorAll("tr");

        linhas.forEach(linha => {
            const nome = linha.querySelector("td").innerText.toLowerCase();

            if (nome.includes(filtro)) {
                linha.style.display = "";
            } else {
                linha.style.display = "none";
            }
        });
    });

    // -------------------------------------------------------------
    // ABRIR / FECHAR POPUPS

    openPopup.addEventListener("click", () => showPopup(popupCadastro));

    closePopup.addEventListener("click", () => {
        hidePopup(popupCadastro);
        resetForm("formCadastro");
    });

    closeEdit.addEventListener("click", () => hidePopup(popupEdit));

    closeAlert.addEventListener("click", () => {
        hidePopup(popupAlert);
        hidePopup(popupCadastro);
        hidePopup(popupEdit);
        carregarCorretores();
    });

    // -------------------------------------------------------------
    // CADASTRAR CORRETOR

    document.getElementById("formCadastro").addEventListener("submit", async function (e) {
        e.preventDefault();

        spinner.style.display = 'flex';

        const dados = {
            user: user.value,
            password: password.value,
            nome_completo: nome_completo.value,
            data_nasc: data_nasc.value,
            creci: creci.value,
            cpf: cpf.value,
            conta_banc: conta_banc.value,
            bank: bank.value,
            ag: ag.value,
            pix: pix.value
        };

        try {
            const resposta = await fetch("https://api-lotes.onrender.com/insert_corretor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                spinner.style.display = 'none';
                showAlert("check", "#04f755", "Cadastrado com Sucesso!");
                resetForm("formCadastro");
                hidePopup(popupCadastro);

            } else {
                spinner.style.display = 'none';
                showAlert("close", "red", resultado.detalhe || resultado.erro);
            }

        } catch (erro) {
            alert("Erro no servidor!");
            console.error(erro);
        }
    });

    // -------------------------------------------------------------
    // EDITAR CLIENTE (ABRIR POPUP)

    document.addEventListener("click", async (e) => {
        if (!e.target.classList.contains("btn-editar")) return;

        spinner.style.display = 'flex';

        const id = e.target.dataset.id;

        const resposta = await fetch(`https://api-lotes.onrender.com/cliente/${id}`);
        const dados = await resposta.json();

        const cliente = dados.data;

        document.getElementById("cliente_nome").innerText = `Cadastro - ${cliente.nome}`;

        nome_edit.value = cliente.nome;
        cpf_edit.value = cliente.cpf;
        telefone_edit.value = cliente.telefone;
        email_edit.value = cliente.email;
        cidade_edit.value = cliente.cidade;
        estado_edit.value = cliente.uf;
        renda_edit.value = cliente.renda;
        bairro_edit.value = cliente.bairro;
        endereco_edit.value = cliente.logradouro;
        numero_edit.value = cliente.numero;
        complemento_edit.value = cliente.complemento;
        cep_edit.value = cliente.cep;
        estado_civil_edit.value = cliente.estado_civil;
        sexo_edit.value = cliente.sexo;
        profissao_edit.value = cliente.profissao;

        document.getElementById("formEditCadastro").dataset.id = id;

        spinner.style.display = 'none';

        showPopup(popupEdit);
    });

    // -------------------------------------------------------------
    // SALVAR EDICAO

    document.getElementById("formEditCadastro").addEventListener("submit", async function (e) {
        e.preventDefault();

        spinner.style.display = 'flex';



        const id = this.dataset.id;

        const dadosAtualizados = {
            nome: nome_edit.value,
            cpf: cpf_edit.value,
            telefone: telefone_edit.value,
            email: email_edit.value,
            cidade: cidade_edit.value,
            uf: estado_edit.value,
            bairro: bairro_edit.value,
            logradouro: endereco_edit.value,
            numero: numero_edit.value,
            complemento: complemento_edit.value,
            cep: cep_edit.value,
            estado_civil: estado_civil_edit.value,
            sexo: sexo_edit.value,
            profissao: profissao_edit.value,
            renda: renda_edit.value
        };

        try {
            const resposta = await fetch(`https://api-lotes.onrender.com/update_cliente/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosAtualizados)
            });


            const resultado = await resposta.json();

            if (resposta.ok) {
                hidePopup(popupEdit);
                showAlert("check", "#04f755", "Cadastro atualizado com sucesso!");
                spinner.style.display = 'none';
            } else {
                spinner.style.display = 'none';
                showAlert("close", "red", resultado.erro || resultado.detalhe);
            }

        } catch (erro) {
            console.error("Erro no UPDATE:", erro);
            alert("Erro no servidor ao atualizar!");
        }
    });

    // -------------------------------------------------------------
    // DELETAR CLIENTE

    const popupConfirm = document.querySelector(".popup_confirm_delete");
    const btnConfirmDelete = document.getElementById("confirm_delete");
    const btnCancelDelete = document.getElementById("cancel_delete_confirm");

    let idParaDeletar = null;

    document.addEventListener("click", (e) => {
        if (!e.target.classList.contains("btn-delete")) return;

        idParaDeletar = e.target.dataset.id;

        console.log(idParaDeletar)

        popupConfirm.style.display = "flex";
    });

    btnCancelDelete.addEventListener("click", () => {
        popupConfirm.style.display = "none";
        idParaDeletar = null;
    });

    btnConfirmDelete.addEventListener("click", async () => {

        spinner.style.display = "flex";


        try {
            const resposta = await fetch(`https://api-lotes.onrender.com/delete_corretor/${idParaDeletar}`, {
                method: "DELETE"
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                spinner.style.display = "none";
                showAlert("check", "#04f755", "Corretor deletado com sucesso!");
            } else {
                spinner.style.display = "none";
                showAlert("close", "red", resultado.erro || resultado.detalhe);
            }

        } catch (erro) {
            console.error("Erro ao deletar Corretor:", erro);
            alert("Erro no servidor ao deletar!");
        }

        popupConfirm.style.display = "none";
        idParaDeletar = null;
    });


    // -------------------------------------------------------------
    carregarCorretores();

});
