let startDate = new Date("2024-01-01");

function getDateTime() {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 7);

  while (startDate <= currentDate) {
    startDate.setDate(startDate.getDate() + 14);
  }
  startDate.setDate(startDate.getDate() - 28);
}

function formatDate() {
  const day = startDate.getDate();
  const month = startDate.getMonth() + 1;
  const year = startDate.getFullYear();
  return `${month}\/${day}\/${year}`;
}
getDateTime();
document.querySelector("#startDate").textContent = formatDate();
startDate.setDate(startDate.getDate() + 13);
document.querySelector("#endDate").textContent = formatDate();

document.getElementById("generateButton").addEventListener("click", () => {
  // Get the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    // Send a message to the content script in the active tab to get the list of elements
    chrome.tabs.sendMessage(activeTab.id, { action: "SubItUp" });
  });
});
