// Is function se hum page ka content aur title nikalte hain
function getPageData() {
    return {
        title: document.title,
        url: window.location.href,
        content: document.body.innerText.substring(0, 5000) // Sirf pehle 5000 characters
    };
}

// Extension ke popup se message sunne ke liye
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SAVE_PAGE") {
        const pageData = getPageData();

        // Backend ko data bhejna
        fetch('http://localhost:5000/api/memories/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pageData)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Success:", data);
            sendResponse({ status: "success", message: "Saved!" });
        })
        .catch(error => {
            console.error("Error:", error);
            sendResponse({ status: "error", message: error.message });
        });

        return true; // async response ke liye zaroori hai
    }
});