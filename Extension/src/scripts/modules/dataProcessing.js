export function getQuestionText() {
    const questionElement = document.querySelector(".qtext");
    return questionElement ? questionElement.innerText.trim() : "";
  }
  
  export function getPromptText() {
    const promptElement = document.querySelector(".prompt");
    return promptElement ? promptElement.innerText.trim() : "";
  }
  
  export function getAllAnswers() {
    const answerElements = document.querySelectorAll(".answer label");
    return Array.from(answerElements).map(label => label.innerText.trim());
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
  