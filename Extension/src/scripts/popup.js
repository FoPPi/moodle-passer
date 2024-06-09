import browser from 'webextension-polyfill';
import '../styles/popup.css';


document.addEventListener('DOMContentLoaded', async function () {
  const saveButton = document.getElementById('saveButton');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const statusMessage = document.getElementById('statusMessage');

  const providerSelect = document.getElementById('providerSelect');
  const localSettings = document.getElementById('localSettings');
  const localModel = document.getElementById('localModel');
  const localPort = document.getElementById('localPort');
  const saveConfigButton = document.getElementById('saveConfigButton');
  const ConfigStatusMessage = document.getElementById('ConfigStatusMessage');

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


  browser.storage.sync.get(['provider', 'localModel', 'localPort'])
  .then(result => {
    providerSelect.value = result.provider || 'ourServer';
    localModel.value = result.localModel || '';
    localPort.value = result.localPort || '';
    toggleLocalSettings();
  });


  providerSelect.addEventListener('change', toggleLocalSettings);

  function toggleLocalSettings() {
    if (providerSelect.value === 'localServer') {
      localSettings.style.display = 'block';
    } else {
      localSettings.style.display = 'none';
    }
  }


  saveConfigButton.addEventListener('click', () => {
    const provider = providerSelect.value;
    const model = localModel.value.trim();
    const port = localPort.value.trim();

    browser.storage.sync.set({
      provider,
      localModel: model,
      localPort: port,
    }).then(() => {
      ConfigStatusMessage.textContent = 'Налаштування збережено!';
    }).catch(error => {
      ConfigStatusMessage.textContent = `Помилка збереження: ${error.message}`;
    });
  });
});
