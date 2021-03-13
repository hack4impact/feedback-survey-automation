const DEV_LOGS_URL =
  "https://script.google.com/a/hack4impact.org/macros/s/AKfycbz1kGHf-TaxtbaQvo8MuvPPDY7bCY-3iuQrpiHYjKKx_ZBhTbuanG2a/exec";

const PROD_LOGS_URL =
  "https://script.google.com/a/hack4impact.org/macros/s/AKfycby4Zcy-Jg8P1desQjLS7z-Y1uHZu1NnbHjvmIcI15fEwlNKEbnXEGwHcA/exec";

const logIframe = document.getElementById("logIframe");
const showDevLogs = document.getElementById("showDevLogs");
const loadingContainer = document.getElementById("loadingContainer");

showDevLogs.checked = false;
logIframe.src = PROD_LOGS_URL;

window.addEventListener("message", (event) => {
  console.log("WE ARE BEING CALLED!");
  if (
    event.origin.startsWith(DEV_LOGS_URL) ||
    event.origin.startsWith(PROD_LOGS_URL)
  ) {
    console.log(event.data);
  }
});

logIframe.onload = function () {
  removeLoading();
  console.log("On Load qsqq sq  ");
};

showDevLogs.onclick = function () {
  if (showDevLogs.checked) {
    logIframe.src = DEV_LOGS_URL;
  } else {
    logIframe.src = PROD_LOGS_URL;
  }
  addLoading();
};

function removeLoading() {
  loadingContainer.classList.remove("d-flex");
  loadingContainer.style.display = "none";
}

function addLoading() {
  loadingContainer.classList.add("d-flex");
}
