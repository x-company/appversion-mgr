/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { IAppVersion } from './IAppVersion';
import chalk from 'chalk';
import path from 'path';

/**
 * Returns the appversion json content.
 * @param  {String} filename [name of the json]
 * @return {Object}          [content of the json]
 */
export function readJson(file: string): IAppVersion {

    if (file.slice(-5) !== '.json') {
        console.log(chalk.red(`\n${chalk.bold('AppVersion:')} ${file} is not a Json\n`));
        process.exit(1);
    }
    try {
        let obj: IAppVersion = require(file === JSON_FILE ? path.resolve('./', file) : path.resolve(file));

        // checks if the appversion.json is at the latest version
        if (file === JSON_FILE && (!obj.config || obj.config.appversion !== apvVersion)) {
            obj = updateAppversion(obj);
        }
        return obj;
    } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            console.log(chalk.red(`\n${chalk.bold('AppVersion:')} Could not find appversion.json\nType ${chalk.bold('\'apv init\'')} for generate the file and start use AppVersion.\n`));
            process.exit(1);
        } else {
            throw new Error(err);
        }
    }
}

/**
 * Search and updates the badge in a .md file.
 * @param  {String} markdownFile [The name of the .md file]
 * @param  {String} newBadge     [new badge to append]
 * @param  {String} oldBadge     [old badge to change]
 */
function appendBadgeToMD(markdownFile, newBadge, oldBadge) {
    const transform = [replaceStream(oldBadge, newBadge)];
    selfStream(markdownFile, transform, (err) => {
        if (err) { console.log(err) }
    });
}

/**
 * Wrote into the json the object passed as argument
 * @param  {Object} obj [Full object]
 * @param  {String} message [Optional message]
 */
export function writeJson(obj, message) {
    if (!check('Object', obj) || !check('String | Undefined', message)) { return }
    const json = `${JSON.stringify(obj, null, 2)}\n`;
    try {
        fs.writeFileSync(JSON_FILE, json);
        if (message) { console.log(message) }
    } catch (err) {
        throw new Error(err);
    }
}

/**
 * Extension of the above function.
 * Updates package.json, bower.json and all other json in appversion.json
 * @param  {String} version   [version number x.y.z]
 */
function writeOtherJson(version) {
    if (!check('String', version)) { return }
    const obj = readJson(JSON_FILE);
    // ignore every subfolder in the project
    if (obj.config.ignore.indexOf('*') > -1) { return }
    // default ignored subfolders
    obj.config.ignore.push('node_modules', 'bower_components', '.git');
    // default json files
    obj.config.json.push('package.json');

    const walker = walk.walk(resolve('./'), { followLinks: false, filters: obj.config.ignore });

    walker.on('file', function(root, fileStats, next) {
        // if the filename is inside the appversion's json array
        if (obj.config.json.indexOf(fileStats.name) > -1) {
            let fileObj;
            try {
                fileObj = JSON.parse(fs.readFileSync(resolve(root, fileStats.name)));
            } catch (err) {
                return;
            }
            if (fileObj.version) { fileObj.version = version }
            const json = `${JSON.stringify(fileObj, null, 2)}\n`;
            fs.writeFileSync(resolve(root, fileStats.name), json);
        }
        next();
    });
}
