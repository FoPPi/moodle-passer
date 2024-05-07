class Toast {
  constructor() {
      this.toastElement = this.initToast();
  }

  initToast() {
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
      closeBtn.addEventListener("click", () => this.close());

      return document.querySelector(".custom-toast");
  }

  show(message, duration = 3000) {
      const textElement = this.toastElement.querySelector("#toast-text");
      textElement.textContent = message;
      this.toastElement.style.display = "block";
      
      if (duration > 0) {
          setTimeout(() => this.close(), duration);
      }
  }

  close() {
      if (this.toastElement) {
          this.toastElement.style.display = "none";
      }
  }
}

export { Toast };
