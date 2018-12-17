"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Helper_1 = require("./Helper");
const BadgeHelper_1 = require("./BadgeHelper");
const child_process_1 = require("child_process");
class UpdateCommand {
    constructor(directory) {
        this.directory = directory;
        this.helper = new Helper_1.Helper(directory);
        this.badgeHelper = new BadgeHelper_1.BadgeHelper(directory);
    }
    update(action) {
        if (action === 'breaking') {
            action = 'major';
        }
        if (action === 'feature') {
            action = 'minor';
        }
        if (action === 'fix') {
            action = 'patch';
        }
        if (action === 'major' || action === 'minor' || action === 'patch' || action === 'build' || action === 'commit') {
            const appVersion = this.helper.readJson();
            if (appVersion) {
                if (action === 'major' || action === 'minor' || action === 'patch') {
                    this.updateVersion(appVersion, action);
                }
                else if (action === 'build') {
                    this.updateBuild(appVersion);
                }
                else if (action === 'commit') {
                    this.updateCommit(appVersion);
                }
            }
        }
    }
    updateVersion(appVersion, action) {
        const previousObj = {
            version: {
                major: appVersion.version.major,
                minor: appVersion.version.minor,
                patch: appVersion.version.patch,
            },
        };
        if (action === 'major') {
            appVersion.version.major++;
            appVersion.version.minor = appVersion.version.patch = 0;
        }
        if (action === 'minor') {
            appVersion.version.minor++;
            appVersion.version.patch = 0;
        }
        if (action === 'patch') {
            appVersion.version.patch++;
        }
        if (appVersion.build) {
            appVersion.build.number = 0;
        }
        this.helper.writeJson(appVersion);
        this.helper.writeOtherJson(appVersion);
        this.badgeHelper.createBadge('version', true, previousObj);
    }
    updateBuild(appVersion) {
        if (appVersion.build) {
            appVersion.build.date = new Date();
            appVersion.build.number++;
            appVersion.build.total++;
            const message = `Build updated to ${appVersion.build.number}/${appVersion.build.total}`;
            this.helper.writeJson(appVersion, message);
        }
    }
    updateCommit(appVersion) {
        child_process_1.exec('git log --oneline', (error, stdout) => {
            if (error) {
                if (appVersion.commit) {
                    appVersion.commit = null;
                }
                this.helper.error('No Git repository found.');
                this.helper.writeJson(appVersion);
            }
            else {
                if (appVersion.commit) {
                    appVersion.commit = stdout.substring(0, 7);
                }
                this.helper.info(`Commit updated to ${stdout.substring(0, 7)}`);
                this.helper.writeJson(appVersion);
            }
        });
    }
}
exports.UpdateCommand = UpdateCommand;
//# sourceMappingURL=UpdateCommand.js.map