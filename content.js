/**
 * LinkedIn Jobs - Performance Optimized Content Script
 */

let userPrefs = {};
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

const getLinkedInLanguage = () => (document.documentElement.lang || "en").split("-")[0];

const filterJobs = () => {
	// Ayarları asenkron al ama yerel objeyi güncelle
	chrome.storage.sync.get(["hideApplied", "hideViewed", "hidePromoted", "badKeywords"], (prefs) => {
		if (chrome.runtime.lastError) return;
		userPrefs = prefs;

		const activeDict = dictionary[getLinkedInLanguage()] || dictionary["en"];
		const jobCards = document.querySelectorAll("li.scaffold-layout__list-item, li[data-occludable-job-id]");

		jobCards.forEach((card) => {
			const cardText = card.innerText.toLowerCase();
			let shouldHide = false;

			if (userPrefs.hideApplied && activeDict.applied.some((k) => cardText.includes(k))) shouldHide = true;
			if (userPrefs.hideViewed && !shouldHide && activeDict.viewed.some((k) => cardText.includes(k))) shouldHide = true;
			if (userPrefs.hidePromoted && !shouldHide && activeDict.promoted.some((k) => cardText.includes(k))) shouldHide = true;

			const currentDisplay = card.style.display;
			const targetDisplay = shouldHide ? "none" : "block";

			// Sadece değişim varsa DOM'a dokun (Performans için kritik)
			if (currentDisplay !== targetDisplay) {
				card.style.setProperty("display", targetDisplay, "important");
			}
		});

		const detailContainer = document.querySelector(".jobs-description__container");
		if (detailContainer && userPrefs.badKeywords && window.highlightSafe) {
			window.highlightSafe(detailContainer, userPrefs.badKeywords);
		}
	});
};

let debounceTimer;
const debounceFilter = () => {
	clearTimeout(debounceTimer);
	debounceTimer = setTimeout(filterJobs, 150);
};

let mainObserver;
const setupMainObserver = () => {
	if (mainObserver) mainObserver.disconnect();

	const jobListContainer = document.querySelector(".scaffold-layout__list-container") || document.querySelector(".jobs-search-results-list") || document.body;

	mainObserver = new MutationObserver((mutations) => {
		let shouldTrigger = false;
		for (let i = 0; i < mutations.length; i++) {
			const m = mutations[i];
			// Sadece içerik veya liste değişimi varsa tetikle
			if (m.addedNodes.length > 0 || m.type === "attributes" || m.type === "characterData") {
				shouldTrigger = true;
				break;
			}
		}
		if (shouldTrigger) debounceFilter();
	});

	mainObserver.observe(jobListContainer, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ["class", "id"], // Sadece kritik öznitelikleri izle
		characterData: true,
	});
};

const initializeExtension = () => {
	let attempts = 0;
	const checkAndRun = setInterval(() => {
		attempts++;
		const jobCards = document.querySelectorAll("li.scaffold-layout__list-item");
		if (jobCards.length > 0 || attempts >= 15) {
			clearInterval(checkAndRun);
			filterJobs();
			setupMainObserver();
		}
	}, 500);
};

// URL Takibi (SPA geçişleri için)
let lastUrl = location.href;
const urlObserver = new MutationObserver(() => {
	if (location.href !== lastUrl) {
		lastUrl = location.href;
		setTimeout(() => {
			filterJobs();
			setupMainObserver();
		}, 500);
	}
});
urlObserver.observe(document, { subtree: true, childList: true });

// Event Listeners
if (document.readyState === "complete" || document.readyState === "interactive") {
	initializeExtension();
} else {
	window.addEventListener("DOMContentLoaded", initializeExtension);
}

window.addEventListener("pageshow", filterJobs);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "refreshFilters") {
		filterJobs();
		sendResponse({ status: "success" });
	}
});
