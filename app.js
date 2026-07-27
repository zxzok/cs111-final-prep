(() => {
  "use strict";

  const DATA = window.COURSE_DATA;
  const BANK = window.MIRACOSTA_BANK;
  const ALL_QUESTIONS = [...DATA.questions, ...BANK.questions];
  const STORAGE_KEY = "cs111-final-lab-mistakes-v1";
  const VIEWS = ["overview", "knowledge", "miracosta", "exam", "mistakes"];
  const DOMAIN_GROUPS = [
    { name: "Fundamentals + Data", topicIds: [1, 2, 3, 4] },
    { name: "Methods + Parameters", topicIds: [5, 6] },
    { name: "Branching + Loops", topicIds: [7, 8] },
    { name: "Arrays + References", topicIds: [9, 10] },
    { name: "Objects + Class Design", topicIds: [11, 12, 13] },
    { name: "Possible Late Topics", topicIds: [14, 15] },
  ];

  const state = {
    view: "overview",
    unitFilter: "all",
    topicSearch: "",
    mistakes: loadMistakes(),
    session: null,
    timerId: null,
    toastId: null,
    returnView: "exam",
  };

  const el = {
    nav: document.querySelector(".primary-nav"),
    menuToggle: document.querySelector("#menu-toggle"),
    mistakeCount: document.querySelector("#mistake-count"),
    priorityLines: document.querySelector("#priority-lines"),
    topicFilter: document.querySelector("#topic-filter"),
    topicList: document.querySelector("#topic-list"),
    topicEmpty: document.querySelector("#topic-empty"),
    topicSearch: document.querySelector("#topic-search"),
    miraQuestionCount: document.querySelector("#miracosta-question-count"),
    miraStats: document.querySelector("#miracosta-stats"),
    miraTopicGrid: document.querySelector("#miracosta-topic-grid"),
    miraSourceList: document.querySelector("#miracosta-source-list"),
    miraTopicFilter: document.querySelector("#miracosta-topic-filter"),
    miraDifficultyFilter: document.querySelector("#miracosta-difficulty-filter"),
    miraLengthFilter: document.querySelector("#miracosta-length-filter"),
    examSetup: document.querySelector("#exam-setup"),
    examSession: document.querySelector("#exam-session"),
    examResults: document.querySelector("#exam-results"),
    modeLabel: document.querySelector("#exam-mode-label"),
    questionPosition: document.querySelector("#question-position"),
    questionTotal: document.querySelector("#question-total"),
    timer: document.querySelector("#exam-timer"),
    progressFill: document.querySelector("#progress-fill"),
    topic: document.querySelector("#question-topic"),
    type: document.querySelector("#question-type"),
    prompt: document.querySelector("#question-prompt"),
    code: document.querySelector("#question-code"),
    choiceFieldset: document.querySelector("#choice-fieldset"),
    shortWrap: document.querySelector("#short-answer-wrap"),
    shortAnswer: document.querySelector("#short-answer"),
    answerForm: document.querySelector("#answer-form"),
    checkAnswer: document.querySelector("#check-answer"),
    feedback: document.querySelector("#feedback-panel"),
    feedbackStatus: document.querySelector("#feedback-status"),
    feedbackTitle: document.querySelector("#feedback-title"),
    feedbackExplanation: document.querySelector("#feedback-explanation"),
    correctAnswer: document.querySelector("#correct-answer"),
    feedbackSource: document.querySelector("#feedback-source"),
    selfGrade: document.querySelector("#self-grade"),
    nextQuestion: document.querySelector("#next-question"),
    quitExam: document.querySelector("#quit-exam"),
    retryMistakes: document.querySelector("#retry-mistakes"),
    clearMistakes: document.querySelector("#clear-mistakes"),
    mistakeSummary: document.querySelector("#mistake-summary"),
    mistakeList: document.querySelector("#mistake-list"),
    emptyMistakes: document.querySelector("#empty-mistakes"),
    toast: document.querySelector("#toast"),
  };

  function range(start, end) {
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function questionById(id) {
    return ALL_QUESTIONS.find((question) => question.id === Number(id));
  }

  function loadMistakes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveMistakes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.mistakes));
    renderMistakeCount();
  }

  function renderMistakeCount() {
    const unresolved = Object.values(state.mistakes).filter((item) => !item.resolved).length;
    el.mistakeCount.textContent = String(unresolved);
    el.mistakeCount.setAttribute("aria-label", `${unresolved} unresolved mistakes`);
  }

  function recordWrong(question, userAnswer) {
    const previous = state.mistakes[question.id] || {};
    state.mistakes[question.id] = {
      id: question.id,
      topic: question.topic,
      count: (previous.count || 0) + 1,
      lastSeen: new Date().toISOString(),
      lastAnswer: userAnswer || "Not answered",
      resolved: false,
    };
    saveMistakes();
  }

  function markResolved(question) {
    if (!state.mistakes[question.id]) return;
    state.mistakes[question.id].resolved = true;
    state.mistakes[question.id].resolvedAt = new Date().toISOString();
    saveMistakes();
  }

  function showToast(message) {
    window.clearTimeout(state.toastId);
    el.toast.textContent = message;
    el.toast.classList.add("is-visible");
    state.toastId = window.setTimeout(() => el.toast.classList.remove("is-visible"), 2400);
  }

  function showView(view, updateHash = true) {
    if (!VIEWS.includes(view)) view = "overview";
    state.view = view;
    document.querySelectorAll("[data-view-panel]").forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.viewPanel === view);
    });
    document.querySelectorAll(".nav-link").forEach((button) => {
      const active = button.dataset.view === view;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    el.nav.classList.remove("is-open");
    el.menuToggle.setAttribute("aria-expanded", "false");
    el.menuToggle.setAttribute("aria-label", "Open navigation");
    if (updateHash) history.replaceState(null, "", `#${view}`);
    if (view === "mistakes") renderMistakes();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderOverview() {
    el.priorityLines.innerHTML = DATA.course.priorities
      .map((priority) => `<div>${escapeHtml(priority)}</div>`)
      .join("");
  }

  function renderMiraCostaBank() {
    const difficultyCounts = BANK.questions.reduce((counts, question) => {
      counts[question.difficulty] = (counts[question.difficulty] || 0) + 1;
      return counts;
    }, {});
    const officialCount = BANK.questions.filter((question) =>
      ["Official course scope", "Official course organization", "Official practice", "Official lab", "Current public template"].includes(
        question.sourceFamily,
      ),
    ).length;

    el.miraQuestionCount.textContent = String(BANK.questions.length);
    el.miraStats.innerHTML = `
      <div><strong>${BANK.questions.length}</strong><span>multiple-choice questions</span></div>
      <div><strong>${DATA.topics.length}/15</strong><span>Topics represented</span></div>
      <div><strong>${difficultyCounts.foundational}/${difficultyCounts.standard}/${difficultyCounts.challenge}</strong><span>foundation / standard / challenge</span></div>
      <div><strong>${officialCount}</strong><span>questions anchored to official public sources</span></div>`;

    el.miraTopicFilter.innerHTML =
      '<option value="all">All 15 Topics</option>' +
      DATA.topics
        .map(
          (topic) =>
            `<option value="${topic.id}">T${topic.id} — ${escapeHtml(topic.topic.replace(/^Topic \d+ - /, ""))}</option>`,
        )
        .join("");

    el.miraTopicGrid.innerHTML = DATA.topics
      .map((topic) => {
        const topicQuestions = BANK.questions.filter(
          (question) => question.topicId === topic.id,
        );
        const official = topicQuestions.filter((question) =>
          question.sourceFamily.startsWith("Official") ||
          question.sourceFamily.startsWith("Current"),
        ).length;
        return `
          <article class="bank-topic-card">
            <span>T${String(topic.id).padStart(2, "0")}</span>
            <div>
              <strong>${escapeHtml(topic.topic.replace(/^Topic \d+ - /, ""))}</strong>
              <small>${topicQuestions.length} questions · ${official} official-source anchored</small>
            </div>
            <button data-miracosta-topic="${topic.id}">Practice all ${topicQuestions.length}</button>
          </article>`;
      })
      .join("");

    el.miraSourceList.innerHTML = BANK.sources
      .map(
        (source) => `
          <article class="bank-source-card">
            <div>
              <span class="source-confidence ${source.confidence}">${source.confidence.toUpperCase()}</span>
              <small>${escapeHtml(source.family)}</small>
            </div>
            <h3>${escapeHtml(source.title)}</h3>
            <p>${escapeHtml(source.note)}</p>
            <a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">Open public source <span aria-hidden="true">↗</span></a>
          </article>`,
      )
      .join("");
  }

  function unitLabel(unit) {
    const match = unit.match(/^Unit \d+/);
    return match ? match[0] : unit;
  }

  function renderTopicFilters() {
    const units = [...new Set(DATA.topics.map((topic) => topic.unit))];
    const items = [{ key: "all", label: "All Topics" }].concat(
      units.map((unit) => ({ key: unit, label: unitLabel(unit) })),
    );
    el.topicFilter.innerHTML = items
      .map(
        (item) =>
          `<button class="${state.unitFilter === item.key ? "is-active" : ""}" data-unit="${escapeHtml(item.key)}">${escapeHtml(item.label)}</button>`,
      )
      .join("");
  }

  function topicConfidence(topic) {
    if (topic.confidence === "confirmed") return "";
    const label = topic.confidence === "possible" ? "Possible coverage" : "Low confidence";
    return `<span class="confidence ${topic.confidence}">${label}</span>`;
  }

  function renderTopics() {
    const query = state.topicSearch.trim().toLowerCase();
    const topics = DATA.topics.filter((topic) => {
      const unitMatch = state.unitFilter === "all" || state.unitFilter === topic.unit;
      const haystack = [
        topic.topic,
        topic.unit,
        ...topic.must,
        topic.pitfall,
        topic.example,
      ]
        .join(" ")
        .toLowerCase();
      return unitMatch && (!query || haystack.includes(query));
    });

    el.topicList.innerHTML = topics
      .map(
        (topic) => `
          <details class="topic-item" id="topic-${topic.id}">
            <summary>
              <span class="topic-number">T${String(topic.id).padStart(2, "0")}</span>
              <span class="topic-title">
                <strong>${escapeHtml(topic.topic.replace(/^Topic \d+ - /, ""))}${topicConfidence(topic)}</strong>
                <small>${escapeHtml(topic.unit)}</small>
              </span>
              <span class="topic-toggle" aria-hidden="true">+</span>
            </summary>
            <div class="topic-body">
              <div>
                <ul>
                  ${topic.must.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                </ul>
                <p class="pitfall"><strong>Frequent pitfall:</strong> ${escapeHtml(topic.pitfall)}</p>
                <div class="topic-actions">
                  <button data-practice-topic="${topic.id}">Practice This Topic</button>
                </div>
              </div>
              <pre class="topic-code"><code>${escapeHtml(topic.example)}</code></pre>
            </div>
          </details>`,
      )
      .join("");
    el.topicEmpty.hidden = topics.length > 0;
  }

  function questionsForTopic(topicId) {
    const exact = new RegExp(`^T${topicId}(?:\\s|$)`);
    const ids = DATA.questions
      .filter((question) => exact.test(question.topic))
      .map((question) => question.id);
    if (topicId === 9) ids.push(61, 62);
    if (topicId === 12 || topicId === 13) ids.push(58, 59, 60, 63);
    return [...new Set(ids)].filter((id) => questionById(id));
  }

  function shuffle(values) {
    const copy = [...values];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }

  function chooseQuestion(candidates, selected) {
    const available = shuffle(candidates).filter((question) => !selected.has(question.id));
    const question = available[0];
    if (!question) return null;
    selected.add(question.id);
    return question;
  }

  function assembleFullExam() {
    const selected = new Set();
    const multipleChoice = DATA.questions.filter((question) => question.type === "mc");
    const collegeStyle = multipleChoice.filter(
      (question) => question.sourceStyle === "public-college",
    );

    for (const topic of DATA.topics) {
      for (const difficulty of ["standard", "challenge"]) {
        const question = chooseQuestion(
          collegeStyle.filter(
            (candidate) =>
              candidate.topicId === topic.id && candidate.difficulty === difficulty,
          ),
          selected,
        );
        if (!question) {
          throw new Error(`Missing ${difficulty} multiple-choice coverage for Topic ${topic.id}`);
        }
      }
    }

    const difficultyTargets = {
      foundational: 10,
      standard: 35,
      challenge: 20,
    };
    for (const [difficulty, target] of Object.entries(difficultyTargets)) {
      let current = [...selected].filter(
        (id) => questionById(id).difficulty === difficulty,
      ).length;
      while (current < target) {
        const question = chooseQuestion(
          multipleChoice.filter((candidate) => candidate.difficulty === difficulty),
          selected,
        );
        if (!question) {
          throw new Error(`Not enough ${difficulty} questions to assemble the exam`);
        }
        current += 1;
      }
    }

    while (selected.size < 65) {
      const question = chooseQuestion(
        multipleChoice,
        selected,
      );
      if (!question) break;
    }

    return shuffle([...selected]).slice(0, 65);
  }

  function assembleQuickExam() {
    const selected = new Set();
    const selectedTopics = new Set();
    const multipleChoice = DATA.questions.filter((question) => question.type === "mc");
    const difficultySlots = shuffle([
      "foundational",
      "foundational",
      "foundational",
      "standard",
      "standard",
      "standard",
      "standard",
      "challenge",
      "challenge",
      "challenge",
    ]);

    DOMAIN_GROUPS.forEach((domain, index) => {
      const question = chooseQuestion(
        multipleChoice.filter(
          (candidate) =>
            domain.topicIds.includes(candidate.topicId) &&
            candidate.difficulty === difficultySlots[index],
        ),
        selected,
      );
      if (question) selectedTopics.add(question.topicId);
    });

    for (const difficulty of difficultySlots.slice(DOMAIN_GROUPS.length)) {
      const distinctTopicCandidates = multipleChoice.filter(
        (candidate) =>
          candidate.difficulty === difficulty && !selectedTopics.has(candidate.topicId),
      );
      const question =
        chooseQuestion(distinctTopicCandidates, selected) ||
        chooseQuestion(
          multipleChoice.filter((candidate) => candidate.difficulty === difficulty),
          selected,
        );
      if (question) selectedTopics.add(question.topicId);
    }

    return shuffle([...selected]).slice(0, 10);
  }

  function assembleMiraCostaFull() {
    const selected = new Set();
    const topicIds = shuffle(DATA.topics.map((topic) => topic.id));

    topicIds.forEach((topicId) => {
      chooseQuestion(
        BANK.questions.filter(
          (question) =>
            question.topicId === topicId && question.difficulty === "standard",
        ),
        selected,
      );
    });

    topicIds.slice(0, 6).forEach((topicId) => {
      chooseQuestion(
        BANK.questions.filter(
          (question) =>
            question.topicId === topicId && question.difficulty === "foundational",
        ),
        selected,
      );
    });
    topicIds.slice(6, 14).forEach((topicId) => {
      chooseQuestion(
        BANK.questions.filter(
          (question) =>
            question.topicId === topicId && question.difficulty === "challenge",
        ),
        selected,
      );
    });
    chooseQuestion(
      BANK.questions.filter((question) => question.difficulty === "standard"),
      selected,
    );

    return shuffle([...selected]);
  }

  function assembleMiraCostaCoverage() {
    const selected = new Set();
    DATA.topics.forEach((topic) => {
      chooseQuestion(
        BANK.questions.filter(
          (question) =>
            question.topicId === topic.id && question.difficulty === "standard",
        ),
        selected,
      );
    });
    return shuffle([...selected]);
  }

  function assembleMiraCostaHistory() {
    return shuffle(
      BANK.questions.filter(
        (question) =>
          question.sourceFamily.startsWith("Historical") ||
          question.sourceFamily === "Student-transcribed review",
      ),
    )
      .slice(0, 10)
      .map((question) => question.id);
  }

  function assembleMiraCostaCustom(topicValue, difficulty, requestedLength) {
    const candidates = BANK.questions.filter((question) => {
      const topicMatch =
        topicValue === "all" || question.topicId === Number(topicValue);
      const difficultyMatch =
        difficulty === "all" || question.difficulty === difficulty;
      return topicMatch && difficultyMatch;
    });
    const selected = new Set();

    if (topicValue === "all" && requestedLength >= DATA.topics.length) {
      shuffle(DATA.topics).forEach((topic) => {
        chooseQuestion(
          candidates.filter((question) => question.topicId === topic.id),
          selected,
        );
      });
    }
    shuffle(candidates).forEach((question) => {
      if (selected.size < requestedLength) selected.add(question.id);
    });
    return shuffle([...selected]).slice(0, requestedLength);
  }

  function startExam(mode, customIds = null, customLabel = null) {
    let ids;
    let label;
    let timed = false;

    if (customIds?.length) {
      ids = shuffle(customIds);
      label = customLabel || (ids.length === 1 ? "SINGLE RETRY" : "TOPIC PRACTICE");
    } else if (mode === "miracosta-full") {
      ids = assembleMiraCostaFull();
      label = "MIRACOSTA COMPREHENSIVE";
    } else if (mode === "miracosta-coverage") {
      ids = assembleMiraCostaCoverage();
      label = "MIRACOSTA COVERAGE CHECK";
    } else if (mode === "miracosta-history") {
      ids = assembleMiraCostaHistory();
      label = "MIRACOSTA HISTORICAL STYLE";
    } else if (mode === "quick") {
      ids = assembleQuickExam();
      label = "FOCUS SPRINT";
    } else if (mode === "mistakes") {
      ids = Object.values(state.mistakes)
        .filter((item) => !item.resolved)
        .sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))
        .map((item) => Number(item.id));
      if (!ids.length) {
        showToast("There are no unresolved questions in the Mistake Notebook.");
        return;
      }
      label = "RETRY MISTAKES";
    } else {
      ids = assembleFullExam();
      label = "FULL SIMULATION";
      timed = true;
    }

    state.returnView = mode.startsWith("miracosta") ? "miracosta" : "exam";
    stopTimer();
    state.session = {
      mode,
      label,
      ids,
      index: 0,
      results: [],
      startedAt: Date.now(),
      secondsLeft: timed ? DATA.course.windowMinutes * 60 : null,
      timed,
      checked: false,
      pendingAnswer: null,
    };

    showView("exam");
    el.examSetup.hidden = true;
    el.examResults.hidden = true;
    el.examSession.hidden = false;
    el.modeLabel.textContent = label;
    el.questionTotal.textContent = String(ids.length);
    if (timed) startTimer();
    renderQuestion();
  }

  function stopTimer() {
    if (state.timerId) window.clearInterval(state.timerId);
    state.timerId = null;
  }

  function startTimer() {
    renderTimer();
    state.timerId = window.setInterval(() => {
      if (!state.session) return;
      state.session.secondsLeft -= 1;
      renderTimer();
      if (state.session.secondsLeft <= 0) {
        stopTimer();
        finishExam("timeout");
      }
    }, 1000);
  }

  function renderTimer() {
    if (!state.session?.timed) {
      el.timer.textContent = "Untimed";
      return;
    }
    const seconds = Math.max(0, state.session.secondsLeft);
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    el.timer.textContent = `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
    el.timer.style.color = seconds <= 600 ? "var(--red)" : "";
  }

  function currentQuestion() {
    if (!state.session) return null;
    return questionById(state.session.ids[state.session.index]);
  }

  function renderQuestion() {
    const question = currentQuestion();
    if (!question) {
      finishExam("complete");
      return;
    }

    state.session.checked = false;
    state.session.pendingAnswer = null;
    const position = state.session.index + 1;
    el.questionPosition.textContent = String(position);
    el.progressFill.style.width = `${((position - 1) / state.session.ids.length) * 100}%`;
    el.topic.textContent = `Q${question.id} · ${question.topic}`;
    const difficulty = question.difficulty.toUpperCase();
    el.type.textContent =
      question.type === "mc"
        ? `MULTIPLE CHOICE · ${difficulty}`
        : `TRACE / SHORT ANSWER · ${difficulty}`;
    el.prompt.textContent = question.prompt;

    if (question.code) {
      el.code.hidden = false;
      el.code.querySelector("code").textContent = question.code;
    } else {
      el.code.hidden = true;
      el.code.querySelector("code").textContent = "";
    }

    if (question.type === "mc") {
      el.choiceFieldset.hidden = false;
      el.shortWrap.hidden = true;
      el.choiceFieldset.innerHTML = question.choices
        .map(
          (choice, index) => `
            <label class="choice-option">
              <input type="radio" name="answer" value="${String.fromCharCode(65 + index)}" />
              <span class="choice-letter">${String.fromCharCode(65 + index)}</span>
              <span>${escapeHtml(choice)}</span>
            </label>`,
        )
        .join("");
    } else {
      el.choiceFieldset.hidden = true;
      el.choiceFieldset.innerHTML = "";
      el.shortWrap.hidden = false;
      el.shortAnswer.value = "";
      el.shortAnswer.disabled = false;
    }

    el.checkAnswer.disabled = false;
    el.answerForm.hidden = false;
    el.feedback.hidden = true;
    el.selfGrade.hidden = true;
    el.nextQuestion.hidden = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function normalized(value, kind = "tokens") {
    let output = String(value).trim().toLowerCase();
    if (kind === "code") return output.replace(/[;\s]+/g, "");
    return output
      .replace(/[;,]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function shortAnswerMatches(question, value) {
    if (!question.grading) return null;
    const user = normalized(value, question.grading.kind);
    return question.grading.answers.some(
      (answer) => normalized(answer, question.grading.kind) === user,
    );
  }

  function answerLabel(question) {
    if (question.type === "mc") {
      const index = question.answer.charCodeAt(0) - 65;
      return `${question.answer}. ${question.choices[index]}`;
    }
    return question.answer;
  }

  function showFeedback(question, correct, manual = false) {
    el.feedback.hidden = false;
    el.feedbackStatus.textContent = manual
      ? "SELF CHECK"
      : correct
        ? "CORRECT"
        : "REVIEW NOW";
    el.feedbackTitle.textContent = manual
      ? "Compare your response with the reference answer"
      : correct
        ? "Correct."
        : "Repair this concept now.";
    el.feedbackExplanation.textContent = question.explanation;
    el.correctAnswer.innerHTML = `<strong>Reference answer:</strong> ${escapeHtml(answerLabel(question))}`;
    if (question.sourceUrl) {
      el.feedbackSource.hidden = false;
      el.feedbackSource.innerHTML = `<strong>Source trail:</strong> ${escapeHtml(question.sourceFamily)} · ${escapeHtml(question.sourceConfidence.toUpperCase())} CONFIDENCE · <a href="${escapeHtml(question.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(question.sourceTitle)} ↗</a>`;
    } else {
      el.feedbackSource.hidden = true;
      el.feedbackSource.innerHTML = "";
    }
    el.selfGrade.hidden = !manual;
    el.nextQuestion.hidden = manual;
    el.feedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function finalizeAnswer(question, correct, userAnswer) {
    if (state.session.checked) return;
    state.session.checked = true;
    state.session.results.push({
      id: question.id,
      correct,
      userAnswer,
    });
    if (correct) {
      if (state.session.mode === "mistakes" || state.session.mode === "retry") {
        markResolved(question);
      }
    } else {
      recordWrong(question, userAnswer);
    }
    el.nextQuestion.hidden = false;
    el.selfGrade.hidden = true;
  }

  function checkAnswer(event) {
    event.preventDefault();
    if (!state.session || state.session.checked) return;
    const question = currentQuestion();

    if (question.type === "mc") {
      const selected = el.choiceFieldset.querySelector("input:checked");
      if (!selected) {
        showToast("Select an answer before submitting.");
        return;
      }
      const userAnswer = selected.value;
      const correct = userAnswer === question.answer;
      el.choiceFieldset.querySelectorAll("input").forEach((input) => {
        input.disabled = true;
        const option = input.closest(".choice-option");
        if (input.value === question.answer) option.classList.add("is-correct");
        if (input.checked && !correct) option.classList.add("is-wrong");
      });
      el.checkAnswer.disabled = true;
      showFeedback(question, correct);
      finalizeAnswer(question, correct, userAnswer);
      return;
    }

    const value = el.shortAnswer.value.trim();
    if (!value) {
      showToast("Write your answer before viewing the explanation.");
      return;
    }
    el.shortAnswer.disabled = true;
    el.checkAnswer.disabled = true;
    state.session.pendingAnswer = value;
    const autoResult = shortAnswerMatches(question, value);
    if (autoResult === null) {
      showFeedback(question, false, true);
    } else {
      showFeedback(question, autoResult);
      finalizeAnswer(question, autoResult, value);
    }
  }

  function selfGrade(correct) {
    if (!state.session || state.session.checked) return;
    const question = currentQuestion();
    finalizeAnswer(question, correct, state.session.pendingAnswer);
    el.feedbackStatus.textContent = correct ? "SELF-MARKED CORRECT" : "ADDED TO MISTAKES";
    el.feedbackTitle.textContent = correct
      ? "Counted as correct."
      : "Added to the Mistake Notebook.";
  }

  function nextQuestion() {
    if (!state.session?.checked) return;
    state.session.index += 1;
    renderQuestion();
  }

  function finishExam(reason) {
    if (!state.session) return;
    stopTimer();
    const session = state.session;
    if (reason === "timeout") {
      const answered = new Set(session.results.map((result) => result.id));
      session.ids.forEach((id) => {
        if (answered.has(id)) return;
        const question = questionById(id);
        session.results.push({ id, correct: false, userAnswer: "Not answered" });
        recordWrong(question, "Not answered");
      });
    }

    const correct = session.results.filter((result) => result.correct).length;
    const total = session.results.length;
    const percent = total ? Math.round((correct / total) * 100) : 0;
    const elapsedSeconds = Math.round((Date.now() - session.startedAt) / 1000);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const title =
      percent >= 90
        ? "You are ready for precision review."
        : percent >= 80
          ? "You are approaching exam readiness."
          : percent >= 66
            ? "Targeted repair is the next step."
            : "Rebuild the core patterns first.";

    const diagnostics = DOMAIN_GROUPS.map((domain) => {
      const domainResults = session.results.filter((result) => {
        const question = questionById(result.id);
        return question && domain.topicIds.includes(question.topicId);
      });
      const domainCorrect = domainResults.filter((result) => result.correct).length;
      return {
        name: domain.name,
        correct: domainCorrect,
        total: domainResults.length,
        percent: domainResults.length
          ? Math.round((domainCorrect / domainResults.length) * 100)
          : 0,
      };
    }).filter((domain) => domain.total > 0);

    el.examSession.hidden = true;
    el.examSetup.hidden = true;
    el.examResults.hidden = false;
    el.examResults.innerHTML = `
      <section class="results-hero">
        <div>
          <p class="eyebrow">${reason === "timeout" ? "TIME IS UP" : "SESSION COMPLETE"}</p>
          <div class="results-score"><span>${correct}</span>/${total}</div>
        </div>
        <div class="results-copy">
          <h1>${title}</h1>
          <p>${percent}% correct · ${minutes}:${String(seconds).padStart(2, "0")} elapsed. Retry every domain below 80% before your next full simulation.</p>
          <div class="results-actions">
            <button class="button button-primary" data-result-action="mistakes">Retry Mistakes</button>
            <button class="button button-dark" data-result-action="knowledge">Return to Knowledge Map</button>
            <button class="button button-ghost" data-result-action="setup">Choose Another Mode</button>
          </div>
        </div>
      </section>
      <section class="diagnostic-list" aria-label="Performance by domain">
        ${diagnostics
          .map(
            (domain) => `
              <div class="diagnostic-row">
                <strong>${escapeHtml(domain.name)}</strong>
                <div class="diagnostic-bar"><span style="width:${domain.percent}%"></span></div>
                <span>${domain.correct}/${domain.total}</span>
              </div>`,
          )
          .join("")}
      </section>`;
    state.session = null;
    renderMistakes();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetExamSetup() {
    stopTimer();
    state.session = null;
    el.examSession.hidden = true;
    el.examResults.hidden = true;
    el.examSetup.hidden = false;
    showView(state.returnView);
  }

  function renderMistakes() {
    const entries = Object.values(state.mistakes).sort((a, b) => {
      if (a.resolved !== b.resolved) return a.resolved ? 1 : -1;
      return new Date(b.lastSeen) - new Date(a.lastSeen);
    });
    const unresolved = entries.filter((item) => !item.resolved);
    const attempts = entries.reduce((sum, item) => sum + item.count, 0);
    const topicCounts = unresolved.reduce((counts, item) => {
      const key = item.topic.split(" ").slice(0, 2).join(" ");
      counts[key] = (counts[key] || 0) + item.count;
      return counts;
    }, {});
    const weakest =
      Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    el.mistakeSummary.innerHTML = `
      <div><strong>${unresolved.length}</strong><span>to review</span></div>
      <div><strong>${attempts}</strong><span>total misses</span></div>
      <div><strong>${escapeHtml(weakest)}</strong><span>weakest tag</span></div>`;
    el.emptyMistakes.hidden = entries.length > 0;
    el.mistakeList.hidden = entries.length === 0;
    el.mistakeList.innerHTML = entries
      .map((item) => {
        const question = questionById(item.id);
        if (!question) return "";
        return `
          <article class="mistake-item">
            <span>Q${question.id}</span>
            <div>
              <h3>${escapeHtml(question.prompt)}</h3>
              <small>${escapeHtml(question.topic)} · ${item.resolved ? "resolved" : `missed ${item.count} time${item.count === 1 ? "" : "s"}`}</small>
            </div>
            <p>${escapeHtml(question.explanation)}<br><strong>Answer:</strong> ${escapeHtml(answerLabel(question))}</p>
            <button data-retry-id="${question.id}">${item.resolved ? "Practice Again" : "Retry Now"}</button>
          </article>`;
      })
      .join("");
    renderMistakeCount();
  }

  function clearMistakes() {
    if (!Object.keys(state.mistakes).length) {
      showToast("The Mistake Notebook is already empty.");
      return;
    }
    const confirmed = window.confirm(
      "Clear all saved mistake history from this browser?",
    );
    if (!confirmed) return;
    state.mistakes = {};
    saveMistakes();
    renderMistakes();
    showToast("Mistake history cleared.");
  }

  function handleClick(event) {
    const navButton = event.target.closest("[data-view]");
    if (navButton) {
      showView(navButton.dataset.view);
      return;
    }

    const goButton = event.target.closest("[data-go-view]");
    if (goButton) {
      showView(goButton.dataset.goView);
      return;
    }

    const startButton = event.target.closest("[data-start-mode]");
    if (startButton) {
      startExam(startButton.dataset.startMode);
      return;
    }

    const miraTopicButton = event.target.closest("[data-miracosta-topic]");
    if (miraTopicButton) {
      const topicId = Number(miraTopicButton.dataset.miracostaTopic);
      const ids = BANK.questions
        .filter((question) => question.topicId === topicId)
        .map((question) => question.id);
      startExam(
        "miracosta-topic",
        ids,
        `MIRACOSTA TOPIC ${topicId}`,
      );
      return;
    }

    const miraCustomButton = event.target.closest("#start-miracosta-custom");
    if (miraCustomButton) {
      const requestedLength = Number(el.miraLengthFilter.value);
      const ids = assembleMiraCostaCustom(
        el.miraTopicFilter.value,
        el.miraDifficultyFilter.value,
        requestedLength,
      );
      if (!ids.length) {
        showToast("No MiraCosta questions match these filters.");
        return;
      }
      if (ids.length < requestedLength) {
        showToast(`This filter contains ${ids.length} unique questions; all were selected.`);
      }
      startExam("miracosta-custom", ids, "MIRACOSTA CUSTOM SET");
      return;
    }

    const unitButton = event.target.closest("[data-unit]");
    if (unitButton) {
      state.unitFilter = unitButton.dataset.unit;
      renderTopicFilters();
      renderTopics();
      return;
    }

    const practiceButton = event.target.closest("[data-practice-topic]");
    if (practiceButton) {
      const ids = questionsForTopic(Number(practiceButton.dataset.practiceTopic));
      if (!ids.length) {
        showToast("This Topic does not have a standalone question yet.");
        return;
      }
      startExam("topic", ids);
      return;
    }

    const retryButton = event.target.closest("[data-retry-id]");
    if (retryButton) {
      startExam("retry", [Number(retryButton.dataset.retryId)]);
      return;
    }

    const selfGradeButton = event.target.closest("[data-self-grade]");
    if (selfGradeButton) {
      selfGrade(selfGradeButton.dataset.selfGrade === "correct");
      return;
    }

    const resultButton = event.target.closest("[data-result-action]");
    if (resultButton) {
      const action = resultButton.dataset.resultAction;
      if (action === "mistakes") startExam("mistakes");
      if (action === "knowledge") showView("knowledge");
      if (action === "setup") resetExamSetup();
    }
  }

  function handleKeyboard(event) {
    if (!state.session || state.session.checked || state.view !== "exam") return;
    const question = currentQuestion();
    if (question?.type === "mc" && ["1", "2", "3", "4"].includes(event.key)) {
      const inputs = [...el.choiceFieldset.querySelectorAll("input")];
      const input = inputs[Number(event.key) - 1];
      if (input) {
        input.checked = true;
        input.focus();
      }
    }
    if (
      event.key === "Enter" &&
      question?.type === "mc" &&
      document.activeElement?.tagName !== "BUTTON"
    ) {
      event.preventDefault();
      el.answerForm.requestSubmit();
    }
  }

  function init() {
    renderOverview();
    renderTopicFilters();
    renderTopics();
    renderMiraCostaBank();
    renderMistakes();
    renderTimer();

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyboard);
    el.topicSearch.addEventListener("input", (event) => {
      state.topicSearch = event.target.value;
      renderTopics();
    });
    el.answerForm.addEventListener("submit", checkAnswer);
    el.nextQuestion.addEventListener("click", nextQuestion);
    el.quitExam.addEventListener("click", () => finishExam("quit"));
    el.retryMistakes.addEventListener("click", () => startExam("mistakes"));
    el.clearMistakes.addEventListener("click", clearMistakes);
    el.menuToggle.addEventListener("click", () => {
      const open = !el.nav.classList.contains("is-open");
      el.nav.classList.toggle("is-open", open);
      el.menuToggle.setAttribute("aria-expanded", String(open));
      el.menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });
    window.addEventListener("hashchange", () => {
      const view = location.hash.replace("#", "");
      if (VIEWS.includes(view) && view !== state.view) showView(view, false);
    });

    const initialView = location.hash.replace("#", "");
    showView(VIEWS.includes(initialView) ? initialView : "overview", false);
  }

  init();
})();
