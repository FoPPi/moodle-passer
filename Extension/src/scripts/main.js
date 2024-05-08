import browser from "webextension-polyfill";

import { Button } from "./modules/Button.js";
import { Toast } from "./modules/Toasts.js";
import {
  getPromptType,
  getAllTextData,
  getAllTextInObj,
} from "./modules/dataProcessing.js";
import { copyToClipboard } from "./modules/helpers.js";
// import { getApiKey } from "./modules/storage.js";

class Application {
  constructor() {
    this.isAutoPassEnabled = false;
    this.toast = new Toast();
    this.userKey = "";

  }

  async  init() {
    this.searchForAnswer();
    const autoPassResponse = await getAutoPassEnabled();
    if (autoPassResponse.status === 'success') {
      this.isAutoPassEnabled = autoPassResponse.isAutoPassEnabled;
    }
  }

  toggleAutoFlag() {
    this.isAutoPassEnabled = !this.isAutoPassEnabled;
    setAutoPassEnabled(this.isAutoPassEnabled).then(response => {
      console.log(response.message);

      const button = document.querySelector("#autoModeButton");
  if (button) {
    button.textContent = this.isAutoPassEnabled
      ? "Зупинити авто вирішення"
      : "Автоматичне вирішення";
    button.className = this.isAutoPassEnabled
      ? "extention-custom-button custom-button-red"
      : "extention-custom-button";
  }
  if (this.isAutoPassEnabled) {
    this.handleGptRequest();
  }

    
  });}

  searchForAnswer() {
    if (!window.location.href.includes("attempt")) return;
    const interval = setInterval(() => {
      if (document.querySelector(".answer")) {
        this.setupUI();
        clearInterval(interval);
      }
    }, 500);
  }

  processResponse(input) {
    const trimmed = input.trim();

    const resultArray = trimmed.split(",").map((item) => item.trim());

    return resultArray;
  }

  selectAnswers(answersArray, promptType) {
    console.log(answersArray, promptType);
    const inputs = document.querySelectorAll(".answer input");
    let isAnswered = false;
  
    inputs.forEach((input) => {
      const label = input.nextElementSibling;
      const labelText = label ? label.innerText.trim().replace(/\s+/g, ' ').toLowerCase() : null;
  
      console.log(labelText);
  
      switch (promptType) {
        case 1:
          input.checked = false;
          if (input.type === "radio" && answersArray.some(answer => this.compareAnswers(answer.toLowerCase(), labelText))) {
            input.checked = true;
            isAnswered = true;
          }
          break;
        case 2:
          input.checked = false;
          if (input.type === "checkbox" && answersArray.some(answer => this.compareAnswers(answer.toLowerCase(), labelText))) {
            input.checked = true;
            isAnswered = true;
          }
          break;
        case -1:
          input.value = "";
          if (input.type === "text" && answersArray.length === 1) {
            input.value = answersArray[0];
            isAnswered = true;
          }
          break;
      }
    });
  
    console.log(`isAnswered: ${isAnswered}`);
    if (isAnswered) {
      this.ensureButtonClick();
    }
  }
  
  compareAnswers(answer, labelText) {
    return labelText.startsWith(answer) || labelText === answer;
  }
  
  

  ensureButtonClick() {
    const nextButton = document.querySelector(".mod_quiz-next-nav");

    if (nextButton) {
      if (!nextButton.disabled && nextButton.offsetParent !== null) {
        nextButton.click();
      } else {
        setTimeout(ensureButtonClick, 500);
      }
    } else {
      setTimeout(ensureButtonClick, 500);
    }
  }

  async handleGptRequest() {
    const textData = getAllTextInObj();
    this.toast.show("Зачекайте, йде обробка даних...", 0);
    try {
      const response = await browser.runtime.sendMessage({
        action: "gptRequest",
        data: textData,
        userKey: this.userKey,
      });
      // console.log("Response: ", response);
      this.toast.close();

      if (response && response.success) {
        console.log("Text Data: ", response.data);
        this.selectAnswers(this.processResponse(response.data), getPromptType());
        this.toast.show(`Данні отриманно. відповідь: ${response.data}`, 5000);
      } else {
        this.toast.show(
          `Помилка отримання данних: ${response.message || "невідома помилка"}`,
          5000
        );
      }
    } catch (error) {
      this.toast.show(`Помилка отримання данних: ${error.message}`, 5000);
      console.error("Error: ", error);
    }
  }

  async setupUI() {
    new Button(
      "Скопіювати",
      () => {
        const textData = getAllTextData();
        copyToClipboard(textData).then((success) => {
          if (success) {
            this.toast.show("Скопійовано у буфер обміну.", 3000);
          } else {
            this.toast.show("Помилка копіювання у буфер обміну.", 3000);
          }
        });
      },
      "copy"
    ).render(document.querySelector(".answer"));

    const response = await this.getApiKey();
    if (response && response.status === "success" && response.apiKey) {
      this.userKey = response.apiKey;
      if (this.isAutoPassEnabled) {
        this.handleGptRequest();
      }
      new Button(
        "Автоматичне вирішення",
        this.toggleAutoFlag.bind(this),
        "autoModeButton"
      ).render(document.querySelector(".answer"));
      new Button(
        "Вирішити через ГПТ",
        this.handleGptRequest.bind(this),
        "answerWithGpt"
      ).render(document.querySelector(".answer"));
    }
  }

  async getApiKey() {
    try {
      return await browser.runtime.sendMessage({ action: "getApiKey" });
    } catch (error) {
      console.error("Error getting API key: ", error);
      return null;
    }
  }

}

const app = new Application();
app.init();
