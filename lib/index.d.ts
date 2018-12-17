import { IAppVersion } from './IAppVersion';
export declare function getVersion(): string;
export declare function getSchemaVersion(): string;
export declare function getAppVersionSync(directory?: string): IAppVersion | null;
export declare function getAppVersion(directory?: string): Promise<IAppVersion>;
export declare function composePatternSync(pattern: string): string;
export declare function composePattern(pattern: string): Promise<string>;
