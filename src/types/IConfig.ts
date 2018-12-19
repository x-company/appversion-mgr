/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * @Script: IConfig.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2018-12-17 23:46:31
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2018-12-19 18:42:04
 * @Description: The IConfig Type
 */

export interface IConfig {
    name: string | null;
    project: string | null;
    schema: string;
    markdown: string[];
    json: string[];
    ignore: string[];
}
