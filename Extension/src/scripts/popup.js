import browser from 'webextension-polyfill';
import '../styles/popup.css';

document.addEventListener('DOMContentLoaded', async function () {
  const saveButton = document.getElementById('saveButton');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const statusMessage = document.getElementById('statusMessage');

  const providerSelect = document.getElementById('providerSelect');
  const localSettings = document.getElementById('localSettings');
  // const localModel = document.getElementById('localModel');
  // const localPort = document.getElementById('localPort');
  const saveConfigButton = document.getElementById('saveConfigButton');
  const ConfigStatusMessage = document.getElementById('ConfigStatusMessage');
  const modelSelect = document.getElementById('modelSelect');

  // Функция для получения доступных моделей
  async function getModels() {
    // const response = await fetch(`${"localhost:11434"}/api/tags`);
    const response = await browser.runtime.sendMessage({ action: 'getModels' });
    const data = response.data;
    return data.models;
  }

  // Функция для заполнения выпадающего списка моделями
  async function populateModels() {
    try {
      const models = await getModels();
      models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.name;
        option.textContent = model.name;
        modelSelect.appendChild(option);
      });

      // Установите выбранное значение из хранилища, если оно есть
      const storedModel = await browser.storage.sync.get('selectedModel');
      if (storedModel.selectedModel) {
        modelSelect.value = storedModel.selectedModel;
      }
    } catch (error) {
      ConfigStatusMessage.textContent = `Помилка завантаження моделей: ${error.message}`;
    }
  }

  try {
    const response = await browser.runtime.sendMessage({ action: 'getApiKey' });
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
      const response = await browser.runtime.sendMessage({ action: 'activateUser', userKey: userKey });
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

  browser.storage.sync.get(['provider', 'localModel', 'localPort', 'selectedModel'])
    .then(result => {
      providerSelect.value = result.provider || 'ourServer';
      // localModel.value = result.localModel || '';
      // localPort.value = result.localPort || '';
      if (result.selectedModel) {
        modelSelect.value = result.selectedModel;
      }
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
    // const model = localModel.value.trim();
    // const port = localPort.value.trim();
    const selectedModel = modelSelect.value;
    const model = modelSelect.value;
    browser.storage.sync.set({
      provider,
      localModel: model,
      localPort: 11434,
      selectedModel
    }).then(() => {
      ConfigStatusMessage.textContent = 'Налаштування збережено!';
    }).catch(error => {
      ConfigStatusMessage.textContent = `Помилка збереження: ${error.message}`;
    });
  });

  // Загрузка моделей при загрузке страницы
  populateModels();
});
