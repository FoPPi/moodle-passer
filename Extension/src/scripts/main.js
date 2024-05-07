import { Button } from "./modules/Button.js";
import { Toast } from "./modules/Toasts.js";
import { getAllTextData, getAllTextInObj } from "./modules/dataProcessing.js";
import { copyToClipboard } from "./modules/helpers.js";

class Application {
  constructor() {
    this.isAutoPassEnabled = false;
    this.toast = new Toast();
  }

  init() {
    this.searchForAnswer();
  }

  searchForAnswer() {
    if (!window.location.href.includes("attempt")) return;
    const interval = setInterval(() => {
      if (document.querySelector(".answer")) {
        this.setupUI();
        clearInterval(interval);
      }
    }, 500);
  }

  setupUI() {
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

    new Button(
      "Автоматичне вирішення",
      this.toggleAutoFlag.bind(this),
      "autoModeButton"
    ).render(document.querySelector(".answer"));

    new Button(
      "Вирішити через ГПТ",
      () => {
        const textData = getAllTextInObj();
        console.log("Text Data: ", textData);
      },
      "answerWithGpt"
    ).render(document.querySelector(".answer"));
  }

  toggleAutoFlag() {
    this.isAutoPassEnabled = !this.isAutoPassEnabled;
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
}

const app = new Application();
app.init();
