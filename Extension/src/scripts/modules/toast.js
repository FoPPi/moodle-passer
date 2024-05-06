export function createToast() {
    let existingToast = document.querySelector(".custom-toast");
    if (existingToast) {
      existingToast.remove();
    }
  
    const toastHTML = `
      <div class="custom-toast" id="toast" style="display: none;">
        <p id="toast-text"></p>
        <div class="toast-close-btn">Close</div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", toastHTML);
    const closeBtn = document.querySelector(".toast-close-btn");
    closeBtn.addEventListener("click", closeToast);
  }
  
  export function closeToast() {
    const toast = document.querySelector(".custom-toast");
    if (toast) {
      toast.style.display = "none";
    }
  }
  
  export function showToast(message, time_ms = 3000) {
    const toast = document.querySelector(".custom-toast");
    const textElement = document.querySelector("#toast-text");
    textElement.textContent = message;
    toast.style.display = "block";
    if (!Number.isNaN(time_ms)) {
      setTimeout(closeToast, time_ms);
    }
  }
  