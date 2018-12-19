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
 * @Last Modified At: 2018-12-19 23:54:50
 * @Description: Central Helper Class for all.
 */

import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import semver from 'semver';
import findRoot from 'find-root';
import { walk } from 'walk';
import { exec } from 'child_process';
import { Info } from '../info';
import { IAppVersion } from '../types/IAppVersion';
import { IVersion } from '../types/IVersion';
import { Updater } from '../updater/Updater';


export class Helper {

    public static error(message: string, header?: string) {
        this.consoleOutput(message, header, true);
    }

    public static info(message: string, header?: string) {
        this.consoleOutput(message, header, false);
    }

    private static consoleOutput(message: string, header?: string, isError: boolean = false) {
        if (!header) {
            header = 'AppVersion Manager:';
        }

        if (isError) {
            console.log(chalk.red(`${chalk.bold(header)} ${message}`));
        } else {
            console.log(chalk.green(`${chalk.bold(header)} ${message}`));
        }
    }

    private PATH: string;
    private FILENAME: string = 'appversion.json';
    private FILEPATH: string;

    constructor(directory?: string) {

        if (!directory) {
            directory = findRoot(process.cwd());
        }

        this.PATH = path.resolve(directory);
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
            const appVersionContent = fs.readFileSync(this.FILEPATH, { encoding: 'utf8' });
            let appVersion: IAppVersion = JSON.parse(appVersionContent) as IAppVersion;

            // checks if the appversion.json is at the latest version
            appVersion = Updater.checkSchemaUpdate(appVersion);

            return appVersion;

        } catch (error) {
            console.log(error);
            if (error.code === 'MODULE_NOT_FOUND') {
                Helper.error(`
Could not find appversion.json
Type ${chalk.bold('\'appvmgr init\'')} for generate the file and start use AppVersionManager.
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

        if (newBadge !== oldBadge) {
            const markdownFilePath = path.join(this.PATH, markdownFile);
            if (!fs.existsSync(markdownFilePath)) {
                const fd = fs.openSync(markdownFilePath, 'wx+');
                fs.writeFileSync(markdownFilePath, oldBadge, { encoding: 'utf8' });
                fs.closeSync(fd);
            }

            const oldContent = fs.readFileSync(markdownFilePath, { encoding: 'utf8' });
            const newContent = oldContent.replace(oldBadge, newBadge);
            if (oldContent !== newContent) {
                fs.writeFileSync(markdownFilePath, newContent, { encoding: 'utf8' });

            }
            // const markdownFileTmp = `${markdownFilePath}.tmp`;
            // const readStream = fs.createReadStream(markdownFilePath, { encoding: 'utf8' });
            // const writeStream = fs.createWriteStream(markdownFileTmp, { encoding: 'utf8' }).on('close', () => {
            //     if (fs.existsSync(markdownFile) && fs.existsSync(markdownFileTmp)) {
            //         fs.rename(markdownFileTmp, markdownFile, (error) => {
            //             if (error) {
            //                 Helper.error(error.message);
            //             }
            //         });
            //     }
            // });

            // readStream
            //     .pipe(replacestream(oldBadge, newBadge, { encoding: 'utf8' }))
            //     .pipe(writeStream);
        }
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
                fs.writeFileSync(this.FILEPATH, json, { encoding: 'utf8' });
                fs.closeSync(fd);
            } else {
                fs.writeFileSync(this.FILEPATH, json);
            }

            if (message) {
                Helper.info(message);
            } else {
                const versionAsString = Info.composePatternSync('M.m.p', appVersion);
                Helper.info(`Version updated to ${versionAsString}`);
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
                        const versionAsString = Info.composePatternSync('M.m.p', appVersion);
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
                name: null,
                project: null,
                schema: Info.getSchemaVersion(),
                ignore: [
                    'node_modules',
                    'bower_components',
                    '.git',
                ],
                json: [
                    'package.json',
                ],
                markdown: [
                    'README.md',
                ],
            },
        };
    }

    /**
     * Adds a tag with the version number to the git repo.
     */
    public addGitTag() {
        const appVersion = this.readJson();

        if (appVersion) {

            const versionCode = (version: IAppVersion) => `v${Info.composePatternSync('M.m.p', version)}`;
            exec(`git tag ${versionCode(appVersion)}`, (error, stdout) => {
                if (error) {
                    if (error.message) {
                        Helper.error(error.message);
                    } else {
                        Helper.error('An unknown Error occured while Git Tag will added.');
                    }
                } else {
                    Helper.info(`Added Git tag '${versionCode(appVersion)}'`);
                }
            });
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
