if (typeof browser === "undefined") {
  var browser = {};
  browser.storage = {
    sync: {
      get: function (keys) {
        return new Promise((resolve, reject) => {
          chrome.storage.sync.get(keys, function (result) {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(result);
            }
          });
        });
      },
      set: function (items) {
        return new Promise((resolve, reject) => {
          chrome.storage.sync.set(items, function () {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        });
      },
      remove: function (keys) {
        return new Promise((resolve, reject) => {
          chrome.storage.sync.remove(keys, function () {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        });
      }
    },
    local: {
      get: function (keys) {
        return new Promise((resolve, reject) => {
          chrome.storage.local.get(keys, function (result) {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(result);
            }
          });
        });
      },
      set: function (items) {
        return new Promise((resolve, reject) => {
          chrome.storage.local.set(items, function () {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        });
      },
      remove: function (keys) {
        return new Promise((resolve, reject) => {
          chrome.storage.local.remove(keys, function () {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        });
      }
    }
  };
}
