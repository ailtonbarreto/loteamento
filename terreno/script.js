window.addEventListener("DOMContentLoaded", () => {

    const spinner = document.getElementById('spinner');

    const popupEdit = document.getElementById('popup_edit_cadastro');
    const popupAlert = document.querySelector('.popup_alert');

    const closeEdit = document.getElementById('close-edit');
    const closeAlert = document.getElementById('close_sucess');

    const popupAlertTitle = document.getElementById('popup_title');
    const iconIndicator = document.getElementById('icon_indicator');

    const tabelaLotes = document.querySelector("#tabelotes tbody");

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


    // -------------------------------------------------------------
    // CARREGAR LOTES

    async function carregarLotes() {
        const tipo = sessionStorage.getItem("usuarioTipo");
        const id = sessionStorage.getItem("usuarioId");

        spinner.style.display = 'flex';

        try {
            const resposta = await fetch(`https://api-lotes.onrender.com/loteamentos?tipo=${tipo}&id=${id}`);
            const dados = await resposta.json();

            tabelaLotes.innerHTML = "";

            if (!Array.isArray(dados.data)) {
                spinner.style.display = 'none';
                return;
            }

            dados.data.sort((a, b) => a.lote.localeCompare(b.lote));

            dados.data.forEach(lote => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                <td>${lote.lote}</td>
                <td>${lote.metragem}</td>
                <td>R$ ${Number(lote.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                <td class="hide_mobile">${lote.nome_completo}</td>

                <td>
                    <span class="material-symbols-outlined btn-editar" data-id_lote="${lote.id_lote}">edit</span>
                </td>
            `;

                tabelaLotes.appendChild(tr);
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
        const linhas = tabelaLotes.querySelectorAll("tr");

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


    closeEdit.addEventListener("click", () => hidePopup(popupEdit));

    closeAlert.addEventListener("click", () => {
        hidePopup(popupAlert);
        hidePopup(popupEdit);
        carregarLotes();
    });

    // -------------------------------------------------------------

    const inputValor = document.getElementById("valor_edit");

    inputValor.addEventListener("input", () => {
        let v = inputValor.value;

        v = v.replace(/\D/g, "");

        if (v === "") {
            inputValor.value = "R$ 0,00";
            return;
        }

        const numero = Number(v) / 100;

        inputValor.value = numero.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    });



    // -------------------------------------------------------------
    // EDITAR LOTE (ABRIR POPUP)

    document.addEventListener("click", async (e) => {

        if (!e.target.classList.contains("btn-editar")) return;

        spinner.style.display = 'flex';

        const id = e.target.dataset.id_lote;

        const moeda = (v) => v.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });


        console.log(id)

        const resposta = await fetch(`https://api-lotes.onrender.com/lote/${id}`);
        const dados = await resposta.json();

        const lote = dados.data;

        document.getElementById("lote_edit").innerText = `Cadastro - ${lote.lote}`;

        valor_edit.value = moeda(Number(lote.valor));
        // corretor_edit.value = lote.nome_completo;

        document.getElementById("formEditCadastro").dataset.id_lote = id;

        spinner.style.display = 'none';

        showPopup(popupEdit);
    });


    // -------------------------------------------------------------
    // SALVAR EDICAO

    document.getElementById("formEditCadastro").addEventListener("submit", async function (e) {
        e.preventDefault();

        spinner.style.display = 'flex';

        const id = this.dataset.id_lote;

        const valorNumerico = parseFloat(
            inputValor.value
                .replace("R$", "")
                .replace(/\./g, "")
                .replace(",", ".")
                .trim()
        );

        const dadosAtualizados = {
            valor: valorNumerico,
        };


        try {
            const resposta = await fetch(`https://api-lotes.onrender.com/update_lote/${id}`, {
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
    carregarLotes();

});
