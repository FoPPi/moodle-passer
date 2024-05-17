async function getApiKey() {
  try {
      const result = await browser.storage.sync.get(["apiKey"]);
      return result.apiKey ? result.apiKey.trim() : "";
  } catch (error) {
      console.error('Error retrieving API key:', error);
      return "";
  }
}

async function setAutoFlag(attempt) {
  try {
      await browser.storage.local.set({
          autoFlag: { attempt: attempt, auto: true }
      });
  } catch (error) {
      console.error('Error setting auto flag:', error);
  }
}

async function removeAutoFlag() {
  try {
      await browser.storage.local.remove("autoFlag");
  } catch (error) {
      console.error("Error removing 'autoFlag' from local storage:", error);
  }
}

export { getApiKey, setAutoFlag, removeAutoFlag };
