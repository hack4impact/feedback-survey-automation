"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Externals
var moment_1 = __importDefault(require("moment"));
// Internals
var index_1 = require("./index");
var daysBetween = function (date1, date2) {
    if (date2 === void 0) { date2 = moment_1.default.now(); }
    date1 = index_1.normalizeDate(date1);
    date2 = index_1.normalizeDate(date2);
    var diff = date2 - date1;
    var diffInDays = (diff / 1000 / 60 / 60 / 24).toFixed(0);
    return parseInt(diffInDays);
};
exports.default = daysBetween;
