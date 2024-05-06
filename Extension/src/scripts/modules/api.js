async function postData(url, data, apiKey) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api_key": apiKey
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }
        return await response.json();
    } catch (error) {
        console.error("Error posting question data:", error);
        throw error;
    }
}

export { postData };
