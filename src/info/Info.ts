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
 * @Last Modified At: 2018-12-18 01:49:20
 * @Description: This is description.
 */

import { IAppVersion } from '../types';
import { Helper } from '../helpers/Helper';

export class Info {

    /**
     * Returns the content of appversion.json as a object.
     * Sync version.
     * @param   {string}        directory	The Directory where should looked for the appversion.json
     * @returns	{IAppVersion}   [The AppVersion Object]
     */
    public getAppVersionSync(directory: string = __dirname): IAppVersion | null {
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
    public getAppVersion(directory: string = __dirname): Promise<IAppVersion> {

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
     * @returns {string}    An AppVersion string, otherwise null.
     */
    public composePatternSync(pattern: string): string {

        const splittedPattern = pattern.split('');
        const appVersion = this.getAppVersionSync();
        let ptt = '';

        if (appVersion) {
            splittedPattern.map((ele) => {
                ptt += this.switchPattern(appVersion, ele);
            });
            return ptt;
        }

        throw new Error('No AppVersion Fils is found.');
    }

    /**
     * Returns a string with the version following the pattern you passed as a input.
     * Async version.
     * @param   {string}    pattern	    The Pattern to format the version
     * @returns	{Promise<String>} A Promise for an AppVersion string
     */
    public composePattern(pattern: string): Promise<string> {

        return new Promise<string>((resolve, reject) => {
            const splittedPattern = pattern.split('');

            this.getAppVersion()
                .then((appVersion: IAppVersion) => {
                    let ptt = '';
                    splittedPattern.map((ele) => {
                        ptt += this.switchPattern(appVersion, ele);
                    });
                    resolve(ptt);
                })
                .catch((err) => console.log(err));
        });
    }

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
    private switchPattern(appVersion: IAppVersion, pattern: string): string | number | Date | null {
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
