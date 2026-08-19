/* assets/js/i18n.js */

(function (window, document) {
  "use strict";

  var STORAGE_KEY = "altgrammar_lang";
  var FALLBACK_LANGUAGE = "en";

  var LANGUAGES = [
    { code: "en", label: "EN", name: "English" },
    { code: "es", label: "ES", name: "Español" },
    { code: "pt", label: "PT", name: "Português" }
  ];

  var catalogs = {};
  var currentLanguage = FALLBACK_LANGUAGE;

  function isSupported(code) {
    return LANGUAGES.some(function (language) {
      return language.code === code;
    });
  }

  function readStoredLanguage() {
    var stored = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      stored = null;
    }
    if (stored && isSupported(stored)) {
      return stored;
    }
    var browserLanguage = (window.navigator.language || "").slice(0, 2).toLowerCase();
    return isSupported(browserLanguage) ? browserLanguage : FALLBACK_LANGUAGE;
  }

  function storeLanguage(code) {
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch (error) {
      /* Private mode: the choice simply lasts for this session. */
    }
  }

  function loadCatalog(code) {
    if (catalogs[code]) {
      return Promise.resolve(catalogs[code]);
    }
    return window.fetch("assets/langs/" + code + ".json").then(function (response) {
      if (!response.ok) {
        throw new Error("Language file " + code + ".json answered " + response.status);
      }
      return response.json();
    }).then(function (data) {
      catalogs[code] = data;
      return data;
    });
  }

  /* Resolves a dotted key such as "home.story.title" inside a catalog. */
  function lookup(catalog, key) {
    if (!catalog) {
      return null;
    }
    var parts = key.split(".");
    var node = catalog;
    for (var index = 0; index < parts.length; index += 1) {
      if (node === null || typeof node !== "object" || !(parts[index] in node)) {
        return null;
      }
      node = node[parts[index]];
    }
    return typeof node === "string" ? node : null;
  }

  function fill(template, params) {
    if (!params) {
      return template;
    }
    return template.replace(/\{(\w+)\}/g, function (match, name) {
      return Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match;
    });
  }

  /*
   * Returns the translation for a key. Missing keys fall back to English,
   * which is why the Spanish and Portuguese files only carry what actually
   * changes: English study material stays English on purpose.
   */
  function translate(key, params) {
    var value = lookup(catalogs[currentLanguage], key);
    if (value === null) {
      value = lookup(catalogs[FALLBACK_LANGUAGE], key);
    }
    if (value === null) {
      return key;
    }
    return fill(value, params);
  }

  function hasKey(key) {
    return lookup(catalogs[currentLanguage], key) !== null || lookup(catalogs[FALLBACK_LANGUAGE], key) !== null;
  }

  /* Applies every data-i18n marker inside a container. */
  function apply(root) {
    var scope = root || document;

    var nodes = scope.querySelectorAll("[data-i18n]");
    Array.prototype.forEach.call(nodes, function (node) {
      var key = node.getAttribute("data-i18n");
      if (hasKey(key)) {
        node.innerHTML = translate(key);
      }
    });

    var attributeNodes = scope.querySelectorAll("[data-i18n-attr]");
    Array.prototype.forEach.call(attributeNodes, function (node) {
      node.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
        var parts = pair.split(":");
        if (parts.length !== 2) {
          return;
        }
        var attribute = parts[0].trim();
        var key = parts[1].trim();
        if (hasKey(key)) {
          node.setAttribute(attribute, translate(key));
        }
      });
    });
  }

  function setDocumentLanguage(code) {
    document.documentElement.setAttribute("lang", code);
    document.title = translate("app.documentTitle");
  }

  function setLanguage(code) {
    if (!isSupported(code)) {
      return Promise.resolve(currentLanguage);
    }
    return loadCatalog(code).then(function () {
      currentLanguage = code;
      storeLanguage(code);
      setDocumentLanguage(code);
      document.dispatchEvent(new CustomEvent("languageChanged", { detail: { language: code } }));
      return code;
    }).catch(function (error) {
      if (code !== FALLBACK_LANGUAGE) {
        return setLanguage(FALLBACK_LANGUAGE);
      }
      throw error;
    });
  }

  function init() {
    var wanted = readStoredLanguage();
    return loadCatalog(FALLBACK_LANGUAGE).then(function () {
      currentLanguage = FALLBACK_LANGUAGE;
      if (wanted === FALLBACK_LANGUAGE) {
        setDocumentLanguage(FALLBACK_LANGUAGE);
        return FALLBACK_LANGUAGE;
      }
      return loadCatalog(wanted).then(function () {
        currentLanguage = wanted;
        setDocumentLanguage(wanted);
        return wanted;
      }).catch(function () {
        setDocumentLanguage(FALLBACK_LANGUAGE);
        return FALLBACK_LANGUAGE;
      });
    });
  }

  window.I18n = {
    LANGUAGES: LANGUAGES,
    STORAGE_KEY: STORAGE_KEY,
    init: init,
    apply: apply,
    setLanguage: setLanguage,
    t: translate,
    has: hasKey,
    getLanguage: function () {
      return currentLanguage;
    }
  };

  /* Short alias used by the mini-games. */
  window.t = translate;
})(window, document);
