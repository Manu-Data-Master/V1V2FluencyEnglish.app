/* assets/js/games/game_06.js */

(function (window, document) {
  "use strict";

  var utils = window.GameUtils;
  var element = utils.element;

  var QUESTIONS = [
    {
      context: "You are presenting to a board of directors",
      prompt: "___ I add one final point before we close?",
      options: ["May", "Must", "Did", "Should"],
      correct: "May",
      note: "May is the formal permission word — right for a board room."
    },
    {
      context: "Asking a teammate for a file",
      prompt: "___ you send me the deck when you have a minute?",
      options: ["Could", "Must", "Does", "Will be"],
      correct: "Could",
      note: "Could softens the request without making it formal."
    },
    {
      context: "A hard contractual deadline",
      prompt: "We ___ deliver the report before Friday.",
      options: ["must", "could", "may", "should"],
      correct: "must",
      note: "Must states an obligation with no room to negotiate."
    },
    {
      context: "Asking your manager for an opinion",
      prompt: "___ we raise the price for the enterprise plan?",
      options: ["Should", "Must", "May", "Did"],
      correct: "Should",
      note: "Should asks for an opinion, not for permission."
    },
    {
      context: "Starting a video call",
      prompt: "___ I share my screen?",
      options: ["Can", "Must", "Were", "Does"],
      correct: "Can",
      note: "Can is the everyday permission word between colleagues."
    },
    {
      context: "Checking a colleague's availability",
      prompt: "___ she join the call at four?",
      options: ["Can", "Must", "Is", "Did be"],
      correct: "Can",
      note: "Can asks about possibility, and the verb after it stays plain."
    },
    {
      context: "Giving advice to a new sales rep",
      prompt: "You ___ follow up within two days.",
      options: ["should", "may", "did", "were"],
      correct: "should",
      note: "Should is advice. Must would sound like an order."
    },
    {
      context: "A polite request to a client",
      prompt: "___ you confirm the delivery address?",
      options: ["Could", "Must", "Do be", "Should be"],
      correct: "Could",
      note: "Could is the safest register with a client."
    },
    {
      context: "Compliance requirement",
      prompt: "Every invoice ___ include the tax number.",
      options: ["must", "could", "may", "should be"],
      correct: "must",
      note: "A rule that cannot be broken takes must."
    },
    {
      context: "Formal request in writing",
      prompt: "___ we schedule the review for next week?",
      options: ["May", "Did", "Was", "Are"],
      correct: "May",
      note: "May keeps a written request formal and polite."
    },
    {
      context: "Choosing the correct form after a helper",
      prompt: "Should we ___ the discount?",
      options: ["approve", "approves", "approved", "approving"],
      correct: "approve",
      note: "The helper carries the tense, so the verb stays plain."
    },
    {
      context: "Negative recommendation in a strategy meeting",
      prompt: "We ___ not discount below ten percent.",
      options: ["should", "must be", "did be", "may be"],
      correct: "should",
      note: "Not sits straight after the helper: should not discount."
    }
  ];

  function mount(container) {
    var shell = utils.createGameShell(container, "06", {
      instructions: t("game06.instructions"),
      howtoExample: "We ___ deliver the report before Friday. &rarr; must (a hard deadline, no room to negotiate)."
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

      contextLine.textContent = current.context;
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
            finished = shell.succeed(t("common.correct") + " " + current.note);
            if (finished) {
              return;
            }
            window.setTimeout(dealQuestion, 900);
          } else {
            button.classList.add("is-wrong");
            shell.fail(t("common.notThisTime") + " " + current.note);
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
