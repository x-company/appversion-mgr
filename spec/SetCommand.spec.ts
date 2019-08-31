import path from 'path';
import fs from 'fs';
import { Helper } from '../src/helpers/Helper';
import { SetCommand } from '../src/commands/SetCommand';
import { Info } from '../src/info/Info';


describe('Testing Set Command', () => {

    let helper: Helper;
    let cmd: SetCommand;

    const JSON_FILE = path.join(__dirname, 'appversion.json');


    beforeEach(() => {

        if (fs.existsSync(JSON_FILE)) {
            fs.unlinkSync(JSON_FILE);
        }

        helper = new Helper(__dirname);
        const expected = Info.getDataSchemaAsObject();
        helper.writeJson(expected);

        cmd = new SetCommand(__dirname);
    });

    it('Testing set-version', () => {

        // act
        cmd.setVersion('1.2.3');
        const actual = helper.readJson();

        // assert
        if (actual) {
            expect(actual.version.major).toEqual(1);
            expect(actual.version.minor).toEqual(2);
            expect(actual.version.patch).toEqual(3);

            if (actual.build) {
                expect(actual.build.number).toEqual(0);
            }
        }

    });

    it('Testing set-status stable', () => {
        // arrange
        const expected = 'stable';

        // Act
        cmd.setStatus(expected);
        const actual = helper.readJson();

        // assert
        if (actual && actual.status) {
            expect(actual.status.stage).toEqual(expected);
            expect(actual.status.number).toEqual(0);
        }
    });

    it('Testing set-status RC.1', () => {
        // arrange
        const stage = 'RC';
        const stageNumber = 1;

        // Act
        cmd.setStatus(`${stage}.${stageNumber}`);
        const actual = helper.readJson();

        // assert
        if (actual && actual.status) {
            expect(actual.status.stage).toEqual(stage);
            expect(actual.status.number).toEqual(stageNumber);
        }
    });

    it('Testing set-status beta.2', () => {
        // arrange
        const stage = 'beta';
        const stageNumber = 2;

        // Act
        cmd.setStatus(`${stage}.${stageNumber}`);
        const actual = helper.readJson();

        // assert
        if (actual && actual.status) {
            expect(actual.status.stage).toEqual(stage);
            expect(actual.status.number).toEqual(stageNumber);
        }
    });

    it('Testing set-status Alpha.0', () => {
        // arrange
        const stage = 'Alpha';
        const stageNumber = 0;

        // Act
        cmd.setStatus(`${stage}.${stageNumber}`);
        const actual = helper.readJson();

        // assert
        if (actual && actual.status) {
            expect(actual.status.stage).toEqual(stage);
            expect(actual.status.number).toEqual(stageNumber);
        }
    });

});
