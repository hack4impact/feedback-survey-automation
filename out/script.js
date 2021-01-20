"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Externals
var dotenv_safe_1 = require("dotenv-safe");
dotenv_safe_1.config();
var yargs_1 = __importDefault(require("yargs/yargs"));
var airtable_1 = __importDefault(require("airtable"));
// Internals
var Airtable_1 = require("./Helpers/Airtable");
// import { getSheetData, setSheetData, setUpSheets } from "./Helpers/Sheets";
var General_1 = require("./Helpers/General");
var send_mail_1 = __importDefault(require("./Helpers/send-mail"));
var create_google_form_1 = __importDefault(require("./Helpers/create-google-form"));
var constants_1 = require("./Utils/constants");
process.on("unhandledRejection", function (e) {
    console.error(e);
    process.exit(1);
});
process.on("uncaughtException", function (e) {
    console.error(e);
    process.exit(1);
});
yargs_1.default(process.argv.slice(2)).argv;
var script = function () { return __awaiter(void 0, void 0, void 0, function () {
    var table;
    return __generator(this, function (_a) {
        table = airtable_1.default.base("app0TDYnyirqeRk1T");
        Airtable_1.getAirtableTable(table, "Projects", function (records, nextPage) {
            records.forEach(function (record) { return __awaiter(void 0, void 0, void 0, function () {
                var name, questions, releaseDate, lastSent, googleFormUrl, formData, surveyNeeded;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            name = record.get(constants_1.FIELDS.name);
                            questions = constants_1.FIELDS.questions.map(function (question) {
                                return record.get(question);
                            });
                            releaseDate = General_1.normalizeDate(record.get(constants_1.FIELDS.releaseDate));
                            lastSent = record.get(constants_1.FIELDS.lastSent);
                            googleFormUrl = record.get(constants_1.FIELDS.googleFormUrl);
                            if (!(typeof googleFormUrl !== "string")) return [3 /*break*/, 2];
                            return [4 /*yield*/, create_google_form_1.default(record, name, questions)];
                        case 1:
                            formData = _a.sent();
                            console.log(formData);
                            _a.label = 2;
                        case 2:
                            surveyNeeded = General_1.checkSurveyNeeded(releaseDate, lastSent);
                            if (!surveyNeeded) return [3 /*break*/, 4];
                            return [4 /*yield*/, send_mail_1.default("avhack4impact@gmail.com", 0)];
                        case 3:
                            _a.sent();
                            console.log(surveyNeeded);
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            nextPage();
        });
        return [2 /*return*/];
    });
}); };
script();
