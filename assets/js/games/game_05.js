/* assets/js/games/game_05.js */

(function (window, document) {
  "use strict";

  var utils = window.GameUtils;
  var element = utils.element;

  var ITEMS = [
    {
      task: "game05.task.1",
      source: "The client approved the budget.",
      answers: ["did the client approve the budget?"],
      note: "game05.note.1"
    },
    {
      task: "game05.task.2",
      source: "She manages the Lima account.",
      answers: ["does she manage the lima account?"],
      note: "game05.note.2"
    },
    {
      task: "game05.task.3",
      source: "They will sign this week.",
      answers: ["will they sign this week?"],
      note: "game05.note.3"
    },
    {
      task: "game05.task.4",
      source: "We discount below ten percent.",
      answers: ["we do not discount below ten percent.", "we don't discount below ten percent."],
      note: "game05.note.4"
    },
    {
      task: "game05.task.5",
      source: "The team shipped the update.",
      answers: ["the team did not ship the update.", "the team didn't ship the update."],
      note: "game05.note.5"
    },
    {
      task: "game05.task.6",
      source: "Marketing sent the report.",
      answers: ["did marketing send the report?"],
      note: "game05.note.6"
    },
    {
      task: "game05.task.7",
      source: "Did he present the results?",
      answers: ["he presented the results."],
      note: "game05.note.7"
    },
    {
      task: "game05.task.8",
      source: "Does she report to you?",
      answers: ["she reports to me."],
      note: "game05.note.8"
    },
    {
      task: "game05.task.9",
      source: "We hire two developers in March.",
      answers: ["do we hire two developers in march?"],
      note: "game05.note.9"
    },
    {
      task: "game05.task.10",
      source: "The client will renew the contract.",
      answers: ["the client will not renew the contract.", "the client won't renew the contract."],
      note: "game05.note.10"
    },
    {
      task: "game05.task.11",
      source: "The campaign reached the target audience.",
      answers: ["did the campaign reach the target audience?"],
      note: "game05.note.11"
    },
    {
      task: "game05.task.12",
      source: "He closes deals every quarter.",
      answers: ["does he close deals every quarter?"],
      note: "game05.note.12"
    }
  ];

  function normalize(value) {
    return value
      .toLowerCase()
      .replace(/\u2019/g, "'")
      .replace(/[.?!]+$/g, function (match) { return match.charAt(0); })
      .replace(/\s+/g, " ")
      .trim();
  }

  function looselyEqual(given, expected) {
    var a = normalize(given).replace(/[.?!]/g, "");
    var b = normalize(expected).replace(/[.?!]/g, "");
    return a === b;
  }

  function mount(container) {
    var shell = utils.createGameShell(container, "05", {
      instructions: t("game05.instructions")
    });

    var deck = utils.buildDeck(ITEMS, 30);
    var deckIndex = 0;
    var finished = false;
    var current = null;

    var taskLine = element("p", "game-context", "");
    var prompt = element("p", "game-prompt", "");
    var input = element("input", "answer-input");
    input.type = "text";
    input.autocomplete = "off";
    input.setAttribute("aria-label", t("game05.ui.inputLabel"));

    var checkButton = element("button", "btn btn-primary", t("game05.ui.check"));
    checkButton.type = "button";

    var form = element("div", "answer-form");
    form.appendChild(input);
    form.appendChild(checkButton);

    var hintLine = element("p", "hint-line", t("game05.ui.hint"));

    shell.board.appendChild(taskLine);
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

      taskLine.textContent = t(current.task);
      prompt.textContent = current.source;
      input.value = "";
      input.disabled = false;
      checkButton.disabled = false;
      input.focus();
    }

    function check() {
      if (finished || !current) {
        return;
      }
      if (!input.value.trim()) {
        shell.fail(t("game05.fb.empty"));
        return;
      }
      var isCorrect = current.answers.some(function (answer) {
        return looselyEqual(input.value, answer);
      });

      if (isCorrect) {
        input.disabled = true;
        checkButton.disabled = true;
        finished = shell.succeed(t("common.correct") + " " + t(current.note));
        if (finished) {
          return;
        }
        window.setTimeout(dealItem, 900);
      } else {
        shell.fail(t("game05.fb.wrong"));
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
  window.Games["05"] = { mount: mount };
})(window, document);
