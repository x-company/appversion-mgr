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
 * @Last Modified At: 2018-12-15 03:17:03
 * @Description: This is description.
 */

import * as program from 'commander';
import * as handler from '../lib';
import * as update from '../lib/update';




program
    .version('0.1.0')
    .description('');

program
    .command('update <action>')
    .option('-d, --directory', 'Specifies the directory where appvmgr should look for the appversion.json')
    .description('Updates the <action> that can be (major|breaking)|(minor|feature)|(patch|fix)|build|commit')
    .action((action, options) => {

        const directory = options.directory || __dirname;
        action = action || 'commit';

        update(directory, param);
    });

if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exit();
}
program.parse(process.argv);
