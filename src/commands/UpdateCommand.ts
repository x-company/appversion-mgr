/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * @Script: UpdateCommand.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2018-12-15 02:38:51
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2018-12-18 21:55:00
 * @Description: Central Update Class to update the Versions
 */

import { IAppVersion } from '../types/IAppVersion';
import { Helper } from '../helpers/Helper';
import { BadgeHelper } from '../helpers/BadgeHelper';
import { exec } from 'child_process';
import { Info } from '../info';


export class UpdateCommand {

    private helper: Helper;
    private badgeHelper: BadgeHelper;

    constructor(private directory?: string) {
        this.helper = new Helper(directory);
        this.badgeHelper = new BadgeHelper(directory);
    }

    /**
     * Calls the correct update function based on the parameter.
     */
    public update(action: string) {

        // Aliases
        if (action === 'breaking') { action = 'major'; }
        if (action === 'feature') { action = 'minor'; }
        if (action === 'fix') { action = 'patch'; }

        if (action === 'major' || action === 'minor' || action === 'patch' || action === 'build' || action === 'commit') {

            const appVersion = this.helper.readJson();
            if (appVersion) {

                if (action === 'major' || action === 'minor' || action === 'patch') {
                    this.updateVersion(appVersion, action);
                } else if (action === 'build') {
                    this.updateBuild(appVersion);
                } else if (action === 'commit') {
                    this.updateCommit(appVersion);
                }
            }
        }
    }


    /**
     * Increase the major|minor|patch version number.
     * @param  {String} version [major|minor|patch]
     */
    private updateVersion(appVersion: IAppVersion, action: string) {

        const previousObj: IAppVersion = {
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

        // The build number is reset whenever we update the version number
        if (appVersion.build) {
            appVersion.build.number = 0;
        }

        this.helper.writeJson(appVersion);
        this.helper.writeOtherJson(appVersion);

        this.badgeHelper.createBadge('version', previousObj);
    }

    /**
     * Increase the build number and updates the date.
     */
    private updateBuild(appVersion: IAppVersion) {

        if (appVersion.build) {
            // The date is a string representing the Date object
            appVersion.build.date = new Date();
            appVersion.build.number++;
            appVersion.build.total++;

            const message = `Build updated to ${Info.composePatternSync('n/t', appVersion)}`;
            this.helper.writeJson(appVersion, message);
        }
    }

    /**
     * Updates the commit code.
     */
    private async updateCommit(appVersion: IAppVersion) {

        await exec('git log --oneline', (error, stdout) => {
            if (error) {
                appVersion.commit = null;
                Helper.error('No Git repository found.');
                this.helper.writeJson(appVersion);
            } else {
                appVersion.commit = stdout.substring(0, 7);
                Helper.info(`Commit updated to ${stdout.substring(0, 7)}`);
                this.helper.writeJson(appVersion);
            }
        });
    }
}
