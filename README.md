# nodejs-mobile-ipc2

_An abstraction for nodejs-mobile-cordova and nodejs-mobile-react-native channels that allows you to call functions on the other side and retrieve their results._

## Installation

    npm i nodejs-mobile-ipc2

## Usage

Create a new NodejsMobileIPC instance:

    const ipc = new NodejsMobileIPC(channel);

`channel` can be either `rnBridge.channel` (in the Node.js project) or `nodejs.channel` (in the React Native app).

### Provide and call functions

To provide a function for the other side of the channel use the `register` method:

    ipc.register('myFunction', (param) => {
      return 'You send: ' + param;
    });

Then, the other side of the channel can call that function and retrieve its return value by using the `call` method:

    const result = await ipc.call('myFunction', 'TEST'); // result is 'You send: TEST'

NOTE: For each function name there can only be one handler function registered.

### Listen to events

Event handlers can be registered using the `on` method.

    ipc.on('myEvent', (param1, param2) => {
      // Do something here, but do not return a value.
    });

They are triggered using the `emit` method on the other side:

    ipc.emit('myEvent', 'TEST1', 'TEST2');

Unlike `call`, `emit` will not return a value!

NOTE: In contrast to functions, there can be multiple handler registered for an event.


## Example: Node.js project

    const rnBridge = require('rn-bridge');
    const NodejsMobileIPC = require('nodejs-mobile-ipc2').NodejsMobileIPC;

    const ipc = new NodejsMobileIPC(rnBridge.channel);
    ipc.register('myFunction', (param) => {
      return 'You send: ' + param;
    });


## Example: React Native app

    import { NodejsMobileIPC } from 'nodejs-mobile-ipc2';
    const ipc = new NodejsMobileIPC(nodejs.channel);

    (async () => {
      try {
        const result = await ipc.call('myFunction', 'TEST');
        console.log(result); // prints 'You send: TEST'
      } catch (e) {
        console.error('Failed to call');
      }
    })();