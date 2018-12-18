/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * @Script: Updater.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2018-12-15 11:30:02
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2018-12-17 23:52:55
 * @Description: Helper Class to check for Schema Updates
 */

import { IAppVersion } from '../types/IAppVersion';
import chalk from 'chalk';
import semver from 'semver';

export class Updater {

    public updateAppversion(appVersion: any, currentVersion: string): IAppVersion {

        // if the "config" filed is not present in the json we add it
        if (!appVersion.config) {
            appVersion.config = {
                appversion: currentVersion,
                ignore: [],
                markdown: [],
                json: [],
            };
        }

        // if the "ignore" filed is present in the json we move it to config
        if (appVersion.ignore) {
            appVersion.config.ignore = appVersion.ignore;
            delete appVersion.ignore;
        }
        // if the "markdown" filed is present in the json we move it to config
        if (appVersion.markdown) {
            appVersion.config.markdown = appVersion.markdown;
            delete appVersion.markdown;
        }
        // if the "markdown" filed is present in the json we move it to config
        if (appVersion.json) {
            appVersion.config.json = appVersion.json;
            delete appVersion.json;
        }

        // if the "package.json" and "bower.json" are present in the "config.json" array field, we remove them
        if (appVersion.config.json.indexOf('package.json') > -1) {
            appVersion.config.json.splice(appVersion.config.json.indexOf('package.json'), 1);
        }

        if (appVersion.config.json.indexOf('bower.json') > -1) {
            appVersion.config.json.splice(appVersion.config.json.indexOf('bower.json'), 1);
        }

        // Remove the appversion field
        if (appVersion.appversion) {
            delete appVersion.appversion;
        }

        // updates the appversion.json version number
        appVersion.config.appversion = currentVersion;

        return appVersion;
    }

    /**
     * This function checks for an update of appversion.
     */
    private checkUpdate(currentVersion: string) {

        // TODO: checkUpdate Function currently not used
        fetch('https://registry.npmjs.org/appversion-mgr/latest')
            .then((response) => {
                try {
                    response.json()
                        .then((json) => {
                            const latest = json.version;
                            if (semver.gt(latest, currentVersion)) {
                                console.log(chalk.yellow(`\n${chalk.bold('AppVersion:')} New apv version available, run ${chalk.bold('\'npm install appversion -g\'')} to update!\n`));
                            }
                        });


                } catch (error) {
                    console.log(error);
                }
            })
            .catch((error) => {
                if (error && error.code === 'ENOTFOUND') {
                    return;
                }

                if (error) {
                    console.log(error);
                }
            });
    }
}
