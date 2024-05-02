document.addEventListener('DOMContentLoaded', function () {
  const saveButton = document.getElementById('saveButton');
  const delButton = document.getElementById('delButton');
  const apiKeyInput = document.getElementById('apiKeyInput');

  // Use browser.storage.sync.get to get API key
  browser.storage.sync.get(['apiKey']).then(result => {
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
    }
  }).catch(error => {
    console.error('Error retrieving the API key:', error);
  });

  saveButton.addEventListener('click', function () {
    const apiKey = apiKeyInput.value;
    // Use browser.storage.sync.set to save the API key
    browser.storage.sync.set({ apiKey: apiKey }).then(() => {
      console.log('API Key saved:', apiKey);
      if (apiKeyInput.value.trim() !== "")
        apiKeyInput.classList.add('input-success');
    }).catch(error => {
      console.error('Error saving the API key:', error);
    });
  });

  delButton.addEventListener('click', function () {
    // Use browser.storage.sync.remove to remove the API key
    browser.storage.sync.remove('apiKey').then(() => {
      console.log('API Key deleted');
      apiKeyInput.value = '';
      apiKeyInput.classList.remove('input-success');
    }).catch(error => {
      console.error('Error deleting the API key:', error);
    });
  });

  apiKeyInput.addEventListener('input', function () {
    if (!apiKeyInput.value) {
      apiKeyInput.classList.remove('input-success');
    }
  });
});
