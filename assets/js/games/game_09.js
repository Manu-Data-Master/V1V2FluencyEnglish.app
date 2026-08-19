/* assets/js/games/game_09.js */

(function (window, document) {
  "use strict";

  var utils = window.GameUtils;
  var element = utils.element;

  var SCENARIOS = [
    {
      context: "game09.context.1",
      sentence: "Sales came in below plan, so we had to revise the ___ for the next two quarters.",
      answers: ["forecast"],
      label: "game09.label.1",
      note: "game09.note.1"
    },
    {
      context: "game09.context.2",
      sentence: "We ___ new clients in two weeks, from contract to first delivery.",
      answers: ["onboard"],
      label: "game09.label.2",
      note: "game09.note.2"
    },
    {
      context: "game09.context.3",
      sentence: "The buyer raised one ___ about the renewal terms.",
      answers: ["concern"],
      label: "game09.label.3",
      note: "game09.note.3"
    },
    {
      context: "game09.context.4",
      sentence: "We ___ the campaign on Monday and measured results on Friday.",
      answers: ["launched"],
      label: "game09.label.4",
      note: "game09.note.4"
    },
    {
      context: "game09.context.5",
      sentence: "The team ___ three enterprise deals last month.",
      answers: ["closed"],
      label: "game09.label.5",
      note: "game09.note.5"
    },
    {
      context: "game09.context.6",
      sentence: "Our margins are under ___ because logistics costs rose.",
      answers: ["pressure"],
      label: "game09.label.6",
      note: "game09.note.6"
    },
    {
      context: "game09.context.7",
      sentence: "Before we decide, let me ___ you through the numbers.",
      answers: ["walk"],
      label: "game09.label.7",
      note: "game09.note.7"
    },
    {
      context: "game09.context.8",
      sentence: "The ads reached the right audience, but they did not ___ our target.",
      answers: ["hit", "reach"],
      label: "game09.label.8",
      note: "game09.note.8"
    },
    {
      context: "game09.context.9",
      sentence: "Please ___ any delivery risk in the shared tracker.",
      answers: ["flag", "raise"],
      label: "game09.label.9",
      note: "game09.note.9"
    },
    {
      context: "game09.context.10",
      sentence: "The market ___ for this segment is roughly forty million dollars.",
      answers: ["opportunity", "size"],
      label: "game09.label.10",
      note: "game09.note.10"
    },
    {
      context: "game09.context.11",
      sentence: "I will ___ the account to Ana before I go on leave.",
      answers: ["hand over", "transfer"],
      label: "game09.label.11",
      note: "game09.note.11"
    },
    {
      context: "game09.context.12",
      sentence: "Legal has to ___ the terms before we sign.",
      answers: ["approve", "review"],
      label: "game09.label.12",
      note: "game09.note.12"
    }
  ];

  function normalize(value) {
    return value.toLowerCase().replace(/\s+/g, " ").trim();
  }

  function mount(container) {
    var shell = utils.createGameShell(container, "09", {
      instructions: t("game09.instructions")
    });

    var deck = utils.buildDeck(SCENARIOS, 30);
    var deckIndex = 0;
    var finished = false;
    var current = null;
    var attempts = 0;

    var contextLine = element("p", "game-context", "");
    var prompt = element("p", "game-prompt", "");
    var input = element("input", "answer-input");
    input.type = "text";
    input.autocomplete = "off";
    input.setAttribute("aria-label", t("game09.ui.inputLabel"));

    var checkButton = element("button", "btn btn-primary", t("game09.ui.check"));
    checkButton.type = "button";

    var form = element("div", "answer-form");
    form.appendChild(input);
    form.appendChild(checkButton);

    var hintLine = element("p", "hint-line", "");

    shell.board.appendChild(contextLine);
    shell.board.appendChild(prompt);
    shell.board.appendChild(form);
    shell.board.appendChild(hintLine);

    function dealScenario() {
      if (deckIndex >= deck.length) {
        deck = utils.buildDeck(SCENARIOS, 30);
        deckIndex = 0;
      }
      current = deck[deckIndex];
      deckIndex += 1;
      attempts = 0;

      contextLine.textContent = t(current.context);
      prompt.textContent = current.sentence;
      hintLine.textContent = t("game09.ui.hint", { label: t(current.label), letter: current.answers[0].charAt(0) });
      input.value = "";
      input.disabled = false;
      checkButton.disabled = false;
      input.focus();
    }

    function check() {
      if (finished || !current) {
        return;
      }
      var value = normalize(input.value);
      if (!value) {
        shell.fail(t("game09.fb.empty"));
        return;
      }
      var isCorrect = current.answers.some(function (answer) {
        return normalize(answer) === value;
      });

      if (isCorrect) {
        input.disabled = true;
        checkButton.disabled = true;
        finished = shell.succeed(t("game09.fb.good") + " " + t(current.note));
        if (finished) {
          return;
        }
        window.setTimeout(dealScenario, 900);
      } else {
        attempts += 1;
        if (attempts >= 2) {
          hintLine.textContent = t("game09.ui.hintLong", {
            label: t(current.label),
            length: current.answers[0].replace(/\s/g, "").length,
            letter: current.answers[0].charAt(0)
          });
        }
        shell.fail(t("game09.fb.wrong"));
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

    dealScenario();
  }

  window.Games = window.Games || {};
  window.Games["09"] = { mount: mount };
})(window, document);
