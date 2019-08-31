import { Info } from '../src/info/Info';


describe('Testing Info Command', () => {

    it('Testing Info getDataSchemaAsObject', () => {

        // arrange
        const badgeUrl = 'https://img.shields.io/badge';
        const projectUrl = '#define-a-url';
        const name = 'AppVersionManager';

        // act
        const actual = Info.getDataSchemaAsObject();

        // assert
        if (actual) {
            expect(actual).not.toBeNull();
            expect(actual.version.badge).toContain(badgeUrl);
            expect(actual.version.badge).toContain(projectUrl);
            expect(actual.version.badge).toContain(name);
        }
    });

    it('Testing Info getDataSchemaAsObject', () => {

        // arrange
        const badgeUrl = 'https://my.special.url.com/sign';
        const projectUrl = 'github.com/a/repo/url.git';
        const name = 'MyAmazingProject';

        // act
        const actual = Info.getDataSchemaAsObject(badgeUrl, projectUrl, name);

        // assert
        if (actual) {
            expect(actual).not.toBeNull();
            expect(actual.version.badge).toContain(badgeUrl);
            expect(actual.version.badge).toContain(projectUrl);
            expect(actual.version.badge).toContain(name);
        }
    });
});
