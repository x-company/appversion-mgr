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
 * @Last Modified At: 2018-12-18 01:10:02
 * @Description: Helper Functions to retrieve Values
 */

import { Info } from './info';

const info = new Info();
export function getAppVersion() {
    return info.getAppVersion();
}
export function getAppVersionSync() {
    return info.getAppVersionSync();
}
export function composePattern(pattern: string) {
    return info.composePattern(pattern);
}
export function composePatternSync(pattern: string) {
    return info.composePatternSync(pattern);
}

// Export all needed Classes
export * from './types/IAppVersion';
export * from './commands/SetCommand';
export * from './commands/UpdateCommand';
