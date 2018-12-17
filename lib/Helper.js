"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const replacestream_1 = __importDefault(require("replacestream"));
const walk_1 = require("walk");
const child_process_1 = require("child_process");
const semver_1 = __importDefault(require("semver"));
const find_root_1 = __importDefault(require("find-root"));
const _1 = require("./");
const Updater_1 = require("./Updater");
const selfstream = require('self-stream');
class Helper {
    constructor(directory) {
        this.FILENAME = 'appversion.json';
        if (!directory) {
            this.PATH = find_root_1.default(__dirname);
        }
        else {
            this.PATH = directory;
        }
        if (!this.PATH.endsWith('/')) {
            this.PATH += '/';
        }
        this.FILEPATH = path_1.default.join(this.PATH, this.FILENAME);
        if (!fs_1.default.existsSync(this.PATH)) {
            fs_1.default.mkdirSync(this.PATH);
        }
        if (!fs_1.default.existsSync(this.FILEPATH)) {
            const emptyAppVersion = this.createEmptyAppVersion();
            this.writeJson(emptyAppVersion, 'Create an empty Application Version Object');
        }
    }
    readJson(filePath) {
        if (!filePath) {
            filePath = this.FILEPATH;
        }
        try {
            let appVersion = require(filePath);
            if (appVersion.config && appVersion.config.appversion !== _1.getSchemaVersion()) {
                const updater = new Updater_1.Updater();
                appVersion = updater.updateAppversion(appVersion, _1.getSchemaVersion());
                this.info('appversion.json updated to the latest version.');
            }
            return appVersion;
        }
        catch (error) {
            if (error.code === 'MODULE_NOT_FOUND') {
                this.error(`
Could not find appversion.json
Type ${chalk_1.default.bold('\'appvmgr init\'')} for generate the file and start use AppVersion.
                `);
                process.exit(1);
            }
            else {
                throw new Error(error);
            }
        }
        return null;
    }
    appendBadgeToMD(markdownFile, newBadge, oldBadge) {
        const transform = [replacestream_1.default(oldBadge, newBadge)];
        selfstream(markdownFile, transform, (error) => {
            if (error) {
                console.log(error);
            }
        });
    }
    writeJson(appVersion, message) {
        const json = `${JSON.stringify(appVersion, null, 2)}\n`;
        try {
            if (!fs_1.default.existsSync(this.FILEPATH)) {
                const fd = fs_1.default.openSync(this.FILEPATH, 'wx+');
                fs_1.default.writeFileSync(this.FILEPATH, json);
                fs_1.default.closeSync(fd);
            }
            else {
                fs_1.default.writeFileSync(this.FILEPATH, json);
            }
            if (message) {
                this.info(message);
            }
            else {
                const versionAsString = `${appVersion.version.major}.${appVersion.version.minor}.${appVersion.version.patch}`;
                this.info(`Version updated to ${versionAsString}`);
            }
        }
        catch (error) {
            throw new Error(error);
        }
    }
    writeOtherJson(appVersion) {
        if (appVersion.config) {
            if (appVersion.config.ignore.indexOf('*') > -1) {
                return;
            }
            const walker = walk_1.walk(path_1.default.resolve(this.PATH), {
                followLinks: false,
                filters: appVersion.config.ignore,
            });
            walker.on('file', (root, fileStats, next) => {
                if (appVersion.config && appVersion.config.json.indexOf(fileStats.name) > -1) {
                    let fileObj;
                    try {
                        fileObj = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(root, fileStats.name), 'utf8'));
                    }
                    catch (err) {
                        return;
                    }
                    if (fileObj.version) {
                        const versionAsString = `${appVersion.version.major}.${appVersion.version.minor}.${appVersion.version.patch}`;
                        fileObj.version = versionAsString;
                    }
                    const json = `${JSON.stringify(fileObj, null, 2)}\n`;
                    fs_1.default.writeFileSync(path_1.default.resolve(root, fileStats.name), json);
                }
                next();
            });
        }
    }
    createEmptyAppVersion() {
        let defaultVersion = {
            major: 0,
            minor: 1,
            patch: 0,
        };
        const packageJsonVerison = this.getPackageJsonVersion();
        if (packageJsonVerison) {
            defaultVersion = packageJsonVerison;
        }
        return {
            version: defaultVersion,
            build: {
                date: null,
                number: 0,
                total: 0,
            },
            status: {
                stage: null,
                number: 0,
            },
            commit: null,
            config: {
                appversion: _1.getSchemaVersion(),
                ignore: [
                    'node_modules',
                    'bower_components',
                    '.git',
                ],
                json: [
                    'package.json',
                ],
                markdown: [],
            },
        };
    }
    addGitTag() {
        const appVersion = this.readJson();
        if (appVersion) {
            const versionCode = (version) => `v${version.major}.${version.minor}.${version.patch}`;
            child_process_1.exec(`git tag ${versionCode(appVersion.version)}`, (error, stdout) => {
                if (error) {
                    this.error('Tag not added, no Git repository found.');
                }
                else {
                    this.info(`Added Git tag '${versionCode(appVersion.version)}'`);
                }
            });
        }
    }
    error(message, header) {
        this.consoleOutput(message, header, true);
    }
    info(message, header) {
        this.consoleOutput(message, header, false);
    }
    consoleOutput(message, header, isError = false) {
        if (!header) {
            header = 'AppVersion Manager:';
        }
        if (isError) {
            console.log(chalk_1.default.red(`${chalk_1.default.bold(header)} ${message}`));
        }
        else {
            console.log(chalk_1.default.green(`${chalk_1.default.bold(header)} ${message}`));
        }
    }
    getPackageJsonVersion() {
        const packageJsonPath = path_1.default.resolve('./', 'package.json');
        if (fs_1.default.existsSync(packageJsonPath)) {
            const packageJson = this.readJson(packageJsonPath);
            if (packageJson) {
                if (packageJson.version) {
                    const versionAsString = semver_1.default.clean(packageJson.version) || '0.1.0';
                    if (!semver_1.default.valid(versionAsString)) {
                        return null;
                    }
                    const versionArray = versionAsString.split('.');
                    return {
                        major: Number(versionArray[0]),
                        minor: Number(versionArray[1]),
                        patch: Number(versionArray[2]),
                    };
                }
            }
        }
        return null;
    }
}
exports.Helper = Helper;
//# sourceMappingURL=Helper.js.map