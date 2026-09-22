/* assets/js/games/game_03.js */

(function (window, document) {
  "use strict";

  var utils = window.GameUtils;
  var element = utils.element;

  var SENTENCES = [
    { parts: ["The team", "presents", "the new pricing."], note: "Subject, V2, noun. Nothing after the noun." },
    { parts: ["Our client", "is", "happy."], note: "V1 takes a feeling as its noun." },
    { parts: ["Marketing", "approved", "the campaign."], note: "Past V2, then the thing it acted on." },
    { parts: ["The numbers", "were", "strong."], note: "Plural subject takes were." },
    { parts: ["We", "closed", "three accounts."], note: "Subject first, always." },
    { parts: ["The deck", "is", "ready."], note: "Short is not wrong. Short is the rule." },
    { parts: ["Sales", "will send", "the proposal."], note: "Will keeps the verb plain." },
    { parts: ["The launch", "was", "a success."], note: "Singular subject takes was." },
    { parts: ["Our developers", "shipped", "the update."], note: "One subject, one verb, one noun." },
    { parts: ["The budget", "covers", "two quarters."], note: "Third person singular adds the -s." },
    { parts: ["I", "manage", "the account."], note: "First person keeps the verb plain." },
    { parts: ["The client", "signed", "the contract."], note: "Past V2 needs no helper in a statement." }
  ];

  function mount(container) {
    var shell = utils.createGameShell(container, "03", {
      instructions: t("game03.instructions"),
      howtoExample: "The team | presents | the new pricing. &rarr; Subject, then V2, then the noun."
    });

    var deck = utils.buildDeck(SENTENCES, 30);
    var deckIndex = 0;
    var finished = false;
    var current = null;

    var slot = element("div", "sentence-slot");
    slot.id = "sentence-slot";
    var bank = element("div", "chip-row");
    var checkButton = element("button", "btn btn-primary", t("game03.ui.check"));
    checkButton.type = "button";
    var clearButton = element("button", "btn btn-ghost", t("game03.ui.clear"));
    clearButton.type = "button";
    var actions = element("div", "answer-form");
    actions.appendChild(checkButton);
    actions.appendChild(clearButton);

    shell.board.appendChild(slot);
    shell.board.appendChild(bank);
    shell.board.appendChild(actions);

    function renderHint() {
      slot.innerHTML = "";
      var hint = element("span", "sentence-slot-hint", t("game03.ui.slotHint"));
      slot.appendChild(hint);
    }

    function currentAnswer() {
      var chips = slot.querySelectorAll(".chip");
      return Array.prototype.map.call(chips, function (chip) {
        return chip.textContent;
      });
    }

    function moveToSlot(chip) {
      var hint = slot.querySelector(".sentence-slot-hint");
      if (hint) {
        hint.remove();
      }
      slot.appendChild(chip);
      chip.dataset.inSlot = "true";
    }

    function moveToBank(chip) {
      bank.appendChild(chip);
      chip.dataset.inSlot = "false";
      if (!slot.querySelector(".chip")) {
        renderHint();
      }
    }

    function makeChip(text) {
      var chip = element("button", "chip", text);
      chip.type = "button";
      chip.draggable = true;
      chip.dataset.inSlot = "false";

      chip.addEventListener("click", function () {
        if (finished) {
          return;
        }
        if (chip.dataset.inSlot === "true") {
          moveToBank(chip);
        } else {
          moveToSlot(chip);
        }
      });

      chip.addEventListener("dragstart", function (event) {
        chip.classList.add("is-dragging");
        event.dataTransfer.setData("text/plain", text);
        event.dataTransfer.effectAllowed = "move";
      });

      chip.addEventListener("dragend", function () {
        chip.classList.remove("is-dragging");
      });

      return chip;
    }

    slot.addEventListener("dragover", function (event) {
      event.preventDefault();
      slot.classList.add("is-over");
    });

    slot.addEventListener("dragleave", function () {
      slot.classList.remove("is-over");
    });

    slot.addEventListener("drop", function (event) {
      event.preventDefault();
      slot.classList.remove("is-over");
      var dragging = bank.querySelector(".is-dragging") || slot.querySelector(".is-dragging");
      if (dragging) {
        moveToSlot(dragging);
      }
    });

    bank.addEventListener("dragover", function (event) {
      event.preventDefault();
    });

    bank.addEventListener("drop", function (event) {
      event.preventDefault();
      var dragging = slot.querySelector(".is-dragging");
      if (dragging) {
        moveToBank(dragging);
      }
    });

    function dealSentence() {
      if (deckIndex >= deck.length) {
        deck = utils.buildDeck(SENTENCES, 30);
        deckIndex = 0;
      }
      current = deck[deckIndex];
      deckIndex += 1;

      bank.innerHTML = "";
      renderHint();
      utils.shuffle(current.parts).forEach(function (part) {
        bank.appendChild(makeChip(part));
      });
      checkButton.disabled = false;
    }

    checkButton.addEventListener("click", function () {
      if (finished || !current) {
        return;
      }
      var answer = currentAnswer();
      if (answer.length !== current.parts.length) {
        shell.fail(t("game03.fb.incomplete"));
        return;
      }
      var correct = answer.join(" ") === current.parts.join(" ");
      if (correct) {
        checkButton.disabled = true;
        finished = shell.succeed(t("common.correct") + " " + current.note);
        if (finished) {
          return;
        }
        window.setTimeout(dealSentence, 750);
      } else {
        shell.fail(t("game03.fb.wrong"));
      }
    });

    clearButton.addEventListener("click", function () {
      if (finished) {
        return;
      }
      var chips = slot.querySelectorAll(".chip");
      Array.prototype.forEach.call(chips, moveToBank);
      shell.feedback(t("game03.fb.cleared"), null);
    });

    dealSentence();
  }

  window.Games = window.Games || {};
  window.Games["03"] = { mount: mount };
})(window, document);
