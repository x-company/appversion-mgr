/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 * 
 * @Script: index.ts
 * @Script: UpdateCommand.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Last Modified By: Roland Breitschaft
 * @Last Modified By: Roland Breitschaft2
 * @Last Modified At: 2018-12-17 23:43:53
 * @Description: Class to work with set-status and set-version
 */


import chalk from 'chalk';
import semver from 'semver';
import { Helper } from '../helpers/Helper';
import { BadgeHelper } from '../helpers/BadgeHelper';
import { IAppVersion } from '../types/IAppVersion';

export class SetCommand {

    private helper: Helper;
    private badgeHelper: BadgeHelper;

    constructor(directory?: string) {
        this.helper = new Helper(directory);
        this.badgeHelper = new BadgeHelper(directory);
    }

    /**
     * Sets a specific version number.
     * @param {String} newVersion [version number "x.y.z"]
     */
    public setVersion(version: string) {

        const newVersion = semver.clean(version);
        if (newVersion) {

            if (!semver.valid(newVersion)) {
                Helper.error(`Insert a valid version number formatted in this way: ${chalk.bold('\'x.y.z\'')} where x|y|z are numbers.`);
                return null;
            }
            const splittedVersion = newVersion.split('.');

            const appVersion = this.helper.readJson();
            if (appVersion) {
                appVersion.version.major = Number(splittedVersion[0]);
                appVersion.version.minor = Number(splittedVersion[1]);
                appVersion.version.patch = Number(splittedVersion[2]);

                // The build number is reset whenever we update the version number
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

    /**
     * Sets a specific status.
     * @param {String} newStatus [status string "stable|rc|beta|alpha"]
     */
    public setStatus(status: string) {

        const splittedStatus = status.split('.');
        if (splittedStatus[1] && isNaN(parseInt(splittedStatus[1], 10))) {
            Helper.error('Insert a valid status.number number');
            return null;
        }

        const match = ['Stable', 'stable', 'RC', 'rc', 'Beta', 'beta', 'Alpha', 'alpha', 'PreRelease', 'prerelease'];
        if (match.indexOf(splittedStatus[0]) === -1) {
            Helper.error('Insert a valid status.stage string');
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
            // if there's not the status number, it's setted to zero
            appVersion.status.number = Number(splittedStatus[1]) || 0;

            this.helper.writeJson(appVersion, `Status updated to ${splittedStatus[0]}.${splittedStatus[1] || 0}`);
            this.badgeHelper.createBadge('status', true, previousAppVersion);
        }
    }

}
