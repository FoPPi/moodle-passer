class Button {
    constructor(text, onClick, id = "") {
        this.text = text;
        this.onClick = onClick;
        this.id = id;
        this.element = null;
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
        this.element.addEventListener("click", this.onClick);
        this.element.classList.add('extention-custom-button');
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
}

export { Button };
