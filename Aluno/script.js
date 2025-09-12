// Header
function toggleMenu() {
  const menu = document.getElementById("dropdownMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// Fechar se clicar fora
document.addEventListener("click", function(e) {
  const menu = document.getElementById("dropdownMenu");
  const avatar = document.querySelector(".avatar");

  if (!avatar.contains(e.target) && !menu.contains(e.target)) {
    menu.style.display = "none";
  }
});

// Materias e Simulados
function toggleCard(id, element) {
  const content = document.getElementById(id);
  content.classList.toggle("active");

  const arrow = element.querySelector(".arrow");
  arrow.classList.toggle("open");
}

function toggleSimulado(id, element) {
  const div = document.getElementById(id);
  div.classList.toggle("active");

  const arrow = element.querySelector(".arrow");
  arrow.classList.toggle("open");
}