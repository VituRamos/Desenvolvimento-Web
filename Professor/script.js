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