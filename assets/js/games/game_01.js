/* assets/js/games/game_01.js */

(function (window, document) {
  "use strict";

  var utils = window.GameUtils;
  var element = utils.element;

  var PAIRS = [
    { word: "pitch", gesture: "game01.gesture.1" },
    { word: "sign the contract", gesture: "game01.gesture.2" },
    { word: "share the screen", gesture: "game01.gesture.3" },
    { word: "cut the budget", gesture: "game01.gesture.4" },
    { word: "hand over the account", gesture: "game01.gesture.5" },
    { word: "raise a concern", gesture: "game01.gesture.6" },
    { word: "close the deal", gesture: "game01.gesture.7" },
    { word: "roll out the product", gesture: "game01.gesture.8" },
    { word: "hit the target", gesture: "game01.gesture.9" },
    { word: "walk the client through it", gesture: "game01.gesture.10" },
    { word: "scale the team", gesture: "game01.gesture.11" },
    { word: "flag the risk", gesture: "game01.gesture.12" }
  ];

  var BOARD_SIZE = 4;

  function mount(container) {
    var shell = utils.createGameShell(container, "01", {
      instructions: t("game01.instructions")
    });

    var finished = false;
    var selectedWordButton = null;
    var boardPairs = [];
    var matchedCount = 0;

    function dealBoard() {
      boardPairs = utils.shuffle(PAIRS).slice(0, BOARD_SIZE);
      matchedCount = 0;
      selectedWordButton = null;

      shell.board.innerHTML = "";
      var columns = element("div", "pair-columns");

      var leftColumn = element("div", null);
      leftColumn.appendChild(element("p", "pair-column-title", t("game01.ui.left")));
      var leftList = element("ul", "pair-list");

      var rightColumn = element("div", null);
      rightColumn.appendChild(element("p", "pair-column-title", t("game01.ui.right")));
      var rightList = element("ul", "pair-list");

      boardPairs.forEach(function (pair, index) {
        var wordItem = element("li", null);
        var wordButton = element("button", "pair-button", pair.word);
        wordButton.type = "button";
        wordButton.dataset.pairIndex = String(index);
        wordButton.addEventListener("click", function () {
          selectWord(wordButton);
        });
        wordItem.appendChild(wordButton);
        leftList.appendChild(wordItem);
      });

      utils.shuffle(boardPairs.map(function (pair, index) {
        return { gesture: pair.gesture, index: index };
      })).forEach(function (entry) {
        var gestureItem = element("li", null);
        var gestureButton = element("button", "pair-button", t(entry.gesture));
        gestureButton.type = "button";
        gestureButton.dataset.pairIndex = String(entry.index);
        gestureButton.addEventListener("click", function () {
          selectGesture(gestureButton);
        });
        gestureItem.appendChild(gestureButton);
        rightList.appendChild(gestureItem);
      });

      leftColumn.appendChild(leftList);
      rightColumn.appendChild(rightList);
      columns.appendChild(leftColumn);
      columns.appendChild(rightColumn);
      shell.board.appendChild(columns);
    }

    function selectWord(button) {
      if (finished || button.classList.contains("is-matched")) {
        return;
      }
      if (selectedWordButton) {
        selectedWordButton.classList.remove("is-selected");
      }
      selectedWordButton = button;
      button.classList.add("is-selected");
      shell.feedback(t("game01.fb.pickGesture"), null);
    }

    function selectGesture(button) {
      if (finished || button.classList.contains("is-matched")) {
        return;
      }
      if (!selectedWordButton) {
        shell.feedback(t("game01.fb.pickPhrase"), null);
        return;
      }
      if (button.dataset.pairIndex === selectedWordButton.dataset.pairIndex) {
        selectedWordButton.classList.remove("is-selected");
        selectedWordButton.classList.add("is-matched");
        selectedWordButton.disabled = true;
        button.classList.add("is-matched");
        button.disabled = true;
        selectedWordButton = null;
        matchedCount += 1;

        finished = shell.succeed(t("game01.fb.matched"));
        if (finished) {
          return;
        }
        if (matchedCount === boardPairs.length) {
          window.setTimeout(dealBoard, 500);
        }
      } else {
        button.classList.add("is-wrong");
        window.setTimeout(function () {
          button.classList.remove("is-wrong");
        }, 400);
        shell.fail(t("game01.fb.wrong"));
      }
    }

    dealBoard();
  }

  window.Games = window.Games || {};
  window.Games["01"] = { mount: mount };
})(window, document);
