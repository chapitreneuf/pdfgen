function runPagedjs() {
	window.PagedPolyfill.preview();
}

function getRequiredLangs(selector) {
	return Array.from(document.querySelectorAll(selector)).reduce(function (obj, el) {
		var lang = el.getAttribute("lang");

		// Fix document: xml:lang -> lang
		if (!lang) {
			var xmlLang = el.getAttribute("xml:lang");
			if (!xmlLang) return obj;
			el.setAttribute("lang", xmlLang);
			lang = xmlLang;
		}

		if (obj[lang]) return obj;
		// Chrome doesn't support hyphenation yet, so we "FORCEHYPHENOPOLY" anyway.
		obj[lang] = "FORCEHYPHENOPOLY";
		return obj;
	}, {});
}

// Display links href attribute when relevant
function displayHref () {
	document.querySelectorAll("a[href^='http://'], a[href^='https://']").forEach(function (el) {
		var text = el.textContent;
		if (text.match(/https?:\/\//)) return;
		el.classList.add("displayHref");
	});
}

displayHref();

window.PagedConfig = {
	auto: false
};

var Hyphenopoly = {
	require: getRequiredLangs(".hyphenate[lang], .hyphenate [lang], .hyphenate[xml\\:lang], .hyphenate [xml\\:lang]"),
	fallbacks: {
		"en": "en-gb"
	},
	setup: {
		dontHyphenateClass: "code",
		selectors: {
			".hyphenate": {}
		}
	},
	handleEvent: {
		// Run Paged.js after Hyphenopoly
		"hyphenopolyEnd": runPagedjs,
		// Event triggered when browser-native CSS hyphenation is available
		"tearDown": runPagedjs
	}
};