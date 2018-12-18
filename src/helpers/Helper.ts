/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * @Script: Helper.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2018-12-17 18:15:55
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2018-12-18 02:21:15
 * @Description: Central Helper Class for all.
 */



import chalk from 'chalk';
import path from 'path';
import fs, { write } from 'fs';
import replacestream from 'replacestream';
import { walk } from 'walk';
import { exec } from 'child_process';
import semver from 'semver';
import findRoot from 'find-root';
import { getSchemaVersion, getVersion } from '../info';
import { IAppVersion } from '../types/IAppVersion';
import { IVersion } from '../types/IVersion';
import { Updater } from '../updater/Updater';


// tslint:disable-next-line: no-var-requires
const selfstream = require('self-stream');

export class Helper {

    private PATH: string;
    private FILENAME: string = 'appversion.json';
    private FILEPATH: string;

    constructor(directory?: string) {
        if (!directory) {
            this.PATH = findRoot(__dirname);
            if (this.PATH) {
                this.PATH = path.resolve(this.PATH);
            }
        } else {
            this.PATH = path.resolve(directory);
        }

        if (!this.PATH.endsWith('/')) {
            this.PATH += '/';
        }

        this.FILEPATH = path.join(this.PATH, this.FILENAME);

        if (!fs.existsSync(this.PATH)) {
            fs.mkdirSync(this.PATH);
        }

        if (!fs.existsSync(this.FILEPATH)) {
            // Write temporary the Config
            const emptyAppVersion = this.createEmptyAppVersion();
            this.writeJson(emptyAppVersion, 'Create an empty Application Version Object');
        }
    }

    /**
     * Returns the appversion json content.
     * @param  {String} filename [name of the json]
     * @return {Object}          [content of the json]
     */
    public readJson(filePath?: string): IAppVersion | null {

        if (!filePath) {
            filePath = this.FILEPATH;
        }

        try {
            let appVersion: IAppVersion = require(filePath);

            // checks if the appversion.json is at the latest version
            if (appVersion.config && appVersion.config.appversion !== getSchemaVersion()) {
                const updater = new Updater();
                appVersion = updater.updateAppversion(appVersion, getSchemaVersion());
                this.info('appversion.json updated to the latest version.');
            }

            return appVersion;

        } catch (error) {
            console.log(error);
            if (error.code === 'MODULE_NOT_FOUND') {
                this.error(`
Could not find appversion.json
Type ${chalk.bold('\'appvmgr init\'')} for generate the file and start use AppVersion.
                `);

                process.exit(1);
            } else {
                throw new Error(error);
            }
        }
        return null;
    }

    /**
     * Search and updates the badge in a .md file.
     * @param  {String} markdownFile [The name of the .md file]
     * @param  {String} newBadge     [new badge to append]
     * @param  {String} oldBadge     [old badge to change]
     */
    public appendBadgeToMD(markdownFile: string, newBadge: string, oldBadge: string) {

        const transform = [replacestream(oldBadge, newBadge)];

        selfstream(markdownFile, transform, (error: any) => {
            if (error) {
                console.log(error);
            }
        });
    }

    /**
     * Wrote into the json the object passed as argument
     * @param  {Object} obj [Full object]
     * @param  {String} message [Optional message]
     */
    public writeJson(appVersion: IAppVersion, message?: string) {

        const json = `${JSON.stringify(appVersion, null, 2)}\n`;
        try {
            if (!fs.existsSync(this.FILEPATH)) {
                const fd = fs.openSync(this.FILEPATH, 'wx+');
                fs.writeFileSync(this.FILEPATH, json);
                fs.closeSync(fd);
            } else {
                fs.writeFileSync(this.FILEPATH, json);
            }

            if (message) {
                this.info(message);
            } else {
                const versionAsString = `${appVersion.version.major}.${appVersion.version.minor}.${appVersion.version.patch}`;
                this.info(`Version updated to ${versionAsString}`);
            }

        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Extension of the above function.
     * Updates package.json, bower.json and all other json in appversion.json
     * @param  {String} version   [version number x.y.z]
     */
    public writeOtherJson(appVersion: IAppVersion) {

        // ignore every subfolder in the project
        if (appVersion.config) {
            if (appVersion.config.ignore.indexOf('*') > -1) {
                return;
            }

            const walker = walk(path.resolve(this.PATH), {
                followLinks: false,
                filters: appVersion.config.ignore,
            });

            walker.on('file', (root, fileStats, next) => {
                // if the filename is inside the appversion's json array
                if (appVersion.config && appVersion.config.json.indexOf(fileStats.name) > -1) {
                    let fileObj;
                    try {
                        fileObj = JSON.parse(fs.readFileSync(path.resolve(root, fileStats.name), 'utf8'));
                    } catch (err) {
                        return;
                    }

                    if (fileObj.version) {
                        const versionAsString = `${appVersion.version.major}.${appVersion.version.minor}.${appVersion.version.patch}`;
                        fileObj.version = versionAsString;
                    }

                    const json = `${JSON.stringify(fileObj, null, 2)}\n`;
                    fs.writeFileSync(path.resolve(root, fileStats.name), json);
                }
                next();
            });
        }
    }

    public createEmptyAppVersion(): IAppVersion {

        let defaultVersion: IVersion = {
            major: 0,
            minor: 1,
            patch: 0,
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
            },
            commit: null,
            config: {
                appversion: getSchemaVersion(),
                ignore: [
                    'node_modules',
                    'bower_components',
                    '.git',
                ],
                json: [
                    'package.json',
                ],
                markdown: [],
            },
        };
    }

    /**
     * Adds a tag with the version number to the git repo.
     */
    public addGitTag() {
        const appVersion = this.readJson();

        if (appVersion) {

            const versionCode = (version: IVersion) => `v${version.major}.${version.minor}.${version.patch}`;

            exec(`git tag ${versionCode(appVersion.version)}`, (error, stdout) => {
                if (error) {
                    this.error('Tag not added, no Git repository found.');
                } else {
                    this.info(`Added Git tag '${versionCode(appVersion.version)}'`);
                }
            });
        }
    }

    public error(message: string, header?: string) {
        this.consoleOutput(message, header, true);
    }

    public info(message: string, header?: string) {
        this.consoleOutput(message, header, false);
    }

    private consoleOutput(message: string, header?: string, isError: boolean = false) {
        if (!header) {
            header = 'AppVersion Manager:';
        }

        if (isError) {
            console.log(chalk.red(`${chalk.bold(header)} ${message}`));
        } else {
            console.log(chalk.green(`${chalk.bold(header)} ${message}`));
        }
    }

    /**
     * Read the version field from a json file (package.json) and return an object divided in major|minor|patch
     * @param  {Object} obj [json file]
     * @return {Object}     [object divided in major|minor|patch]
     */
    private getPackageJsonVersion(): IVersion | null {
        // Read the Package Json
        const packageJsonPath = path.resolve('./', 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson: any = this.readJson(packageJsonPath);
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
