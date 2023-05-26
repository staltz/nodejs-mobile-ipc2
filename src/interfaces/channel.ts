export interface IPCChannel {
  on(event: string, clb: (message: any) => void): void;
  post(event: string, message: any): void;
}
