const btnEntrar = document.getElementById("btnEntrar");
const spinner = document.getElementById('spinner');
const msg = document.getElementById('msg');

spinner.style.display = 'none';

btnEntrar.onclick = async (event) => {
  event.preventDefault();

  const user = document.getElementById('nome').value;
  const password = document.getElementById('senha').value;
  

  spinner.style.display = 'flex';

  try {
    const response = await fetch('https://api-lotes.onrender.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, password })
    });

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Resposta:", data);

    if (response.ok) {
      localStorage.setItem('nome', user);
      sessionStorage.setItem('logon', 'ok');
      sessionStorage.setItem("usuarioTipo", data.usuario.tipo);
      sessionStorage.setItem("usuarioId", data.usuario.id);

      window.location.href = "./home/home.html";
    } else {
      spinner.style.display = 'none';
      msg.style.display = 'block';
      msg.innerHTML = "Usuário ou senha incorretos";
    }

  } catch (error) {
    console.log("Erro:", error);
    spinner.style.display = 'none';
    alert("Erro ao conectar com o servidor");
  }
};
