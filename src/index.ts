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
 * @Last Modified At: 2018-12-18 22:47:53
 * @Description: Helper Functions to retrieve Values
 */

import { Updater } from './updater/Updater';

// Export all needed Classes
export * from './types/IAppVersion';
export * from './commands';
export * from './info';

// Check for Updates
const updater = new Updater();
updater.checkUpdate();
