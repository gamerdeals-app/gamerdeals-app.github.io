const API_BASE = 'https://www.cheapshark.com/api/1.0';

let listaOfertasGlobal = [];

document.addEventListener('DOMContentLoaded', () => {
  obtenerOfertasDestacadas();

  document.getElementById('search-btn').addEventListener('click', ejecutarBusqueda);
  document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') ejecutarBusqueda();
  });

  const rangeInput = document.getElementById('price-range');
  rangeInput.addEventListener('input', (e) => {
    document.getElementById('price-val').textContent = `$${e.target.value} USD`;
    filtrarPorPrecio(e.target.value);
  });

  document.getElementById('reset-filters').addEventListener('click', () => {
    rangeInput.value = 50;
    document.getElementById('price-val').textContent = '$50 USD';
    renderizarTarjetas(listaOfertasGlobal);
  });
});

async function obtenerOfertasDestacadas() {
  const container = document.getElementById('deals-container');
  container.innerHTML = '<div class="loading-spinner">Buscando las mejores ofertas...</div>';

  try {
    const res = await fetch(`${API_BASE}/deals?pageSize=20&sortBy=Deal%20Rating`);
    const ofertas = await res.json();
    listaOfertasGlobal = ofertas;
    renderizarTarjetas(ofertas);
  } catch (err) {
    container.innerHTML = '<div class="no-results">Error al cargar las ofertas. Revisa tu conexión.</div>';
  }
}

async function ejecutarBusqueda() {
  const query = document.getElementById('search-input').value.trim();
  if (!query) return obtenerOfertasDestacadas();

  const container = document.getElementById('deals-container');
  container.innerHTML = `<div class="loading-spinner">Buscando "${query}"...</div>`;
  document.getElementById('section-title').textContent = `Resultados para: "${query}"`;

  try {
    const res = await fetch(`${API_BASE}/games?title=${encodeURIComponent(query)}&limit=20`);
    const juegos = await res.json();

    if (juegos.length === 0) {
      container.innerHTML = '<div class="no-results">No se encontraron juegos con ese nombre.</div>';
      return;
    }

    // Convertimos la respuesta de búsqueda de juegos al formato de oferta
    const ofertasFormateadas = juegos.map(juego => ({
      title: juego.external,
      thumb: juego.thumb,
      price: juego.cheapest,
      normalPrice: juego.cheapest, // Precio de referencia
      savings: 0,
      dealID: juego.cheapestDealID
    }));

    listaOfertasGlobal = ofertasFormateadas;
    renderizarTarjetas(ofertasFormateadas);
  } catch (err) {
    container.innerHTML = '<div class="no-results">Error al realizar la búsqueda.</div>';
  }
}

function filtrarPorPrecio(precioMax) {
  const filtradas = listaOfertasGlobal.filter(item => parseFloat(item.price) <= parseFloat(precioMax));
  renderizarTarjetas(filtradas);
}

function renderizarTarjetas(ofertas) {
  const container = document.getElementById('deals-container');
  container.innerHTML = '';

  if (ofertas.length === 0) {
    container.innerHTML = '<div class="no-results">No hay juegos dentro de este rango de precio.</div>';
    return;
  }

  ofertas.forEach(item => {
    const descuento = Math.round(parseFloat(item.savings));
    const card = document.createElement('article');
    card.className = 'card';

    // Enlace de la oferta (aquí se canalizan las compras)
    const enlaceOferta = `https://www.cheapshark.com/redirect?dealID=${item.dealID}`;

    card.innerHTML = `
      <img src="${item.thumb}" alt="${item.title}" loading="lazy">
      <div class="card-body">
        <h3 class="card-title">${item.title}</h3>
        <div class="price-row">
          <div>
            ${item.savings > 0 ? `<div class="old-price">$${item.normalPrice} USD</div>` : ''}
            <div class="current-price">$${item.price} USD</div>
          </div>
          ${descuento > 0 ? `<span class="badge">-${descuento}%</span>` : ''}
        </div>
        <a href="${enlaceOferta}" target="_blank" rel="noopener noreferrer" class="deal-link">
          Ver Oferta
        </a>
      </div>
    `;

    container.appendChild(card);
  });
}