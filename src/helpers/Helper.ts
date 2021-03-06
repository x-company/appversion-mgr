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
 * @Last Modified At: 2019-08-31 15:07:49
 * @Description: Central Helper Class for all.
 */

import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import findRoot from 'find-root';
import { walk } from 'walk';
import { Info } from '../info/Info';
import { IAppVersion } from '../types/IAppVersion';
import { Updater } from '../updater/Updater';
import { CreateCommand } from '../commands';


export class Helper {

    public static verboseEnabled: boolean = false;

    /**
     * Writes an Error Message
     *
     * @static
     * @param {string} message      The Message
     * @param {string} [header]     An optional Header
     * @memberof Helper
     */
    public static error(message: string, header?: string) {
        this.consoleOutput(message, header, true);
    }

    /**
     * Writes an Info Message to the Console
     *
     * @static
     * @param {string} message      The Message
     * @param {string} [header]     An optional Header
     * @memberof Helper
     */
    public static info(message: string, header?: string) {
        this.consoleOutput(message, header, false);
    }

    public static verbose(message: string, args?: any) {
        if (Helper.verboseEnabled) {
            if (args) {
                Helper.info('VERBOSE: ' + message + ' ' + args);
            } else {
                Helper.info('VERBOSE: ' + message);
            }
        }
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

    /**
     * The complete FilePath for the appversion.json
     *
     * @type {string}
     * @memberof Helper
     */
    public FILEPATH: string;

    /**
     * The Path where the appversion.json lives
     *
     * @type {string}
     * @memberof Helper
     */
    public PATH: string;

    private FILENAME: string = 'appversion.json';

    constructor(directory?: string, shouldCreateIfNotExists: boolean = true) {

        Helper.verbose('Init Helper');

        if (!directory) {
            directory = findRoot(process.cwd());
            Helper.verbose('ROOT:', process.cwd());
        }

        this.PATH = path.resolve(directory);
        if (!this.PATH.endsWith('/')) {
            this.PATH += '/';
        }

        this.FILEPATH = path.join(this.PATH, this.FILENAME);
        if (!fs.existsSync(this.PATH)) {
            fs.mkdirSync(this.PATH);
        }

        Helper.verbose('PATH:', this.PATH);
        Helper.verbose('FILEPATH:', this.FILEPATH);

        if (shouldCreateIfNotExists && !fs.existsSync(this.FILEPATH)) {

            const cmd = new CreateCommand(this.PATH);
            cmd.initAppVersion();
        }
    }

    /**
     * Returns the appversion json content.
     *
     * @param  {String} filename [name of the json]
     * @return {Object}          [content of the json]
     */
    public readJson(filePath?: string): IAppVersion | null {

        if (!filePath) {
            filePath = this.FILEPATH;
        }

        try {
            Helper.verbose('Read the appversion.json');

            const appVersionContent = fs.readFileSync(this.FILEPATH, { encoding: 'utf8' });
            let appVersion: IAppVersion = JSON.parse(appVersionContent) as IAppVersion;

            // checks if the appversion.json is at the latest version
            appVersion = Updater.checkSchemaUpdate(appVersion, this);

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
     * Wrote into the json the object passed as argument
     * @param  {Object} obj [Full object]
     * @param  {String} message [Optional message]
     */
    public writeJson(appVersion: IAppVersion, message?: string) {

        const json = `${JSON.stringify(appVersion, null, 2)}\n`;
        try {
            if (!fs.existsSync(this.FILEPATH)) {
                Helper.verbose('appversion.json not exists. It will created.');

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
     * Deletes the given File
     *
     * @param  {String} filename [name of the json]
     * @memberof Helper
     */
    public deleteJson(filePath?: string) {

        if (!filePath) {
            filePath = this.FILEPATH;
        }

        if (fs.existsSync(filePath)) {
            Helper.verbose('Delete existing appversion.json');
            fs.unlinkSync(filePath);
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
            // Check for Ignore All is setted
            if (appVersion.config.ignore.indexOf('*') > -1) {
                return;
            }

            // default ignored subfolders
            appVersion.config.ignore.push('node_modules', 'bower_components', '.git');

            // default json files
            appVersion.config.json.push('package.json');

            const walker = walk(path.resolve(this.PATH), {
                followLinks: false,
                filters: appVersion.config.ignore,
            });

            walker.on('file', (root, fileStats, next) => {
                // if the filename is inside the appversion json array
                if (appVersion.config && appVersion.config.json.indexOf(fileStats.name) > -1) {
                    let fileObj;
                    try {
                        fileObj = JSON.parse(fs.readFileSync(path.resolve(root, fileStats.name), 'utf8'));
                    } catch (err) {
                        if (err && err.Message) {
                            Helper.error(err.Message);
                        }
                        return;
                    }

                    if (fileObj.version) {
                        const versionAsString = Info.composePatternSync('M.m.p', appVersion);
                        fileObj.version = versionAsString;
                    }

                    const otherFilePath = path.resolve(root, fileStats.name);
                    Helper.verbose('Update other Files', otherFilePath);

                    const json = `${JSON.stringify(fileObj, null, 2)}\n`;
                    fs.writeFileSync(otherFilePath, json);
                }
                next();
            });
        }
    }
}
