import { Helper } from './Helper';
import { IAppVersion } from './IAppVersion';
export declare class BadgeHelper extends Helper {
    constructor(directory?: string);
    createBadge(tag: string, updateMD?: boolean, previousAppVersion?: IAppVersion): void;
    private shieldUrl;
    private mdCode;
    private composeReadmeCode;
    private versionBadge;
    private statusBadge;
    private printReadme;
}
