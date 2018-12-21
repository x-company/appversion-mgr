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
import { BadgeGenerator } from '../helpers/BadgeGenerator';
import { IAppVersion } from '../types';
import { Info } from '../info';

export class SetCommand {

    private helper: Helper;
    private generator: BadgeGenerator;

    constructor(directory?: string) {
        Helper.verbose('Init SetCommand');

        this.helper = new Helper(directory);
        this.generator = new BadgeGenerator(directory);
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
                const prevAppVersion = Info.getDataSchemaAsObject();

                appVersion.version.major = Number(splittedVersion[0]);
                appVersion.version.minor = Number(splittedVersion[1]);
                appVersion.version.patch = Number(splittedVersion[2]);

                // The build number is reset whenever we update the version number
                if (!appVersion.build) {
                    Object.assign(appVersion.build, prevAppVersion.build);
                }

                if (appVersion.build) {
                    appVersion.build.number = 0;
                }

                Object.assign(prevAppVersion.version, appVersion.version);
                Object.assign(prevAppVersion.build, appVersion.build);

                this.helper.writeJson(appVersion);
                this.helper.writeOtherJson(appVersion);

                this.generator.generateVersionBadge(appVersion, prevAppVersion);
            }
        }
    }

    /**
     * Sets a specific status.     *
     *
     * @param {String} newStatus A string which represented the current Status
     * @memberof SetCommand
     */
    public setStatus(status: string) {

        const splittedStatus = status.split('.');
        if (splittedStatus[1] && isNaN(parseInt(splittedStatus[1], 10))) {
            Helper.error('Insert a valid status.number number');
            return null;
        }

        const appVersion = this.helper.readJson();
        if (appVersion) {

            const prevAppVersion = Info.getDataSchemaAsObject();
            if (!appVersion.status) {
                Object.assign(appVersion.status, prevAppVersion.status);
            }

            Object.assign(prevAppVersion.version, appVersion.version);
            Object.assign(prevAppVersion.status, appVersion.status);

            if (appVersion.status) {
                appVersion.status.stage = splittedStatus[0];
                // if there's not the status number, it's setted to zero
                appVersion.status.number = Number(splittedStatus[1]) || 0;
            }

            this.helper.writeJson(appVersion, `Status updated to ${splittedStatus[0]}.${splittedStatus[1] || 0}`);
            this.generator.generateStatusBadge(appVersion, prevAppVersion);
        }
    }

}
