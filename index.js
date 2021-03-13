const DEV_LOGS_URL =
  "https://script.google.com/a/hack4impact.org/macros/s/AKfycbz1kGHf-TaxtbaQvo8MuvPPDY7bCY-3iuQrpiHYjKKx_ZBhTbuanG2a/exec";

const PROD_LOGS_URL =
  "https://script.google.com/a/hack4impact.org/macros/s/AKfycby4Zcy-Jg8P1desQjLS7z-Y1uHZu1NnbHjvmIcI15fEwlNKEbnXEGwHcA/exec";

const logIframe = document.getElementById("logIframe");
const showDevLogs = document.getElementById("showDevLogs");
const loadingContainer = document.getElementById("loadingContainer");

const params = new URLSearchParams(window.location.search);

console.log(params.get("dev"), window.location.search);

showDevLogs.checked = params.get("dev") === "true" ? true : false;
logIframe.setAttribute("data-type", "prod");
logIframe.src = getIframeSrc();

window.addEventListener("message", (event) => {
  console.log("listener called!", event);
  if (event.origin.endsWith("script.googleusercontent.com")) {
    const { type } = event.data;

    switch (type) {
      case "dateChange": {
        const { date, start, end } = event.data;

        if (date) {
          logIframe.src = `${getIframeSrc()}?date=${date}`;
        } else if (start && end) {
          logIframe.src = `${getIframeSrc()}?start=${start}&end=${end}`;
        }

        addLoading();
        break;
      }
      case "showMoreLogs": {
        const { start, end } = event.data;

        if (start && end) {
          logIframe.src = `${getIframeSrc()}?start=${start}&end=${end}`;
        }
        addLoading();
        break;
      }
      default: {
        break;
      }
    }
  }
});

logIframe.onload = function () {
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
