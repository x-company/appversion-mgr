import { IAppVersion } from './IAppVersion';
export declare class Helper {
    private PATH;
    private FILENAME;
    private FILEPATH;
    constructor(directory?: string);
    readJson(filePath?: string): IAppVersion | null;
    appendBadgeToMD(markdownFile: string, newBadge: string, oldBadge: string): void;
    writeJson(appVersion: IAppVersion, message?: string): void;
    writeOtherJson(appVersion: IAppVersion): void;
    createEmptyAppVersion(): IAppVersion;
    addGitTag(): void;
    error(message: string, header?: string): void;
    info(message: string, header?: string): void;
    private consoleOutput;
    private getPackageJsonVersion;
}
