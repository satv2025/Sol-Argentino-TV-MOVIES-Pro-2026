
async function load() {
  const res = await fetch('public/data/cardsData.json');
  const data = await res.json();
  const app = document.getElementById('app');
  app.innerHTML = `<section class="grid">
    ${data.map(item => `
      <div class="card">
        <img src="${item.image}" />
        <h3>${item.title}</h3>
      </div>
    `).join('')}
  </section>`;
}
load();
