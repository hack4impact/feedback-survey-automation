const DEV_LOGS_URL =
  "https://script.google.com/a/hack4impact.org/macros/s/AKfycbz1kGHf-TaxtbaQvo8MuvPPDY7bCY-3iuQrpiHYjKKx_ZBhTbuanG2a/exec";

const PROD_LOGS_URL =
  "https://script.google.com/a/hack4impact.org/macros/s/AKfycby4Zcy-Jg8P1desQjLS7z-Y1uHZu1NnbHjvmIcI15fEwlNKEbnXEGwHcA/exec";

const logIframe = document.getElementById("logIframe");
const showDevLogs = document.getElementById("showDevLogs");
const loadingContainer = document.getElementById("loadingContainer");

showDevLogs.checked = false;
logIframe.setAttribute("data-type", "prod");
logIframe.src = getIframeSrc();

window.addEventListener("message", (event) => {
  console.log("listener called!", event);
  if (event.origin.endsWith("script.googleusercontent.com")) {
    const { type } = event.data;

    if (type === "dateChange") {
      if (event.data.date) {
        logIframe.src = `${getIframeSrc()}?date=${event.data.date}`;
      } else if (event.data.start && event.data.end) {
        logIframe.src = `${getIframeSrc()}?start=${event.data.start}&end=${
          event.data.end
        }`;
      }
      addLoading();
    }
  }
});

logIframe.onload = function () {
  console.log("DONE LOADIN!");
  removeLoading();
};

showDevLogs.onclick = function () {
  if (showDevLogs.checked) {
    logIframe.setAttribute("data-type", "dev");
    logIframe.src = getIframeSrc();
  } else {
    logIframe.setAttribute("data-type", "prod");
    logIframe.src = getIframeSrc();
  }
  addLoading();
};

function removeLoading() {
  loadingContainer.classList.remove("d-flex");
  loadingContainer.style.display = "none";
}

function addLoading() {
  loadingContainer.classList.add("d-flex");
  loadingContainer.style.display = "flex";
}

function getIframeSrc() {
  const type = logIframe.getAttribute("data-type");
  return type === "dev" ? DEV_LOGS_URL : PROD_LOGS_URL;
}
