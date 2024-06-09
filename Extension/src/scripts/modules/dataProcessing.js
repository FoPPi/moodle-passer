export function getCleanText(text) {
  text = text.replace(/\n+/g, " ");
  text = text.replace(/\btest\b/gi, "t est");
  return text;
}

const siteSelectors = {
  "dn.duikt.edu.ua": {
    questionSelector: ".qtext",
    promptSelector: ".prompt",
    answerSelector: ".answer label",
    testTypeSelector: "h1",
  },
  "ido-m.kneu.edu.ua": {
    questionSelector: ".qtext",
    promptSelector: ".prompt",
    answerSelector: ".answer p",
    testTypeSelector: "",
  },
  "127.0.0.1": {
    questionSelector: ".qtext",
    promptSelector: ".prompt",
    answerSelector: ".answer p",
    testTypeSelector: "",
  },
};

function getSiteSelectors() {
  const hostname = window.location.hostname;
  return siteSelectors[hostname] || {};
}

export function getQuestionText() {
  const selectors = getSiteSelectors();
  if (selectors.questionSelector) {
    const questionElement = document.querySelector(selectors.questionSelector);
    return questionElement ? questionElement.innerText.trim() : "";
  }
  return "";
}

export function getPromptText() {
  const selectors = getSiteSelectors();
  if (selectors.promptSelector) {
    const promptElement = document.querySelector(selectors.promptSelector);
    return promptElement ? promptElement.innerText.trim() : "";
  }
  return "";
}

export function getAllAnswers() {
  const selectors = getSiteSelectors();
  if (selectors.answerSelector) {
    const answerElements = document.querySelectorAll(selectors.answerSelector);
    return Array.from(answerElements).map((label) => label.innerText.trim());
  }
  return [];
}

export function getTestType() {
  const selectors = getSiteSelectors();
  if (selectors.testTypeSelector) {
    const testTypeElement = document.querySelector(selectors.testTypeSelector);
    return testTypeElement ? testTypeElement.textContent : "";
  }
  return "";
}

export function getAllTextData() {
  const question = getQuestionText();
  const prompt = getPromptText();
  const answers = getAllAnswers();
  let fullText = `${question}`;
  if (prompt) {
    fullText += `\n${prompt}\n`;
  }
  if (answers.length) {
    fullText += `\n${answers.join("\n")}`;
  }
  return fullText;
}

export function getPromptType() {
  const promptText = getPromptText();
  if (promptText.includes("Виберіть одну відповідь:")) {
    return 1;
  } else if (promptText.includes("Виберіть одну або декілька відповідей:")) {
    return 2;
  } else {
    return -1;
  }
}

export function getAllTextInObj() {
  const question = getQuestionText();
  const answers = getAllAnswers();
  const testType = getTestType();
  const prompt = getPromptType();
  const data = {
    test_type: testType,
    question: getCleanText(question),
    prompt: prompt,
    answers: answers,
  };
  return data;
}
