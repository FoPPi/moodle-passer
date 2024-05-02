// background.js

serverLink = "http://127.0.0.1:8000";

function fetchData(apiKey, data) {
    return fetch(`${serverLink}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_key": apiKey,
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      return response.json();
    })
    .catch(error => {
      console.error("Error posting question data:", error);
      return { error };
    });
  }
  
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("1");
    if (message.action === "fetchData") {
      fetchData(message.apiKey, message.data).then(data => {
        sendResponse({ success: true, data: data });
      });
      return true; // indicates an asynchronous response
    }
  });
  

  