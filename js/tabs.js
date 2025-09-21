// Sélectionne tous les onglets et contenus
const tabs = document.querySelectorAll(".tabs ul li");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {
  tab.addEventListener("click", (event) => {
    event.preventDefault();

    const target = tab.dataset.tab;

    // Retire l'état actif sur tous les onglets
    tabs.forEach(t => t.classList.remove("is-active"));

    // Cache tous les contenus
    contents.forEach(c => c.classList.add("is-hidden"));

    // Active l'onglet cliqué
    tab.classList.add("is-active");

    // Affiche le contenu associé
    document.getElementById(target).classList.remove("is-hidden");
  });
});