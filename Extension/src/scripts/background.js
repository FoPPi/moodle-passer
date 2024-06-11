import browser from "webextension-polyfill";

const serverLink = process.env.SERVER_LINK;
const apiKey = process.env.API_KEY;

function getNormalQuestions(data) {
  const { test_type, question, prompt, answers } = data;
  const dataText = `
  Test Type: ${test_type}
  Question: ${question}
  Prompt: ${prompt === 1 ? 'Select only one answer' : prompt === 2 ? 'Select one or several answers' : 'Write what I need to enter in input'}
  Answers: ${answers.join(', ')}
  `;

  return dataText;
}


async function fetchAPI(endpoint, method, userKey, data) {
  const settings = await browser.storage.sync.get(['provider', 'localModel', 'localPort']);

  if (settings.provider === 'localServer' && endpoint === "/") {
    return fetchLocalAPI(endpoint, method, userKey, data, settings.localModel, settings.localPort);
  } else {
    return fetchRemoteAPI(endpoint, method, userKey, data);
  }
}


async function fetchRemoteAPI(endpoint, method, userKey, data) {
  const url = `${serverLink}${endpoint}`;
  const headers = new Headers({
    "Content-Type": "application/json",
    "X-Api-Key": apiKey,
  });

  if (userKey) {
    headers.append("X-User-Key", userKey);
  }

  const fetchOptions = {
    method: method,
    headers: headers,
  };

  if (data) {
    fetchOptions.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.detail) {
        if(errorData.detail.includes("Key not found")){
          throw new Error("Key not found");
        }
        else if(errorData.detail.includes("Subscription is expired")){

          throw new Error("Subscription is expired");

        }else{
          throw new Error(errorData.detail);
        }

      } else {
        throw new Error("Unknown error occurred");
      }
    }
    return response.json();
  } catch (error) {
    console.error("Error with fetch operation:", error);
    return { error: true, message: error.message };
  }
}

async function fetchLocalAPI(endpoint, method, userKey, data, localModel, localPort) {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  const url = `http://localhost:11434/api/generate`;

 console.log(url);

  const fetchOptions = {
    method: method,
    headers: headers,
    body: JSON.stringify({ model: localModel, prompt: getNormalQuestions(data), stream: false }),
  };



  console.log(fetchOptions);

  try {
    const response = await fetch(url, fetchOptions);
    console.log(response);
    if (!response.ok) {
      throw new Error("Local server error");
    }
    return response.json();
  } catch (error) {
    console.error("Error with local fetch operation:", error);
    return { error: true, message: error.message };
  }
}

async function gptRequestHandler(userKey, data) {
  try {
    const response = await fetchAPI("/", "POST", userKey, data);

    if (response.error) {
      let userMessage;
      if (response.message === "Key not found") {
        userMessage = "Ключ не знайдено. Будь ласка, перевірте свій API ключ.";
        await deleteApiKeyHandler();
      } else if (response.message === "Subscription is expired") {
        userMessage = "Підписка завершилася. Будь ласка, поновіть вашу підписку.";
        await deleteApiKeyHandler();
      } else {
        userMessage = `Помилка обробки GPT запиту: ${response.message}`; 
      }
      return { success: false, message: userMessage };
    }

    if (response.answer && response.answer.trim() === "") {
      return { success: false, message: "Чат ГПТ не знає відповідь" };
    }

    return { success: true, data: response.answer };
  } catch (error) {
    console.error("Error with GPT request:", error);
    return { success: false, message: `Error processing GPT request: ${error.message}` };
  }
}

async function activateUserHandler(userKey) {
  try {
    const response = await fetchAPI("/user/activate", "POST", userKey);
    console.log(response);
    if (!response.error) {
      await browser.storage.sync.set({ apiKey: userKey });
      return { status: "success", message: "API Key saved and activated" };
    } else {
      return {
        status: "error",
        message: response.message || "Activation failed",
      };
    }
  } catch (error) {
    console.error("Error activating user:", error);
    return {
      status: "error",
      message: `Error saving the API key: ${error.message}`,
    };
  }
}

async function deleteApiKeyHandler() {
  console.log("storage");
  try {
    await browser.storage.sync.remove("apiKey");
    return { status: "success", message: "API Key deleted" };
  } catch (error) {
    console.error("Error deleting the API key:", error);
    return {
      status: "error",
      message: `Error deleting the API key: ${error.message}`,
    };
  }
}

async function getApiKeyHandler() {
  try {
    const result = await browser.storage.sync.get("apiKey");
    const apiKey = result.apiKey || "";
    return { status: "success", apiKey: apiKey };
  } catch (error) {
    console.error("Error retrieving the API key:", error);
    return {
      status: "error",
      message: `Error retrieving the API key: ${error.message}`,
    };
  }
}


async function getModelsHandler() {
  try {
    const response = await fetch(`http://localhost:11434/api/tags`);
    const data = await response.json();
    return { status: "success", data: data };
  } catch (error) {
    console.error("Error retrieving the API key:", error);
    return {
      status: "error",
      message: `Error retrieving the API key: ${error.message}`,
    };
  }
}


async function getAutoPassEnabled() {
  try {
    const result = await browser.storage.sync.get("autoPassObj");
    if (result.autoPassObj) {
      return { status: "success", autoPassObj: result.autoPassObj };
    } else {
      return {
        status: "success",
        autoPassObj: { isAutoPassEnabled: false, attempt: null },
      };
    }
  } catch (error) {
    console.error("Error retrieving the auto-pass flag:", error);
    return {
      status: "error",
      message: `Error retrieving the auto-pass flag: ${error.message}`,
    };
  }
}

async function setAutoPassEnabled(value) {
  console.log(value);
  try {
    await browser.storage.sync.set({
      autoPassObj: {
        isAutoPassEnabled: value.isAutoPassEnabled,
        attempt: value.attempt,
      },
    });
    console.log({
      autoPassObj: {
        isAutoPassEnabled: value.isAutoPassEnabled,
        attempt: value.attempt,
      },
    });
    return { status: "success", message: "Auto-pass flag set" };
  } catch (error) {
    console.error("Error setting the auto-pass flag:", error);
    return {
      status: "error",
      message: `Error setting the auto-pass flag: ${error.message}`,
    };
  }
}

async function deleteAutoPassEnabled() {
  try {
    await browser.storage.sync.remove("autoPassObj");
    return { status: "success", message: "Auto-pass flag deleted" };
  } catch (error) {
    console.error("Error deleting the auto-pass flag:", error);
    return {
      status: "error",
      message: `Error deleting the auto-pass flag: ${error.message}`,
    };
  }
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "activateUser":
      activateUserHandler(message.userKey).then((response) =>
        sendResponse(response)
      );
      break;
    case "deleteApiKey":
      deleteApiKeyHandler().then((response) => sendResponse(response));
      break;
    case "getApiKey":
      getApiKeyHandler().then((response) => sendResponse(response));
      break;
    case "gptRequest":
      gptRequestHandler(message.userKey, message.data).then((response) =>
        sendResponse(response)
      );
      break;
      case "getModels":
        getModelsHandler().then((response) => sendResponse(response));
        break;
    case "getAutoPassEnabled":
      getAutoPassEnabled().then((response) => sendResponse(response));
      break;
    case "setAutoPassEnabled":
      setAutoPassEnabled(message.autoPassObj).then((response) =>
        sendResponse(response)
      );
      break;
    case "deleteAutoPassEnabled":
      deleteAutoPassEnabled().then((response) => sendResponse(response));
      break;
  }
  return true;
});
