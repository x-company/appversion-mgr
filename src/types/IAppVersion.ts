/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * @Script: IAppVersion.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2018-12-15 01:01:35
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2018-12-20 23:41:21
 * @Description: The AppVersion Type Interface
 */

import { IVersion } from './IVersion';
import { IStatus } from './IStatus';
import { IBuild } from './IBuild';
import { IConfig } from './IConfig';
import { IGit } from './IGit';

export interface IAppVersion {

    version: IVersion;
    status?: IStatus;
    build?: IBuild;
    git?: IGit;
    config?: IConfig;

}
