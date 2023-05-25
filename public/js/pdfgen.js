// IMPORTANT: this script must be loaded before Hyphenopoly

function ready(fn) {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

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
    if (text.match(/^(https?:\/\/|www\.)/)) {
      el.classList.add("url-visible");
    } else {
      el.classList.add("url-hidden");
    }
  });
}

// Paged.js workaround to avoid text justification before line breaks : replace br elements with span.br
function fixBrInText() {
  var brs = document.querySelectorAll(".main br");
  var parents = [];
  var alreadyFound = function(el) {
    return parents.some(function(p) {
      return el.isSameNode(p);
    });
  };

  Array.prototype.forEach.call(brs, function(el){
    var parent = el.parentNode;
    var textAlign = getComputedStyle(parent)["textAlign"];
    if (textAlign !== "justify" || alreadyFound(parent)) return;
    parents.push(parent);
  });

  parents.forEach(function(el) {
    var html = el.innerHTML;
    var parts = html.split(/<br[^>]*>/gm);
    if (parts.length === 0) return;
    var newHtml = parts.reduce(function(res, text, index) {
      if (index === parts.length - 1) {
        return res + text;
      }
      return res + "<span class='br'>" + text + "</span>";
    }, "");
    el.innerHTML = newHtml;
  });
}

// Fix article toc anchors in issue
function fixArticleToc() {
  const articles = document.querySelectorAll(".document.article");
  articles.forEach(function(article) {
    const articleId = article.getAttribute("data-lodel-id");
    const headings = article.querySelectorAll(":scope h1.texte a, :scope h2.texte a, :scope h3.texte a, :scope h4.texte a, :scope h5.texte a, :scope h6.texte a")
    let count = 0;
    headings.forEach(function(a) {
      count++
      a.setAttribute("id", `tocto${articleId}-${count}`);
      a.setAttribute("href", `#tocfrom${articleId}-${count}`);
    });
  });
}

displayHref();
fixBrInText();
fixArticleToc();

window.PagedConfig = {
  auto: false
};

ready(function() {
  Hyphenopoly.config({
    require: getRequiredLangs(".hyphenate[lang], .hyphenate [lang], .hyphenate[xml\\:lang], .hyphenate [xml\\:lang]"),
    fallbacks: {
      "en": "en-gb"
    },
    setup: {
      dontHyphenateClass: "code",
      hide: "none",
      safeCopy: false,
      selectors: {
        ".hyphenate": {
          orphanControl: 3,
          leftmin: 4,
          rightmin: 4
        }
      }
    },
    handleEvent: {
      // Run Paged.js after Hyphenopoly
      "hyphenopolyEnd": runPagedjs,
      // Event triggered when browser-native CSS hyphenation is available
      "tearDown": runPagedjs
    }
  });
});
