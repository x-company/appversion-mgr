"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Helper_1 = require("./Helper");
const PROG_VERSION = '0.1.0';
const SCHEMA_VERSION = '1.7.1';
function getVersion() {
    return PROG_VERSION;
}
exports.getVersion = getVersion;
function getSchemaVersion() {
    return SCHEMA_VERSION;
}
exports.getSchemaVersion = getSchemaVersion;
function getAppVersionSync(directory = __dirname) {
    try {
        const helper = new Helper_1.Helper(directory);
        const appVersion = helper.readJson();
        if (appVersion) {
            delete appVersion.config;
            return appVersion;
        }
    }
    catch (error) {
        throw new Error(error);
    }
    return null;
}
exports.getAppVersionSync = getAppVersionSync;
function getAppVersion(directory = __dirname) {
    return new Promise((resolve, reject) => {
        const helper = new Helper_1.Helper(directory);
        const appVersion = helper.readJson();
        if (appVersion) {
            delete appVersion.config;
            resolve(appVersion);
        }
        else {
            reject(new Error('No appversion.json found'));
        }
    });
}
exports.getAppVersion = getAppVersion;
function composePatternSync(pattern) {
    const splittedPattern = pattern.split('');
    const appVersion = getAppVersionSync();
    let ptt = '';
    if (appVersion) {
        splittedPattern.map((ele) => {
            ptt += switchPattern(appVersion, ele);
        });
        return ptt;
    }
    throw new Error('No AppVersion Fils is found.');
}
exports.composePatternSync = composePatternSync;
function composePattern(pattern) {
    return new Promise((resolve, reject) => {
        const splittedPattern = pattern.split('');
        getAppVersion()
            .then((appVersion) => {
            let ptt = '';
            splittedPattern.map((ele) => {
                ptt += switchPattern(appVersion, ele);
            });
            resolve(ptt);
        })
            .catch((err) => console.log(err));
    });
}
exports.composePattern = composePattern;
function switchPattern(appVersion, pattern) {
    switch (pattern) {
        case 'M' || 'B':
            return appVersion.version.major;
        case 'm' || 'F':
            return appVersion.version.minor;
        case 'p' || 'f':
            return appVersion.version.patch;
        case 'S':
            return appVersion.status ? appVersion.status.stage : null;
        case 's':
            return appVersion.status ? appVersion.status.number : null;
        case 'n':
            return appVersion.build ? appVersion.build.number : null;
        case 't':
            return appVersion.build ? appVersion.build.total : null;
        case 'd':
            return appVersion.build ? appVersion.build.date : null;
        case 'c':
            return appVersion.commit ? appVersion.commit : null;
        default:
            return pattern;
    }
}
//# sourceMappingURL=index.js.map