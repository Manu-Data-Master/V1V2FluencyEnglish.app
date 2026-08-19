/* assets/js/games/game_02.js */

(function (window, document) {
  "use strict";

  var utils = window.GameUtils;
  var element = utils.element;

  var WORDS = [
    { word: "is", type: "V1" },
    { word: "negotiate", type: "V2" },
    { word: "were", type: "V1" },
    { word: "launch", type: "V2" },
    { word: "am", type: "V1" },
    { word: "deliver", type: "V2" },
    { word: "will be", type: "V1" },
    { word: "present", type: "V2" },
    { word: "are", type: "V1" },
    { word: "invoice", type: "V2" },
    { word: "was", type: "V1" },
    { word: "hire", type: "V2" },
    { word: "forecast", type: "V2" },
    { word: "is not", type: "V1" },
    { word: "close", type: "V2" },
    { word: "sign", type: "V2" },
    { word: "weren't", type: "V1" },
    { word: "report", type: "V2" },
    { word: "ship", type: "V2" },
    { word: "aren't", type: "V1" }
  ];

  var SECONDS_PER_WORD = 6;

  function mount(container) {
    var shell = utils.createGameShell(container, "02", {
      instructions: t("game02.instructions")
    });

    var deck = utils.buildDeck(WORDS, 40);
    var deckIndex = 0;
    var finished = false;
    var timerId = null;
    var secondsLeft = SECONDS_PER_WORD;

    var wordNode = element("p", "tap-word", "");
    wordNode.setAttribute("aria-live", "polite");
    var clockNode = element("p", "tap-clock", "");

    var grid = element("div", "tap-grid");
    var buttonV1 = element("button", "tap-button tap-button-v1", t("game02.ui.v1"));
    buttonV1.type = "button";
    var buttonV2 = element("button", "tap-button tap-button-v2", t("game02.ui.v2"));
    buttonV2.type = "button";
    grid.appendChild(buttonV1);
    grid.appendChild(buttonV2);

    shell.board.appendChild(wordNode);
    shell.board.appendChild(clockNode);
    shell.board.appendChild(grid);

    function stopTimer() {
      if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }
    }

    function nextWord() {
      if (finished) {
        return;
      }
      if (deckIndex >= deck.length) {
        deck = utils.buildDeck(WORDS, 40);
        deckIndex = 0;
      }
      var current = deck[deckIndex];
      deckIndex += 1;
      wordNode.textContent = current.word;
      wordNode.dataset.type = current.type;
      secondsLeft = SECONDS_PER_WORD;
      clockNode.textContent = t("game02.ui.clock", { seconds: secondsLeft });

      stopTimer();
      timerId = window.setInterval(function () {
        secondsLeft -= 1;
        clockNode.textContent = t("game02.ui.clock", { seconds: secondsLeft });
        if (secondsLeft <= 0) {
          stopTimer();
          shell.fail(t("game02.fb.slow", { type: current.type }));
          window.setTimeout(nextWord, 800);
        }
      }, 1000);
    }

    function answer(choice) {
      if (finished || !wordNode.dataset.type) {
        return;
      }
      stopTimer();
      var correctType = wordNode.dataset.type;
      if (choice === correctType) {
        finished = shell.succeed(t(choice === "V1" ? "game02.fb.goodV1" : "game02.fb.goodV2"));
        if (finished) {
          clockNode.textContent = "";
          return;
        }
        window.setTimeout(nextWord, 550);
      } else {
        shell.fail(t("game02.fb.wrong", { type: correctType }));
        window.setTimeout(nextWord, 900);
      }
    }

    buttonV1.addEventListener("click", function () { answer("V1"); });
    buttonV2.addEventListener("click", function () { answer("V2"); });

    nextWord();
  }

  window.Games = window.Games || {};
  window.Games["02"] = { mount: mount };
})(window, document);
