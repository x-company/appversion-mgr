export interface IAppVersion {
    version: IVersion;
    status?: IStatus;
    build?: IBuild;
    commit?: string | null;
    config?: IConfig;
}
export interface IVersion {
    major: number;
    minor: number;
    patch: number;
}
interface IStatus {
    stage: string | null;
    number: number;
}
interface IBuild {
    date: Date | null;
    number: number;
    total: number;
}
interface IConfig {
    appversion: string;
    markdown: string[];
    json: string[];
    ignore: string[];
}
export {};
