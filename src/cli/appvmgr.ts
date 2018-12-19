#! /usr/bin/env node

/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * @Script: appvmgr.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2018-12-15 00:53:57
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2018-12-20 00:11:57
 * @Description: The CLI Application
 */

import { Command } from 'commander';
import { UpdateCommand, SetCommand } from '../commands';
import { Info } from '../info';
import { Helper } from '../helpers/Helper';
import { BadgeHelper } from '../helpers/BadgeHelper';
import { Updater } from '../updater/Updater';

const program = new Command();

program
    .version(Info.getProductVersion(), '-v, --version')
    .description('AppVersion Manager is a CLI tool whose purpose is to provide a unique manager of the version of you application.');

program
    .command('init')
    .description('Generates the appversion.json file.')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .action((options) => {

        const directory = options.directory || undefined;

        const helper = new Helper(directory);
        const emptyAppVersion = helper.createEmptyAppVersion();
        helper.writeJson(emptyAppVersion);
    });

program
    .command('update <action>')
    .description('Updates the <action> that can be (major|breaking)|(minor|feature)|(patch|fix)|build|commit')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .option('-t, --tag', 'Adds a tag with the version number to the git repo')
    .action((action, options) => {

        const directory: string = options.directory || undefined;
        action = action || 'build';

        const command = new UpdateCommand(directory);
        command.update(action);

        if (options.tag) {
            const helper = new Helper(directory);
            helper.addGitTag();
        }
    });

program
    .command('set-version <version>')
    .description('Sets a specific version number, the <version> must be x.y.z')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .option('-t, --tag', 'Adds a tag with the version number to the git repo')
    .action((version, options) => {

        const directory: string = options.directory || undefined;

        const command = new SetCommand(directory);
        command.setVersion(version);

        if (options.tag) {
            const helper = new Helper(directory);
            helper.addGitTag();
        }
    });

program
    .command('set-status <status>')
    .description('Sets a specific status, the <status> stage can be stable|rc|beta|alpha|prerelease and the number must be a number')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .action((status, options) => {

        const directory: string = options.directory || undefined;

        const command = new SetCommand(directory);
        command.setStatus(status);
    });

program
    .command('generate-badge <param>')
    .description('Generates the .md code of a shield badge with the version of your application, <param> can be version|status')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .action((param, options) => {

        const directory: string = options.directory || undefined;

        const command = new BadgeHelper(directory);
        command.createBadge(param);
    });

program
    .command('add-git-tag')
    .description('Adds a tag with the version number to the git repo.')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .action((options) => {

        const directory: string = options.directory || undefined;

        const command = new Helper(directory);
        command.addGitTag();
    });

program
    .command('check')
    .description('Check for Program Updates.')
    .action((options) => {

        Updater.checkUpdate();
    });

if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exit();
}
program.parse(process.argv);
