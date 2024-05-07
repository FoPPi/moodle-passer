import browser from 'webextension-polyfill';

const serverLink = "http://127.0.0.1:8000";
const apiKey = "018f0b31-ea27-76af-b954-a75cdec903ff";

function fetchAPI(endpoint, method, userKey, data) {
  const url = `${serverLink}${endpoint}`;
  const headers = new Headers({
    "Content-Type": "application/json",
    "api_key": apiKey,
  });

  if (userKey) {
    headers.append("user_key", userKey);
  }

  const fetchOptions = {
    method: method,
    headers: headers,
  };

  if (data) {
    fetchOptions.body = JSON.stringify(data);
  }

  return fetch(url, fetchOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .catch(error => {
      console.error("Error with fetch operation:", error);
      return { error: true, message: error.message };
    });
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "activateUser":
      fetchAPI("/user/activate", "POST", message.userKey).then(data => {
        if (data.success) { // Checking whether the key activation was successful
          browser.storage.sync.set({ apiKey: message.userKey })
            .then(() => sendResponse({ status: 'success', message: 'API Key saved and activated' }))
            .catch(error => sendResponse({ status: 'error', message: `Error saving the API key: ${error}` }));
        } else {
          sendResponse({ status: 'error', message: data.message || 'Activation failed' });
        }
      });
      break;
    case "gptRequest":
      fetchAPI("/", "POST", message.userKey, message.data).then(data => {
        sendResponse({ success: true, data: data });
      });
      break;
    case 'deleteApiKey':
      browser.storage.sync.remove('apiKey')
        .then(() => sendResponse({ status: 'success', message: 'API Key deleted' }))
        .catch(error => sendResponse({ status: 'error', message: `Error deleting the API key: ${error}` }));
      break;
    case 'getApiKey':
      browser.storage.sync.get('apiKey')
        .then(result => sendResponse({ status: 'success', apiKey: result.apiKey || '' }))
        .catch(error => sendResponse({ status: 'error', message: `Error retrieving the API key: ${error}` }));
      break;
  }
  return true;  
});

