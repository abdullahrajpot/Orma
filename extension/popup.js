document.getElementById('saveBtn').addEventListener('click', async () => {
    // Current active tab dhoondo
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Tab ko message bhejo ke content extract kare
    chrome.tabs.sendMessage(tab.id, { action: "SAVE_PAGE" }, (response) => {
        if (response && response.status === "success") {
            alert("Memory Saved Successfully!");
        } else {
            alert("Failed to save memory.");
        }
    });
});