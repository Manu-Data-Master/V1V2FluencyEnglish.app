/* assets/js/games/game_09.js */

(function (window, document) {
  "use strict";

  var utils = window.GameUtils;
  var element = utils.element;

  var SCENARIOS = [
    {
      context: "Quarterly review",
      sentence: "Sales came in below plan, so we had to revise the ___ for the next two quarters.",
      answers: ["forecast"],
      label: "Noun",
      note: "You revise, miss or beat a forecast."
    },
    {
      context: "Client kickoff",
      sentence: "We ___ new clients in two weeks, from contract to first delivery.",
      answers: ["onboard"],
      label: "V2",
      note: "You onboard a client, a team or a tool."
    },
    {
      context: "Pricing negotiation",
      sentence: "The buyer raised one ___ about the renewal terms.",
      answers: ["concern"],
      label: "Noun",
      note: "You raise, address or share a concern."
    },
    {
      context: "Product launch",
      sentence: "We ___ the campaign on Monday and measured results on Friday.",
      answers: ["launched"],
      label: "V2 (past)",
      note: "You launch a campaign, a product or a pilot."
    },
    {
      context: "Sales pipeline",
      sentence: "The team ___ three enterprise deals last month.",
      answers: ["closed"],
      label: "V2 (past)",
      note: "You close a deal — never finish it."
    },
    {
      context: "Board update",
      sentence: "Our margins are under ___ because logistics costs rose.",
      answers: ["pressure"],
      label: "Noun",
      note: "Margins, teams and budgets all come under pressure."
    },
    {
      context: "Stakeholder meeting",
      sentence: "Before we decide, let me ___ you through the numbers.",
      answers: ["walk"],
      label: "V2",
      note: "You walk someone through a document or a plan."
    },
    {
      context: "Marketing performance",
      sentence: "The ads reached the right audience, but they did not ___ our target.",
      answers: ["hit", "reach"],
      label: "V2",
      note: "You hit or miss a target."
    },
    {
      context: "Project risk log",
      sentence: "Please ___ any delivery risk in the shared tracker.",
      answers: ["flag", "raise"],
      label: "V2",
      note: "You flag a risk early, or raise it in the meeting."
    },
    {
      context: "Investor pitch",
      sentence: "The market ___ for this segment is roughly forty million dollars.",
      answers: ["opportunity", "size"],
      label: "Noun",
      note: "Market opportunity and market size both work here."
    },
    {
      context: "Account handover",
      sentence: "I will ___ the account to Ana before I go on leave.",
      answers: ["hand over", "transfer"],
      label: "V2",
      note: "You hand over an account, a project or a shift."
    },
    {
      context: "Contract review",
      sentence: "Legal has to ___ the terms before we sign.",
      answers: ["approve", "review"],
      label: "V2",
      note: "Legal reviews terms, then approves them."
    }
  ];

  function normalize(value) {
    return value.toLowerCase().replace(/\s+/g, " ").trim();
  }

  function mount(container) {
    var shell = utils.createGameShell(container, "09", {
      instructions: t("game09.instructions"),
      howtoExample: "Sales came in below plan, so we had to revise the ___ for the next two quarters. &rarr; forecast (Noun)."
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

      contextLine.textContent = current.context;
      prompt.textContent = current.sentence;
      hintLine.textContent = t("game09.ui.hint", { label: current.label, letter: current.answers[0].charAt(0) });
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
        finished = shell.succeed(t("game09.fb.good") + " " + current.note);
        if (finished) {
          return;
        }
        window.setTimeout(dealScenario, 900);
      } else {
        attempts += 1;
        if (attempts >= 2) {
          hintLine.textContent = t("game09.ui.hintLong", {
            label: current.label,
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
