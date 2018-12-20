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
 * @Last Modified At: 2018-12-19 21:24:46
 * @Description: Helper File to generate Badges
 */

import chalk from 'chalk';
import { Helper } from './Helper';
import { IAppVersion } from '../types/IAppVersion';
import { Info } from '../info';

export class BadgeGenerator {

    private helper: Helper;

    constructor(directory?: string) {
        this.helper = new Helper(directory);
    }

    /**
     * Generates the badge with the current version.
     * @param {String}  tag         [Toggle version/status generation.]
     * @param {Boolean} updateMD    [If this parameter is undefined means that the function was called by the user, so it outputs the badge code.]
     * @param {Object}  previousAppVersion	[version/status object]
     */
    public createBadge(tag: string, previousAppVersion?: IAppVersion) {

        tag === 'status' ? this.statusBadge(previousAppVersion) : this.versionBadge(previousAppVersion);
    }

    private composeReadmeCode(appVersion: IAppVersion, badge: string | undefined): string {

        if (badge) {
            const search = /\$\{(.*?)\}/g;

            let result;
            do {
                result = search.exec(badge);
                if (result) {

                    const completePattern = result[0];
                    const pattern = result[1];
                    const version = Info.composePatternSync(pattern, appVersion);

                    badge = badge.replace(completePattern, version);
                }
            } while (result);

            return badge;
        }
        return '';
    }

    private versionBadge(previousAppVersion?: IAppVersion) {
        const appVersion = this.helper.readJson();

        if (appVersion) {
            const readmeCode = this.composeReadmeCode(appVersion, appVersion.version.badge);

            if (previousAppVersion && appVersion.config) {
                const pastReadmeCode = this.composeReadmeCode(previousAppVersion, previousAppVersion.version.badge);
                appVersion.config.markdown.map((file) => {
                    return this.helper.appendBadgeToMD(file, readmeCode, pastReadmeCode);
                });
            } else {
                this.printReadme(readmeCode, 'Version');
            }
        }
    }

    private statusBadge(previousAppVersion?: IAppVersion) {
        const appVersion = this.helper.readJson();

        if (appVersion && appVersion.status) {
            const readmeCode = this.composeReadmeCode(appVersion, appVersion.status.badge);

            if (previousAppVersion && previousAppVersion.status) {
                const pastReadmeCode = this.composeReadmeCode(previousAppVersion, previousAppVersion.status.badge);

                if (appVersion.config) {
                    appVersion.config.markdown.map((file) => {
                        return this.helper.appendBadgeToMD(file, readmeCode, pastReadmeCode);
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
