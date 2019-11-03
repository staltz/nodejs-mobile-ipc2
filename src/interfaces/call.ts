export interface IPCCall {
    id: number;
    fn: string;
    args?: any[];
}

export interface IPCCallResultOK {
    id: number;
    status: 'ok';
    data?: any;
}

export interface IPCCallResultError {
    id: number;
    status: 'error';
    error?: string;
}

export type IPCCallResult = IPCCallResultOK | IPCCallResultError;
export type IPCCallHandler = (...args: any[]) => any;
