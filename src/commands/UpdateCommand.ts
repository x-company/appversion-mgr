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
 * @Last Modified At: 2019-08-31 15:07:35
 * @Description: Central Update Class to update the Versions
 */

import { IAppVersion } from '../types/IAppVersion';
import { Helper } from '../helpers/Helper';
import { BadgeGenerator } from '../helpers/BadgeGenerator';
import { exec } from 'child_process';
import { Info } from '../info/Info';

export class UpdateCommand {

    private helper: Helper;
    private generator: BadgeGenerator;

    constructor(private directory?: string) {
        Helper.verbose('Init UpdateCommand');

        this.helper = new Helper(directory);
        this.generator = new BadgeGenerator(directory);
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

    public updateBadges(badgeBaseUrl: string | undefined, projectUrl: string | undefined, projectName: string | undefined) {
        const appVersion = this.helper.readJson();
        const emptyAppVersionObject = Info.getDataSchemaAsObject(badgeBaseUrl, projectUrl, projectName);
        if (appVersion && emptyAppVersionObject) {

            if (appVersion.build && emptyAppVersionObject.build) {
                appVersion.build.badge = emptyAppVersionObject.build.badge;
            }

            if (appVersion.status && emptyAppVersionObject.status) {
                appVersion.status.badge = emptyAppVersionObject.status.badge;
            }

            if (appVersion.version && emptyAppVersionObject.version) {
                appVersion.version.badge = emptyAppVersionObject.version.badge;
            }

            this.helper.writeJson(appVersion);
        }
    }


    /**
     * Increase the major|minor|patch version number.
     * @param  {String} version [major|minor|patch]
     */
    private updateVersion(appVersion: IAppVersion, action: string) {

        const previousObj: IAppVersion = Info.getDataSchemaAsObject();
        Object.assign(previousObj.version, appVersion.version);

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

        this.generator.generateVersionBadge(appVersion, previousObj);
    }

    /**
     * Increase the build number and updates the date.
     */
    private updateBuild(appVersion: IAppVersion) {

        if (appVersion.build) {

            const previousObj: IAppVersion = Info.getDataSchemaAsObject();
            Object.assign(previousObj.version, appVersion.version);
            Object.assign(previousObj.build, appVersion.build);

            // The date is a string representing the Date object
            appVersion.build.date = new Date();
            appVersion.build.number++;
            appVersion.build.total++;

            const message = `Build updated to ${Info.composePatternSync('n/t', appVersion)}`;
            this.helper.writeJson(appVersion, message);

            this.generator.generateBuildBadge(appVersion, previousObj);
        }
    }

    /**
     * Updates the commit code.
     */
    private async updateCommit(appVersion: IAppVersion) {

        await exec('git log --oneline', (error, stdout) => {
            if (appVersion.git) {
                if (error) {
                    appVersion.git.commit = null;
                    Helper.error('No Git repository found.');
                } else {
                    appVersion.git.commit = stdout.substring(0, 7);
                    Helper.info(`Commit updated to ${stdout.substring(0, 7)}`);
                }

                this.helper.writeJson(appVersion);
            } else {
                Helper.error('No git Configuration found in appversion.json');
            }
        });
    }
}
