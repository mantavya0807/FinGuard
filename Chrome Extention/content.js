// This script will run in the context of the web page
console.log("Content script loaded");
const timeTable = [];
// Function to get the HTML of the entire page
function getTimeList() {
  const rowElements = document
    .querySelector("tbody")
    .querySelectorAll('[role="row"]');
  rowElements.forEach((row) => {
    const tdElement = row.querySelectorAll("td");
    if (tdElement.length > 0) {
      const rowTemp = [];
      rowTemp.push(tdElement[0].textContent);
      rowTemp.push(tdElement[1].textContent.split(" ")[0]);
      rowTemp.push(
        tdElement[1].textContent.split(" ")[1] +
          " " +
          tdElement[1].textContent.split(" ")[2]
      );
      rowTemp.push(
        tdElement[2].textContent.split(" ")[1] +
          " " +
          tdElement[2].textContent.split(" ")[2]
      );
      rowTemp.push(tdElement[3].textContent);
      timeTable.push(rowTemp);
    }
  });
  return timeTable;
}

function generateCSV(arr) {
  // Initialize an empty string to store the CSV content
  let csvContent = "Dept,Date,Clock In,Clock Out,Time\n";
  // Iterate over each row in the array
  arr.forEach((row, rowIndex) => {
    // Iterate over each element in the row
    row.forEach((element, columnIndex) => {
      // Add the element to the CSV content
      csvContent += element;

      // Add a comma if it's not the last element in the row
      if (columnIndex < row.length - 1) {
        csvContent += ",";
      }
    });

    // Add a newline character after each row, except for the last row
    if (rowIndex < arr.length - 1) {
      csvContent += "\n";
    }
  });

  return csvContent;
}

function downloadCSV(csvContent, fileName) {
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", fileName);
  a.style.display = "none";

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function setWorkday() {
  console.log("Setting workday");
  // setTimeout(function () {
  //   // Code to execute after waiting
  //   const modString = document.querySelector(
  //     ".wd-Text.WOY2.WD-2.WIAB.WPWK"
  //   ).textContent;
  //   const date = modString.split("–")[0] + modString[4];
  //   console.log(date);
  // }, 1000);

  // setTimeout(function () {
  //   document.querySelector('[title="Actions"]').click();
  // }, 2000);

  // setTimeout(function () {
  //   document.querySelector('[data-automation-id="dropdown-option"]').click();
  // }, 3000);

  // setTimeout(function () {
  //   document.querySelector('[data-automation-id="wd-CommandButton"]').click();
  // }, 4000);

  // setTimeout(function () {

  // }, 4000);

  // setTimeout(function () {
  //   document.querySelectorAll('[type="checkbox"]')[2].click();
  // }, 6000);

  const enterEvent = new KeyboardEvent("keydown", {
    key: "Enter",
    keyCode: 13,
    code: "Enter",
    which: 13,
    bubbles: true,
  });

  setTimeout(function () {
    const inputBox = document.querySelectorAll('[aria-live="polite"]')[1];
    document
      .querySelector('[data-automation-id="standaloneTimeWidget"]')
      .click();
    inputBox.value = "02:00 PM";
    // document
    //   .querySelector('[data-automation-id="standaloneTimeWidget"]')
    //   .focus();
    // inputBox.dispatchEvent(enterEvent);
  }, 1000);

  // setTimeout(function () {
  //   const outputBox = document.querySelectorAll('[aria-live="polite"]')[3];
  //   outputBox.value = "4:00 PM";
  //   outputBox.click();
  //   outputBox.focus();
  // }, 10000);

  // setTimeout(function () {
  //   document.querySelector('[data-automation-id="wd-CommandButton"]').click();
  // }, 4000);
}

// Send the page HTML to the background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SubItUp") {
    downloadCSV(generateCSV(getTimeList()), "timeTable.csv");
  }
  if (request.action === "Workday") {
    setWorkday();
  }
});
