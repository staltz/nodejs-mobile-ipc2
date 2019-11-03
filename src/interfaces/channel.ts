export interface IPCChannel {
    on(event: string, clb: (message: any) => void);
    post(event: string, message: any);
}
