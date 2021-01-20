"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var makeGoogleForm = function (request) {
    var data = JSON.parse(request.postData.getDataAsString());
    if (data.password === "hack4impact") {
        var form = FormApp.create(data.projectName);
        //form config
        form.setCollectEmail(true);
        form.setLimitOneResponsePerUser(true);
        //form questions
        for (var _i = 0, _a = data.questions; _i < _a.length; _i++) {
            var question = _a[_i];
            var questionOnForm = form.addTextItem();
            questionOnForm.setTitle(question);
        }
        // setting form to call airTable update func on submit
        ScriptApp.newTrigger("updateProjectSuccessTable")
            .forForm(form)
            .onFormSubmit();
        var formData = {
            publishedUrl: form.getPublishedUrl(),
            editUrl: form.getEditUrl(),
        };
        return ContentService.createTextOutput(JSON.stringify(formData));
    }
    else {
        return ContentService.createTextOutput("Unauthorized");
    }
};
function updateProjectSuccessTable(form) {
    var response = form.response;
    UrlFetchApp.fetch("https://api.airtable.com/v0/app0TDYnyirqeRk1T/Project%20Success%20Data", {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + "keyWt5lrjRSF1z1Ci",
        },
        payload: JSON.stringify({
            records: [
                {
                    fields: {},
                },
            ],
        }),
    });
}
function getRowId(desiredFormId) {
    var idStore = SpreadsheetApp.openById("1J_uUVFv9EtI3raTddPRcoKi0Qs1bAEw_E3qSFQU4KD4");
    var data = idStore.getRange("A1:B1500").getValues();
    for (var i = 0; i < data.length; i++) {
        var _a = data[i], formId = _a[0], projectId = _a[1];
        if (formId == desiredFormId) {
            return projectId;
        }
    }
    return "";
}
function addRowToIdStore(formId, projectId) {
    var idStore = SpreadsheetApp.openById("1J_uUVFv9EtI3raTddPRcoKi0Qs1bAEw_E3qSFQU4KD4");
    idStore.appendRow([formId, projectId]);
}
function getProjectData(projectId) {
    var AUTH_HEADER = "Bearer " + "keyWt5lrjRSF1z1Ci";
    var targetURL = "https://api.airtable.com/v0/app0TDYnyirqeRk1T/Projects/" + projectId;
    var res = UrlFetchApp.fetch(targetURL, {
        headers: {
            Authorization: AUTH_HEADER,
        },
    });
    var data = JSON.parse(res.getBlob().getDataAsString());
    return data;
}
function mapResponseToAirtableRow(formData, projectData) {
    //
}
function addRecordToAirTable(data) {
    var res = UrlFetchApp.fetch("https://api.airtable.com/v0/app0TDYnyirqeRk1T/Project%20Success%20Data", {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + "keyWt5lrjRSF1z1Ci",
        },
        payload: JSON.stringify({
            records: [
                {
                    fields: data,
                },
            ],
        }),
    });
    var resData = JSON.parse(res.getBlob().getDataAsString());
    return resData;
}
