# nodejs-mobile-ipc

_An abstraction of nodejs-mobile-cordova channels that allows to call functions on the other side and retrieve their results._

## Installation

    npm i nodejs-mobile-ipc

## Usage

Create a new NodeCordovaIPC instance:

    const ipc = new NodeCordovaIPC(channel);

`channel` can be either `cordova.channel` (in nodejs app) or `nodejs.channel` (in cordova app).

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


## Example: nodejs app (here: Javascript)

    const cordova = require('cordova-bridge');
    const NodeCordovaIPC = require('nodejs-mobile-ipc').NodeCordovaIPC;

    const ipc = new NodeCordovaIPC(cordova.channel);
    // Register function "myFunction", which can be called by cordova app.
    ipc.register('myFunction', (param) => {
        return 'You send: ' + param;
    });


## Example: cordova app (here: Typescript)

    import { NodeCordovaIPC } from 'nodejs-mobile-ipc';
    const ipc = new NodeCordovaIPC(nodejs.channel);

    (async () => {
        try {
            const result = await ipc.call('myFunction', 'TEST'); 
            console.log(result); // prints 'You send: TEST'
        } catch (e) {
            console.error('Failed to call');
        }
    })();