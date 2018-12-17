export declare class SetCommand {
    private helper;
    private badgeHelper;
    constructor(directory?: string);
    setVersion(version: string): null | undefined;
    setStatus(status: string): null | undefined;
}
