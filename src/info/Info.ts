/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * @Script: Info.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2018-12-18 01:20:07
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2018-12-18 23:24:47
 * @Description: It's a Helper Class to work with AppVersion Elements
 */

import { IAppVersion } from '../types';
import { Helper } from '../helpers/Helper';

export class Info {

    /**
     * The current Program Version
     *
     * @returns {string}        A Program Version
     */
    public static getProductVersion() {
        let installPath: string | undefined;
        try {
            installPath = require.resolve('appversion-mgr');
        } catch {
            // Nothing to catch
        }

        const appVersion = Info.getAppVersionSync(installPath);
        if (appVersion) {
            const productVersion = `${appVersion.version.major}.${appVersion.version.minor}.${appVersion.version.patch}`;
            return productVersion;
        } else {
            return Info.PROG_VERSION;
        }
    }

    /**
     * Returns the Schema Version of the AppVersion File
     *
     * @returns {string}    A Schema Version
     */
    public static getSchemaVersion(): string {
        return Info.SCHEMA_VERSION;
    }

    /**
     * Returns the content of appversion.json as a object.
     * Sync version.
     * @param   {string}        directory	The Directory where should looked for the appversion.json
     * @returns	{IAppVersion}   [The AppVersion Object]
     */
    public static getAppVersionSync(directory?: string): IAppVersion | null {
        try {
            const helper = new Helper(directory);
            const appVersion = helper.readJson();
            if (appVersion) {
                delete appVersion.config;
                return appVersion;
            }
        } catch (error) {
            throw new Error(error);
        }
        return null;
    }

    /**
     * Returns the content of appversion.json as a object.
     * Async version.
     * @param   {string}                directory	The Directory where should looked for the appversion.json
     * @returns {Promise<IAppVersion>}  A Promise for an AppVersion Object
     */
    public static getAppVersion(directory?: string): Promise<IAppVersion> {

        return new Promise<IAppVersion>((resolve, reject) => {
            const helper = new Helper(directory);
            const appVersion = helper.readJson();

            if (appVersion) {
                delete appVersion.config;
                resolve(appVersion);
            } else {
                reject(new Error('No appversion.json found'));
            }
        });
    }

    /**
     * Returns a string with the version following the pattern you passed as a input.
     * Sync version.
     * @param   {string}    pattern	    The Pattern to format the version
     * @param   {string}    directory	The Directory where should looked for the appversion.json
     * @returns {string}    An AppVersion string, otherwise null.
     */
    public static composePatternSync(pattern: string, directory?: string): string {

        const splittedPattern = pattern.split('');
        const appVersion = Info.getAppVersionSync(directory);
        let ptt = '';

        if (appVersion) {
            splittedPattern.map((ele) => {
                ptt += Info.switchPattern(appVersion, ele);
            });
            return ptt;
        }

        throw new Error('No AppVersion Fils is found.');
    }

    /**
     * Returns a string with the version following the pattern you passed as a input.
     * Async version.
     * @param   {string}    pattern	    The Pattern to format the version
     * @param   {string}    directory	The Directory where should looked for the appversion.json
     * @returns	{Promise<String>} A Promise for an AppVersion string
     */
    public static composePattern(pattern: string, directory?: string): Promise<string> {

        return new Promise<string>((resolve, reject) => {
            const splittedPattern = pattern.split('');

            Info.getAppVersion(directory)
                .then((appVersion: IAppVersion) => {
                    let ptt = '';
                    splittedPattern.map((ele) => {
                        ptt += Info.switchPattern(appVersion, ele);
                    });
                    resolve(ptt);
                })
                .catch((err) => console.log(err));
        });
    }

    private static PROG_VERSION: string = '0.1.0';
    private static SCHEMA_VERSION: string = '1.7.1';

    /**
     * Returns the correspondent obj parameter, if not, it returns the given pattern.
     * @param  {IAppVersion}    appVersion      An AppVersion Object
     * @param  {String}         pattern         The format pattern
     * @return {String | Number | Date | null}  The correspondent pattern
     *
     * pattern:
     * M|B : version.major
     * m|F : version.minor
     * p|f : version.patch
     * S : status.stage
     * s : status.number
     * n : build.number
     * t : build.total
     * d : build.date
     * c : commit
     * . : separator
     * - : separator
     */
    private static switchPattern(appVersion: IAppVersion, pattern: string): string | number | Date | null {
        switch (pattern) {
            case 'M' || 'B':
                return appVersion.version.major;
            case 'm' || 'F':
                return appVersion.version.minor;
            case 'p' || 'f':
                return appVersion.version.patch;
            case 'S':
                return appVersion.status ? appVersion.status.stage : null;
            case 's':
                return appVersion.status ? appVersion.status.number : null;
            case 'n':
                return appVersion.build ? appVersion.build.number : null;
            case 't':
                return appVersion.build ? appVersion.build.total : null;
            case 'd':
                return appVersion.build ? appVersion.build.date : null;
            case 'c':
                return appVersion.commit ? appVersion.commit : null;
            default:
                return pattern;
        }
    }
}
