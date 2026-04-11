// ===== map-report.js FINAL =====

const buttonLabels = ["20/1850", "20/2100", "24/2220", "24/2520"];

// =================================
// POKAZANIE DILERA NA MAPIE
// =================================
function showDealerInfo(locationName) {
  const marker = markerMap[locationName];
  if (!marker) return;

  // zmiana koloru
  marker.setStyle({
    color: "orange",
    fillColor: "orange"
  });

  // jeśli tooltip już istnieje – nie dodawaj drugi raz
  if (marker._dealerActive) return;

  marker.bindTooltip("🟠 Diler aktywny", {
    permanent: true,
    direction: "top",
    offset: [0, -10]
  }).openTooltip();

  marker._dealerActive = true;
}

// =================================
// WYSYŁANIE ZGŁOSZENIA
// =================================
async function sendReport(locationName, amount) {
  try {
    const resUser = await fetch("/api/me");
    if (!resUser.ok) {
      alert("Nie jesteś zalogowany!");
      return;
    }

    const userData = await resUser.json();
    const user = userData.username || "Nieznany";

    const res = await fetch("/api/send-location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: locationName,
        lat: 0,
        lng: 0,
        user,
        amount
      })
    });

    if (!res.ok) throw new Error("Błąd wysyłania");

    // pokaż od razu lokalnie
    showDealerInfo(locationName);

    alert(`Zgłoszono: ${locationName} - ${amount}`);
  } catch (err) {
    console.error("Błąd przy wysyłaniu:", err);
    alert("Nie udało się wysłać zgłoszenia.");
  }
}

// =================================
// PRZYCISKI W POPUP
// =================================
function addButtonsToPopup(popup) {
  const popupNode = popup.getElement();
  if (!popupNode) return;

  const locationName = popupNode.querySelector("b")?.textContent;
  if (!locationName) return;

  // nie dodawaj drugi raz
  if (popupNode.querySelector(".discord-report-btn-container")) return;

  const btnContainer = document.createElement("div");
  btnContainer.className = "discord-report-btn-container";
  btnContainer.style.display = "flex";
  btnContainer.style.flexWrap = "wrap";
  btnContainer.style.justifyContent = "space-between";
  btnContainer.style.marginTop = "5px";

  buttonLabels.forEach(label => {
    const btn = document.createElement("button");
    btn.innerText = label;
    btn.style.flex = "1";
    btn.style.margin = "2px";
    btn.style.padding = "5px 8px";
    btn.style.background = "#5865F2";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.borderRadius = "4px";
    btn.style.cursor = "pointer";

    btn.onclick = () => sendReport(locationName, label);

    btnContainer.appendChild(btn);
  });

  popupNode.appendChild(btnContainer);
}

// =================================
// INICJALIZACJA PRZYCISKÓW
// =================================
function initReportButtons() {
  map.eachLayer(layer => {
    if (!layer.getPopup) return;

    const popup = layer.getPopup();
    if (!popup) return;

    layer.on("popupopen", () => {
      addButtonsToPopup(popup);
    });
  });
}

// =================================
// WCZYTYWANIE GLOBALNYCH RAPORTÓW
// =================================
async function loadGlobalReports() {
  try {
    const res = await fetch("/api/get-reports");
    if (!res.ok) return;

    const reports = await res.json();

    Object.keys(reports).forEach(locationName => {
      showDealerInfo(locationName);
    });

  } catch (e) {
    console.warn("Nie udało się pobrać raportów");
  }
}

// =================================
// START
// =================================
document.addEventListener("DOMContentLoaded", () => {
  // poczekaj aż mapa i markery się załadują
  setTimeout(() => {
    initReportButtons();
    loadGlobalReports();
  }, 800);
});

// odświeżanie globalne co 15 sekund
setInterval(loadGlobalReports, 15000);
