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
 * @Last Modified At: 2018-12-17 18:16:32
 * @Description: The AppVersion Type Interface
 */

export interface IAppVersion {

    version: IVersion;
    status?: IStatus;
    build?: IBuild;
    commit?: string | null;
    config?: IConfig;

}

export interface IVersion {
    major: number;
    minor: number;
    patch: number;
}

interface IStatus {
    stage: string | null;
    number: number;
}

interface IBuild {
    date: Date | null;
    number: number;
    total: number;
}

interface IConfig {
    appversion: string;
    markdown: string[];
    json: string[];
    ignore: string[];
}
