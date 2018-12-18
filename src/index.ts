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
 * @Last Modified At: 2018-12-18 13:56:44
 * @Description: Helper Functions to retrieve Values
 */

import { Info } from './info';
import { IAppVersion } from './types';
import { Updater } from './updater/Updater';

const info = new Info();

/**
 * Gets the ApiVersion of a given Directory. If no Directory is given,
 * the default '__dirname' will used.
 *
 * @export
 * @param {string} [directory]      The Directory where the appverion.js lives
 * @returns {Promise<IAppVersion>}  A Promise for an AppVersion
 */
export function getAppVersion(directory?: string): Promise<IAppVersion> {
    return info.getAppVersion(directory);
}

/**
 * Gets the ApiVersion of a given Directory. If no Directory is given,
 * the default '__dirname' will used.
 *
 * @export
 * @param {string} [directory]      The Directory where the appverion.js lives
 * @returns {(IAppVersion | null)}  The ApiVersion, otherwise null.
 */
export function getAppVersionSync(directory?: string): IAppVersion | null {
    return info.getAppVersionSync(directory);
}

/**
 * Formats a ApiVersion with an given Pattern
 *
 * @export
 * @param {string} pattern      The Format Pattern.
 * @param {string} [directory]  The Directory where the appverion.js lives
 * @returns {Promise<string>}   A Promise vor the formatted Versions Number.
 */
export function composePattern(pattern: string, directory?: string): Promise<string> {
    return info.composePattern(pattern, directory);
}

/**
 * Formats a ApiVersion with an given Pattern
 *
 * @export
 * @param {string} pattern      The Format Pattern.
 * @param {string} [directory]  The Directory where the appverion.js lives
 * @returns {string}            The formatted Versions Number
 */
export function composePatternSync(pattern: string, directory?: string): string {
    return info.composePatternSync(pattern, directory);
}

// Export all needed Classes
export * from './types/IAppVersion';
export * from './commands/SetCommand';
export * from './commands/UpdateCommand';

// Check for Updates
const updater = new Updater();
updater.checkUpdate();
