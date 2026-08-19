/* assets/js/games/game_06.js */

(function (window, document) {
  "use strict";

  var utils = window.GameUtils;
  var element = utils.element;

  var QUESTIONS = [
    {
      context: "game06.context.1",
      prompt: "___ I add one final point before we close?",
      options: ["May", "Must", "Did", "Should"],
      correct: "May",
      note: "game06.note.1"
    },
    {
      context: "game06.context.2",
      prompt: "___ you send me the deck when you have a minute?",
      options: ["Could", "Must", "Does", "Will be"],
      correct: "Could",
      note: "game06.note.2"
    },
    {
      context: "game06.context.3",
      prompt: "We ___ deliver the report before Friday.",
      options: ["must", "could", "may", "should"],
      correct: "must",
      note: "game06.note.3"
    },
    {
      context: "game06.context.4",
      prompt: "___ we raise the price for the enterprise plan?",
      options: ["Should", "Must", "May", "Did"],
      correct: "Should",
      note: "game06.note.4"
    },
    {
      context: "game06.context.5",
      prompt: "___ I share my screen?",
      options: ["Can", "Must", "Were", "Does"],
      correct: "Can",
      note: "game06.note.5"
    },
    {
      context: "game06.context.6",
      prompt: "___ she join the call at four?",
      options: ["Can", "Must", "Is", "Did be"],
      correct: "Can",
      note: "game06.note.6"
    },
    {
      context: "game06.context.7",
      prompt: "You ___ follow up within two days.",
      options: ["should", "may", "did", "were"],
      correct: "should",
      note: "game06.note.7"
    },
    {
      context: "game06.context.8",
      prompt: "___ you confirm the delivery address?",
      options: ["Could", "Must", "Do be", "Should be"],
      correct: "Could",
      note: "game06.note.8"
    },
    {
      context: "game06.context.9",
      prompt: "Every invoice ___ include the tax number.",
      options: ["must", "could", "may", "should be"],
      correct: "must",
      note: "game06.note.9"
    },
    {
      context: "game06.context.10",
      prompt: "___ we schedule the review for next week?",
      options: ["May", "Did", "Was", "Are"],
      correct: "May",
      note: "game06.note.10"
    },
    {
      context: "game06.context.11",
      prompt: "Should we ___ the discount?",
      options: ["approve", "approves", "approved", "approving"],
      correct: "approve",
      note: "game06.note.11"
    },
    {
      context: "game06.context.12",
      prompt: "We ___ not discount below ten percent.",
      options: ["should", "must be", "did be", "may be"],
      correct: "should",
      note: "game06.note.12"
    }
  ];

  function mount(container) {
    var shell = utils.createGameShell(container, "06", {
      instructions: t("game06.instructions")
    });

    var deck = utils.buildDeck(QUESTIONS, 30);
    var deckIndex = 0;
    var finished = false;
    var locked = false;

    var contextLine = element("p", "game-context", "");
    var prompt = element("p", "game-prompt", "");
    var grid = element("div", "option-grid");

    shell.board.appendChild(contextLine);
    shell.board.appendChild(prompt);
    shell.board.appendChild(grid);

    function dealQuestion() {
      if (deckIndex >= deck.length) {
        deck = utils.buildDeck(QUESTIONS, 30);
        deckIndex = 0;
      }
      var current = deck[deckIndex];
      deckIndex += 1;
      locked = false;

      contextLine.textContent = t(current.context);
      prompt.textContent = current.prompt;
      grid.innerHTML = "";

      utils.shuffle(current.options).forEach(function (option) {
        var button = element("button", "option-button", option);
        button.type = "button";
        button.addEventListener("click", function () {
          if (finished || locked) {
            return;
          }
          locked = true;
          var buttons = grid.querySelectorAll(".option-button");
          Array.prototype.forEach.call(buttons, function (node) {
            node.disabled = true;
            if (node.textContent === current.correct) {
              node.classList.add("is-correct");
            }
          });

          if (option === current.correct) {
            finished = shell.succeed(t("common.correct") + " " + t(current.note));
            if (finished) {
              return;
            }
            window.setTimeout(dealQuestion, 900);
          } else {
            button.classList.add("is-wrong");
            shell.fail(t("common.notThisTime") + " " + t(current.note));
            window.setTimeout(dealQuestion, 1600);
          }
        });
        grid.appendChild(button);
      });
    }

    dealQuestion();
  }

  window.Games = window.Games || {};
  window.Games["06"] = { mount: mount };
})(window, document);
