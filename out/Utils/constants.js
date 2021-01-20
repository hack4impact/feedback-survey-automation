"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPREADSHEET_ID = exports.FIELDS = void 0;
exports.FIELDS = {
    // Basic
    name: "Project Name",
    chapter: "Chapter",
    semester: "Creation Semester",
    releaseDate: "(Anticipated) Delivery Date",
    lastSent: "Last Sent Out",
    // Project
    leads: "Project Leads (PM, Tech Lead, Designer)",
    status: "Project Status",
    members: "Team Members",
    // Nonprofit
    nonprofitName: "Nonprofit Partner Name",
    nonprofitWebsite: "Nonprofit Partner Website",
    nonprofitFocus: "Nonprofit Focus",
    nonprofitContactName: "Nonprofit Point of Contact Name",
    nonprofitContactEmail: "Nonprofit Point of Contact Email",
    // Misc
    questions: __spreadArrays(Array(8)).map(function (x, i) { return "Success Metric Question " + (i + 1); }),
    googleFormUrl: "Google Form URL",
};
exports.SPREADSHEET_ID = "11O5zz8ff1GpWQrGdnmy973Wc7NoU3G_-RHoaFULa4Gk";
