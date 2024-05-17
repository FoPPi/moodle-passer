class Button {
  constructor(text, onClick, id = "", onClickIfDisabled  = null) {
    this.text = text;
    this.onClick = onClick;
    this.id = id;
    this.element = null;
    this.onClickIfDisabled = onClickIfDisabled;
  }

  render(parent) {
    if (!parent) {
      console.log("No suitable parent found for the button.");
      return;
    }

    // Prevent multiple instances of the same button
    if (document.querySelector(`#${this.id}`)) return;

    this.element = document.createElement("div");
    this.element.textContent = this.text;
    this.element.addEventListener("click", () => {
        if (!this.element.disabled) {
          this.onClick();
        } else if (this.onClickIfDisabled) {
          this.onClickIfDisabled();
        }
      });
    this.element.classList.add("extention-custom-button");
    if (this.id) this.element.id = this.id;

    parent.appendChild(this.element);
  }

  updateText(newText) {
    if (this.element) {
      this.element.textContent = newText;
    }
  }

  addClass(className) {
    this.element?.classList.add(className);
  }

  removeClass(className) {
    this.element?.classList.remove(className);
  }

  remove() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null; // Clear reference to the removed element
    }
  }

  disable() {
    if (this.element) {
      this.element.disabled = true;
      this.element.style.opacity = 0.5; 
      this.element.style.cursor = "not-allowed";
    }
  }

  enable() {
    if (this.element) {
      this.element.disabled = false;
      this.element.style.opacity = 1;
      this.element.style.cursor = "pointer"; 
    }
  }
}

export { Button };
