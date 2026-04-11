const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -0.5,
  maxZoom: 4
});

const imageUrl = 'img/mapa.jpg';
const imageBounds = [[0,0], [1000,1000]];
L.imageOverlay(imageUrl, imageBounds).addTo(map);
map.fitBounds(imageBounds);

const znajdzkiCount = markers.filter(m => m.category === "znajdzka").length;
document.getElementById("znajdzki-counter").innerText = `Dilerów: ${znajdzkiCount}`;

const markerMap = {};

markers.forEach(m => {
  const color = m.category === "znajdzka" ? "red" :
                m.category === "skrot" ? "green" :
                m.category === "npc" ? "blue" : "gray";

  const marker = L.circleMarker([m.lat, m.lng], {
    radius: 8,
    color: color,
    fillOpacity: 0.8
  }).addTo(map);

  let popupHtml = `<b>${m.name}</b>`;
  if (m.img) {
    popupHtml += `<br><img src="${m.img}" alt="zdjęcie" style="max-width: 250px; height: auto; margin-top: 5px; border-radius: 4px; cursor: pointer;">`;
  }

  marker.bindPopup(popupHtml);
  markerMap[m.name] = marker; 
});

function showImageModal(src) {
  const modal = document.getElementById('imgModal');
  const modalImg = document.getElementById('modalImg');
  modal.style.display = 'flex';
  modalImg.src = src;
}

map.on('popupopen', function(e) {
  const popupNode = e.popup.getElement();
  const img = popupNode.querySelector('img');
  if (img) {
    img.style.cursor = 'pointer';
    img.onclick = () => showImageModal(img.src);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('imgModal').style.display = 'none';
  });

  document.getElementById('imgModal').addEventListener('click', (e) => {
    if (e.target.id === 'imgModal') {
      e.target.style.display = 'none';
    }
  });
});

map.on('click', function(e) {
  const lat = e.latlng.lat.toFixed(5);
  const lng = e.latlng.lng.toFixed(5);
  console.log(`lat: ${lat}, lng: ${lng}`);
});

document.getElementById("toggleLegenda").addEventListener("click", () => {
  const list = document.getElementById("legenda-list");
  list.style.display = list.style.display === "none" ? "block" : "none";
});

const legendaList = document.getElementById("legenda-list");
markers.forEach(m => {
  const li = document.createElement("li");
  li.textContent = m.name;
  li.addEventListener("click", () => {
    const marker = markerMap[m.name];
    if (marker) {
      map.setView(marker.getLatLng(), 2);
      marker.openPopup();
    }
  });
  legendaList.appendChild(li);
});

const searchInput = document.getElementById("searchInput");
const autocompleteList = document.getElementById("autocomplete-list");

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  autocompleteList.innerHTML = "";
  
  if (!query) {
    autocompleteList.style.display = "none";
    return;
  }

  const matches = markers.filter(m => m.name.toLowerCase().includes(query));
  
  if (matches.length === 0) {
    autocompleteList.style.display = "none";
    return;
  }

  matches.forEach(m => {
    const li = document.createElement("li");
    li.textContent = m.name;
    li.addEventListener("click", () => {
      const marker = markerMap[m.name];
      if (marker) {
        map.setView(marker.getLatLng(), 2);
        marker.openPopup();
        autocompleteList.style.display = "none";
        searchInput.value = m.name;
      }
    });
    autocompleteList.appendChild(li);
  });

  autocompleteList.style.display = "block";
});

searchInput.addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === "Tab") && autocompleteList.style.display !== "none") {
    e.preventDefault(); 
    const firstItem = autocompleteList.querySelector("li");
    if (firstItem) {
      firstItem.click();
    }
  }
});

document.addEventListener("click", (e) => {
  if (!document.getElementById("search-box").contains(e.target)) {
    autocompleteList.style.display = "none";
  }
});

function parseAdTags(text) {
  return text
    .replace(/\[b\](.*?)\[\/b\]/g, '<strong>$1</strong>')
    .replace(/\[red\](.*?)\[\/red\]/g, '<span style="color:red;">$1</span>')
    .replace(/\[blue\](.*?)\[\/blue\]/g, '<span style="color:blue;">$1</span>')
    .replace(/\[green\](.*?)\[\/green\]/g, '<span style="color:green;">$1</span>')
    .replace(/\[gray\](.*?)\[\/gray\]/g, '<span style="color:gray;">$1</span>');
}

fetch('ad.txt')
  .then(response => {
    if (!response.ok) throw new Error('Nie udało się załadować reklamy');
    return response.text();
  })
  .then(text => {
    const banner = document.getElementById('ad-banner');
    const ads = text.trim().split('\n').map(line => parseAdTags(line));
    banner.innerHTML = `
      <div class="banner-prefix">dzwq-news</div>
      <div class="banner-content">${ads.join('<hr style="border: none; border-top: 1px dashed #aaa; margin: 6px 0;">')}</div>
    `;
  })
  .catch(error => {
    console.warn('Błąd ładowania reklamy:', error);
  });








// ===== Logo Leaflet – lewy dolny róg, bez białego tła =====
const LogoControl = L.Control.extend({
  options: { position: 'bottomleft' },

  onAdd: function () {
    const container = L.DomUtil.create('div');

    // usunięcie stylu leaflet-control
    container.style.background = 'none';
    container.style.border = 'none';
    container.style.boxShadow = 'none';
    container.style.margin = '5px';

    container.innerHTML = `
      <a href="https://gdziedil.vercel.app/" target="_blank" style="display:block;">
        <img src="https://i.imgur.com/hJ4QsrL.png"
             style="height:160px;width:auto;display:block;" />
      </a>
    `;

    // żeby kliknięcie nie przesuwało mapy
    L.DomEvent.disableClickPropagation(container);

    return container;
  }
});

// Dodaj do mapy
map.addControl(new LogoControl());
