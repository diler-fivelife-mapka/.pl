const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -2,
  maxZoom: 3
});

const size = 1000;
const bounds = [[0, 0], [size, size]];

// WAŻNE: GitHub Pages → ścieżka musi być RELATYWNA
const imageUrl = './img/mapa.jpg';

const img = new Image();

img.onload = () => {
  L.imageOverlay(imageUrl, bounds).addTo(map);
  map.fitBounds(bounds);
};

img.onerror = () => {
  console.error("Nie znaleziono obrazu:", imageUrl);
};

img.src = imageUrl;
