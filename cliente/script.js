window.addEventListener("DOMContentLoaded", () => {

    const popupCadastro = document.getElementById('popup_cadastro');
    const popupEdit = document.getElementById('popup_edit_cadastro');
    const popupAlert = document.querySelector('.popup_alert');

    const openPopup = document.getElementById('open_popup');
    const closePopup = document.getElementById('close-cadastro');
    const closeEdit = document.getElementById('close-edit');
    const closeAlert = document.getElementById('close_sucess');

    const popupAlertTitle = document.getElementById('popup_title');
    const iconIndicator = document.getElementById('icon_indicator');

    const tabelaCliente = document.querySelector("#tabelaCliente tbody");

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
    // CARREGAR CLIENTES

    async function carregarClientes() {
        const tipo = sessionStorage.getItem("usuarioTipo");
        const id = sessionStorage.getItem("usuarioId");

        try {
            const resposta = await fetch(`https://api-lotes.onrender.com/cliente?tipo=${tipo}&id=${id}`);
            const dados = await resposta.json();

            tabelaCliente.innerHTML = "";

            if (!Array.isArray(dados.data)) return;

            dados.data.forEach(cliente => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${cliente.nome}</td>
                    <td>${cliente.cpf}</td>
                    <td>${cliente.telefone}</td>
                    <td>${cliente.cidade} - ${cliente.uf}</td>
                    <td>${formatarMoeda(cliente.renda)}</td>

                    <td>
                        <span class="material-symbols-outlined btn-editar" data-id="${cliente.id_cliente}">edit</span>
                        <span class="material-symbols-outlined btn-delete" data-id="${cliente.id_cliente}">delete</span>
                    </td>
                `;

                tabelaCliente.appendChild(tr);
            });

        } catch (erro) {
            console.error("Erro ao carregar clientes:", erro);
        }
    }

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
    });

    // -------------------------------------------------------------
    // CADASTRAR CLIENTE

    document.getElementById("formCadastro").addEventListener("submit", async function (e) {
        e.preventDefault();

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
            id_corretor: sessionStorage.getItem("usuarioId")
        };

        try {
            const resposta = await fetch("https://api-lotes.onrender.com/insert_cliente", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                showAlert("check", "green", "Cadastrado com Sucesso!");
                resetForm("formCadastro");
                carregarClientes();
            } else {
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

        showPopup(popupEdit);
    });

    // -------------------------------------------------------------
    // SALVAR EDICAO

    document.getElementById("formEditCadastro").addEventListener("submit", async function (e) {
        e.preventDefault();

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
                showAlert("check", "green", "Cadastro atualizado com sucesso!");
                carregarClientes();
            } else {
                showAlert("close", "red", resultado.erro || resultado.detalhe);
            }

        } catch (erro) {
            console.error("Erro no UPDATE:", erro);
            alert("Erro no servidor ao atualizar!");
        }
    });

    // -------------------------------------------------------------
    // DELETAR CLIENTE

    document.addEventListener("click", async (e) => {
        if (!e.target.classList.contains("btn-delete")) return;

        const id = e.target.dataset.id;

        if (!confirm("Deseja realmente excluir este cliente?")) return;

        try {
            const resposta = await fetch(`https://api-lotes.onrender.com/delete_cliente/${id}`, {
                method: "DELETE"
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                showAlert("check", "green", "Cliente deletado com sucesso!");
                carregarClientes();
            } else {
                showAlert("close", "red", resultado.erro || resultado.detalhe);
            }

        } catch (erro) {
            console.error("Erro ao deletar cliente:", erro);
            alert("Erro no servidor ao deletar!");
        }
    });

    // -------------------------------------------------------------
    carregarClientes();

});
