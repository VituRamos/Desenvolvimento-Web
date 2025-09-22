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

//Popup add
function openPopup() {
  document.getElementById("popup").style.display = "flex";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

//Ligar o botão flutuante ao popup
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".fab").addEventListener("click", openPopup);
});

function confirmarMateria() {
  const nomeMateria = document.getElementById("nomeMateria").value.trim();
  
  if (nomeMateria) {
    alert("Matéria adicionada: " + nomeMateria);
    // aqui você pode adicionar a lógica de inserir a matéria na lista
    closePopup();
  } else {
    alert("Por favor, insira o nome da matéria.");
  }
}

// Abrir popup do Simulado
function openPopupSimulado() {
  document.getElementById("popupSimulado").style.display = "flex";
}

// Fechar popup do Simulado
function closePopupSimulado() {
  document.getElementById("popupSimulado").style.display = "none";
}

// Confirmar Simulado
function confirmarSimulado() {
  const nome = document.getElementById("nomeSimulado").value.trim();
  const arquivo = document.getElementById("arquivoSimulado").files[0];

  if (!nome) {
    alert("Por favor, insira o nome do simulado.");
    return;
  }

  if (!arquivo) {
    alert("Por favor, selecione um arquivo.");
    return;
  }

  alert("Simulado adicionado:\nNome: " + nome + "\nArquivo: " + arquivo.name);
  closePopupSimulado();
}

// Ligar o botão ao popup
document.addEventListener("DOMContentLoaded", () => {
  const btnSimulado = document.querySelector(".btn"); // botão "Adicionar novo simulado"
  if (btnSimulado) {
    btnSimulado.addEventListener("click", openPopupSimulado);
  }
});

// Fechar popup de matéria
function closePopup() {
  document.getElementById("popup").style.display = "none";
  document.getElementById("nomeMateria").value = ""; // limpa o input
}

// Fechar popup de simulado
function closePopupSimulado() {
  document.getElementById("popupSimulado").style.display = "none";
  document.getElementById("nomeSimulado").value = ""; // limpa input texto
  document.getElementById("arquivoSimulado").value = ""; // limpa input file
}