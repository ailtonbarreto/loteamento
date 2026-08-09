window.addEventListener("DOMContentLoaded", () => {

    const popup_cad_comprador = document.getElementById('popup_cadastro');
    const open_popup = document.getElementById('open_popup');
    const close_popup = document.getElementById('close-cadastro');


    const popup_edit_cadastro = document.getElementById('popup_edit_cadastro');
    const close_edit_cadastro = document.getElementById('close-edit');

    const tabelCliente = document.getElementById('tabelaCliente');

    const popup_sucess = document.querySelector('.popup_sucess');
    const close_sucess = document.getElementById('close_sucess');

    async function carregarClientes() {
        const user_tipo = sessionStorage.getItem("usuarioTipo");
        const corretor_id = sessionStorage.getItem("usuarioId");

        try {
            const url = `https://api-lotes.onrender.com/cliente?tipo=${user_tipo}&id=${corretor_id}`;
            const resposta = await fetch(url);
            const clientes = await resposta.json();

            const tbody = document.querySelector("#tabelaCliente tbody");
            tbody.innerHTML = "";

            if (!Array.isArray(clientes.data)) {
                console.error("API não retornou lista de clientes em 'data'");
                return;
            }

            clientes.data.forEach(cliente => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${cliente.nome}</td>
                    <td>${cliente.cpf}</td>
                    <td>${cliente.telefone}</td>
                    <td>${cliente.cidade} - ${cliente.uf}</td>
                    <td>${cliente.renda}</td>
                    <td>
                        <span class="material-symbols-outlined btn-editar" data-id="${cliente.id_cliente}">edit</span>
                        <span class="material-symbols-outlined btn-delete" data-id="${cliente.id_cliente}">delete</span>

                    </td>
                `;


                tbody.appendChild(tr);
            });

        } catch (erro) {
            console.error("Erro ao carregar clientes:", erro);
        }
    }

    open_popup.addEventListener('click', () => {
        popup_cad_comprador.style.display = 'flex';
    });


    close_popup.addEventListener('click', () => {
        popup_cad_comprador.style.display = 'none';
        document.getElementById("formCadastro").reset();
    });

    close_sucess.addEventListener('click', () => {
        popup_sucess.style.display = 'none';
        popup_cad_comprador.style.display = 'none';
    });

    close_edit_cadastro.addEventListener('click', () => {
        popup_edit_cadastro.style.display = 'none';
        document.getElementById("formEditCadastro").reset();
    });

    // ------------------------------------------------------------------------------------

    document.getElementById("formCadastro").addEventListener("submit", async function (e) {
        e.preventDefault();

        const dados = {
            nome: document.getElementById("nome").value,
            cpf: document.getElementById("cpf").value,
            sexo: document.getElementById("sexo").value,
            estado_civil: document.getElementById("estado_civil").value,
            email: document.getElementById("email").value,
            telefone: document.getElementById("telefone").value,
            logradouro: document.getElementById("endereco").value,
            numero: document.getElementById("numero").value,
            complemento: document.getElementById("complemento").value,
            bairro: document.getElementById("bairro").value,
            cidade: document.getElementById("cidade").value,
            uf: document.getElementById("estado").value,
            cep: document.getElementById("cep").value,
            profissao: document.getElementById("profissao").value,
            renda: document.getElementById("renda").value,
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
                popup_sucess.style.display = 'flex';
                document.getElementById("formCadastro").reset();
                carregarClientes();
            } else {
                alert(`Erro ao cadastrar: ${resultado.detalhe || resultado.erro}`);
            }

        } catch (erro) {
            alert('Erro no servidor!');
            console.error(erro);
        }
    });

    // ---------------------------------------------------------------------------------------

    document.addEventListener("click", async (e) => {
        if (e.target.classList.contains("btn-editar")) {

            const id = e.target.dataset.id;

            const resposta = await fetch(`https://api-lotes.onrender.com/cliente/${id}`);
            const dados = await resposta.json();


            const cliente =
                dados.data ||
                dados.cliente ||
                dados.result ||
                dados[0] ||
                dados;

            document.getElementById("cliente_nome").innerText = `Cadastro - ${cliente.nome} `;

            document.getElementById("nome_edit").value = cliente.nome || "";
            document.getElementById("cpf_edit").value = cliente.cpf || "";
            document.getElementById("telefone_edit").value = cliente.telefone || "";
            document.getElementById("email_edit").value = cliente.email || "";
            document.getElementById("cidade_edit").value = cliente.cidade || "";
            document.getElementById("estado_edit").value = cliente.uf || "";
            document.getElementById("renda_edit").value = cliente.renda || "";
            document.getElementById("bairro_edit").value = cliente.bairro || "";
            document.getElementById("endereco_edit").value = cliente.logradouro || "";
            document.getElementById("numero_edit").value = cliente.numero || "";
            document.getElementById("complemento_edit").value = cliente.complemento || "";
            document.getElementById("cep_edit").value = cliente.cep || "";
            document.getElementById("estado_civil_edit").value = cliente.estado_civil || "";
            document.getElementById("sexo_edit").value = cliente.sexo || "";
            document.getElementById("profissao_edit").value = cliente.profissao || "";

            document.getElementById("formEditCadastro").dataset.id = id;

            popup_edit_cadastro.style.display = "flex";
        }
    });

    // --------------------------------------------------------------------------

    document.getElementById("formEditCadastro").addEventListener("submit", async function (e) {
        e.preventDefault();

        const id = this.dataset.id;

        const dadosAtualizados = {
            nome: document.getElementById("nome_edit").value,
            cpf: document.getElementById("cpf_edit").value,
            telefone: document.getElementById("telefone_edit").value,
            email: document.getElementById("email_edit").value,
            cidade: document.getElementById("cidade_edit").value,
            uf: document.getElementById("estado_edit").value,
            bairro: document.getElementById("bairro_edit").value,
            logradouro: document.getElementById("endereco_edit").value,
            numero: document.getElementById("numero_edit").value,
            complemento: document.getElementById("complemento_edit").value,
            cep: document.getElementById("cep_edit").value,
            estado_civil: document.getElementById("estado_civil_edit").value,
            sexo: document.getElementById("sexo_edit").value,
            profissao: document.getElementById("profissao_edit").value,
            renda: document.getElementById("renda_edit").value
        };

        try {
            const resposta = await fetch(`https://api-lotes.onrender.com/update_cliente/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosAtualizados)
            });

            const resultado = await resposta.json();
            console.log("Resultado UPDATE:", resultado);

            if (resposta.ok) {
                alert("Cliente atualizado com sucesso!");
                popup_edit_cadastro.style.display = "none";
                carregarClientes();
            } else {
                alert("Erro ao atualizar: " + (resultado.erro || resultado.detalhe));
            }

        } catch (erro) {
            console.error("Erro no UPDATE:", erro);
            alert("Erro no servidor ao atualizar!");
        }
    });



    carregarClientes();

});
