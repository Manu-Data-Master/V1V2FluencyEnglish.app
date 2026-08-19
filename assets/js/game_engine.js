/* assets/js/game_engine.js */

(function (window, document) {
  "use strict";

  var STORAGE_KEY = "altgrammar_hunt";
  var TOTAL_LOCATIONS = 9;
  var ROUNDS_TO_WIN = 10;

  /* Single source of truth: every location, its concept and its hidden object. */
  var LOCATIONS = [
    {
      id: "01",
      place: "Ronald Reagan Presidential Library",
      concept: "Movement First",
      objectName: "Silver Speech Coin",
      objectIcon: "\uD83E\uDE99",
      objectLetter: "S"
    },
    {
      id: "02",
      place: "Corriganville Park",
      concept: "Two Kinds of Verb",
      objectName: "Ironwood Film Reel",
      objectIcon: "\uD83C\uDF9E\uFE0F",
      objectLetter: "I"
    },
    {
      id: "03",
      place: "Strathearn Historical Park",
      concept: "The Rule of Seven",
      objectName: "Miner's Brass Lantern",
      objectIcon: "\uD83C\uDFEE",
      objectLetter: "M"
    },
    {
      id: "04",
      place: "Santa Susana Depot",
      concept: "V1 in Detail",
      objectName: "Iron Rail Whistle",
      objectIcon: "\uD83D\uDE82",
      objectLetter: "I"
    },
    {
      id: "05",
      place: "Chumash Indian Museum",
      concept: "V2 in Detail",
      objectName: "Valley Rain Basket",
      objectIcon: "\uD83E\uDDFA",
      objectLetter: "V"
    },
    {
      id: "06",
      place: "Rocky Peak Park",
      concept: "The Other Helpers",
      objectName: "Amber Sandstone Key",
      objectIcon: "\uD83D\uDDDD\uFE0F",
      objectLetter: "A"
    },
    {
      id: "07",
      place: "Mount McCoy Cross",
      concept: "The Small Rules",
      objectName: "Hilltop Bell",
      objectIcon: "\uD83D\uDD14",
      objectLetter: "LL"
    },
    {
      id: "08",
      place: "Simi Valley Cultural Arts Center",
      concept: "The Sound of American English",
      objectName: "Echo Stage Mask",
      objectIcon: "\uD83C\uDFAD",
      objectLetter: "E"
    },
    {
      id: "09",
      place: "Rancho Simi Community Park",
      concept: "Words You Can Actually Use",
      objectName: "Yucca Seed Medallion",
      objectIcon: "\uD83C\uDF3F",
      objectLetter: "Y"
    }
  ];

  var state = null;

  function defaultState() {
    var locations = {};
    LOCATIONS.forEach(function (location) {
      locations[location.id] = "available";
    });
    return { locations: locations, collected_objects: [] };
  }

  function readStorage() {
    var raw = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return defaultState();
    }
    if (!raw) {
      return null;
    }
    try {
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || !parsed.locations) {
        return defaultState();
      }
      var fresh = defaultState();
      LOCATIONS.forEach(function (location) {
        if (parsed.locations[location.id] === "completed") {
          fresh.locations[location.id] = "completed";
        }
      });
      fresh.collected_objects = LOCATIONS
        .filter(function (location) { return fresh.locations[location.id] === "completed"; })
        .map(function (location) { return location.id; });
      return fresh;
    } catch (error) {
      return defaultState();
    }
  }

  function writeStorage() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      /* Storage may be unavailable in private mode: the session still works in memory. */
    }
  }

  function initialize() {
    var stored = readStorage();
    if (stored === null) {
      state = defaultState();
      writeStorage();
    } else {
      state = stored;
    }
  }

  function getLocation(locationId) {
    var found = null;
    LOCATIONS.forEach(function (location) {
      if (location.id === locationId) {
        found = location;
      }
    });
    return found;
  }

  function emit(eventName, detail) {
    document.dispatchEvent(new CustomEvent(eventName, { detail: detail || {} }));
  }

  /* ---------- Public API ---------- */

  var GameEngine = {
    STORAGE_KEY: STORAGE_KEY,
    TOTAL_LOCATIONS: TOTAL_LOCATIONS,
    ROUNDS_TO_WIN: ROUNDS_TO_WIN,

    getLocations: function () {
      return LOCATIONS.map(function (location) {
        var copy = {};
        Object.keys(location).forEach(function (key) { copy[key] = location[key]; });
        copy.status = state.locations[location.id];
        return copy;
      });
    },

    getLocation: function (locationId) {
      var location = getLocation(locationId);
      if (!location) {
        return null;
      }
      var copy = {};
      Object.keys(location).forEach(function (key) { copy[key] = location[key]; });
      copy.status = state.locations[locationId];
      return copy;
    },

    getProgress: function () {
      return JSON.parse(JSON.stringify(state));
    },

    markComplete: function (locationId) {
      var location = getLocation(locationId);
      if (!location) {
        return false;
      }
      if (state.locations[locationId] === "completed") {
        return false;
      }
      state.locations[locationId] = "completed";
      state.collected_objects.push(locationId);
      writeStorage();
      emit("objectCollected", {
        locationId: location.id,
        objectName: location.objectName,
        objectIcon: location.objectIcon,
        objectLetter: location.objectLetter
      });
      return true;
    },

    isCompleted: function (locationId) {
      return state.locations[locationId] === "completed";
    },

    getCollectedCount: function () {
      return state.collected_objects.length;
    },

    getAllCollected: function () {
      return state.collected_objects.slice();
    },

    isHuntComplete: function () {
      return state.collected_objects.length === TOTAL_LOCATIONS;
    },

    resetAll: function () {
      state = defaultState();
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        /* Nothing else to clean up. */
      }
      writeStorage();
      emit("huntReset", { total: TOTAL_LOCATIONS });
      return true;
    }
  };

  /* ---------- Shared helpers for the nine mini-games ---------- */

  function shuffle(items) {
    var copy = items.slice();
    for (var index = copy.length - 1; index > 0; index -= 1) {
      var swapIndex = Math.floor(Math.random() * (index + 1));
      var temporary = copy[index];
      copy[index] = copy[swapIndex];
      copy[swapIndex] = temporary;
    }
    return copy;
  }

  function buildDeck(items, size) {
    var deck = shuffle(items);
    while (deck.length < size) {
      deck = deck.concat(shuffle(items));
    }
    return deck.slice(0, size);
  }

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined && text !== null) {
      node.textContent = text;
    }
    return node;
  }

  /*
   * Creates the shared frame every mini-game runs inside: round counter,
   * progress bar, playing board, feedback line and the winning card.
   */
  function createGameShell(container, locationId, options) {
    var settings = options || {};
    var location = GameEngine.getLocation(locationId);
    var totalRounds = settings.totalRounds || ROUNDS_TO_WIN;
    var alreadyCollected = GameEngine.isCompleted(locationId);
    var round = 0;

    container.innerHTML = "";

    var shell = element("div", "game-shell");

    var hud = element("div", "game-hud");
    var roundLabel = element("p", "game-round", t("game.round", { current: 1, total: totalRounds }));
    roundLabel.setAttribute("aria-live", "polite");
    var track = element("div", "progress-track");
    var fill = element("div", "progress-fill");
    track.appendChild(fill);
    hud.appendChild(roundLabel);
    hud.appendChild(track);

    if (alreadyCollected) {
      var badge = element("p", "game-collected-badge");
      badge.innerHTML = "<span aria-hidden=\"true\">" + location.objectIcon + "</span> " + t("game.alreadyCollected");
      hud.appendChild(badge);
    }

    var instructions = element("p", "game-instructions", settings.instructions || "");
    var board = element("div", "game-board");
    var feedback = element("p", "game-feedback");
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");

    var reward = element("div", "reward-card");
    reward.hidden = true;

    shell.appendChild(hud);
    if (settings.instructions) {
      shell.appendChild(instructions);
    }
    shell.appendChild(board);
    shell.appendChild(feedback);
    shell.appendChild(reward);
    container.appendChild(shell);

    function updateHud() {
      var displayRound = Math.min(round + 1, totalRounds);
      roundLabel.textContent = t("game.round", { current: displayRound, total: totalRounds });
      fill.style.width = Math.round((round / totalRounds) * 100) + "%";
    }

    function showReward() {
      var isNew = GameEngine.markComplete(locationId);
      board.hidden = true;
      feedback.textContent = "";
      roundLabel.textContent = t("game.roundComplete", { total: totalRounds });
      fill.style.width = "100%";

      reward.hidden = false;
      reward.innerHTML = "";
      reward.appendChild(element("p", "reward-eyebrow", t(isNew ? "reward.secured" : "reward.practice")));
      reward.appendChild(element("div", "reward-icon", location.objectIcon));
      reward.appendChild(element("h3", "reward-name", location.objectName));
      reward.appendChild(element("p", "reward-place", t("reward.recoveredAt", { place: location.place })));

      var letterRow = element("div", "reward-letter-row");
      letterRow.appendChild(element("span", "reward-letter-label", t("reward.letterLabel")));
      letterRow.appendChild(element("span", "reward-letter", location.objectLetter));
      reward.appendChild(letterRow);

      if (!isNew) {
        reward.appendChild(element("p", "reward-note", t("reward.alreadyHad")));
      }

      var backButton = element("button", "btn btn-primary btn-large", t("reward.back"));
      backButton.type = "button";
      backButton.addEventListener("click", function () {
        window.location.hash = "#/home";
      });
      reward.appendChild(backButton);
      reward.focus();
    }

    updateHud();

    return {
      board: board,
      feedbackNode: feedback,
      location: location,
      totalRounds: totalRounds,

      getRound: function () {
        return round;
      },

      feedback: function (message, tone) {
        feedback.textContent = message;
        feedback.className = "game-feedback" + (tone ? " is-" + tone : "");
      },

      /* Advances one round. Returns true when the game is finished. */
      succeed: function (message) {
        round += 1;
        if (message) {
          feedback.textContent = message;
          feedback.className = "game-feedback is-good";
        }
        if (round >= totalRounds) {
          window.setTimeout(showReward, 700);
          return true;
        }
        updateHud();
        return false;
      },

      fail: function (message) {
        feedback.textContent = message;
        feedback.className = "game-feedback is-bad";
      }
    };
  }

  window.GameEngine = GameEngine;
  window.GameUtils = {
    shuffle: shuffle,
    buildDeck: buildDeck,
    element: element,
    createGameShell: createGameShell
  };

  initialize();
})(window, document);
