export declare class UpdateCommand {
    private directory?;
    private helper;
    private badgeHelper;
    constructor(directory?: string | undefined);
    update(action: string): void;
    private updateVersion;
    private updateBuild;
    private updateCommit;
}
