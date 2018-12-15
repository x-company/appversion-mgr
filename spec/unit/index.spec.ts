/**
 * Copyright (c) 2018 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 * @Script: index.spec.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2018-12-15 00:34:02
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2018-12-15 14:27:43
 * @Description: This is description.
 */


import { exec, execSync } from 'child_process';
import fs from 'fs';

const JSON_FILE = 'appversion.json';

describe('Testing update', () => {
    // arrange
    const expected = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
    const readme = fs.readFileSync('README.md', 'utf8');

    it('Testing build', () => {

        // act
        execSync('./bin/appvmgr.js update build');
        const actual = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));

        // assert
        expect(actual.build.number).toEqual(expected.build.number + 1);
        expect(actual.build.total).toEqual(expected.build.total + 1);
        expect(!!Date.parse(actual.build.date)).toBeTruthy();
    });

    it('Testing patch', () => {

        // act
        execSync('./bin/appvmgr.js update patch');
        const actual = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));

        // assert
        expect(actual.version.patch).toEqual(expected.version.patch + 1);
        expect(actual.build.number).toEqual(0);
    });

    it('Testing minor', () => {

        // act
        execSync('./bin/appvmgr.js update minor');
        const actual = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));

        // assert
        expect(actual.version.minor).toEqual(expected.version.minor + 1);
        expect(actual.version.patch).toEqual(0);
        expect(actual.build.number).toEqual(0);
    });

    it('Testing major', () => {

        // act
        execSync('./bin/appvmgr.js update major');
        const actual = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));

        // assert
        expect(actual.version.major).toEqual(expected.version.major + 1);
        expect(actual.version.minor).toEqual(0 + 1);
        expect(actual.version.patch).toEqual(0);
        expect(actual.build.number).toEqual(0);
    });

    it('Testing commit', () => {

        // act
        execSync('./bin/appvmgr.js update commit');
        const actual = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));

        // assert
        exec('git log --oneline', function(err, stdout) {
            if (err) {
                expect(actual.commit).toBeNull();
            } else {
                expect(actual.commit).toEqual(stdout.substring(0, 7));
            }
        });
    });

    // Restore JSON_FILE to the original values.
    fs.writeFileSync(JSON_FILE, JSON.stringify(expected, null, 2) + '\n');
    fs.writeFileSync('README.md', readme);
});
