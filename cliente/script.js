window.addEventListener("DOMContentLoaded", () => {

    const popup_cad_comprador = document.getElementById('popup_cadastro');
    const close_popup = document.getElementById('close-cadastro');
    const open_popup = document.getElementById('open_popup');
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

            console.log("Resposta da API:", clientes);

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


    document.getElementById("formCadastro").addEventListener("submit", async function (e) {
        e.preventDefault();

        const dados = {
            nome: document.getElementById("nome").value,
            cpf: document.getElementById("cpf").value,
            sexo : document.getElementById("sexo").value,
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

    carregarClientes();

});
