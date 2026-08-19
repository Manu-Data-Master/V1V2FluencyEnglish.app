/* assets/js/games/game_04.js */

(function (window, document) {
  "use strict";

  var utils = window.GameUtils;
  var element = utils.element;

  var ITEMS = [
    { before: "The proposal", after: "ready for Monday.", answers: ["is"], hint: "game04.hint.1", note: "game04.note.1" },
    { before: "We", after: "in the client meeting yesterday.", answers: ["were"], hint: "game04.hint.2", note: "game04.note.2" },
    { before: "I", after: "responsible for the launch.", answers: ["am"], hint: "game04.hint.3", note: "game04.note.3" },
    { before: "The numbers", after: "final last week.", answers: ["were"], hint: "game04.hint.4", note: "game04.note.4" },
    { before: "She", after: "the new account manager.", answers: ["is"], hint: "game04.hint.5", note: "game04.note.5" },
    { before: "Our team", after: "online at nine tomorrow.", answers: ["will be"], hint: "game04.hint.6", note: "game04.note.6" },
    { before: "The campaign", after: "not profitable last quarter.", answers: ["was"], hint: "game04.hint.7", note: "game04.note.7" },
    { before: "You", after: "right about the pricing.", answers: ["are", "were"], hint: "game04.hint.8", note: "game04.note.8" },
    { before: "The invoices", after: "in your inbox now.", answers: ["are"], hint: "game04.hint.9", note: "game04.note.9" },
    { before: "It", after: "a strong quarter for the region.", answers: ["was", "is"], hint: "game04.hint.10", note: "game04.note.10" },
    { before: "They", after: "not available before Thursday.", answers: ["are", "were"], hint: "game04.hint.11", note: "game04.note.11" },
    { before: "The presentation", after: "ready by the time you arrive.", answers: ["will be"], hint: "game04.hint.12", note: "game04.note.12" },
    { before: "He", after: "in Lima during the negotiation.", answers: ["was"], hint: "game04.hint.13", note: "game04.note.13" },
    { before: "Our margins", after: "under pressure this year.", answers: ["are"], hint: "game04.hint.14", note: "game04.note.14" }
  ];

  function normalize(value) {
    return value.toLowerCase().replace(/\s+/g, " ").trim();
  }

  function mount(container) {
    var shell = utils.createGameShell(container, "04", {
      instructions: t("game04.instructions")
    });

    var deck = utils.buildDeck(ITEMS, 30);
    var deckIndex = 0;
    var finished = false;
    var current = null;

    var prompt = element("p", "game-prompt");
    var input = element("input", "blank-input");
    input.type = "text";
    input.autocomplete = "off";
    input.setAttribute("aria-label", t("game04.ui.inputLabel"));

    var checkButton = element("button", "btn btn-primary", t("game04.ui.check"));
    checkButton.type = "button";

    var form = element("div", "answer-form");
    form.appendChild(checkButton);

    var hintLine = element("p", "hint-line");

    shell.board.appendChild(prompt);
    shell.board.appendChild(form);
    shell.board.appendChild(hintLine);

    function dealItem() {
      if (deckIndex >= deck.length) {
        deck = utils.buildDeck(ITEMS, 30);
        deckIndex = 0;
      }
      current = deck[deckIndex];
      deckIndex += 1;

      prompt.innerHTML = "";
      prompt.appendChild(document.createTextNode(current.before + " "));
      prompt.appendChild(input);
      prompt.appendChild(document.createTextNode(" " + current.after));

      input.value = "";
      input.disabled = false;
      checkButton.disabled = false;
      hintLine.textContent = t("game04.ui.hint", { hint: t(current.hint) });
      input.focus();
    }

    function check() {
      if (finished || !current) {
        return;
      }
      var value = normalize(input.value);
      if (!value) {
        shell.fail(t("game04.fb.empty"));
        return;
      }
      var isCorrect = current.answers.some(function (answer) {
        return normalize(answer) === value;
      });

      if (isCorrect) {
        input.disabled = true;
        checkButton.disabled = true;
        finished = shell.succeed(t("common.correct") + " " + t(current.note));
        if (finished) {
          return;
        }
        window.setTimeout(dealItem, 750);
      } else {
        shell.fail(t("game04.fb.wrong", { hint: t(current.hint) }));
        input.select();
      }
    }

    checkButton.addEventListener("click", check);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        check();
      }
    });

    dealItem();
  }

  window.Games = window.Games || {};
  window.Games["04"] = { mount: mount };
})(window, document);
