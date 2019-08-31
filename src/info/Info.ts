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
 * @Last Modified At: 2019-08-31 13:33:41
 * @Description: It's a Helper Class to work with AppVersion Elements
 */

import path from 'path';
import { Helper } from '../helpers/Helper';
import { IAppVersion } from '../types/IAppVersion';

export class Info {

    /**
     * The current Program Version
     *
     * @static
     * @returns {string}        A Program Version
     * @memberof Info
     */
    public static getProductVersion() {

        Helper.verbose('Get Product Version');

        let installPath: string | undefined;
        try {
            const indexFile = require.resolve('appversion-mgr');
            const indexFilePath = path.dirname(indexFile);
            installPath = path.resolve(indexFilePath, '..');
        } catch {
            // Nothing to catch
        }

        const appVersion = Info.getAppVersionSync(installPath);
        if (appVersion) {
            const productVersion = Info.composePatternSync('M.m.p', appVersion);
            return productVersion;
        } else {
            return Info.PROG_VERSION;
        }
    }

    /**
     * Returns the Schema Version of the AppVersion File
     *
     * @static
     * @returns {string}    A Schema Version
     * @memberof Info
     */
    public static getSchemaVersion(): string {

        Helper.verbose('Get Data Schema Version');

        return Info.SCHEMA_VERSION;
    }

    /**
     * Returns the content of appversion.json as a object.
     * Sync version.
     *
     * @static
     * @param   {string}        directory	The Directory where should looked for the appversion.json
     * @returns	{IAppVersion}   [The AppVersion Object]
     * @memberof Info
     */
    public static getAppVersionSync(directory?: string): IAppVersion | null {

        Helper.verbose('Get AppVersion Sync');

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
     *
     * @static
     * @param   {string}                directory	The Directory where should looked for the appversion.json
     * @returns {Promise<IAppVersion>}  A Promise for an AppVersion Object
     * @memberof Info
     */
    public static getAppVersion(directory?: string): Promise<IAppVersion> {

        Helper.verbose('Get AppVersion ASync');

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
     * Returns a string with the version following the pattern you passed as a input from the current
     * or given Directory.
     *
     * @static
     * @param   {string}    pattern	    The Pattern to format the version
     * @param   {string}    directory	The Directory where should looked for the appversion.json
     * @returns {string}    An AppVersion string formatted with the given pattern.
     * @memberof Info
     */
    public static composePatternSync(pattern: string, directory?: string): string;

    /**
     * Returns a string with the version following the pattern you passed as a input
     * with the given IAppVersion Object
     *
     * @static
     * @param   {string}    pattern	    The Pattern to format the version
     * @param {IAppVersion} appVersion	A AppVersion Object which will used to format a Pattern.
     * @returns {string}    An AppVersion string formatted with the given pattern.
     * @memberof Info
     */
    public static composePatternSync(pattern: string, appVersion: IAppVersion): string;
    public static composePatternSync(pattern: string, appVersionOrDirectory?: string | IAppVersion): string {

        Helper.verbose('Compose Pattern Sync');

        let appVersion: IAppVersion;
        if (!appVersionOrDirectory) {
            appVersion = Info.getAppVersionSync() as IAppVersion;
        } else {
            if (typeof appVersionOrDirectory === 'string') {
                appVersion = Info.getAppVersionSync(appVersionOrDirectory) as IAppVersion;
            } else {
                appVersion = appVersionOrDirectory as IAppVersion;
            }
        }

        if (appVersion) {
            const splittedPattern = pattern.split('');
            let result: string = '';

            splittedPattern.map((char) => {
                result += Info.switchPattern(appVersion, char);
            });
            return result;
        }
        throw new Error('No AppVersion File could found.');
    }

    /**
     * Returns a string with the version following the pattern you passed as a input
     * from the current or given Directory.
     *
     * @static
     * @param   {string}    pattern	    The Pattern to format the version
     * @param   {string}    directory	The Directory where should looked for the appversion.json
     * @returns	{Promise<String>} A Promise for an AppVersion string
     * @memberof Info
     */
    public static composePattern(pattern: string, directory?: string): Promise<string>;

    /**
     * Returns a string with the version following the pattern you passed as a input
     * with the given IAppVersion Object
     *
     * @static
     * @param   {string}        pattern	    The Pattern to format the version
     * @param   {IAppVersion}   appVersion	A AppVersion Object which will used to format a Pattern.
     * @returns	{Promise<String>} A Promise for an AppVersion string
     * @memberof Info
     */
    public static composePattern(pattern: string, appVersion: IAppVersion): Promise<string>;
    public static composePattern(pattern: string, appVersionOrDirectory?: IAppVersion | string): Promise<string> {

        Helper.verbose('Compose Pattern ASync');

        return new Promise<string>((resolve, reject) => {
            let appVersion: IAppVersion;

            const composeHelper = (version: IAppVersion) => {
                const splittedPattern = pattern.split('');
                let ptt = '';
                splittedPattern.map((ele) => {
                    ptt += Info.switchPattern(version, ele);
                });
                resolve(ptt);
            };


            if (!appVersionOrDirectory) {
                Info.getAppVersion()
                    .then((version) => composeHelper(version))
                    .catch((error) => reject(error));
            } else {
                if (typeof appVersionOrDirectory === 'string') {
                    Info.getAppVersion(appVersionOrDirectory)
                        .then((version) => composeHelper(version))
                        .catch((error) => reject(error));
                } else {
                    appVersion = appVersionOrDirectory as IAppVersion;
                    if (appVersion) {
                        composeHelper(appVersion);
                    } else {
                        reject(new Error('No AppVersion Object is given.'));
                    }
                }
            }
        });
    }

    /**
     * Creates an emtpy AppVersion Object
     *
     * @static
     * @returns {IAppVersion}
     * @memberof CreateCommand
     */
    public static getDataSchemaAsObject(badgeUrl: string = 'https://img.shields.io/badge', projectUrl: string = '#define-a-url', name: string = 'AppVersionManager'): IAppVersion {
        
        return {
            version: {
                major: 0,
                minor: 1,
                patch: 0,
                badge: `[![${name}-version](${badgeUrl}/Version-\${M.m.p}-brightgreen.svg?style=flat)](${projectUrl})`,
            },
            build: {
                date: null,
                number: 0,
                total: 0,
                badge: `[![${name}-build](${badgeUrl}/Builds-\${t}-brightgreen.svg?style=flat)](${projectUrl})`,
            },
            status: {
                stage: null,
                number: 0,
                badge: `[![${name}-status](${badgeUrl}/Status-\${S%20s}-brightgreen.svg?style=flat)](${projectUrl})`,
            },
            git: {
                commit: null,
                tag: 'vM.m.p',
            },
            config: {
                schema: Info.getSchemaVersion(),
                ignore: [],
                json: [],
                markdown: [],
            },
        };
    }

    private static PROG_VERSION: string = '0.1.0';
    private static SCHEMA_VERSION: string = '1.11.1';

    /**
     * Returns the correspondent obj parameter, if not, it returns the given pattern.
     *
     * @static
     * @param  {IAppVersion}    appVersion      An AppVersion Object
     * @param  {String}         pattern         The format pattern
     * @return {String | Number | Date | null}  The correspondent pattern
     * @memberof Info
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
                return appVersion.status ? appVersion.status.stage : '';
            case 's':
                return appVersion.status ? appVersion.status.number : '';
            case 'n':
                return appVersion.build ? appVersion.build.number : '';
            case 't':
                return appVersion.build ? appVersion.build.total : '';
            case 'd':
                return appVersion.build ? appVersion.build.date : '';
            case 'c':
                return appVersion.git ? appVersion.git.commit : '';
            default:
                return pattern;
        }
    }
}
