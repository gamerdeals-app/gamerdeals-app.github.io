const API_URL = 'https://www.cheapshark.com/api/1.0/deals';

// Elementos del DOM
const dealsContainer = document.getElementById('deals-container');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const priceRange = document.getElementById('price-range');
const priceVal = document.getElementById('price-val');
const storeSelect = document.getElementById('store-select');
const sortSelect = document.getElementById('sort-select');
const resetBtn = document.getElementById('reset-filters');
const sectionTitle = document.getElementById('section-title');
const resultsCount = document.getElementById('results-count');

// Función para obtener ofertas de la API
async function fetchDeals() {
  dealsContainer.innerHTML = '<div class="loading-spinner">Buscando las mejores ofertas...</div>';

  const title = searchInput.value.trim();
  const maxPrice = priceRange.value;
  const storeID = storeSelect.value;
  const sortBy = sortSelect.value;

  // Construir parámetros URL
  let url = `${API_URL}?upperPrice=${maxPrice}&sortBy=${sortBy}`;
  
  if (title) url += `&title=${encodeURIComponent(title)}`;
  if (storeID !== 'all') url += `&storeID=${storeID}`;

  try {
    const response = await fetch(url);
    const deals = await response.json();
    renderDeals(deals);
  } catch (error) {
    dealsContainer.innerHTML = '<div class="loading-spinner">Error al cargar las ofertas. Inténtalo de nuevo.</div>';
  }
}

// Renderizar las tarjetas
function renderDeals(deals) {
  if (!deals || deals.length === 0) {
    dealsContainer.innerHTML = '<div class="loading-spinner">No se encontraron ofertas con estos filtros.</div>';
    resultsCount.textContent = '0 resultados';
    return;
  }

  resultsCount.textContent = `${deals.length} ofertas encontradas`;

  dealsContainer.innerHTML = deals.map(item => {
    const discount = Math.round(item.savings);
    const thumb = item.thumb || 'https://via.placeholder.com/300x140?text=Sin+Imagen';
    const redirectUrl = `https://www.cheapshark.com/redirect?dealID=${item.dealID}`;

    return `
      <article class="deal-card">
        <img src="${thumb}" alt="${item.title}" class="deal-thumb" loading="lazy">
        <div class="deal-info">
          <h4 class="deal-title">${item.title}</h4>
          <div class="price-row">
            <span class="savings-tag">-${discount}%</span>
            <div class="prices">
              <span class="old-price">$${item.normalPrice}</span>
              <span class="new-price">$${item.salePrice}</span>
            </div>
          </div>
          <a href="${redirectUrl}" target="_blank" rel="noopener noreferrer" class="deal-btn">Ver Oferta</a>
        </div>
      </article>
    `;
  }).join('');
}

// Event Listeners
searchBtn.addEventListener('click', () => {
  sectionTitle.textContent = searchInput.value.trim() ? `Resultados para "${searchInput.value}"` : '🔥 Ofertas Destacadas';
  fetchDeals();
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchBtn.click();
});

priceRange.addEventListener('input', (e) => {
  priceVal.textContent = `$${e.target.value} USD`;
});

priceRange.addEventListener('change', fetchDeals);
storeSelect.addEventListener('change', fetchDeals);
sortSelect.addEventListener('change', fetchDeals);

resetBtn.addEventListener('click', () => {
  searchInput.value = '';
  priceRange.value = 50;
  priceVal.textContent = '$50 USD';
  storeSelect.value = 'all';
  sortSelect.value = 'Deal Rating';
  sectionTitle.textContent = '🔥 Ofertas Destacadas';
  fetchDeals();
});

// Carga inicial
fetchDeals();
