/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT

 * @Script: IAppVersion.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2018-12-15 01:01:35
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2018-12-15 01:06:49
 * @Description: This is description.
 */

export interface IAppVersion {

    version: IVersion;
    status: IStatus;
    build: IBuild;
    commit: string;
    config: IConfig;

}

interface IVersion {
    major: number;
    minor: number;
    patch: number;
}

interface IStatus {
    stage: string;
    number: number;
}

interface IBuild {
    date: Date;
    number: number;
    total: number;
}

interface IConfig {
    appversion: string;
    markdown: Array<string>;
    json: Array<string>;
    ignore: Array<string>;
}
