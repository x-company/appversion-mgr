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
 * @Last Modified At: 2018-12-20 22:30:18
 * @Description: The CLI Application
 */

import { Command } from 'commander';
import { UpdateCommand, SetCommand, CreateCommand, GitCommand } from '../commands';
import { Info } from '../info';
import { Helper } from '../helpers/Helper';
import { BadgeGenerator } from '../helpers/BadgeGenerator';
import { Updater } from '../updater/Updater';

Updater.checkUpdate();

const program = new Command();

program
    .version(Info.getProductVersion())
    .description('AppVersion Manager is a CLI tool whose purpose is to provide a unique manager of the version of you application.');

program
    .command('init')
    .description('Generates the appversion.json file.')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .option('-f, --force', 'Overwrites an existing appversion.json')
    .option('-v, --verbose', 'Shows Verbose Messages')
    .action((options) => {

        if (options.verbose) {
            Helper.verboseEnabled = true;
        }
        const directory = options.directory || undefined;

        const cmd = new CreateCommand(directory);
        if (options.force) {
            cmd.resetAppVersion();
        } else {
            cmd.initAppVersion();
        }
    });

program
    .command('reset')
    .description('Resets the appversion.json file to his default Values.')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .option('-v, --verbose', 'Shows Verbose Messages')
    .action((options) => {

        if (options.verbose) {
            Helper.verboseEnabled = true;
        }

        const directory = options.directory || undefined;

        const cmd = new CreateCommand(directory);
        cmd.resetAppVersion();
    });

program
    .command('update <action>')
    .description('Updates the <action> that can be (major|breaking)|(minor|feature)|(patch|fix)|build|commit')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .option('-t, --tag', 'Adds a tag with the version number to the git repo')
    .option('-v, --verbose', 'Shows Verbose Messages')
    .action((action, options) => {

        if (options.verbose) {
            Helper.verboseEnabled = true;
        }

        const directory: string = options.directory || undefined;
        action = action || 'build';

        const command = new UpdateCommand(directory);
        command.update(action);

        if (options.tag) {
            const git = new GitCommand(directory);
            git.addGitTag();
        }
    });

program
    .command('set-version <version>')
    .description('Sets a specific version number, the <version> must be x.y.z')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .option('-t, --tag', 'Adds a tag with the version number to the git repo')
    .option('-v, --verbose', 'Shows Verbose Messages')
    .action((version, options) => {

        if (options.verbose) {
            Helper.verboseEnabled = true;
        }

        const directory: string = options.directory || undefined;

        const command = new SetCommand(directory);
        command.setVersion(version);

        if (options.tag) {
            const git = new GitCommand(directory);
            git.addGitTag();
        }
    });

program
    .command('set-status <status>')
    .description('Sets a specific status, the <status> stage can be stable|rc|beta|alpha|prerelease and the number must be a number')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .option('-v, --verbose', 'Shows Verbose Messages')
    .action((status, options) => {

        if (options.verbose) {
            Helper.verboseEnabled = true;
        }

        const directory: string = options.directory || undefined;

        const command = new SetCommand(directory);
        command.setStatus(status);
    });

program
    .command('generate-badge <param>')
    .description('Generates the .md code of a shield badge with the version of your application, <param> can be version|status')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .option('-v, --verbose', 'Shows Verbose Messages')
    .action((param, options) => {

        if (options.verbose) {
            Helper.verboseEnabled = true;
        }

        const directory: string = options.directory || undefined;

        const generator = new BadgeGenerator(directory);
        if (param === 'status' || param === 'version') {
            const appVersion = Info.getAppVersionSync(directory);
            if (appVersion) {
                if (param === 'status') {
                    generator.generateStatusBadge(appVersion);
                } else if (param === 'version') {
                    generator.generateVersionBadge(appVersion);
                }
                Helper.info('Copy generated Badges to your Markdown Files, defined in your appversion.json.');
            } else {
                Helper.error('Current appversion.json could not readed.');
            }
        } else {
            Helper.error('Please type "status" or "version".');
        }
    });

program
    .command('add-git-tag')
    .description('Adds a tag with the version number to the git repo.')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .option('-v, --verbose', 'Shows Verbose Messages')
    .action((options) => {

        if (options.verbose) {
            Helper.verboseEnabled = true;
        }

        const directory: string = options.directory || undefined;

        const command = new GitCommand(directory);
        command.addGitTag();
    });

if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exit();
}
program.parse(process.argv);
