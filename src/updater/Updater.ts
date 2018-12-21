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
 * @Last Modified At: 2018-12-21 01:17:27
 * @Description: Helper Class to check for Schema Updates
 */

import chalk from 'chalk';
import semver from 'semver';
import { IAppVersion } from '../types/IAppVersion';
import { Info } from '../info';
import { Helper } from '../helpers/Helper';
import nfetch from 'node-fetch';

export class Updater {

    /**
     * Checks the Data Schema for the right Version
     *
     * @static
     * @param {*} appVersion	A loaded AppVersion Object
     * @returns {IAppVersion} The updated AppVersion Object
     * @memberof Updater
     */
    public static checkSchemaUpdate(appVersion: any, helper: Helper): IAppVersion {
        const schemaVersion = Info.getSchemaVersion();

        Helper.verbose('Check Data Schema:', schemaVersion);
        if ((appVersion.config.appversion && appVersion.config.appversion !== schemaVersion) || appVersion.config.schema !== schemaVersion) {
            Helper.info('Schema of appversion.json is outdated. Perform schema update ...');
            appVersion = Updater.updateSchema(appVersion);
            helper.writeJson(appVersion, 'Schema of appversion.json updated to the latest version.');
        } else {
            Helper.verbose('No Update for DataSchema needed.');
        }
        return appVersion;
    }

    /**
     * This function checks for an update of AppVersionManager.
     *
     * @static
     * @memberof Updater
     */
    public static checkUpdate() {

        Helper.verbose('Check for Programm Updates');

        const currentVersion = Info.getProductVersion();

        nfetch('https://registry.npmjs.org/appversion-mgr/latest')
            .then((response) => {
                try {
                    response.json()
                        .then((json) => {
                            const latest = json.version;
                            if (semver.gt(latest, currentVersion)) {
                                Helper.info(`New appvmgr version available, run ${chalk.bold('\'npm install appversion-mgr -g\'')} to update!`);
                            } else {
                                Helper.verbose('No new appvmgr version available.');
                            }
                        });
                } catch (error) {
                    Helper.error(error);
                }
            })
            .catch((error) => {
                if (error && error.code === 'ENOTFOUND') {
                    return;
                }

                if (error) {
                    Helper.error(error);
                }
            });
    }

    /**
     * Updates the Schema of the appversion.json
     *
     * @static
     * @param {*} appVersion	A loaded AppVersion Object
     * @returns {IAppVersion} The updated AppVersion Object
     * @memberof Updater
     */
    private static updateSchema(appVersion: any): IAppVersion {

        const schemaVersion = Info.getSchemaVersion();
        const schema = Info.getDataSchemaAsObject();

        // Add Objects if missing
        if (!appVersion.build) {
            Object.assign(appVersion.build, schema.build);
        }

        if (!appVersion.config) {
            Object.assign(appVersion.config, schema.config);
        }

        if (!appVersion.git) {
            Object.assign(appVersion.git, schema.git);
        }

        if (!appVersion.status) {
            Object.assign(appVersion.status, schema.status);
        }

        if (!appVersion.version) {
            Object.assign(appVersion.version, schema.version);
        }

        // Add Templates if missing
        if (Updater.isEmptyString(appVersion.version.badge)) {
            appVersion.version.badge = schema.version.badge;
        }

        if (Updater.isEmptyString(appVersion.status.badge) && schema.status) {
            appVersion.status.badge = schema.status.badge;
        }

        if (Updater.isEmptyString(appVersion.build.badge) && schema.build) {
            appVersion.build.badge = schema.build.badge;
        }

        if (Updater.isEmptyString(appVersion.git.tag) && schema.git) {
            appVersion.git.tag = schema.git.tag;
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

        // if the "gittag" filed is present in the json we move it to git
        if (appVersion.config.gittag) {
            appVersion.git.tag = appVersion.config.gittag;
            delete appVersion.config.gittag;
        }

        // if the "commit" filed is present in the json we move it to git
        if (appVersion.commit) {
            appVersion.git.commit = appVersion.commit;
            delete appVersion.commit;
        }

        // if the "package.json" and "bower.json" are present in the "config.json" array field, we remove them
        if (appVersion.config.json.indexOf('package.json') > -1) {
            appVersion.config.json.splice(appVersion.config.json.indexOf('package.json'), 1);
        }

        if (appVersion.config.json.indexOf('bower.json') > -1) {
            appVersion.config.json.splice(appVersion.config.json.indexOf('bower.json'), 1);
        }

        // Remove name Field
        if (appVersion.config.name) {
            delete appVersion.config.name;
        }

        // Remove project Field
        if (appVersion.config.project) {
            delete appVersion.config.project;
        }

        // Remove the appversion field
        if (appVersion.appversion) {
            delete appVersion.appversion;
        }

        // Remove the commit field
        if (appVersion.commit || appVersion.commit === null) {
            appVersion.commit = '';
            delete appVersion.commit;
        }

        // updates the appversion.json version number
        if (appVersion.config.appversion) {
            delete appVersion.config.appversion;
        }
        appVersion.config.schema = schemaVersion;

        return appVersion;
    }

    private static isEmptyString(value: string): boolean {
        if (value) {
            return typeof value === 'string' && !value.trim() || typeof value === 'undefined' || value === null;
        }
        return true;
    }
}
