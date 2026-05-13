const getLinkedInLanguage = () => {
	const lang = document.documentElement.lang || "en";
	return lang.split("-")[0];
};

const filterJobs = () => {
	chrome.storage.sync.get(["hideApplied", "hideViewed", "hidePromoted"], (prefs) => {
		const userLang = getLinkedInLanguage();
		const jobCards = document.querySelectorAll("li.scaffold-layout__list-item");

		const dictionary = {
			tr: {
				applied: ["başvuruldu", "başvuru yapıldı", "başvurulanlar"],
				viewed: ["görüntülendi", "bakıldı", "görüntülenen"],
				promoted: ["sponsorlu", "tanıtım", "reklam", "tanıtıldı"],
			},
			en: {
				applied: ["applied"],
				viewed: ["viewed"],
				promoted: ["promoted", "advertisement", "sponsored"],
			},
			fr: {
				applied: ["candidature envoyée", "postulé"],
				viewed: ["consultée"],
				promoted: ["sponsoring", "annonce"],
			},
		};

		const activeDict = dictionary[userLang] || dictionary["en"];

		jobCards.forEach((card) => {
			const cardText = card.innerText.toLowerCase();
			let shouldHide = false;

			if (prefs.hideApplied && activeDict.applied.some((k) => cardText.includes(k))) shouldHide = true;
			if (prefs.hideViewed && !shouldHide && activeDict.viewed.some((k) => cardText.includes(k))) shouldHide = true;
			if (prefs.hidePromoted && !shouldHide && activeDict.promoted.some((k) => cardText.includes(k))) shouldHide = true;

			card.style.setProperty("display", shouldHide ? "none" : "block", "important");
		});
	});
};

// Performans için Debounce
let debounceTimer;
const debounceFilter = () => {
	clearTimeout(debounceTimer);
	debounceTimer = setTimeout(filterJobs, 300);
};

// --- YENİ: Dinamik Sayfa Geçişlerini Yöneten Kısım ---

// 1. 'main' Elementini İzleyen Fonksiyon (Daha Garanti Yapı)
let mainObserver;
const setupMainObserver = () => {
	if (mainObserver) mainObserver.disconnect();

	const mainElement = document.getElementById("main");
	const target = mainElement || document.body;

	mainObserver = new MutationObserver((mutations) => {
		// Sadece yeni elementler eklendiğinde kontrol et
		let shouldTrigger = false;

		for (const mutation of mutations) {
			// 1. Eğer yeni node'lar eklendiyse
			if (mutation.addedNodes.length > 0) {
				// 2. Eklenen node'lar arasında iş kartı (li) var mı bak
				const hasJobCard = Array.from(mutation.addedNodes).some((node) => node.nodeType === 1 && (node.classList.contains("scaffold-layout__list-item") || node.querySelector(".scaffold-layout__list-item")));

				if (hasJobCard) {
					shouldTrigger = true;
					break; // Bir tane bulmamız yeterli
				}
			}
		}

		// Sadece iş kartı değişikliği gördüğümüzde debounce çalışsın
		if (shouldTrigger) {
			debounceFilter();
		}
	});

	mainObserver.observe(target, {
		childList: true,
		subtree: true,
	});
};

// 2. URL Değişimini İzle (Geri/İleri butonu veya menü geçişleri için)
let lastUrl = location.href;
const urlObserver = new MutationObserver(() => {
	if (location.href !== lastUrl) {
		lastUrl = location.href;
		filterJobs(); // URL değiştiğinde hemen çalıştır
		setupMainObserver(); // Observer'ı yeni sayfadaki 'main' elementine tekrar bağla
	}
});
urlObserver.observe(document, { subtree: true, childList: true });

// 3. Sayfa belleğe alındığında (Geri dönüşlerde) çalıştır
window.addEventListener("pageshow", filterJobs);

// İlk Kurulum
setupMainObserver();
filterJobs();

// Popup'tan gelen mesajları dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "refreshFilters") {
		filterJobs();
		sendResponse({ status: "success" });
	}
});
