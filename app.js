(() => {
  "use strict";

  const DATA = window.COURSE_DATA;
  const STORAGE_KEY = "cs111-final-lab-mistakes-v1";
  const VIEWS = ["overview", "knowledge", "exam", "mistakes"];
  const DOMAIN_GROUPS = [
    { name: "基础 + 数据", ids: [...range(1, 14), 51] },
    { name: "方法 + 参数", ids: [...range(15, 22), 52, 53] },
    { name: "分支 + 循环", ids: [...range(23, 35), 54, 55] },
    { name: "数组 + 引用", ids: [...range(36, 45), 56, 57, 61, 62] },
    { name: "对象 + 类设计", ids: [...range(46, 50), 58, 59, 60, 63] },
    { name: "后续 Topic", ids: [64, 65] },
  ];

  const state = {
    view: "overview",
    unitFilter: "all",
    topicSearch: "",
    mistakes: loadMistakes(),
    session: null,
    timerId: null,
    toastId: null,
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
    return DATA.questions.find((question) => question.id === Number(id));
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
    el.mistakeCount.setAttribute("aria-label", `${unresolved} 道待复习错题`);
  }

  function recordWrong(question, userAnswer) {
    const previous = state.mistakes[question.id] || {};
    state.mistakes[question.id] = {
      id: question.id,
      topic: question.topic,
      count: (previous.count || 0) + 1,
      lastSeen: new Date().toISOString(),
      lastAnswer: userAnswer || "未作答",
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
    el.menuToggle.setAttribute("aria-label", "打开导航");
    if (updateHash) history.replaceState(null, "", `#${view}`);
    if (view === "mistakes") renderMistakes();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderOverview() {
    el.priorityLines.innerHTML = DATA.course.priorities
      .map((priority) => `<div>${escapeHtml(priority)}</div>`)
      .join("");
  }

  function unitLabel(unit) {
    const match = unit.match(/^Unit \d+/);
    return match ? match[0] : unit;
  }

  function renderTopicFilters() {
    const units = [...new Set(DATA.topics.map((topic) => topic.unit))];
    const items = [{ key: "all", label: "全部 Topic" }].concat(
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
    const label = topic.confidence === "possible" ? "可能考" : "低置信度";
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
                <p class="pitfall"><strong>高频陷阱：</strong>${escapeHtml(topic.pitfall)}</p>
                <div class="topic-actions">
                  <button data-practice-topic="${topic.id}">练这个 Topic</button>
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

  function startExam(mode, customIds = null) {
    let ids;
    let label;
    let timed = false;

    if (customIds?.length) {
      ids = [...customIds];
      label = ids.length === 1 ? "SINGLE RETRY" : "TOPIC PRACTICE";
    } else if (mode === "quick") {
      ids = shuffle(DATA.questions.map((question) => question.id)).slice(0, 10);
      label = "FOCUS SPRINT";
    } else if (mode === "mistakes") {
      ids = Object.values(state.mistakes)
        .filter((item) => !item.resolved)
        .sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))
        .map((item) => Number(item.id));
      if (!ids.length) {
        showToast("错题本里目前没有待复习题目。");
        return;
      }
      label = "RETRY MISTAKES";
    } else {
      ids = DATA.questions.map((question) => question.id);
      label = "FULL SIMULATION";
      timed = true;
    }

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
      el.timer.textContent = "不限时";
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
    el.type.textContent = question.type === "mc" ? "MULTIPLE CHOICE" : "TRACE / SHORT ANSWER";
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
      ? "对照参考答案进行自评"
      : correct
        ? "答对了。"
        : "这道题需要立刻修正。";
    el.feedbackExplanation.textContent = question.explanation;
    el.correctAnswer.innerHTML = `<strong>参考答案：</strong>${escapeHtml(answerLabel(question))}`;
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
      if (state.session.mode === "mistakes") markResolved(question);
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
        showToast("请先选择一个答案。");
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
      showToast("请先写下你的答案，再查看解析。");
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
    el.feedbackTitle.textContent = correct ? "已计为答对。" : "已加入错题本。";
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
        session.results.push({ id, correct: false, userAnswer: "未作答" });
        recordWrong(question, "未作答");
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
        ? "可以进入精修阶段。"
        : percent >= 80
          ? "接近考试状态。"
          : percent >= 66
            ? "需要定点修复。"
            : "先重建核心模式。";

    const diagnostics = DOMAIN_GROUPS.map((domain) => {
      const domainResults = session.results.filter((result) => domain.ids.includes(result.id));
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
          <p>正确率 ${percent}% · 用时 ${minutes}:${String(seconds).padStart(2, "0")}。低于 80% 的领域应在下一次整卷前专项重做。</p>
          <div class="results-actions">
            <button class="button button-primary" data-result-action="mistakes">重做错题</button>
            <button class="button button-dark" data-result-action="knowledge">回到知识点</button>
            <button class="button button-ghost" data-result-action="setup">选择其他模式</button>
          </div>
        </div>
      </section>
      <section class="diagnostic-list" aria-label="分领域诊断">
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
    showView("exam");
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
      <div><strong>${unresolved.length}</strong><span>待订正</span></div>
      <div><strong>${attempts}</strong><span>累计错误</span></div>
      <div><strong>${escapeHtml(weakest)}</strong><span>最弱标签</span></div>`;
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
              <small>${escapeHtml(question.topic)} · ${item.resolved ? "已订正" : `错误 ${item.count} 次`}</small>
            </div>
            <p>${escapeHtml(question.explanation)}<br><strong>答案：</strong>${escapeHtml(answerLabel(question))}</p>
            <button data-retry-id="${question.id}">${item.resolved ? "再练一次" : "立即重做"}</button>
          </article>`;
      })
      .join("");
    renderMistakeCount();
  }

  function clearMistakes() {
    if (!Object.keys(state.mistakes).length) {
      showToast("错题本已经是空的。");
      return;
    }
    const confirmed = window.confirm("确定要清空当前浏览器中的全部错题记录吗？");
    if (!confirmed) return;
    state.mistakes = {};
    saveMistakes();
    renderMistakes();
    showToast("错题记录已清空。");
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
        showToast("这个 Topic 暂时没有独立题目。");
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
      el.menuToggle.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
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
