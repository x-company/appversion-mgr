/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 * @Script: UpdateCommand.spec.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2018-12-15 00:34:02
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2018-12-17 12:32:00
 * @Description: This is description.
 */


import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { UpdateCommand } from '../../lib/UpdateCommand';
import { IAppVersion } from '../../lib/IAppVersion';
import { Helper } from '../../lib/Helper';

describe('Testing Update Command', () => {

    let expected: IAppVersion;
    let helper: Helper;
    let cmd: UpdateCommand;

    const JSON_FILE = path.join(__dirname, 'appversion.json');


    beforeEach(() => {
        // arrange
        if (fs.existsSync(JSON_FILE)) {
            fs.unlinkSync(JSON_FILE);
        }

        helper = new Helper(__dirname);
        expected = helper.createEmptyAppVersion();
        helper.writeJson(expected);

        cmd = new UpdateCommand(__dirname);
    });

    it('Testing major', () => {

        // act
        cmd.update('major');
        const actual = helper.readJson();

        // assert
        expect(actual).not.toBeNull();
        if (actual) {
            expect(actual.version.major).toEqual(expected.version.major + 1);
            expect(actual.version.minor).toEqual(0);
            expect(actual.version.patch).toEqual(0);

            expect(actual.build).not.toBeNull();
            if (actual.build) {
                expect(actual.build.number).toEqual(0);
            }
        }
    });

    it('Testing minor', () => {
        // act
        cmd.update('minor');
        const actual = helper.readJson();

        // assert
        expect(actual).not.toBeNull();
        if (actual) {
            expect(actual.version.major).toEqual(expected.version.major);
            expect(actual.version.minor).toEqual(expected.version.minor + 1);
            expect(actual.version.patch).toEqual(0);

            expect(actual.build).not.toBeNull();
            if (actual.build) {
                expect(actual.build.number).toEqual(0);
            }
        }
    });

    it('Testing patch', () => {

        // act
        cmd.update('patch');
        const actual = helper.readJson();

        // assert
        expect(actual).not.toBeNull();
        if (actual) {
            expect(actual.version.major).toEqual(expected.version.major);
            expect(actual.version.minor).toEqual(expected.version.minor);
            expect(actual.version.patch).toEqual(expected.version.patch + 1);

            expect(actual.build).not.toBeNull();
            if (actual.build) {
                expect(actual.build.number).toEqual(0);
            }
        }
    });

    it('Testing build', () => {

        // act
        cmd.update('build');
        const actual = helper.readJson();

        // assert
        expect(actual).not.toBeNull();
        if (actual) {
            expect(actual.build).not.toBeNull();
            if (actual.build && expected && expected.build) {
                expect(actual.build.number).toEqual(expected.build.number + 1);
                expect(actual.build.total).toEqual(expected.build.total + 1);
            }
        }
    });

    it('Testing commit', () => {

        // act
        cmd.update('commit');
        const actual = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));

        // assert
        exec('git log --oneline', (err, stdout) => {
            if (err) {
                expect(actual.commit).toBeNull();
            } else {
                expect(actual.commit).toEqual(stdout.substring(0, 7));
            }
        });
    });
});
