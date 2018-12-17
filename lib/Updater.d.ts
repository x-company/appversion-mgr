import { IAppVersion } from './IAppVersion';
export declare class Updater {
    updateAppversion(appVersion: any, currentVersion: string): IAppVersion;
    private checkUpdate;
}
