/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * @Script: index.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2018-12-18 01:20:53
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2018-12-18 01:20:53
 * @Description: Barrel for the Info Component
 */

export * from './Info';


const PROG_VERSION: string = '0.1.0';
const SCHEMA_VERSION: string = '1.7.1';

/**
 * The current Program Version
 *
 * @returns     {string}    A Program Version
 */
export function getProductVersion() {
    return PROG_VERSION;
}

/**
 * Returns the Schema Version of the AppVersion File
 *
 * @returns {string}    A Schema Version
 */
export function getSchemaVersion(): string {
    return SCHEMA_VERSION;
}
