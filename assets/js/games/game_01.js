/* assets/js/games/game_01.js */

(function (window, document) {
  "use strict";

  var utils = window.GameUtils;
  var element = utils.element;

  var PAIRS = [
    { word: "pitch", gesture: "You stand up, open both hands and face the room" },
    { word: "sign the contract", gesture: "You move your hand across a page and stop" },
    { word: "share the screen", gesture: "You turn the laptop toward the client" },
    { word: "cut the budget", gesture: "You draw a line and push half of it away" },
    { word: "hand over the account", gesture: "You pass a folder to the person beside you" },
    { word: "raise a concern", gesture: "You lift one finger and wait for the room" },
    { word: "close the deal", gesture: "You shake a hand and let it go" },
    { word: "roll out the product", gesture: "You unroll something wide across the table" },
    { word: "hit the target", gesture: "You point once, straight at a spot on the wall" },
    { word: "walk the client through it", gesture: "You trace a path with your finger, slowly" },
    { word: "scale the team", gesture: "Your hands move apart, further and further" },
    { word: "flag the risk", gesture: "You wave a small square of paper in the air" }
  ];

  var BOARD_SIZE = 4;

  function mount(container) {
    var shell = utils.createGameShell(container, "01", {
      instructions: t("game01.instructions"),
      howtoExample: "sign the contract &rarr; You move your hand across a page and stop."
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
        var gestureButton = element("button", "pair-button", entry.gesture);
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
