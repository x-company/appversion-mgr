"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const Helper_1 = require("../../lib/Helper");
const SetCommand_1 = require("../../lib/SetCommand");
describe('Testing Set Command', () => {
    let helper;
    let cmd;
    const JSON_FILE = path_1.default.join(__dirname, 'appversion.json');
    beforeEach(() => {
        if (fs_1.default.existsSync(JSON_FILE)) {
            fs_1.default.unlinkSync(JSON_FILE);
        }
        helper = new Helper_1.Helper(__dirname);
        const expected = helper.createEmptyAppVersion();
        helper.writeJson(expected);
        cmd = new SetCommand_1.SetCommand(__dirname);
    });
    it('Testing set-version', () => {
        cmd.setVersion('1.2.3');
        const actual = helper.readJson();
        if (actual) {
            expect(actual.version.major).toEqual(1);
            expect(actual.version.minor).toEqual(2);
            expect(actual.version.patch).toEqual(3);
            if (actual.build) {
                expect(actual.build.number).toEqual(0);
            }
        }
    });
    it('Testing set-status stable', () => {
        const expected = 'stable';
        cmd.setStatus(expected);
        const actual = helper.readJson();
        if (actual && actual.status) {
            expect(actual.status.stage).toEqual(expected);
            expect(actual.status.number).toEqual(0);
        }
    });
    it('Testing set-status RC.1', () => {
        const stage = 'RC';
        const stageNumber = 1;
        cmd.setStatus(`${stage}.${stageNumber}`);
        const actual = helper.readJson();
        if (actual && actual.status) {
            expect(actual.status.stage).toEqual(stage);
            expect(actual.status.number).toEqual(stageNumber);
        }
    });
    it('Testing set-status beta.2', () => {
        const stage = 'beta';
        const stageNumber = 2;
        cmd.setStatus(`${stage}.${stageNumber}`);
        const actual = helper.readJson();
        if (actual && actual.status) {
            expect(actual.status.stage).toEqual(stage);
            expect(actual.status.number).toEqual(stageNumber);
        }
    });
    it('Testing set-status Alpha.0', () => {
        const stage = 'Alpha';
        const stageNumber = 0;
        cmd.setStatus(`${stage}.${stageNumber}`);
        const actual = helper.readJson();
        if (actual && actual.status) {
            expect(actual.status.stage).toEqual(stage);
            expect(actual.status.number).toEqual(stageNumber);
        }
    });
});
//# sourceMappingURL=SetCommand.spec.js.map