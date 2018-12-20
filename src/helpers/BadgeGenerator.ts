/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * @Script: BadgeGenerator.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2018-12-15 12:49:45
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2018-12-20 22:56:53
 * @Description: Helper File to generate Badges
 */

import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { Helper } from './Helper';
import { IAppVersion } from '../types/IAppVersion';
import { Info } from '../info';

export class BadgeGenerator {

    private helper: Helper;

    constructor(directory?: string) {
        Helper.verbose('Init BadgeGenerator');

        this.helper = new Helper(directory);
    }

    /**
     * Generates the Version badge with the current version.
     *
     * @param {IAppVersion} appVersion
     * @param {IAppVersion} [prevAppVersion]
     * @memberof BadgeGenerator
     */
    public generateVersionBadge(appVersion: IAppVersion, prevAppVersion?: IAppVersion) {

        const template = appVersion.version.badge;
        const readmeCode = this.composeReadmeCode(appVersion, template);
        if (prevAppVersion && appVersion.config) {
            const pastReadmeCode = this.composeReadmeCode(prevAppVersion, template);
            appVersion.config.markdown.map((file) => {
                return this.appendBadgeToMD(file, readmeCode, pastReadmeCode);
            });
        } else {
            this.printReadme(readmeCode, 'Version');
        }
    }

    /**
     *
     *
     * @param {IAppVersion} appVersion
     * @param {IAppVersion} [prevAppVersion]
     * @memberof BadgeGenerator
     */
    public generateStatusBadge(appVersion: IAppVersion, prevAppVersion?: IAppVersion) {

        if (appVersion.status) {
            const template = appVersion.status.badge;
            const readmeCode = this.composeReadmeCode(appVersion, template);

            if (prevAppVersion && prevAppVersion.status) {
                const pastReadmeCode = this.composeReadmeCode(prevAppVersion, template);

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

    /**
     * Search and updates the badge in a .md file.
     * @param  {String} markdownFile [The name of the .md file]
     * @param  {String} newBadge     [new badge to append]
     * @param  {String} oldBadge     [old badge to change]
     */
    private appendBadgeToMD(markdownFile: string, newBadge: string, oldBadge: string) {

        if (newBadge !== oldBadge) {
            const markdownFilePath = path.join(this.helper.PATH, markdownFile);
            if (!fs.existsSync(markdownFilePath)) {
                const fd = fs.openSync(markdownFilePath, 'wx+');
                fs.writeFileSync(markdownFilePath, oldBadge, { encoding: 'utf8' });
                fs.closeSync(fd);
            }

            const oldContent = fs.readFileSync(markdownFilePath, { encoding: 'utf8' });
            const newContent = oldContent.replace(oldBadge, newBadge);
            if (oldContent !== newContent) {
                fs.writeFileSync(markdownFilePath, newContent, { encoding: 'utf8' });

            }
        }
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

    private printReadme(code: string, tag: string) {
        Helper.info(`${tag} badge generated! ${chalk.cyan(code)}`);
    }
}
