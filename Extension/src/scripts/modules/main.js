// import { fetchJsonData } from "./api.js";
import { addElement} from "./ui.js";
import { getCleanText, copyToClipboard } from "./helpers.js";
import { getAllTextData } from './dataProcessing.js';
import { createToast, closeToast, showToast } from './toast.js';


function main() {
    createToast();
    
    addElement("Скопіювати", () => {
        console.log("Calling getAllTextData");
        const textData = getAllTextData();
        console.log("Text Data: ", textData);
        copyToClipboard(textData);
      }, "copy");
}


// START APP

function workInThisPage() {
    return window.location.href.includes("attempt");
}

function searchForAnswer() {
if (!workInThisPage()) return; 
  const interval = setInterval(() => {
    const answerElement = document.querySelector(".answer");
    if (answerElement) {
      main();
      clearInterval(interval);
    }
  }, 500);
}

searchForAnswer();
