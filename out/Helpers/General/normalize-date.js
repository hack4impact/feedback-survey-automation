"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Externals
var moment_1 = __importDefault(require("moment"));
var normalizeDate = function (date) {
    if (typeof date === "string") {
        date = normalizeDate(moment_1.default(date));
    }
    else if (date instanceof Date) {
        date = date.getTime();
    }
    else if (moment_1.default.isMoment(date)) {
        date = parseInt(date.format("x"));
    }
    return date;
};
exports.default = normalizeDate;
