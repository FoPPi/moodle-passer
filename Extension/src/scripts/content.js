import browser from "webextension-polyfill";
import "../styles/content.css";
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
    this.autoPassObj = null;
    this.isAutoPassEnabled = false;
    this.toast = new Toast();
    this.userKey = "";
    this.clickDelayInSec = 5;
    this.attempt = null;
    this.autoModeButton = null;
    this.answerWithGptButton = null;
  }

  async init() {
    this.searchForAnswer();
  }

  updateAutoPassButton() {
    const button = document.querySelector("#autoModeButton");
    if (button) {
      button.textContent = this.isAutoPassEnabled
        ? "Зупинити авто вирішення"
        : "Автоматичне вирішення";
      button.className = this.isAutoPassEnabled
        ? "extention-custom-button custom-button-red"
        : "extention-custom-button";
    }
  }

  toggleAutoFlag() {
    this.isAutoPassEnabled = !this.isAutoPassEnabled;
    this.setAutoPassEnabled(this.isAutoPassEnabled)
      .then((response) => {
        // console.log(response.message);
        this.updateAutoPassButton();

        this.toast.show(
          `${
            this.isAutoPassEnabled
              ? "Автоматичний режим активовано."
              : "Автоматичний режим деактивовано."
          }`
        );

        if (this.isAutoPassEnabled) {
          this.handleGptRequest();
        }
      })
      .catch((error) => {
        console.error("Error toggling auto flag:", error);
      });
  }

  async searchForAnswer() {
    if (
      window.location.href.includes("summary") ||
      window.location.href.includes("view")
    ) {
      const autoPassResponse = await this.getAutoPassEnabled();
      if (autoPassResponse.status === "success") {
        this.autoPassObj = autoPassResponse.autoPassObj;
        this.isAutoPassEnabled = this.autoPassObj.isAutoPassEnabled;
      }

      if (this.isAutoPassEnabled) {
        this.deleteAutoPassEnabled();
        this.toast.show("Автоматичний режим деактивовано.");
        this.isAutoPassEnabled = false;
      }

      return;
    }
    if (!window.location.href.includes("attempt")) return;
    this.attempt = new URL(window.location.href).searchParams.get("attempt");
    const interval = setInterval(async () => {
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
      const labelText = label
        ? label.innerText.trim().replace(/\s+/g, " ").toLowerCase()
        : null;

      switch (promptType) {
        case 1:
          input.checked = false;
          if (
            input.type === "radio" &&
            answersArray.some((answer) =>
              this.compareAnswers(answer.toLowerCase(), labelText)
            )
          ) {
            input.checked = true;
            isAnswered = true;
          }
          break;
        case 2:
          input.checked = false;
          if (
            input.type === "checkbox" &&
            answersArray.some((answer) =>
              this.compareAnswers(answer.toLowerCase(), labelText)
            )
          ) {
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

    // console.log(`isAnswered: ${isAnswered}`);
    if (isAnswered && this.isAutoPassEnabled) {
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
        setTimeout(() => nextButton.click(), this.clickDelayInSec * 1000);
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
        // console.log("Text Data: ", response.data);
        this.selectAnswers(
          this.processResponse(response.data),
          getPromptType()
        );
        this.toast.show(`Данні отриманно. відповідь: ${response.data}`, 0);
      } else {
        this.toast.show(
          `Помилка отримання данних: ${response.message || "невідома помилка"}`,
          0
        );
      }
    } catch (error) {
      this.toast.show(`Помилка отримання данних: ${error.message}`, 0);
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

    this.createGptBtns();

    this.disableGptBtns();


    if (response && response.status === "success" && response.apiKey) {
      this.userKey = response.apiKey;

      this.enableGptBtns();

      const autoPassResponse = await this.getAutoPassEnabled();
      if (autoPassResponse.status === "success") {
        // console.log(autoPassResponse);
        this.autoPassObj = autoPassResponse.autoPassObj;
        // console.log(autoPassResponse.autoPassObj);
        this.isAutoPassEnabled = this.autoPassObj.isAutoPassEnabled;
      }

      this.updateAutoPassButton();

      if (this.isAutoPassEnabled && this.attempt === this.autoPassObj.attempt) {
        this.handleGptRequest();
      }
    }
  }

  enableGptBtns() {
    if (this.autoModeButton) {
      this.autoModeButton.enable();
    }
    if (this.answerWithGptButton) {
      this.answerWithGptButton.enable();
    }
  }

  createGptBtns() {
    this.autoModeButton = new Button("Автоматичне вирішення", this.toggleAutoFlag.bind(this), "autoModeButton", this.showApiKeyToast.bind(this));
    this.autoModeButton.render(document.querySelector(".answer"));
  
    this.answerWithGptButton = new Button("Вирішити через ГПТ", this.handleGptRequest.bind(this), "answerWithGpt", this.showApiKeyToast.bind(this));
    this.answerWithGptButton.render(document.querySelector(".answer"));
  }
  
  showApiKeyToast() {
    this.toast.close();
    this.toast.show("Для використання цієї функції купіть API-ключ.", 3000);
  }

  disableGptBtns() {
    if (this.autoModeButton) {
      this.autoModeButton.disable();
    }
    if (this.answerWithGptButton) {
      this.answerWithGptButton.disable();
    }
  }

  offGptBtns(){
    this.disableGptBtns();

    this.autoPassObj = null; // Clear autoPassObj
    this.isAutoPassEnabled = false; // Disable auto-solve
    this.deleteAutoPassEnabled();
    this.updateAutoPassButton(); // Update button state
  }

  async getApiKey() {
    try {
      return await browser.runtime.sendMessage({ action: "getApiKey" });
    } catch (error) {
      console.error("Error getting API key: ", error);
      return null;
    }
  }

  async deleteAutoPassEnabled() {
    try {
      return await browser.runtime.sendMessage({
        action: "deleteAutoPassEnabled",
      });
    } catch (error) {
      console.error("Error: ", error);
      return null;
    }
  }
  async setAutoPassEnabled(isAutoPassEnabled) {
    try {
      return await browser.runtime.sendMessage({
        autoPassObj: {
          attempt: this.attempt,
          isAutoPassEnabled: isAutoPassEnabled,
        },
        action: "setAutoPassEnabled",
      });
    } catch (error) {
      console.error("Error: ", error);
      return null;
    }
  }
  async getAutoPassEnabled() {
    try {
      return await browser.runtime.sendMessage({
        action: "getAutoPassEnabled",
      });
    } catch (error) {
      console.error("Error: ", error);
      return null;
    }
  }
}

const app = new Application();
app.init();

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    if (changes.apiKey) {
      if (changes.apiKey.newValue) {
        app.userKey = changes.apiKey.newValue;
        app.enableGptBtns();
      } else {
        app.offGptBtns();
      }
    }

    if (changes.autoPassObj) {
      // console.log("Auto-pass settings changed:", changes.autoPassObj.newValue);
      app.isAutoPassEnabled = changes.autoPassObj.newValue.isAutoPassEnabled;
      app.updateAutoPassButton();
    }
  }
});
