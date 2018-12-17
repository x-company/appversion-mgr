"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const Helper_1 = require("./Helper");
class BadgeHelper extends Helper_1.Helper {
    constructor(directory) {
        super(directory);
    }
    createBadge(tag, updateMD = false, previousAppVersion) {
        tag === 'status' ? this.statusBadge(updateMD, previousAppVersion) : this.versionBadge(updateMD, previousAppVersion);
    }
    shieldUrl(part) {
        return `https://img.shields.io/badge/${part}-brightgreen.svg?style=flat`;
    }
    mdCode(tag, url) {
        return `[![AppVersion-${tag}](${url})](https://github.com/x-company/appversion-mgr?#${tag})`;
    }
    composeReadmeCode(tag, part) {
        return this.mdCode(tag, this.shieldUrl(part));
    }
    versionBadge(updateMD, previousAppVersion) {
        const appVersion = this.readJson();
        if (appVersion) {
            const version = `${appVersion.version.major}.${appVersion.version.minor}.${appVersion.version.patch}`;
            const readmeCode = this.composeReadmeCode('version', `AppVersion-${version}`);
            if (updateMD && previousAppVersion) {
                const pastVersion = `${previousAppVersion.version.major}.${previousAppVersion.version.minor}.${previousAppVersion.version.patch}`;
                if (appVersion.config) {
                    const pastReadmeCode = this.composeReadmeCode('version', `AppVersion-${pastVersion}`);
                    appVersion.config.markdown.map((file) => {
                        return this.appendBadgeToMD(file, readmeCode, pastReadmeCode);
                    });
                }
            }
            else {
                this.printReadme(readmeCode, 'version');
            }
        }
    }
    statusBadge(updateMD, previousAppVersion) {
        const appVersion = this.readJson();
        if (appVersion) {
            let status = 'unknown';
            if (appVersion.status) {
                status = appVersion.status.number > 0 ? `${appVersion.status.stage}%20${appVersion.status.number}` : appVersion.status.stage;
            }
            const readmeCode = this.composeReadmeCode('status', `Status-${status}`);
            if (updateMD && previousAppVersion) {
                let pastStatus = 'unknown';
                if (previousAppVersion.status) {
                    pastStatus = previousAppVersion.status.number > 0 ? `${previousAppVersion.status.stage}%20$ ${previousAppVersion.status.number}` : previousAppVersion.status.stage;
                }
                const pastReadmeCode = this.composeReadmeCode('status', `Status-${pastStatus}`);
                if (appVersion.config) {
                    appVersion.config.markdown.map((file) => {
                        return this.appendBadgeToMD(file, readmeCode, pastReadmeCode);
                    });
                }
            }
            else {
                this.printReadme(readmeCode, 'status');
            }
        }
    }
    printReadme(code, tag) {
        this.info(`${tag} badge generated! ${chalk_1.default.cyan(code)}`);
    }
}
exports.BadgeHelper = BadgeHelper;
//# sourceMappingURL=BadgeHelper.js.map