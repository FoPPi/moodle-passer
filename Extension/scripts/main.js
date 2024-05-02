serverLink = "http://127.0.0.1:8000";

const baseToastDeley = 3000;

let canClickNext = undefined;


function isChromiumBased() {
  return typeof window.chrome !== 'undefined' && !!window.chrome.runtime;
}

function createToast() {
  let existingToast = document.querySelector(".custom-toast");
  if (existingToast) {
    existingToast.remove();
  }

  const toastHTML = `
    <div class="custom-toast" id="toast" style="display: none;">
      <p id="toast-text"></p>
      <div class="toast-close-btn">Close</div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", toastHTML);

  const closeBtn = document.querySelector(".toast-close-btn");
  closeBtn.addEventListener("click", closeToast);
}

function closeToast() {
  const toast = document.querySelector(".custom-toast");
  if (toast) {
    toast.style.display = "none";
  }
}

function showToast(message, time_ms = NaN) {
  const toast = document.querySelector(".custom-toast");
  const textElement = document.querySelector("#toast-text");
  textElement.textContent = message;
  toast.style.display = "block";
  if (!Number.isNaN(time_ms)) {
    setTimeout(closeToast, time_ms);
  }
}


/**
 * This function create Json from Question, Answer and Prompt
 */
async function getJsonData(apiKey) {
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

  if(isChromiumBased()){
    const jsonData = JSON.stringify(data);
    console.log(jsonData);
  
    try {
      const response = await fetch(serverLink, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          api_key: apiKey,
        },
        body: jsonData,
      });
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      const data_2 = await response.json();
      console.log(data_2);
      showToast("Дані успішно опрацьовані.", baseToastDeley);
      handleApiResponse(data_2);
      return data_2;
    } catch (error) {
      console.error("Error posting question data:", error);
      showToast("Помилка при надсиланні даних.",baseToastDeley);
      throw error;
    }
  }else{
    browser.runtime.sendMessage({
      action: "fetchData",
      apiKey: apiKey,
      data: data
    }).then(response => {
      if (response.success) {
        console.log(response.data);
        showToast("Дані успішно опрацьовані.", baseToastDeley);
        handleApiResponse(response.data);
      } else {
        console.error("Error posting question data:", response.error);
        showToast("Помилка при надсиланні даних.", baseToastDeley);
      }
    }).catch(error => {
      console.error("Error with fetching data:", error);
      showToast("Системна помилка при запиті.", baseToastDeley);
    });
  }


}

  /**
 * This function finds the correct answer and selects it.
 */
async function getCorrectAnswer() {
  showToast("Зачекайте, йде обробка даних...");

  const apiKey = await browser.storage.sync.get(["apiKey"])
    .then((result) => result.apiKey ? result.apiKey.trim() : "")
    .catch((error) => {
      console.error('Error retrieving API key:', error);
      showToast("Помилка при отриманні API ключа.", baseToastDeley);
    });

  if (!apiKey) {
    showToast("Для запиту на сервер потрібен правильний API ключ.", baseToastDeley);
    return;
  }

  try {
    await getJsonData(apiKey);
  } catch (error) {
    console.error("Error:", error);
    showToast("Помилка при отриманні даних.", baseToastDeley);
  }
}


function getTestType() {
  return document.querySelector("h1").textContent;
}

function getPromptType() {
  const promptText = getPromptText();
  if (promptText.includes("Виберіть одну відповідь:")) {
    return 1;
  } else if (promptText.includes("Виберіть одну або декілька відповідей:")) {
    return 2;
  } else {
    return -1;
  }
}

function ensureButtonClick() {
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

function selectAnswers(answersArray, promptType) {
  const inputs = document.querySelectorAll(".answer input");
  let isAnswered = false;
  
  inputs.forEach((input) => {
    const label = input.nextElementSibling;
    const labelChar = label
      ? label.innerText.trim().charAt(0).toLowerCase()
      : null;
    const labelText = label
      ? label.innerText.trim()
      : null;
    
    switch (promptType) {
      case 1:
        input.checked = false;
        if (input.type === "radio" && (answersArray.includes(labelText) || answersArray.includes(labelChar))) {
          input.checked = true;
          isAnswered = true;
        }
        break;
      case 2:
        input.checked = false;
        if (input.type === "checkbox" && (answersArray.includes(labelText) || answersArray.includes(labelChar))) {
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


  console.log(`canClickNext ${canClickNext} | isAnswered ${!!isAnswered}`)
  if (canClickNext === true && isAnswered ) {
    // closeToast();
    ensureButtonClick();
  }
}

function handleApiResponse(data) {
  const { answer } = data;
  const answersArray = answer.split(", ").map((a) => a.trim().toLowerCase());
  let promptType = getPromptType();
  if (answersArray.length > 0) {
    selectAnswers(answersArray, promptType);
  } else {
    showToast("Немає даних для відповіді або неправильні дані.", baseToastDeley);
  }
}



/**
 * This function copies provided text to the clipboard.
 * @param {string} text The text to copy.
 */
function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      console.log("Copied to clipboard successfully.");
      showToast("Скопійовано у буфер обміну.", baseToastDeley);
    })
    .catch((err) => {
      console.log("Failed to copy to clipboard:", err);
      showToast("Помилка копіювання у буфер обміну.", baseToastDeley);
    });
}

/**
 * Cleans the text by removing newline characters and replacing escaped double quotes with regular double quotes.
 * @param {string} text The original text to be cleaned.
 * @returns {string} The text after removing newlines and converting escaped quotes to standard quotes.
 */
function getCleanText(text) {
  text = text.replace(/\n+/g, " ");
  text = text.replace(/\btest\b/gi, "t est");
  return text;
}

/**
 * This function retrieves the text of the question from the page.
 * @returns {string} The question text.
 */
function getQuestionText() {
  const questionElement = document.querySelector(".qtext");
  return questionElement ? questionElement.innerText.trim() : "";
}

/**
 * This function retrieves the text of the prompt from the page.
 * @returns {string} The prompt text.
 */
function getPromptText() {
  const promptElement = document.querySelector(".prompt");
  return promptElement ? promptElement.innerText.trim() : "";
}

/**
 * This function retrieves all answer texts from the page.
 * @returns {Array} List of all answers.
 */
function getAllAnswers() {
  const answerElements = document.querySelectorAll(".answer label");
  const answers = Array.from(answerElements).map((label) =>
    label.innerText.trim()
  ); 
  // console.log(answers)
  return answers;
}

/**
 * This function compiles the question and answers and copies them to the clipboard.
 */
function copyQuestionAndAnswer() {
  const question = getQuestionText();
  const prompt = getPromptText();
  const answers = getAllAnswers();
  let fullText = `${question}`;
  if (prompt != "") {
    fullText += `\n${prompt}\n`;
  }
  if (answers.length > 0) {
    fullText += `\n${answers.join("\n")}`;
  }
  copyToClipboard(fullText);
}

/**
 * This function adds a custom button with given text and associated function to the page.
 * @param {string} text Button label.
 * @param {Function} func Function to execute on click.
 */
function addElement(text, func, css_id = "") {
  const parent = document.querySelector(".answer");
  if (!parent) {
    console.log("No suitable parent found for the button.");
    return;
  }

  const button = document.createElement("div");
  button.textContent = text;
  button.addEventListener("click", func);

  button.classList = ('extention-custom-button');
  button.id = css_id;

  parent.appendChild(button);
}

async function updateButtons() {
  let autoActive = null;

  try {
    const result = await browser.storage.local.get(["autoFlag"]);
    autoActive = result.autoFlag;
  } catch (error) {
    console.error('Error retrieving auto flag:', error);
  }

  const button = document.querySelector("#autoModeButton");
  if (!button) return; 

  if (autoActive) {
    button.textContent = "Зупинити авто вирішення";
    button.className = "extention-custom-button custom-button-red";
    button.removeEventListener("click", setAutoFlag);
    button.addEventListener("click", removeAutoFlag);
  } else {
    button.textContent = "Автоматичне вирішення";
    button.className = "extention-custom-button";
    button.removeEventListener("click", removeAutoFlag);
    button.addEventListener("click", setAutoFlag);
  }
}





function removeAutoFlag(){
  browser.storage.local.remove("autoFlag").then(() => {
    console.log("Successfully removed 'autoFlag' from local storage.");
  }).catch((error) => {
    console.error("Error removing 'autoFlag' from local storage:", error);
  });
  showToast("Автоматичний режим деактивовано.", baseToastDeley);
  canClickNext = false;
  updateButtons();
}

function checkForSubmitButtonAndRemoveFlag(autoFlag) {
  const submitButton = document.querySelector(".singlebutton button[type='submit']");
  if (submitButton) {
    if(autoFlag){
      removeAutoFlag();

    }
  }
  return !!submitButton;
}

function setAutoFlag() {
  const attempt = new URL(window.location.href).searchParams.get("attempt");
  
  browser.storage.local.set({
    autoFlag: { attempt: attempt, auto: true }
  }).then(() => {
    showToast("Автоматичний режим активовано", baseToastDeley);
  }).catch((error) => {
    console.error('Error setting auto flag:', error);
    showToast("Помилка при встановленні авто-флага.", baseToastDeley);
  });
  updateButtons();
  canClickNext = true;
  getCorrectAnswer();

}


function answerWithGpt(){
  canClickNext = undefined;
  getCorrectAnswer();
}


/**
 * Main function to initialize the webpage modifications.
 */
async function main() {
  let autoFlag = null;

  const currentAttempt = new URL(window.location.href).searchParams.get("attempt");

  try {
    const result = await browser.storage.local.get(["autoFlag"]);
    autoFlag = result.autoFlag;
  } catch (error) {
    console.error('Error retrieving auto flag:', error);
  }

  createToast();
  if(checkForSubmitButtonAndRemoveFlag(autoFlag)) return;
 

  addElement("Вирішити через ГПТ", answerWithGpt);

  addElement("Автоматичне вирішення", setAutoFlag, "autoModeButton");

  if (autoFlag && autoFlag.attempt === currentAttempt && autoFlag.auto) {
    canClickNext = true;
    getCorrectAnswer();
    updateButtons();
  }
  

  addElement("Скопіювати", copyQuestionAndAnswer);

}


if (isChromiumBased()) {
  document.body.onload = main;
} else{
  main();
}
