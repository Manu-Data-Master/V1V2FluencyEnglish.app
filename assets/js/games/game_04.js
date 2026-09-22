/* assets/js/games/game_04.js */

(function (window, document) {
  "use strict";

  var utils = window.GameUtils;
  var element = utils.element;

  var ITEMS = [
    { before: "The proposal", after: "ready for Monday.", answers: ["is"], hint: "Present, singular subject.", note: "Singular thing, present time: is." },
    { before: "We", after: "in the client meeting yesterday.", answers: ["were"], hint: "Past, plural subject.", note: "We / you / they take were." },
    { before: "I", after: "responsible for the launch.", answers: ["am"], hint: "Present, first person.", note: "I always takes am." },
    { before: "The numbers", after: "final last week.", answers: ["were"], hint: "Past, plural subject.", note: "Plural subject in the past: were." },
    { before: "She", after: "the new account manager.", answers: ["is"], hint: "Present, third person singular.", note: "He / she / it take is." },
    { before: "Our team", after: "online at nine tomorrow.", answers: ["will be"], hint: "Future — two words.", note: "Future is will be for every subject." },
    { before: "The campaign", after: "not profitable last quarter.", answers: ["was"], hint: "Past, singular subject.", note: "Not comes straight after V1." },
    { before: "You", after: "right about the pricing.", answers: ["are", "were"], hint: "Present or past, second person.", note: "You takes are in the present, were in the past." },
    { before: "The invoices", after: "in your inbox now.", answers: ["are"], hint: "Present, plural subject.", note: "Plural subject in the present: are." },
    { before: "It", after: "a strong quarter for the region.", answers: ["was", "is"], hint: "Third person singular.", note: "It takes is or was — never are." },
    { before: "They", after: "not available before Thursday.", answers: ["are", "were"], hint: "Plural subject.", note: "They take are or were, and not follows V1." },
    { before: "The presentation", after: "ready by the time you arrive.", answers: ["will be"], hint: "Future — two words.", note: "Will be carries every future subject." },
    { before: "He", after: "in Lima during the negotiation.", answers: ["was"], hint: "Past, third person singular.", note: "He / she / it take was in the past." },
    { before: "Our margins", after: "under pressure this year.", answers: ["are"], hint: "Present, plural subject.", note: "Plural subject in the present: are." }
  ];

  function normalize(value) {
    return value.toLowerCase().replace(/\s+/g, " ").trim();
  }

  function mount(container) {
    var shell = utils.createGameShell(container, "04", {
      instructions: t("game04.instructions"),
      howtoExample: "The proposal ___ ready for Monday. &rarr; is (present, singular subject)."
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
      hintLine.textContent = t("game04.ui.hint", { hint: current.hint });
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
        finished = shell.succeed(t("common.correct") + " " + current.note);
        if (finished) {
          return;
        }
        window.setTimeout(dealItem, 750);
      } else {
        shell.fail(t("game04.fb.wrong", { hint: current.hint }));
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
