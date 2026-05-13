document.addEventListener("DOMContentLoaded", () => {
	// 1. Tüm metinleri çevir
	document.querySelectorAll("[data-i18n]").forEach((el) => {
		const key = el.getAttribute("data-i18n");
		const translation = chrome.i18n.getMessage(key);

		if (translation) {
			el.textContent = translation;
		} else {
			console.warn(`Missing translation key: ${key}`);
			el.textContent = key; // Hata durumunda en azından anahtar ismini göster
		}
	});

	// 2. Ayarları ve Event Listener'ları yükle
	const settings = ["hideApplied", "hideViewed", "hidePromoted"];

	settings.forEach((id) => {
		const el = document.getElementById(id);
		if (!el) return; // Element yoksa hata vermemesi için koruma

		// Mevcut ayarları yükle
		chrome.storage.sync.get(id, (data) => {
			el.checked = data[id] || false;
		});

		// Ayar değiştiğinde kaydet ve sayfaya haber ver
		el.addEventListener("change", () => {
			chrome.storage.sync.set({ [id]: el.checked }, () => {
				chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
					if (tabs[0] && tabs[0].url.includes("linkedin.com")) {
						chrome.tabs.sendMessage(tabs[0].id, { action: "refreshFilters" });
					}
				});
			});
		});
	});
	// Kaydetme butonuna basıldığında
	document.getElementById("saveBlacklist").addEventListener("click", () => {
		const words = document
			.getElementById("blacklist")
			.value.split(",")
			.map((w) => w.trim())
			.filter((w) => w !== "");

		chrome.storage.sync.set({ badKeywords: words }, () => {
			// Sayfayı yenilemeye gerek kalmadan content script'e haber ver
			chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
				if (tabs[0]) {
					chrome.tabs.sendMessage(tabs[0].id, { action: "refreshFilters" });
				}
			});
		});
	});

	// Sayfa açıldığında mevcut listeyi yükle
	chrome.storage.sync.get("badKeywords", (data) => {
		if (data.badKeywords) {
			document.getElementById("blacklist").value = data.badKeywords.join(", ");
		}
	});
});
