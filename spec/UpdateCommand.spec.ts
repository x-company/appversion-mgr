/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 * @Script: UpdateCommand.spec.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Script: appvmgr.ts-15 00:34:02
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2019-08-31 13:39:22
 * @Description: This is description.
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2019-08-31 13:42:34
 */

import fs from 'fs';
import path from 'path';
import { UpdateCommand } from '../src/commands/UpdateCommand';
import { IAppVersion } from '../src/types/IAppVersion';
import { Helper } from '../src/helpers/Helper';
import { Info } from '../src/info/Info';

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
        const expected = Info.getDataSchemaAsObject();
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
