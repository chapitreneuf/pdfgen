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

displayHref();
fixBrInText();

window.PagedConfig = {
  auto: false
};

// Table of contents for issues
// https://pagedjs.org/posts/build-a-table-of-contents-from-your-html/
function createToc(config) {
  const content = config.content;
  const tocElement = config.tocElement;
  const titleElements = config.titleElements;

  let tocElementDiv = content.querySelector(tocElement);
  if (tocElementDiv.length === 0) return;

  let tocUl = document.createElement("ul");
  tocUl.id = "list-toc-generated";
  tocElementDiv.appendChild(tocUl);

  // add class to all title elements
  let tocElementNbr = 0;
  for (var i = 0; i < titleElements.length; i++) {
    let titleHierarchy = i + 1;
    let titleElement = content.querySelectorAll(titleElements[i]);

    titleElement.forEach(function (element) {
      // add classes to the element
      element.classList.add("title-element");
      element.setAttribute("data-title-level", titleHierarchy);

      // add id if doesn't exist
      tocElementNbr++;
      idElement = element.id;
      if (idElement == "") {
        element.id = "title-element-" + tocElementNbr;
      }
      let newIdElement = element.id;
    });
  }

  // create toc list
  let tocElements = content.querySelectorAll(".title-element");

  for (var i = 0; i < tocElements.length; i++) {
    let tocElement = tocElements[i];

    let tocNewLi = document.createElement("li");

    // Add class for the hierarcy of toc
    tocNewLi.classList.add("toc-element");
    tocNewLi.classList.add(
      "toc-element-level-" + tocElement.dataset.titleLevel
    );

    // Keep class of title elements
    let classTocElement = tocElement.classList;
    for (var n = 0; n < classTocElement.length; n++) {
      if (classTocElement[n] != "title-element") {
        tocNewLi.classList.add(classTocElement[n]);
      }
    }

    // Create the element
    tocNewLi.innerHTML =
      '<a href="#' + tocElement.id + '">' + tocElement.innerHTML + "</a>";
    tocUl.appendChild(tocNewLi);
  }
}

ready(function() {
  class handlers extends Paged.Handler {
    constructor(chunker, polisher, caller) {
      super(chunker, polisher, caller);
    }

    beforeParsed(content) {
      createToc({
        content: content,
        tocElement: "#sommaire",
        titleElements: [".article__title"]
      });
    }
  }
  Paged.registerHandlers(handlers);

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
