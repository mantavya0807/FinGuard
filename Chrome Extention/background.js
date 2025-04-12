chrome.action.onClicked.addListener((tab) => {
  // Inject the content script into the active tab
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      files: ["content.js"],
    },
    () => {
      // Send a message to the content script to get the list of elements
      chrome.tabs.sendMessage(tab.id, { action: "getTimeList" }, (response) => {
        console.log(response.timeList);
        // Do something with the list of elements
      });
    }
  );
});
