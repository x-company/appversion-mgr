/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Copyright (c) 2018 Roland Breitschaft
 *
 * @Script: CreateCommand.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2018-12-20 20:36:23
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2019-08-31 12:58:05
 * @Description: This is description.
 */

import path from 'path';
import fs from 'fs';
import semver from 'semver';
import { Helper } from '../helpers/Helper';
import { IVersion } from '../types/IVersion';
import { Info } from '../info/Info';

export class CreateCommand {

    private helper: Helper;

    constructor(directory?: string, private badgeUrl?: string, private projectUrl?: string, private name?: string) {
        Helper.verbose('Init CreateCommand');

        this.helper = new Helper(directory, false);
    }

    /**
     * Creates an new appversion.json
     *
     * @memberof CreateCommand
     */
    public initAppVersion() {
        if (!fs.existsSync(this.helper.FILEPATH)) {
            const emptyAppVersion = Info.getDataSchemaAsObject(this.badgeUrl, this.projectUrl, this.name);

            const packageJsonVersion = this.getPackageJsonVersion();
            if (packageJsonVersion) {
                emptyAppVersion.version.major = packageJsonVersion.major;
                emptyAppVersion.version.minor = packageJsonVersion.minor;
                emptyAppVersion.version.patch = packageJsonVersion.patch;
            }

            this.helper.writeJson(emptyAppVersion);
            Helper.info('appversion.json was created with default Values.');
        } else {
            Helper.verbose('appversion.json already exists.');
        }
    }

    /**
     * Resets a appversion.json to his defaults
     *
     * @memberof CreateCommand
     */
    public resetAppVersion() {
        this.helper.deleteJson();
        Helper.info('appversion.json was resetted to his default Values.');
        this.initAppVersion();
    }

    /**
     * Read the version field from a json file (package.json) and return an object divided in major|minor|patch
     *
     * @param  {Object} obj [json file]
     * @return {Object}     [object divided in major|minor|patch]
     */
    private getPackageJsonVersion(): IVersion | null {

        // Read the Package Json
        const packageJsonPath = path.resolve(this.helper.PATH, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson: any = require(packageJsonPath);
            if (packageJson) {
                if (packageJson.version) {
                    const versionAsString = semver.clean(packageJson.version) || '0.1.0';
                    if (!semver.valid(versionAsString)) {
                        return null;
                    }
                    const versionArray = versionAsString.split('.');
                    return {
                        major: Number(versionArray[0]),
                        minor: Number(versionArray[1]),
                        patch: Number(versionArray[2]),
                    };
                }
            }
        }
        return null;
    }
}
