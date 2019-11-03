export interface IPCEvent {
    event: string;
    args?: any[];
}

export type IPCEventHandler = (...args: any[]) => void;
