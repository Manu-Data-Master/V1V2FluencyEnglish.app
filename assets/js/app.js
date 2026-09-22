/* assets/js/app.js */

(function (window, document) {
  "use strict";

  var engine = window.GameEngine;
  var utils = window.GameUtils;
  var element = utils.element;

  var contentArea = document.getElementById("content-area");
  var headerPlaceholder = document.getElementById("header-placeholder");
  var menuPlaceholder = document.getElementById("menu-placeholder");
  var footerPlaceholder = document.getElementById("footer-placeholder");
  var menuBackdrop = document.getElementById("menu-backdrop");
  var resetModal = document.getElementById("reset-modal");
  var locationModal = document.getElementById("location-modal");

  var loadedGames = {};
  var currentRoute = "";

  var LOCATION_PHOTOS = {
    "01": "assets/images/1_ronald_reagan_presidential_library.png",
    "02": "assets/images/2_corriganville_park.png",
    "03": "assets/images/3_strathearn_historical_park.png",
    "04": "assets/images/4_santa_susana_depot.png",
    "05": "assets/images/5_chumash_indian_museum.png",
    "06": "assets/images/6_rocky_peak_park.png",
    "07": "assets/images/7_mount_mccoy_cross.png",
    "08": "assets/images/8_simi_valley_cultural_arts_center.png",
    "09": "assets/images/9_rancho_simi_community_park.png"
  };

  /* ---------- Fetch helpers ---------- */

  function fetchFragment(url) {
    return window.fetch(url).then(function (response) {
      if (!response.ok) {
        throw new Error("The server answered " + response.status + " for " + url);
      }
      return response.text();
    });
  }

  function renderLoadError(target, url, error) {
    var isFileProtocol = window.location.protocol === "file:";
    target.innerHTML = "";
    var box = element("div", "load-error");
    box.appendChild(element("h2", null, t("error.title")));
    box.appendChild(element("p", null, t("error.line", { url: url })));
    if (isFileProtocol) {
      var explanation = element("p", null, "");
      explanation.innerHTML = t("error.fileProtocol");
      box.appendChild(explanation);
      var command = element("p", null, "");
      command.innerHTML = "<code>python3 -m http.server 8000</code> &nbsp;then&nbsp; <code>http://localhost:8000</code>";
      box.appendChild(command);
    } else {
      box.appendChild(element("p", null, t("error.checkFile")));
    }
    var retry = element("button", "btn btn-ghost", t("error.retry"));
    retry.type = "button";
    retry.addEventListener("click", function () {
      window.location.reload();
    });
    box.appendChild(retry);
    if (error && error.message) {
      box.appendChild(element("p", "footer-note", t("error.technical", { message: error.message })));
    }
    target.appendChild(box);
  }

  /* ---------- Header ---------- */

  function buildHeaderIcons() {
    var list = document.getElementById("object-icons");
    if (!list) {
      return;
    }
    list.innerHTML = "";
    engine.getLocations().forEach(function (location) {
      var item = element("li", "object-icon");
      item.dataset.locationId = location.id;
      item.tabIndex = 0;
      var glyph = element("span", "object-glyph", location.objectIcon);
      glyph.setAttribute("aria-hidden", "true");
      item.appendChild(glyph);

      var tip = element("span", "object-tip");
      tip.innerHTML = "<strong>" + location.objectName + "</strong><span class=\"object-tip-letter\">" +
        t("header.tipLetter", { letter: location.objectLetter }) + "</span>";
      item.appendChild(tip);

      if (location.status === "completed") {
        item.classList.add("is-collected");
        item.setAttribute("aria-label", t("header.iconCollected", { object: location.objectName, letter: location.objectLetter }));
      } else {
        item.setAttribute("aria-label", t("header.iconMissing", { place: location.place }));
      }
      list.appendChild(item);
    });
  }

  function updateHeaderCounter(highlightId) {
    var counter = document.getElementById("object-counter");
    if (counter) {
      counter.textContent = t("header.objectsFound", { count: engine.getCollectedCount(), total: engine.TOTAL_LOCATIONS });
    }
    buildHeaderIcons();
    if (highlightId) {
      var icon = document.querySelector('.object-icon[data-location-id="' + highlightId + '"]');
      if (icon) {
        icon.classList.add("just-collected");
      }
    }
  }

  function buildLanguageSwitch() {
    var container = document.getElementById("language-switch");
    if (!container) {
      return;
    }
    container.innerHTML = "";
    window.I18n.LANGUAGES.forEach(function (language) {
      var button = element("button", "language-button", language.label);
      button.type = "button";
      button.dataset.language = language.code;
      button.title = language.name;
      button.setAttribute("aria-label", language.name);
      if (language.code === window.I18n.getLanguage()) {
        button.classList.add("is-active");
        button.setAttribute("aria-pressed", "true");
      } else {
        button.setAttribute("aria-pressed", "false");
      }
      button.addEventListener("click", function () {
        if (language.code === window.I18n.getLanguage()) {
          return;
        }
        window.I18n.setLanguage(language.code);
      });
      container.appendChild(button);
    });
  }

  function wireHeader() {
    window.I18n.apply(headerPlaceholder);
    buildLanguageSwitch();
    updateHeaderCounter(null);

    var toggle = document.getElementById("menu-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var menu = document.getElementById("left-menu");
        if (!menu) {
          return;
        }
        var isOpen = menu.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        menuBackdrop.hidden = !isOpen;
      });
    }

    var resetButton = document.getElementById("reset-button");
    if (resetButton) {
      resetButton.addEventListener("click", openResetModal);
    }
  }

  /* ---------- Reset modal ---------- */

  var lastFocusedBeforeModal = null;

  function openResetModal() {
    lastFocusedBeforeModal = document.activeElement;
    resetModal.hidden = false;
    document.getElementById("reset-cancel").focus();
    document.addEventListener("keydown", handleModalKeys);
  }

  function closeResetModal() {
    resetModal.hidden = true;
    document.removeEventListener("keydown", handleModalKeys);
    if (lastFocusedBeforeModal && lastFocusedBeforeModal.focus) {
      lastFocusedBeforeModal.focus();
    }
  }

  function handleModalKeys(event) {
    if (event.key === "Escape") {
      closeResetModal();
      return;
    }
    if (event.key !== "Tab") {
      return;
    }
    var focusable = resetModal.querySelectorAll("button");
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function wireResetModal() {
    document.getElementById("reset-cancel").addEventListener("click", closeResetModal);
    document.getElementById("reset-confirm").addEventListener("click", function () {
      engine.resetAll();
      closeResetModal();
      window.location.hash = "#/home";
      if (currentRoute === "home") {
        renderRoute();
      }
    });
    resetModal.addEventListener("click", function (event) {
      if (event.target === resetModal) {
        closeResetModal();
      }
    });
  }

  /* ---------- Location info modal ---------- */

  var lastFocusedBeforeLocationModal = null;

  function openLocationModal(locationId) {
    var location = engine.getLocation(locationId);
    if (!location || !locationModal) {
      return;
    }
    document.getElementById("location-modal-eyebrow").textContent = t("place" + locationId + ".t01");
    document.getElementById("location-modal-title").textContent = location.place;
    var photo = document.getElementById("location-modal-photo");
    photo.src = LOCATION_PHOTOS[locationId] || "";
    photo.alt = location.place;
    document.getElementById("location-modal-history-label").textContent = t("locationModal.t01");
    document.getElementById("location-modal-history").textContent = t("history." + locationId);
    document.getElementById("location-modal-learn-label").textContent = t("locationModal.t02");
    document.getElementById("location-modal-concept").textContent = t("place" + locationId + ".t04");
    document.getElementById("location-modal-object-label").textContent = t("locationModal.t03");
    document.getElementById("location-modal-object").innerHTML = t("place" + locationId + ".t03");

    lastFocusedBeforeLocationModal = document.activeElement;
    locationModal.hidden = false;
    document.getElementById("location-modal-close").focus();
    document.addEventListener("keydown", handleLocationModalKeys);
  }

  function closeLocationModal() {
    if (!locationModal) {
      return;
    }
    locationModal.hidden = true;
    document.removeEventListener("keydown", handleLocationModalKeys);
    if (lastFocusedBeforeLocationModal && lastFocusedBeforeLocationModal.focus) {
      lastFocusedBeforeLocationModal.focus();
    }
  }

  function handleLocationModalKeys(event) {
    if (event.key === "Escape") {
      closeLocationModal();
    }
  }

  function wireLocationModal() {
    if (!locationModal) {
      return;
    }
    document.getElementById("location-modal-close").addEventListener("click", closeLocationModal);
    locationModal.addEventListener("click", function (event) {
      if (event.target === locationModal) {
        closeLocationModal();
      }
    });
  }

  /* ---------- Left menu ---------- */

  function buildMenu() {
    window.I18n.apply(menuPlaceholder);
    var list = document.getElementById("menu-locations");
    if (!list) {
      return;
    }
    list.innerHTML = "";
    engine.getLocations().forEach(function (location, index) {
      var item = element("li", null);
      var link = element("a", "menu-item menu-item-location");
      link.href = "#/place/" + location.id;
      link.dataset.route = "place/" + location.id;

      var icon = element("span", "menu-icon", location.objectIcon);
      icon.setAttribute("aria-hidden", "true");
      link.appendChild(icon);

      var label = element("span", "menu-label");
      label.appendChild(document.createTextNode(t("menu.location", { number: index + 1 })));
      label.appendChild(element("span", "menu-label-place", location.place));
      link.appendChild(label);

      var check = element("span", "menu-check", "\u2714");
      check.setAttribute("aria-hidden", "true");
      link.appendChild(check);

      if (location.status === "completed") {
        link.classList.add("is-complete");
        link.setAttribute("aria-label", t("menu.locationDone", { number: index + 1, place: location.place }));
      } else {
        link.setAttribute("aria-label", t("menu.locationAria", { number: index + 1, place: location.place }));
      }

      item.appendChild(link);
      list.appendChild(item);
    });
    updateFinalMenuItem();
    highlightActiveMenuItem();
  }

  function updateFinalMenuItem() {
    var finalItem = document.getElementById("menu-final-item");
    var note = document.getElementById("menu-locked-note");
    if (!finalItem || !note) {
      return;
    }
    var complete = engine.isHuntComplete();
    finalItem.hidden = !complete;
    note.hidden = complete;
  }

  function highlightActiveMenuItem() {
    var links = document.querySelectorAll(".menu-item");
    Array.prototype.forEach.call(links, function (link) {
      if (link.dataset.route === currentRoute) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("is-active");
        link.removeAttribute("aria-current");
      }
    });
  }

  function closeMenuOnMobile() {
    var menu = document.getElementById("left-menu");
    var toggle = document.getElementById("menu-toggle");
    if (menu) {
      menu.classList.remove("is-open");
    }
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }
    menuBackdrop.hidden = true;
  }

  /* ---------- Home view (map) ---------- */

  function renderMapCards() {
    var grid = document.getElementById("map-grid");
    if (!grid) {
      return;
    }
    grid.innerHTML = "";
    engine.getLocations().forEach(function (location, index) {
      var card = element("article", "map-card");
      card.dataset.locationId = location.id;
      if (location.status === "completed") {
        card.classList.add("is-complete");
      }

      var top = element("div", "map-card-top");
      top.appendChild(element("span", "map-card-number", t("menu.location", { number: index + 1 })));
      var icon = element("span", "map-card-icon", location.objectIcon);
      icon.setAttribute("aria-hidden", "true");
      top.appendChild(icon);
      card.appendChild(top);

      card.appendChild(element("h3", "map-card-place", location.place));

      var infoLink = element("button", "map-card-learn-more");
      infoLink.type = "button";
      infoLink.innerHTML = "<span aria-hidden=\"true\">ℹ️</span> " + t("map.learnMore");
      infoLink.setAttribute("aria-label", t("map.infoAria", { place: location.place }));
      infoLink.addEventListener("click", function () {
        openLocationModal(location.id);
      });
      card.appendChild(infoLink);

      card.appendChild(element("p", "map-card-concept", t("concept." + location.id)));

      var status = element("p", "map-card-status", t(location.status === "completed" ? "map.done" : "map.notVisited"));
      card.appendChild(status);

      var button = element("button", "btn btn-primary map-card-button", t("map.explore"));
      button.type = "button";
      button.setAttribute("aria-label", t("map.exploreAria", { place: location.place }));
      button.addEventListener("click", function () {
        window.location.hash = "#/place/" + location.id;
      });
      card.appendChild(button);

      grid.appendChild(card);
    });
    updateMapProgress();
  }

  var MAP_PIN_POSITIONS = {
    "01": { left: 7.2, top: 53.6 },  // 1. Ronald Reagan Presidential Library
    "02": { left: 93.4, top: 49.1 }, // 2. Corriganville Park
    "03": { left: 31.7, top: 41.8 }, // 3. Strathearn Historical Park
    "04": { left: 80.5, top: 53.6 }, // 4. Santa Susana Depot
    "05": { left: 9.5, top: 94.9 },  // 5. Chumash Indian Museum
    "06": { left: 93.8, top: 10.2 }, // 6. Rocky Peak Park
    "07": { left: 15.9, top: 49.2 }, // 7. Mount McCoy Cross
    "08": { left: 51.2, top: 44.5 }, // 8. Simi Valley Cultural Arts Center
    "09": { left: 34.5, top: 52.0 }  // 9. Rancho Simi Community Park
  };

  function renderMapPins() {
    var container = document.getElementById("story-map-pins");
    if (!container) {
      return;
    }
    container.innerHTML = "";
    engine.getLocations().forEach(function (location) {
      var pos = MAP_PIN_POSITIONS[location.id];
      if (!pos) {
        return;
      }
      var pin = element("button", "map-pin");
      pin.type = "button";
      pin.style.left = pos.left + "%";
      pin.style.top = pos.top + "%";
      var photoUrl = LOCATION_PHOTOS[location.id] || "";
      if (photoUrl) {
        photoUrl = new URL(photoUrl, document.baseURI).href;
      }
      pin.style.setProperty("--pin-photo", "url('" + photoUrl + "')");
      pin.setAttribute("aria-label", t("map.infoAria", { place: location.place }));

      pin.appendChild(element("span", "map-pin-label", location.place));

      pin.addEventListener("click", function () {
        openLocationModal(location.id);
      });

      container.appendChild(pin);
    });
  }

  function renderCreditsPhotos() {
    var grid = document.getElementById("credits-photo-grid");
    if (!grid) {
      return;
    }
    grid.innerHTML = "";
    engine.getLocations().forEach(function (location) {
      var item = element("button", "credits-photo-item");
      item.type = "button";
      item.setAttribute("aria-label", t("map.infoAria", { place: location.place }));

      var photo = element("img", "credits-photo-thumb");
      photo.src = LOCATION_PHOTOS[location.id] || "";
      photo.alt = "";
      photo.setAttribute("aria-hidden", "true");
      photo.loading = "lazy";
      item.appendChild(photo);

      item.appendChild(element("span", "credits-photo-caption", location.place));

      item.addEventListener("click", function () {
        openLocationModal(location.id);
      });

      grid.appendChild(item);
    });
  }

  function updateMapProgress() {
    var label = document.getElementById("map-progress-label");
    var fill = document.getElementById("map-progress-fill");
    if (!label || !fill) {
      return;
    }
    var count = engine.getCollectedCount();
    label.textContent = t("map.progress", { count: count, total: engine.TOTAL_LOCATIONS });
    fill.style.width = Math.round((count / engine.TOTAL_LOCATIONS) * 100) + "%";
  }

  /* ---------- Place view ---------- */

  function wirePlaceView() {
    var article = contentArea.querySelector("[data-location-id]");
    if (!article) {
      return;
    }
    var locationId = article.dataset.locationId;
    var startButton = contentArea.querySelector(".start-game-button");
    var gameSection = contentArea.querySelector(".game-section");
    var mount = contentArea.querySelector(".game-mount");

    if (!startButton || !gameSection || !mount) {
      return;
    }

    startButton.addEventListener("click", function () {
      gameSection.hidden = false;
      gameSection.classList.add("is-revealed");
      startButton.disabled = true;
      startButton.textContent = t("place.started");
      loadGame(locationId, mount);
      window.setTimeout(function () {
        gameSection.scrollIntoView({ behavior: "smooth", block: "start" });
        var heading = gameSection.querySelector("h2");
        if (heading) {
          heading.setAttribute("tabindex", "-1");
          heading.focus();
        }
      }, 120);
    });
  }

  function loadGame(locationId, mount) {
    if (loadedGames[locationId] && window.Games && window.Games[locationId]) {
      window.Games[locationId].mount(mount);
      return;
    }
    mount.innerHTML = "<p class=\"loading-note\">" + t("place.preparing") + "</p>";
    var script = document.createElement("script");
    script.src = "assets/js/games/game_" + locationId + ".js";
    script.onload = function () {
      loadedGames[locationId] = true;
      if (window.Games && window.Games[locationId]) {
        window.Games[locationId].mount(mount);
      } else {
        renderLoadError(mount, script.src, new Error(t("error.gameRegister")));
      }
    };
    script.onerror = function () {
      renderLoadError(mount, script.src, new Error(t("error.gameDownload")));
    };
    document.body.appendChild(script);
  }

  /* ---------- Final reveal view ---------- */

  function renderFinalReveal() {
    var lettersRow = document.getElementById("reveal-letters");
    var summary = document.getElementById("reveal-summary");
    var word = document.getElementById("reveal-word");
    if (!lettersRow || !summary || !word) {
      return;
    }

    lettersRow.innerHTML = "";
    summary.innerHTML = "";
    word.textContent = "";

    var locations = engine.getLocations();

    locations.forEach(function (location, index) {
      var tile = element("div", "reveal-tile");
      tile.style.animationDelay = (index * 420) + "ms";
      var icon = element("span", "reveal-tile-icon", location.objectIcon);
      icon.setAttribute("aria-hidden", "true");
      tile.appendChild(icon);
      tile.appendChild(element("span", "reveal-tile-letter", location.objectLetter));
      tile.appendChild(element("span", "reveal-tile-name", location.objectName));
      lettersRow.appendChild(tile);

      var card = element("li", "reveal-summary-item");
      var summaryIcon = element("span", "reveal-summary-icon", location.objectIcon);
      summaryIcon.setAttribute("aria-hidden", "true");
      card.appendChild(summaryIcon);
      var text = element("div", "reveal-summary-text");
      text.appendChild(element("strong", null, location.objectName));
      text.appendChild(element("span", null, location.place));
      card.appendChild(text);
      card.appendChild(element("span", "reveal-summary-letter", location.objectLetter));
      summary.appendChild(card);
    });

    var totalDelay = locations.length * 420 + 600;
    window.setTimeout(function () {
      var letters = locations.map(function (location) { return location.objectLetter; });
      letters.forEach(function (letter, index) {
        var span = element("span", "reveal-word-letter", letter);
        span.style.animationDelay = (index * 140) + "ms";
        if (index === 4) {
          word.appendChild(element("span", "reveal-word-space", " "));
        }
        word.appendChild(span);
      });
      word.setAttribute("aria-label", "SIMI VALLEY");
    }, totalDelay);

    var playAgain = document.getElementById("play-again-button");
    if (playAgain) {
      playAgain.addEventListener("click", function () {
        engine.resetAll();
        window.location.hash = "#/home";
      });
    }
  }

  /* ---------- Router ---------- */

  var ROUTES = {
    home: "assets/contents/main_map.html",
    credits: "assets/contents/credits.html",
    final: "assets/contents/final_reveal.html"
  };

  function parseHash() {
    var hash = window.location.hash.replace(/^#\/?/, "");
    if (!hash) {
      return "home";
    }
    return hash;
  }

  function renderRoute() {
    var route = parseHash();
    var url;

    if (route.indexOf("place/") === 0) {
      var locationId = route.split("/")[1];
      if (!engine.getLocation(locationId)) {
        window.location.hash = "#/home";
        return;
      }
      url = "assets/contents/place_" + locationId + ".html";
    } else if (route === "final") {
      if (!engine.isHuntComplete()) {
        window.location.hash = "#/home";
        return;
      }
      url = ROUTES.final;
    } else if (ROUTES[route]) {
      url = ROUTES[route];
    } else {
      window.location.hash = "#/home";
      return;
    }

    currentRoute = route;
    highlightActiveMenuItem();
    closeMenuOnMobile();
    contentArea.innerHTML = "<p class=\"loading-note\">" + t("ui.loading") + "</p>";

    fetchFragment(url).then(function (html) {
      contentArea.innerHTML = html;
      window.I18n.apply(contentArea);
      contentArea.focus();
      window.scrollTo({ top: 0, behavior: "auto" });

      if (route === "home") {
        renderMapCards();
        renderMapPins();
      } else if (route === "credits") {
        renderCreditsPhotos();
      } else if (route === "final") {
        renderFinalReveal();
      } else if (route.indexOf("place/") === 0) {
        wirePlaceView();
      }
    }).catch(function (error) {
      renderLoadError(contentArea, url, error);
    });
  }

  /* ---------- Global events ---------- */

  document.addEventListener("objectCollected", function (event) {
    updateHeaderCounter(event.detail.locationId);
    buildMenu();
    var card = document.querySelector('.map-card[data-location-id="' + event.detail.locationId + '"]');
    if (card) {
      card.classList.add("is-complete");
      var status = card.querySelector(".map-card-status");
      if (status) {
        status.textContent = t("map.done");
      }
    }
    updateMapProgress();
  });

  document.addEventListener("huntReset", function () {
    updateHeaderCounter(null);
    buildMenu();
    renderMapCards();
  });

  document.addEventListener("languageChanged", function () {
    window.I18n.apply(document);
    buildLanguageSwitch();
    updateHeaderCounter(null);
    buildMenu();
    renderRoute();
  });

  window.addEventListener("hashchange", renderRoute);

  menuBackdrop.addEventListener("click", closeMenuOnMobile);

  document.addEventListener("click", function (event) {
    var link = event.target.closest ? event.target.closest(".menu-item") : null;
    if (link) {
      closeMenuOnMobile();
    }
  });

  /* ---------- Boot ---------- */

  function boot() {
    wireResetModal();
    wireLocationModal();

    var sections = [
      { placeholder: headerPlaceholder, url: "assets/sections/header.html", after: wireHeader },
      { placeholder: menuPlaceholder, url: "assets/sections/left_menu.html", after: buildMenu },
      { placeholder: footerPlaceholder, url: "assets/sections/footer.html", after: function () {
        window.I18n.apply(footerPlaceholder);
      } }
    ];

    window.I18n.init().catch(function () {
      /* Without a catalog the app still runs on the English text baked into the markup. */
    }).then(function () {
      window.I18n.apply(document);

      var loaders = sections.map(function (section) {
        return fetchFragment(section.url).then(function (html) {
          section.placeholder.innerHTML = html;
          if (section.after) {
            section.after();
          }
        }).catch(function (error) {
          renderLoadError(section.placeholder, section.url, error);
          throw error;
        });
      });

      return Promise.all(loaders);
    }).then(function () {
      if (!window.location.hash) {
        window.location.hash = "#/home";
      }
      renderRoute();
    }).catch(function () {
      /* The failing section already shows its own message; the map still tries to load. */
      renderRoute();
    });
  }

  boot();
})(window, document);
