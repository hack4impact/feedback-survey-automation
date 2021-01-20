"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Externals
var moment_1 = __importDefault(require("moment"));
// Internals
var index_1 = require("./index");
var types_1 = require("../../Utils/types");
var checkSurveyNeeded = function (releaseDate, lastSent) {
    var milestones = types_1.TIME_PERIODS.map(function (timePeriod) {
        var timeAmount = timePeriod.slice(0, 1);
        return moment_1.default().subtract(parseInt(timeAmount), getTimeType(timePeriod));
    });
    var index = typeof lastSent === "string" ? types_1.TIME_PERIODS.indexOf(lastSent) + 1 : 0;
    if (index < types_1.TIME_PERIODS.length)
        return index_1.normalizeDate(milestones[index]) > releaseDate;
    return false;
};
var getTimeType = function (timePeriod) {
    var timeType = timePeriod.slice(1, 2);
    switch (timeType) {
        case "m": {
            return "months";
        }
        case "y": {
            return "years";
        }
        default: {
            throw new Error("Unrecognized time type " + timeType);
        }
    }
};
exports.default = checkSurveyNeeded;
