/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * @Script: IVersion.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2018-12-17 23:44:33
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2018-12-20 00:52:45
 * @Description: The Version Type
 */

export interface IVersion {
    major: number;
    minor: number;
    patch: number;
    badge?: string;
}
