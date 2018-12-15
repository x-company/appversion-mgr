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
 * @Last Modified At: 2018-12-15 14:18:13
 * @Description: This is description.
 */

import chalk from 'chalk';
import { IAppVersion } from './IAppVersion';
import { Helper } from './Helper';
import { BadgeHelper } from './BadgeHelper';
import { exec } from 'child_process';

export class UpdateCommand {

    private _helper: Helper;
    private _badgeHelper: BadgeHelper;

    constructor(private directory: string) {
        this._helper = new Helper(directory);
        this._badgeHelper = new BadgeHelper(directory);
    }

    /**
     * Calls the correct update function based on the parameter.
     */
    public update(action: string) {

        // Aliases
        if (action === 'breaking') { action = 'major'; }
        if (action === 'feature') { action = 'minor'; }
        if (action === 'fix') { action = 'patch'; }

        if (action === 'major' || action === 'minor' || action === 'patch' || action === 'build' || action == 'commit') {

            const appVersion = this._helper.readJson();
            if (appVersion) {

                if (action === 'major' || action === 'minor' || action === 'patch') {
                    this.updateVersion(appVersion, action);
                } else if (action === 'build') {
                    this.updateBuild(appVersion);
                } else if (action === 'commit') {
                    this.updateCommit(appVersion);
                }
            }

        } else {
            console.log(chalk.red(`\n${chalk.bold('AppVersion:')} type ${chalk.bold('\'apv -h\'')} to get more informations!\n`));
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

        const version = `${appVersion.version.major}.${appVersion.version.minor}.${appVersion.version.patch}`;
        const message = `Version updated to ${version}`;

        this._helper.info(message);

        this._helper.writeJson(appVersion, message);
        this._helper.writeOtherJson(version);

        this._badgeHelper.createBadge('version', true, previousObj);
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

            const message = `Build updated to ${appVersion.build.number}/${appVersion.build.total}`;
            this._helper.writeJson(appVersion, chalk.green(`\n${chalk.bold('AppVersion:')} ${message}\n`));
        }
    }

    /**
     * Updates the commit code.
     */
    private updateCommit(appVersion: IAppVersion) {

        exec('git log --oneline', (error, stdout) => {
            if (error) {
                if (appVersion.commit) {
                    appVersion.commit = null;
                }
                this._helper.writeJson(appVersion, chalk.red(`\n${chalk.bold('AppVersion:')} No Git repository found.\n`));
            } else {
                if (appVersion.commit) {
                    appVersion.commit = stdout.substring(0, 7);
                }
                this._helper.writeJson(appVersion, chalk.green(`\n${chalk.bold('AppVersion:')} Commit updated to ${stdout.substring(0, 7)}\n`));
            }
        });
    }
}
