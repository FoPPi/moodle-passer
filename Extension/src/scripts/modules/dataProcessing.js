import { getCleanText } from './helpers.js';


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


  export function getTestType() {
    return document.querySelector("h1").textContent;
  }
  

  export function getAllTextInObj(){
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