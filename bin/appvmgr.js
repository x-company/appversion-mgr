#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const lib_1 = require("../lib/");
const UpdateCommand_1 = require("../lib/UpdateCommand");
const SetCommand_1 = require("../lib/SetCommand");
const Helper_1 = require("../lib/Helper");
const BadgeHelper_1 = require("../lib/BadgeHelper");
const program = new commander_1.Command();
program
    .version(lib_1.getVersion(), '-v, --version')
    .description('AppVersion Manager is a CLI tool whose purpose is to provide a unique manager of the version of you application.');
program
    .command('init')
    .description('Generates the appversion.json file.')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .action((options) => {
    const directory = options.directory || undefined;
    const helper = new Helper_1.Helper(directory);
    const emptyAppVersion = helper.createEmptyAppVersion();
    helper.writeJson(emptyAppVersion);
});
program
    .command('update <action>')
    .description('Updates the <action> that can be (major|breaking)|(minor|feature)|(patch|fix)|build|commit')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .action((action, options) => {
    const directory = options.directory || __dirname;
    action = action || 'commit';
    const command = new UpdateCommand_1.UpdateCommand(directory);
    command.update(action);
});
program
    .command('set-version <version>')
    .description('Sets a specific version number, the <version> must be x.y.z')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .action((version, options) => {
    const directory = options.directory || __dirname;
    const command = new SetCommand_1.SetCommand(directory);
    command.setVersion(version);
});
program
    .command('set-status <status>')
    .description('Sets a specific status, the <status> stage can be stable|rc|beta|alpha and the number must be a number')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .action((status, options) => {
    const directory = options.directory || __dirname;
    const command = new SetCommand_1.SetCommand(directory);
    command.setStatus(status);
});
program
    .command('generate-badge <param>')
    .description('Generates the .md code of a shield badge with the version of your application, <param> can be version|status')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .action((param, options) => {
    const directory = options.directory || __dirname;
    const command = new BadgeHelper_1.BadgeHelper(directory);
    command.createBadge(param);
});
program
    .command('add-git-tag')
    .description('Adds a tag with the version number to the git repo.')
    .option('-d, --directory <directory>', 'Specifies the directory where appvmgr should create the appversion.json')
    .action((options) => {
    const directory = options.directory || __dirname;
    const command = new Helper_1.Helper(directory);
    command.addGitTag();
});
if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exit();
}
program.parse(process.argv);
//# sourceMappingURL=appvmgr.js.map