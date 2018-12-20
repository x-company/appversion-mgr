/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * @Script: Helper.ts Roland Breitschaft
 *
 * @Script: GitCommand.ts
 * @Author: Roland Breitschaft
 * @Last Modified By: Roland Breitschaftde
 * @Last Modified At: 2018-12-20 20:49:36
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2018-12-20 20:49:19
 * @Description: This is description.
 */

import { exec } from 'child_process';
import { Helper } from '../helpers/Helper';
import { Info } from '../info/Info';

export class GitCommand {

    private helper: Helper;

    constructor(directory?: string) {
        Helper.verbose('Init GitCommand');

        this.helper = new Helper(directory);
    }

    /**
     * Adds a tag with the version number to the git repo.
     *
     * @memberof GitCommand
     */
    public addGitTag() {
        const appVersion = this.helper.readJson();

        if (appVersion) {
            const schema = Info.getDataSchemaAsObject();

            let pattern = schema.git ? schema.git.tag : '';
            if (appVersion.git) {
                pattern = appVersion.git.tag;
            }
            const gittag = Info.composePatternSync(pattern, appVersion);
            exec(`git tag ${gittag}`, (error, stdout) => {
                if (error) {
                    if (error.message) {
                        Helper.error(error.message);
                    } else {
                        Helper.error('An unknown Error occured while Git Tag will added.');
                    }
                } else {
                    Helper.info(`Added Git tag '${gittag}'`);
                }
            });
        }
    }
}
