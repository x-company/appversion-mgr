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
 * @Last Modified At: 2018-12-20 22:53:27
 * @Description: This is description.
 */

import path from 'path';
import fs from 'fs';
import semver from 'semver';
import { Helper } from '../helpers/Helper';
import { IAppVersion } from '../types/IAppVersion';
import { IVersion } from '../types/IVersion';
import { Info } from '../info/Info';

export class CreateCommand {

    private helper: Helper;

    constructor(directory?: string) {
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
            const emptyAppVersion = this.createEmptyAppVersion();
            this.helper.writeJson(emptyAppVersion);
            Helper.info('appverison.json was created with default Values.');
        } else {
            Helper.error('appversion.json already exists.');
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
     * Creates an emtpy AppVersion Object
     *
     * @static
     * @returns {IAppVersion}
     * @memberof CreateCommand
     */
    private createEmptyAppVersion(): IAppVersion {

        let defaultVersion: IVersion = {
            major: 0,
            minor: 1,
            patch: 0,
            badge: '[![AppVersionManager-version](https://img.shields.io/badge/Version-${M.m.p}-brightgreen.svg?style=flat)](#define-a-url)',
        };

        const packageJsonVerison = this.getPackageJsonVersion();
        if (packageJsonVerison) {
            defaultVersion = packageJsonVerison;
        }

        return {
            version: defaultVersion,
            build: {
                date: null,
                number: 0,
                total: 0,
            },
            status: {
                stage: null,
                number: 0,
                badge: '[![AppVersionManager-status](https://img.shields.io/badge/Status-${S%20s}-brightgreen.svg?style=flat)](#define-a-url)',
            },
            commit: null,
            config: {
                schema: Info.getSchemaVersion(),
                ignore: [],
                json: [],
                markdown: [],
                gittag: 'vM.m.p',
            },
        };
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
