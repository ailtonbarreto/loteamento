const sidebar = document.getElementById("menu");
const toggleBtn = document.querySelector("#menu-toggle");
const closeBtn = document.querySelector(".close-menu");

// Abre sidebar
toggleBtn.addEventListener("click", () => {
    sidebar.classList.add("open");
});

// Fecha sidebar + recolhe submenus
closeBtn.addEventListener("click", () => {
    sidebar.classList.remove("open");

    // Recolhe todos os submenus abertos
    document.querySelectorAll(".has-submenu.open").forEach(item => {
        item.classList.remove("open");
    });
});

// Controle dos submenus
document.querySelectorAll(".has-submenu").forEach(item => {
    item.addEventListener("click", () => {

        // Fecha outros submenus antes de abrir o atual
        document.querySelectorAll(".has-submenu.open").forEach(openItem => {
            if (openItem !== item) {
                openItem.classList.remove("open");
            }
        });

        item.classList.toggle("open");
    });
});

const adm_menu = document.querySelectorAll(".admin_menu");
const tipoUsuario = sessionStorage.getItem("usuarioTipo");

if (tipoUsuario === "1") {

    adm_menu.forEach((item) => {
        item.style.display = "block";
    });

} else {

    adm_menu.forEach((item) => {
        item.style.display = "none";
    });

}

