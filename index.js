const DEV_LOGS_URL =
  "https://script.google.com/a/hack4impact.org/macros/s/AKfycbz1kGHf-TaxtbaQvo8MuvPPDY7bCY-3iuQrpiHYjKKx_ZBhTbuanG2a/exec";

const PROD_LOGS_URL =
  "https://script.google.com/a/hack4impact.org/macros/s/AKfycby4Zcy-Jg8P1desQjLS7z-Y1uHZu1NnbHjvmIcI15fEwlNKEbnXEGwHcA/exec";

const logIframe = document.getElementById("logIframe");
const showDevLogs = document.getElementById("showDevLogs");

showDevLogs.checked = false;
logIframe.src = PROD_LOGS_URL;

logIframe.onload = function () {
  console.log("On Load");
};

logIframe.onloadstart = function () {
  console.log("On Load Start");
};

logIframe.onloadeddata = function () {
  console.log("On Load Data");
};

logIframe.onloadedmetadata = function () {
  console.log("On Load Meta Data");
};

showDevLogs.onclick = function () {
  if (showDevLogs.checked) {
    logIframe.src = DEV_LOGS_URL;
  } else {
    logIframe.src = PROD_LOGS_URL;
  }
};
