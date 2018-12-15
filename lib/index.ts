/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 * @Script: index.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2018-12-14 23:47:45
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2018-12-15 13:55:30
 * @Description: This is description.
 */

import fs from 'fs';
import path from 'path';
import { IAppVersion } from './IAppVersion';

const JSON_FILE: string = 'appversion.json';
const APP_DIRECTORY: string = __dirname;

/**
 * Returns the content of appversion.json as a object.
 * Sync version.
 * @return {Object} [appversion object]
 */
export function getAppVersionSync(): IAppVersion {
    try {
        const appVersion: IAppVersion = require(path.join(APP_DIRECTORY, JSON_FILE));
        delete appVersion.config;
        return appVersion;
    } catch (error) {
        throw new Error(error);
    }
}

/**
 * Returns the content of appversion.json as a object.
 * Async version.
 * @param  {Function} callback [callback]
 * @return {Object} [appversion object]
 */
export function getAppVersion(): Promise<IAppVersion> {

    return new Promise<IAppVersion>((resolve, reject) => {
        fs.readFile(path.join(APP_DIRECTORY, JSON_FILE), 'utf8', (error, data) => {
            const appVersion = JSON.parse(data) as IAppVersion;
            if (appVersion) {
                delete appVersion.config;
                resolve(appVersion);
            } else {
                reject(error);
            }
        });
    });
}

/**
 * Returns a string with the version following the pattern you passed as a input.
 * Sync version.
 * @return {String} [appversion string]
 */
export function composePatternSync(pattern: string): string {

    const splittedPattern = pattern.split('');
    const appVersion = getAppVersionSync();
    let ptt = '';

    splittedPattern.map((ele) => {
        ptt += switchPattern(appVersion, ele);
    });
    return ptt;
}

/**
 * Returns a string with the version following the pattern you passed as a input.
 * Async version.
 * @param  {Function} callback [callback]
 * @return {Promise<String>} [appversion string]
 */
export function composePattern(pattern: string): Promise<string> {

    return new Promise<string>((resolve, reject) => {
        const splittedPattern = pattern.split('');

        getAppVersion()
            .then((appVersion: IAppVersion) => {
                let ptt = '';
                splittedPattern.map((ele) => {
                    ptt += switchPattern(appVersion, ele);
                });
                resolve(ptt);
            })
            .catch((err) => console.log(err));
    });
}

/**
 * Returns the correspondent obj parameter, if not, it returns the given pattern.
 * @param  {IAppVersion}    appVersion      [appversion IAppVersion]
 * @param  {String}         pattern         [pattern]
 * @return {String}                         [correspondent pattern]
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
function switchPattern(appVersion: IAppVersion, pattern: string): string | number | Date | null {
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
