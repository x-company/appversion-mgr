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
 * @Last Modified At: 2018-12-18 21:54:51
 * @Description: This is description.
 */


import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { UpdateCommand } from '../lib/commands/UpdateCommand';
import { IAppVersion } from '../lib/types/IAppVersion';
import { Helper } from '../lib/helpers/Helper';

describe('Testing Update Command', () => {

    interface TestResult {
        actual?: IAppVersion;
        expected: IAppVersion;
    }

    const updateHelper = (action: string): TestResult => {

        const filePath = path.join(__dirname, action);
        const file = path.join(filePath, 'appversion.json');
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }

        const helper = new Helper(filePath);
        const expected = helper.createEmptyAppVersion();
        helper.writeJson(expected);

        const cmd = new UpdateCommand(filePath);
        cmd.update(action);

        const actual = helper.readJson();
        if (actual) {
            return {
                actual,
                expected,
            };
        } else {
            return {
                expected,
            };
        }
    };

    it('Testing major', () => {

        // act
        const result = updateHelper('major');
        const expected = result.expected;
        const actual = result.actual;

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
        const result = updateHelper('minor');
        const expected = result.expected;
        const actual = result.actual;


        // assert
        expect(actual).not.toBeNull();
        if (actual) {
            console.log('Actual', actual.version.major);
            console.log('Expected:', expected.version.major);

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
        const result = updateHelper('patch');
        const expected = result.expected;
        const actual = result.actual;

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
        const result = updateHelper('build');
        const expected = result.expected;
        const actual = result.actual;

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
});
