/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { IAppVersion } from './IAppVersion';
import chalk from 'chalk';
import path from 'path';
import fs, { write } from 'fs';
import { Updater } from './Updater';
import replacestream from 'replacestream';
import { walk } from 'walk';

// tslint:disable-next-line: no-var-requires
const selfstream = require('self-stream');

export class Helper {

    private FILENAME: string = 'appversion.json';
    private FILEPATH: string;
    private VERSION: string = '0.1.0';

    constructor(private directory: string) {
        this.FILEPATH = path.join(directory, this.FILENAME);

        if (!fs.existsSync(this.FILENAME)) {
            // TODO: File not exists, File will created
        }
    }

    /**
     * Returns the appversion json content.
     * @param  {String} filename [name of the json]
     * @return {Object}          [content of the json]
     */
    public readJson(): IAppVersion | null {

        try {
            let appVersion: IAppVersion = require(this.FILEPATH);

            // checks if the appversion.json is at the latest version
            if (!appVersion.config || appVersion.config.appversion !== this.VERSION) {
                const updater = new Updater();
                appVersion = updater.updateAppversion(appVersion, '');

            }

            return appVersion;

        } catch (error) {
            if (error.code === 'MODULE_NOT_FOUND') {
                this.error(`
Could not find appversion.json
Type ${chalk.bold('\'apv init\'')} for generate the file and start use AppVersion.
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
            fs.writeFileSync(this.FILENAME, json);
            if (message) {
                console.log(message);
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
    public writeOtherJson(version: string) {

        const appVersion = this.readJson();
        if (!appVersion) {
            throw new Error('No AppVersions File found.');
        }

        // ignore every subfolder in the project
        if (appVersion.config) {
            if (appVersion.config.ignore.indexOf('*') > -1) {
                return;
            }

            // default ignored subfolders
            appVersion.config.ignore.push('node_modules', 'bower_components', '.git');

            // default json files
            appVersion.config.json.push('package.json');

            const walker = walk(path.resolve(this.directory), {
                followLinks: false,
                filters: appVersion.config.ignore
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
                        fileObj.version = version;
                    }

                    const json = `${JSON.stringify(fileObj, null, 2)}\n`;
                    fs.writeFileSync(path.resolve(root, fileStats.name), json);
                }
                next();
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
            header = 'AppVersion Manager';
        }

        if (isError) {
            console.log(chalk.red(`\n${chalk.bold(header)} ${message}\n`));
        }
        else {
            console.log(`\n${chalk.bold(header)} ${message}\n`);
        }
    }
}
