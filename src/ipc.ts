import {
  IPCCallHandler,
  IPCCallResult,
  IPCCall,
  IPCCallResultError,
  IPCCallResultOK,
} from './interfaces/call';
import {IPCEventHandler, IPCEvent} from './interfaces/event';
import {IPCChannel} from './interfaces/channel';

type Resolver = (value?: any) => void;
type Rejecter = (reason?: any) => void;

export class NodejsMobileIPC {
  private callHandlers = new Map<string, IPCCallHandler>();
  private eventHandlers = new Map<string, IPCEventHandler[]>();
  private pendingCalls = new Map<number, [Resolver, Rejecter]>();

  constructor(private channel: IPCChannel) {
    channel.on('ipc:call-result', this.onCallResult.bind(this));
    channel.on('ipc:call', this.onCall.bind(this));
    channel.on('ipc:event', this.onEvent.bind(this));
  }

  private onCallResult(result: IPCCallResult) {
    if (!this.pendingCalls.has(result.id)) {
      return;
    }
    const call = this.pendingCalls.get(result.id);
    this.pendingCalls.delete(result.id);
    if (result.status === 'ok') {
      call[0](result.data);
    } else {
      call[1](result.error);
    }
  }

  private onEvent({event, args}: IPCEvent) {
    const handlers = this.eventHandlers.get(event);
    if (handlers === undefined) {
      return;
    }
    for (const handler of handlers) {
      handler(...args);
    }
  }

  private async onCall({id, fn, args}: IPCCall) {
    if (!this.callHandlers.has(fn)) {
      const result: IPCCallResultError = {
        id,
        status: 'error',
        error: `Function ${fn} does not exist!`,
      };
      this.channel.post('ipc:call-result', result);
      return;
    }
    try {
      const data = await this.callHandlers.get(fn)(...args);
      const result: IPCCallResultOK = {
        id,
        status: 'ok',
        data,
      };
      this.channel.post('ipc:call-result', result);
    } catch (e) {
      const result: IPCCallResultError = {
        id,
        status: 'error',
        error:
          e instanceof Error
            ? e.message
            : typeof e === 'string'
            ? e
            : 'Unknown Error',
      };
      this.channel.post('ipc:call-result', result);
    }
  }

  call(fn: string, ...args: any[]): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const id = this.generateID();
      this.pendingCalls.set(id, [resolve, reject]);
      const call: IPCCall = {
        id,
        fn,
        args,
      };
      this.channel.post('ipc:call', call);
    });
  }

  emit(event: string, ...args: any[]) {
    const e: IPCEvent = {
      event,
      args,
    };
    this.channel.post('ipc:event', e);
  }

  register(fn: string, handler: IPCCallHandler) {
    this.callHandlers.set(fn, handler);
  }

  on(event: string, handler: IPCEventHandler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    const handlers = this.eventHandlers.get(event);
    handlers.push(handler);
  }

  private generateID() {
    let id: number;
    do {
      id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    } while (this.pendingCalls.has(id));
    return id;
  }
}
