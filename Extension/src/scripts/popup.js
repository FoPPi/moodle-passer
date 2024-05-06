document.addEventListener('DOMContentLoaded', function () {
  const saveButton = document.getElementById('saveButton');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const statusMessage = document.getElementById('statusMessage'); // Элемент для отображения статусных сообщений

  // Запрос текущего значения API ключа при загрузке
  browser.runtime.sendMessage({action: 'getApiKey'}).then(response => {
      if (response.status === 'success' && response.apiKey) {
          apiKeyInput.value = response.apiKey;
          apiKeyInput.disabled = true; // Блокировать изменение если ключ уже сохранен
          saveButton.disabled = true; // Блокировать кнопку если ключ уже сохранен
          statusMessage.textContent = 'API ключ уже активирован и сохранен.';
      }
  });

  saveButton.addEventListener('click', function () {
      const userKey = apiKeyInput.value;
      if (!userKey) {
          statusMessage.textContent = 'Пожалуйста, введите API ключ.';
          return;
      }
      
      // Отправка сообщения для активации ключа
      browser.runtime.sendMessage({action: 'activateUser', userKey: userKey}).then(response => {
          if (response.status === 'success') {
              statusMessage.textContent = 'API ключ успешно активирован и сохранен.';
              apiKeyInput.disabled = true;
              saveButton.disabled = true;
          } else {
              statusMessage.textContent = 'Ошибка активации: ' + response.message;
              apiKeyInput.disabled = false;
              saveButton.disabled = false;
          }
      });
  });
});
