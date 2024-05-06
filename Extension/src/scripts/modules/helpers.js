import { showToast } from './toast.js';

export function getCleanText(text) {
    text = text.replace(/\n+/g, " ");
    text = text.replace(/\btest\b/gi, "t est");
    return text;
}

export function copyToClipboard(text) {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            console.log("Copied to clipboard successfully.");
            showToast("Скопійовано у буфер обміну.", 3000);
        })
        .catch((err) => {
            console.error("Failed to copy to clipboard:", err);
            showToast("Помилка копіювання у буфер обміну.", 3000);
        });
}
