"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const semver_1 = __importDefault(require("semver"));
const Helper_1 = require("./Helper");
const BadgeHelper_1 = require("./BadgeHelper");
class SetCommand {
    constructor(directory) {
        this.helper = new Helper_1.Helper(directory);
        this.badgeHelper = new BadgeHelper_1.BadgeHelper(directory);
    }
    setVersion(version) {
        const newVersion = semver_1.default.clean(version);
        if (newVersion) {
            if (!semver_1.default.valid(newVersion)) {
                this.helper.error(`Insert a valid version number formatted in this way: ${chalk_1.default.bold('\'x.y.z\'')} where x|y|z are numbers.`);
                return null;
            }
            const splittedVersion = newVersion.split('.');
            const appVersion = this.helper.readJson();
            if (appVersion) {
                appVersion.version.major = Number(splittedVersion[0]);
                appVersion.version.minor = Number(splittedVersion[1]);
                appVersion.version.patch = Number(splittedVersion[2]);
                if (!appVersion.build) {
                    appVersion.build = {
                        date: null,
                        total: 0,
                        number: 0,
                    };
                }
                appVersion.build.number = 0;
                this.helper.writeJson(appVersion);
                this.helper.writeOtherJson(appVersion);
                const previousAppVersion = {
                    version: {
                        major: appVersion.version.major,
                        minor: appVersion.version.minor,
                        patch: appVersion.version.patch,
                    },
                };
                this.badgeHelper.createBadge('version', true, previousAppVersion);
            }
        }
    }
    setStatus(status) {
        const splittedStatus = status.split('.');
        if (splittedStatus[1] && isNaN(parseInt(splittedStatus[1], 10))) {
            this.helper.error('Insert a valid status.number number');
            return null;
        }
        const match = ['Stable', 'stable', 'RC', 'rc', 'Beta', 'beta', 'Alpha', 'alpha', 'PreRelease', 'prerelease'];
        if (match.indexOf(splittedStatus[0]) === -1) {
            this.helper.error('Insert a valid status.stage string');
            return null;
        }
        const appVersion = this.helper.readJson();
        if (appVersion) {
            if (!appVersion.status) {
                appVersion.status = {
                    number: 0,
                    stage: null,
                };
            }
            const previousAppVersion = {
                version: appVersion.version,
                status: appVersion.status,
            };
            appVersion.status.stage = splittedStatus[0];
            appVersion.status.number = Number(splittedStatus[1]) || 0;
            this.helper.writeJson(appVersion, `Status updated to ${splittedStatus[0]}.${splittedStatus[1] || 0}`);
            this.badgeHelper.createBadge('status', true, previousAppVersion);
        }
    }
}
exports.SetCommand = SetCommand;
//# sourceMappingURL=SetCommand.js.map