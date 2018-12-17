"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const semver_1 = __importDefault(require("semver"));
class Updater {
    updateAppversion(appVersion, currentVersion) {
        if (!appVersion.config) {
            appVersion.config = {
                appversion: currentVersion,
                ignore: [],
                markdown: [],
                json: [],
            };
        }
        if (appVersion.ignore) {
            appVersion.config.ignore = appVersion.ignore;
            delete appVersion.ignore;
        }
        if (appVersion.markdown) {
            appVersion.config.markdown = appVersion.markdown;
            delete appVersion.markdown;
        }
        if (appVersion.json) {
            appVersion.config.json = appVersion.json;
            delete appVersion.json;
        }
        if (appVersion.config.json.indexOf('package.json') > -1) {
            appVersion.config.json.splice(appVersion.config.json.indexOf('package.json'), 1);
        }
        if (appVersion.config.json.indexOf('bower.json') > -1) {
            appVersion.config.json.splice(appVersion.config.json.indexOf('bower.json'), 1);
        }
        if (appVersion.appversion) {
            delete appVersion.appversion;
        }
        appVersion.config.appversion = currentVersion;
        return appVersion;
    }
    checkUpdate(currentVersion) {
        fetch('https://registry.npmjs.org/appversion-mgr/latest')
            .then((response) => {
            try {
                response.json()
                    .then((json) => {
                    const latest = json.version;
                    if (semver_1.default.gt(latest, currentVersion)) {
                        console.log(chalk_1.default.yellow(`\n${chalk_1.default.bold('AppVersion:')} New apv version available, run ${chalk_1.default.bold('\'npm install appversion -g\'')} to update!\n`));
                    }
                });
            }
            catch (error) {
                console.log(error);
            }
        })
            .catch((error) => {
            if (error && error.code === 'ENOTFOUND') {
                return;
            }
            if (error) {
                console.log(error);
            }
        });
    }
}
exports.Updater = Updater;
//# sourceMappingURL=Updater.js.map