/* assets/js/games/game_08.js */

(function (window, document) {
  "use strict";

  var utils = window.GameUtils;
  var element = utils.element;

  var FAMILIES = {
    R: "Angry dog R",
    E: "Happy dog long E",
    SHUN: "The -shun ending"
  };

  var WORDS = [
    { word: "quarter", family: "R", tip: "Two growls: quar-ter." },
    { word: "meeting", family: "E", tip: "Hold the smile: mee-ting." },
    { word: "presentation", family: "SHUN", tip: "presenta-shun." },
    { word: "person", family: "R", tip: "per-son, tongue pulled back." },
    { word: "team", family: "E", tip: "A long, wide vowel: teeem." },
    { word: "information", family: "SHUN", tip: "informa-shun." },
    { word: "work", family: "R", tip: "One low growl, no tap." },
    { word: "agree", family: "E", tip: "The long E lands at the end." },
    { word: "production", family: "SHUN", tip: "produc-shun." },
    { word: "return", family: "R", tip: "The R closes the word." },
    { word: "key", family: "E", tip: "Smile all the way through." },
    { word: "negotiation", family: "SHUN", tip: "negotia-shun." },
    { word: "first", family: "R", tip: "The R growls in the middle." },
    { word: "stream", family: "E", tip: "Long vowel, short ending." }
  ];

  function mount(container) {
    var shell = utils.createGameShell(container, "08", {
      instructions: t("game08.instructions"),
      howtoExample: "quarter &rarr; Two growls: quar-ter (the Angry dog R)."
    });

    var deck = utils.buildDeck(WORDS, 30);
    var deckIndex = 0;
    var finished = false;
    var current = null;
    var locked = false;

    var RecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    var canSynthesize = typeof window.speechSynthesis !== "undefined";
    var mode = RecognitionClass ? "speak" : "listen";
    var recognition = null;

    var wordNode = element("p", "speech-word", "");
    var hintNode = element("p", "speech-hint", "");
    var controls = element("div", "speech-controls");
    var transcriptNode = element("p", "speech-transcript", "");
    var optionGrid = element("div", "option-grid");

    shell.board.appendChild(wordNode);
    shell.board.appendChild(hintNode);
    shell.board.appendChild(controls);
    shell.board.appendChild(transcriptNode);
    shell.board.appendChild(optionGrid);

    function speakWord(word) {
      if (!canSynthesize) {
        shell.feedback(t("game08.fb.noVoice"), null);
        return;
      }
      window.speechSynthesis.cancel();
      var utterance = new window.SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }

    function switchToListening(message) {
      mode = "listen";
      if (message) {
        shell.feedback(message, null);
      }
      dealWord();
    }

    function startRecognition() {
      if (!RecognitionClass || locked) {
        return;
      }
      locked = true;
      transcriptNode.textContent = t("game08.ui.listening");
      recognition = new RecognitionClass();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;

      recognition.onresult = function (event) {
        locked = false;
        var heard = [];
        var results = event.results[0];
        for (var index = 0; index < results.length; index += 1) {
          heard.push(results[index].transcript.toLowerCase().trim());
        }
        transcriptNode.textContent = t("game08.ui.heard", { text: heard[0] });
        var matched = heard.some(function (option) {
          return option.indexOf(current.word.toLowerCase()) !== -1;
        });
        if (matched) {
          finished = shell.succeed(t("game08.fb.clean") + " " + current.tip);
          if (!finished) {
            window.setTimeout(dealWord, 900);
          }
        } else {
          shell.fail(t("game08.fb.retry", { tip: current.tip }));
        }
      };

      recognition.onerror = function () {
        locked = false;
        transcriptNode.textContent = "";
        switchToListening(t("game08.fb.noMic"));
      };

      recognition.onend = function () {
        locked = false;
        if (transcriptNode.textContent === t("game08.ui.listening")) {
          transcriptNode.textContent = "";
        }
      };

      try {
        recognition.start();
      } catch (error) {
        locked = false;
        switchToListening(t("game08.fb.micFailed"));
      }
    }

    function buildSpeakControls() {
      controls.innerHTML = "";
      optionGrid.innerHTML = "";

      var sayButton = element("button", "btn btn-primary", t("game08.ui.say"));
      sayButton.type = "button";
      sayButton.addEventListener("click", startRecognition);

      var hearButton = element("button", "btn btn-ghost", t("game08.ui.hear"));
      hearButton.type = "button";
      hearButton.addEventListener("click", function () {
        speakWord(current.word);
      });

      var switchButton = element("button", "btn btn-ghost", t("game08.ui.switchListen"));
      switchButton.type = "button";
      switchButton.addEventListener("click", function () {
        switchToListening(t("game08.fb.switched"));
      });

      controls.appendChild(sayButton);
      controls.appendChild(hearButton);
      controls.appendChild(switchButton);
    }

    function buildListenControls() {
      controls.innerHTML = "";
      transcriptNode.textContent = "";

      var playButton = element("button", "btn btn-primary", t(canSynthesize ? "game08.ui.play" : "game08.ui.read"));
      playButton.type = "button";
      playButton.addEventListener("click", function () {
        speakWord(current.word);
      });
      controls.appendChild(playButton);

      if (RecognitionClass) {
        var backButton = element("button", "btn btn-ghost", t("game08.ui.useMic"));
        backButton.type = "button";
        backButton.addEventListener("click", function () {
          mode = "speak";
          dealWord();
        });
        controls.appendChild(backButton);
      }

      optionGrid.innerHTML = "";
      utils.shuffle(Object.keys(FAMILIES)).forEach(function (familyKey) {
        var button = element("button", "option-button", FAMILIES[familyKey]);
        button.type = "button";
        button.addEventListener("click", function () {
          if (finished || locked) {
            return;
          }
          locked = true;
          var buttons = optionGrid.querySelectorAll(".option-button");
          Array.prototype.forEach.call(buttons, function (node) {
            node.disabled = true;
            if (node.textContent === FAMILIES[current.family]) {
              node.classList.add("is-correct");
            }
          });

          if (familyKey === current.family) {
            finished = shell.succeed("Correct. " + current.tip);
            if (finished) {
              return;
            }
            window.setTimeout(dealWord, 900);
          } else {
            button.classList.add("is-wrong");
            shell.fail(t("game08.fb.family", { family: FAMILIES[current.family], tip: current.tip }));
            window.setTimeout(dealWord, 1700);
          }
        });
        optionGrid.appendChild(button);
      });
    }

    function dealWord() {
      if (finished) {
        return;
      }
      if (deckIndex >= deck.length) {
        deck = utils.buildDeck(WORDS, 30);
        deckIndex = 0;
      }
      current = deck[deckIndex];
      deckIndex += 1;
      locked = false;

      wordNode.textContent = current.word;
      if (mode === "speak") {
        hintNode.textContent = t("game08.ui.speakHint");
        buildSpeakControls();
      } else {
        hintNode.textContent = t("game08.ui.listenHint");
        buildListenControls();
      }
    }

    dealWord();
  }

  window.Games = window.Games || {};
  window.Games["08"] = { mount: mount };
})(window, document);
