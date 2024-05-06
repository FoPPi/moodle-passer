function addElement(text, func, css_id = "") {
    const parent = document.querySelector(".answer");
    if (!parent) {
        console.log("No suitable parent found for the button.");
        return;
    }

    const button = document.createElement("div");
    button.textContent = text;
    button.addEventListener("click", func);
    button.classList.add('extention-custom-button');
    if (css_id) button.id = css_id;

    parent.appendChild(button);
}



export { addElement };
