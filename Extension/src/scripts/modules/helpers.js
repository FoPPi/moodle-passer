export function copyToClipboard(text) {
    return navigator.clipboard.writeText(text)
        .then(() => {
            console.log("Copied to clipboard successfully.");
            return true; 
        })
        .catch((err) => {
            console.error("Failed to copy to clipboard:", err);
            return false; 
        });
}
