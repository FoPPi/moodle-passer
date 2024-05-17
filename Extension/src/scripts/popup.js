import browser from 'webextension-polyfill';
import '../styles/popup.css';


document.addEventListener('DOMContentLoaded', async function () {
  const saveButton = document.getElementById('saveButton');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const statusMessage = document.getElementById('statusMessage');

  try {
    const response = await browser.runtime.sendMessage({action: 'getApiKey'});
    if (response && response.status === 'success' && response.apiKey) {
      apiKeyInput.value = response.apiKey;
      apiKeyInput.disabled = true;
      saveButton.disabled = true;
      statusMessage.textContent = 'API ключ уже активовано і збережено.';
    }
  } catch (error) {
    statusMessage.textContent = 'Помилка під час отримання API ключа: ' + error.message;
  }

  saveButton.addEventListener('click', async function () {
    statusMessage.textContent = 'Зачекайте...';
    const userKey = apiKeyInput.value.trim();
    if (!userKey) {
      statusMessage.textContent = 'Будь ласка, введіть API ключ.';
      return;
    }
    
    try {
      const response = await browser.runtime.sendMessage({action: 'activateUser', userKey: userKey});
      if (response && response.status === 'success') {
        statusMessage.textContent = 'API ключ успішно активовано та збережено.';
        apiKeyInput.disabled = true;
        saveButton.disabled = true;
      } else {
        statusMessage.textContent = 'Помилка активації: ' + (response.message || 'Невідома помилка');
      }
    } catch (error) {
      statusMessage.textContent = 'Помилка активації: ' + error.message;
    }
  });
});
