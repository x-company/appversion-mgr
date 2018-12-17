#! /usr/bin/env node

/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 * @Script: appvmgr.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2018-12-15 00:53:57
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2018-12-17 21:36:27
 * @Description: This is description.
 */

import { Command } from 'commander';
import { getVersion, UpdateCommand, SetCommand } from '../lib';
import { Helper } from '../lib/Helper';
import { BadgeHelper } from '../lib/BadgeHelper';

const program = new Command();

program
    .version(getVersion(), '-v, --version')
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
    .action((action, options) => {

        const directory: string = options.directory || __dirname;
        action = action || 'commit';

        const command = new UpdateCommand(directory);
        command.update(action);
    });

program
    .command('set-version <version>')
    .description('Sets a specific version number, the <version> must be x.y.z')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .action((version, options) => {

        const directory: string = options.directory || __dirname;

        const command = new SetCommand(directory);
        command.setVersion(version);
    });

program
    .command('set-status <status>')
    .description('Sets a specific status, the <status> stage can be stable|rc|beta|alpha and the number must be a number')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .action((status, options) => {

        const directory: string = options.directory || __dirname;

        const command = new SetCommand(directory);
        command.setStatus(status);
    });

program
    .command('generate-badge <param>')
    .description('Generates the .md code of a shield badge with the version of your application, <param> can be version|status')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .action((param, options) => {

        const directory: string = options.directory || __dirname;

        const command = new BadgeHelper(directory);
        command.createBadge(param);
    });

program
    .command('add-git-tag')
    .description('Adds a tag with the version number to the git repo.')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .action((options) => {

        const directory: string = options.directory || __dirname;

        const command = new Helper(directory);
        command.addGitTag();
    });



if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exit();
}
program.parse(process.argv);
