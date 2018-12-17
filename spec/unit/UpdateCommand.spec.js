"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const UpdateCommand_1 = require("../../lib/UpdateCommand");
const Helper_1 = require("../../lib/Helper");
describe('Testing Update Command', () => {
    let expected;
    let helper;
    let cmd;
    const JSON_FILE = path_1.default.join(__dirname, 'appversion.json');
    beforeEach(() => {
        if (fs_1.default.existsSync(JSON_FILE)) {
            fs_1.default.unlinkSync(JSON_FILE);
        }
        helper = new Helper_1.Helper(__dirname);
        expected = helper.createEmptyAppVersion();
        helper.writeJson(expected);
        cmd = new UpdateCommand_1.UpdateCommand(__dirname);
    });
    it('Testing major', () => {
        cmd.update('major');
        const actual = helper.readJson();
        expect(actual).not.toBeNull();
        if (actual) {
            expect(actual.version.major).toEqual(expected.version.major + 1);
            expect(actual.version.minor).toEqual(0);
            expect(actual.version.patch).toEqual(0);
            expect(actual.build).not.toBeNull();
            if (actual.build) {
                expect(actual.build.number).toEqual(0);
            }
        }
    });
    it('Testing minor', () => {
        cmd.update('minor');
        const actual = helper.readJson();
        expect(actual).not.toBeNull();
        if (actual) {
            expect(actual.version.major).toEqual(expected.version.major);
            expect(actual.version.minor).toEqual(expected.version.minor + 1);
            expect(actual.version.patch).toEqual(0);
            expect(actual.build).not.toBeNull();
            if (actual.build) {
                expect(actual.build.number).toEqual(0);
            }
        }
    });
    it('Testing patch', () => {
        cmd.update('patch');
        const actual = helper.readJson();
        expect(actual).not.toBeNull();
        if (actual) {
            expect(actual.version.major).toEqual(expected.version.major);
            expect(actual.version.minor).toEqual(expected.version.minor);
            expect(actual.version.patch).toEqual(expected.version.patch + 1);
            expect(actual.build).not.toBeNull();
            if (actual.build) {
                expect(actual.build.number).toEqual(0);
            }
        }
    });
    it('Testing build', () => {
        cmd.update('build');
        const actual = helper.readJson();
        expect(actual).not.toBeNull();
        if (actual) {
            expect(actual.build).not.toBeNull();
            if (actual.build && expected && expected.build) {
                expect(actual.build.number).toEqual(expected.build.number + 1);
                expect(actual.build.total).toEqual(expected.build.total + 1);
            }
        }
    });
    it('Testing commit', () => {
        cmd.update('commit');
        const actual = JSON.parse(fs_1.default.readFileSync(JSON_FILE, 'utf8'));
        child_process_1.exec('git log --oneline', (err, stdout) => {
            if (err) {
                expect(actual.commit).toBeNull();
            }
            else {
                expect(actual.commit).toEqual(stdout.substring(0, 7));
            }
        });
    });
});
//# sourceMappingURL=UpdateCommand.spec.js.map