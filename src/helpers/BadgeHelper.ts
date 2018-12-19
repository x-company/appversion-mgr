/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * @Script: BadgeHelper.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2018-12-15 12:49:45
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2018-12-19 18:55:00
 * @Description: Helper File to generate Badges
 */

import chalk from 'chalk';
import { Helper } from './Helper';
import { IAppVersion } from '../types/IAppVersion';
import { Info } from '../info';

export class BadgeHelper extends Helper {

    constructor(directory?: string) {
        super(directory);
    }

    /**
     * Generates the badge with the current version.
     * @param {String}  tag         [Toggle version/status generation.]
     * @param {Boolean} updateMD    [If this parameter is undefined means that the function was called by the user, so it outputs the badge code.]
     * @param {Object}  previousAppVersion	[version/status object]
     */
    public createBadge(tag: string, updateMD: boolean = false, previousAppVersion?: IAppVersion) {

        tag === 'status' ? this.statusBadge(updateMD, previousAppVersion) : this.versionBadge(updateMD, previousAppVersion);
    }

    private shieldUrl(part: string): string {
        return `https://img.shields.io/badge/${part}-brightgreen.svg?style=flat`;
    }

    private mdCode(appVersion: IAppVersion, tag: string, url: string): string {
        const name: string = appVersion.config && appVersion.config.name ? appVersion.config.name : 'AppVersionManager';
        const projectName = appVersion.config && appVersion.config.project ? appVersion.config.project : 'appversion-mgr';

        return `[![${name}-${tag}](${url})](https://github.com/x-company/${projectName}?#${tag})`;
    }

    private composeReadmeCode(appVersion: IAppVersion, tag: string, part: string): string {
        return this.mdCode(appVersion, tag, this.shieldUrl(part));
    }

    private versionBadge(updateMD: boolean, previousAppVersion?: IAppVersion) {
        const appVersion = this.readJson();

        if (appVersion) {
            const version = Info.composePatternSync('M.m.p', appVersion);
            const readmeCode = this.composeReadmeCode(appVersion, 'version', `AppVersionManager-${version}`);
            if (updateMD && previousAppVersion) {
                const pastVersion = Info.composePatternSync('M.m.p', previousAppVersion);
                if (appVersion.config) {
                    const pastReadmeCode = this.composeReadmeCode(appVersion, 'version', `AppVersionManager-${pastVersion}`);
                    appVersion.config.markdown.map((file) => {
                        return this.appendBadgeToMD(file, readmeCode, pastReadmeCode);
                    });
                }
            } else {
                this.printReadme(readmeCode, 'version');
            }
        }
    }

    private statusBadge(updateMD: boolean, previousAppVersion?: IAppVersion) {
        const appVersion = this.readJson();
        if (appVersion) {
            let status: string | null = 'unknown';
            if (appVersion.status) {
                status = appVersion.status.number > 0 ? Info.composePatternSync('S%20s', appVersion) : appVersion.status.stage;
            }
            const readmeCode = this.composeReadmeCode(appVersion, 'status', `Status-${status}`);

            if (updateMD && previousAppVersion) {
                let pastStatus: string | null = 'unknown';
                if (previousAppVersion.status) {
                    pastStatus = previousAppVersion.status.number > 0 ? Info.composePatternSync('S%20s', previousAppVersion) : previousAppVersion.status.stage;
                }

                const pastReadmeCode = this.composeReadmeCode(appVersion, 'status', `Status-${pastStatus}`);

                if (appVersion.config) {
                    appVersion.config.markdown.map((file) => {
                        return this.appendBadgeToMD(file, readmeCode, pastReadmeCode);
                    });
                }
            } else {
                this.printReadme(readmeCode, 'status');
            }
        }
    }

    private printReadme(code: string, tag: string) {
        Helper.info(`${tag} badge generated! ${chalk.cyan(code)}`);
    }
}
