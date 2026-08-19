/* assets/js/games/game_07.js */

(function (window, document) {
  "use strict";

  var utils = window.GameUtils;
  var element = utils.element;

  var CARDS = [
    { front: "The call starts ___ 2:00.", back: "at 2:00", detail: "game07.detail.1" },
    { front: "We launch ___ March.", back: "in March", detail: "game07.detail.2" },
    { front: "The figures are ___ slide four.", back: "on slide four", detail: "game07.detail.3" },
    { front: "The total came in ___ budget.", back: "under budget", detail: "game07.detail.4" },
    { front: "The client answered ___ (angry).", back: "angrily", detail: "game07.detail.5" },
    { front: "That was a ___ (quick) decision.", back: "quick", detail: "game07.detail.6" },
    { front: "___ review the numbers. (suggest it to the room)", back: "Let's review the numbers.", detail: "game07.detail.7" },
    { front: "We have worked together ___ 2019.", back: "since 2019", detail: "game07.detail.8" },
    { front: "The pilot runs ___ Monday ___ Friday.", back: "from Monday to Friday", detail: "game07.detail.9" },
    { front: "The ___ (present) is ready. Which word?", back: "presentation", detail: "game07.detail.10" },
    { front: "How does -tion sound at the end of a word?", back: "shun", detail: "game07.detail.11" },
    { front: "Our team works ___ Fridays.", back: "on Fridays", detail: "game07.detail.12" },
    { front: "The report is ___ the shared folder.", back: "in the shared folder", detail: "game07.detail.13" },
    { front: "She presented ___ (confident).", back: "confidently", detail: "game07.detail.14" }
  ];

  function mount(container) {
    var shell = utils.createGameShell(container, "07", {
      instructions: t("game07.instructions")
    });

    var queue = utils.shuffle(CARDS);
    var finished = false;
    var current = null;
    var isFlipped = false;

    var card = element("div", "flashcard");
    var inner = element("div", "flashcard-inner");
    var front = element("div", "flashcard-face flashcard-front");
    var back = element("div", "flashcard-face flashcard-back");
    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    var flipButton = element("button", "btn btn-primary", t("game07.ui.flip"));
    flipButton.type = "button";

    var flipRow = element("div", "rating-row");
    flipRow.appendChild(flipButton);

    var ratingRow = element("div", "rating-row");
    ratingRow.hidden = true;
    var knewButton = element("button", "btn btn-primary", t("game07.ui.knew"));
    knewButton.type = "button";
    var missedButton = element("button", "btn btn-ghost", t("game07.ui.missed"));
    missedButton.type = "button";
    ratingRow.appendChild(knewButton);
    ratingRow.appendChild(missedButton);

    shell.board.appendChild(card);
    shell.board.appendChild(flipRow);
    shell.board.appendChild(ratingRow);

    function dealCard() {
      if (!queue.length) {
        queue = utils.shuffle(CARDS);
      }
      current = queue.shift();
      isFlipped = false;
      card.classList.remove("is-flipped");

      front.innerHTML = "";
      front.appendChild(element("p", "game-context", t("game07.ui.prompt")));
      front.appendChild(element("h4", null, current.front));

      back.innerHTML = "";
      back.appendChild(element("h4", null, current.back));
      back.appendChild(element("p", null, t(current.detail)));

      flipRow.hidden = false;
      ratingRow.hidden = true;
      flipButton.focus();
    }

    flipButton.addEventListener("click", function () {
      if (finished || isFlipped) {
        return;
      }
      isFlipped = true;
      card.classList.add("is-flipped");
      flipRow.hidden = true;
      ratingRow.hidden = false;
      shell.feedback(t("game07.fb.compare"), null);
      knewButton.focus();
    });

    knewButton.addEventListener("click", function () {
      if (finished || !isFlipped) {
        return;
      }
      finished = shell.succeed(t("game07.fb.knew"));
      if (finished) {
        return;
      }
      window.setTimeout(dealCard, 600);
    });

    missedButton.addEventListener("click", function () {
      if (finished || !isFlipped) {
        return;
      }
      queue.splice(Math.min(3, queue.length), 0, current);
      shell.fail(t("game07.fb.missed"));
      window.setTimeout(dealCard, 700);
    });

    dealCard();
  }

  window.Games = window.Games || {};
  window.Games["07"] = { mount: mount };
})(window, document);
