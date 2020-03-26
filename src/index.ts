/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * @Script: index.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2018-12-14 23:47:45
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2019-01-07 00:37:40
 * @Description: Helper Functions to retrieve Values
 */

import { Updater } from './updater/Updater';

// Export all needed Classes
export { IAppVersion } from './types';
export { CreateCommand, SetCommand, UpdateCommand } from './commands';
export { Info } from './info';

// Check for Updates
Updater.checkUpdate();
