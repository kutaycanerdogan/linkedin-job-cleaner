/**
 * Job Detail Highlighter - Scroll Destekli Versiyon
 */
window.highlightSafe = (rootElement, badKeywords) => {
	if (!badKeywords || badKeywords.length === 0) return;

	const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT, null, false);

	let nodesToProcess = [];
	let currentNode;

	while ((currentNode = walker.nextNode())) {
		const text = currentNode.nodeValue;
		if (currentNode.parentNode.classList.contains("ln-cleaner-highlight")) continue;

		if (badKeywords.some((word) => text.toLowerCase().includes(word.toLowerCase()))) {
			nodesToProcess.push(currentNode);
		}
	}

	// Değişiklik yapılacak node var mı kontrol et
	if (nodesToProcess.length === 0) return;

	nodesToProcess.forEach((node) => {
		const parent = node.parentNode;
		if (!parent || ["SCRIPT", "STYLE"].includes(parent.tagName)) return;

		const text = node.nodeValue;
		const pattern = new RegExp(`(\\b${badKeywords.join("\\b|\\b")}\\b)`, "gi");
		const parts = text.split(pattern);

		if (parts.length <= 1) return;

		const fragment = document.createDocumentFragment();
		parts.forEach((part) => {
			if (badKeywords.some((word) => part.toLowerCase() === word.toLowerCase())) {
				const span = document.createElement("span");
				span.className = "ln-cleaner-highlight";
				span.style.cssText = "background-color: #ff4d4d; color: white; padding: 0 4px; border-radius: 2px; font-weight: bold; display: inline-block;";
				span.textContent = part;
				fragment.appendChild(span);
			} else if (part) {
				fragment.appendChild(document.createTextNode(part));
			}
		});

		parent.replaceChild(fragment, node);
	});

	// --- YENİ: Otomatik Scroll Mantığı ---
	// Oluşturduğumuz ilk highlight span'ini bul
	const firstHighlight = rootElement.querySelector(".ln-cleaner-highlight");

	if (firstHighlight) {
		// Yumuşak bir geçişle (smooth) kelimenin olduğu yere kaydır
		// 'block: center' yaparak kelimeyi ekranın ortasına getirmek daha iyi bir görünüm sağlar
		setTimeout(() => {
			firstHighlight.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}, 100); // LinkedIn'in kendi iç render'ının bitmesi için kısa bir delay
	}
};
