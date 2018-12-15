/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * @Script: update.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2018-12-15 02:38:51
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2018-12-15 03:00:55
 * @Description: This is description.
 */

import { IAppVersion } from "./IAppVersion";
import { readJson, writeJson } from './helper';


/**
* Calls the correct update function based on the parameter.
*/
export function update(file: string, param: string) {

    // Aliases
    if (param === 'breaking') { param = 'major'; }
    if (param === 'feature') { param = 'minor'; }
    if (param === 'fix') { param = 'patch'; }

    if (param === 'major' || param === 'minor' || param === 'patch' || param === 'build' || param == 'commit') {
        const appVersion: IAppVersion = readJson(JSON_FILE);

        if (param === 'major' || param === 'minor' || param === 'patch') {
            updateVersion(appVersion, param);
        } else if (param === 'build') {
            updateBuild(appVersion);
        } else if (param === 'commit') {
            updateCommit(appVersion);
        }

    } else {
        console.log(chalk.red(`\n${chalk.bold('AppVersion:')} type ${chalk.bold('\'apv -h\'')} to get more informations!\n`))
    }
}


/**
 * Increase the major|minor|patch version number.
 * @param  {String} version [major|minor|patch]
 */
function updateVersion(appVersion: IAppVersion, param: string): IAppVersion {

    let previousObj = {
        version: {
            major: obj.version.major,
            minor: obj.version.minor,
            patch: obj.version.patch
        }
    }
    obj.version[param]++
    if (param === 'major') obj.version.minor = obj.version.patch = 0
    if (param === 'minor') obj.version.patch = 0
    // The build number is reset whenever we update the version number
    obj.build.number = 0
    writeJson(obj, chalk.green(`\n${chalk.bold('AppVersion:')} Version updated to ${obj.version.major}.${obj.version.minor}.${obj.version.patch}\n`))
    writeOtherJson(`${obj.version.major}.${obj.version.minor}.${obj.version.patch}`)
    createBadge('version', true, previousObj)
}

/**
 * Increase the build number and updates the date.
 */
function updateBuild(appVersion: IAppVersion): IAppVersion {

    // The date is a string representing the Date object
    obj.build.date = (new Date()).toString()
    obj.build.number++
    obj.build.total++
    writeJson(obj, chalk.green(`\n${chalk.bold('AppVersion:')} Build updated to ${obj.build.number}/${obj.build.total}\n`))
}

/**
 * Updates the commit code.
 */
function updateCommit(appVersion: IAppVersion): IAppVersion {

    exec('git log --oneline', (error, stdout) => {
        if (error) {
            obj.commit = null
            writeJson(obj, chalk.red(`\n${chalk.bold('AppVersion:')} No Git repository found.\n`))
        } else {
            obj.commit = stdout.substring(0, 7)
            writeJson(obj, chalk.green(`\n${chalk.bold('AppVersion:')} Commit updated to ${stdout.substring(0, 7)}\n`))
        }
    })
}
