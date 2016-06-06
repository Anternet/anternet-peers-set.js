# anternet-peers-set.js

[![build](https://img.shields.io/travis/Anternet/anternet-peers-set.js.svg?branch=master)](https://travis-ci.org/Anternet/anternet-peers-set.js)
[![npm](https://img.shields.io/npm/v/anternet-peers-set.svg)](https://npmjs.org/package/anternet-peers-set)
[![Join the chat at https://gitter.im/Anternet/anternet.js](https://badges.gitter.im/Anternet/anternet.js.svg)](https://gitter.im/Anternet/anternet.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm](https://img.shields.io/npm/l/anternet-peers-set.svg)](LICENSE)


[Anternet](https://www.npmjs.com/package/anternet) library for storing and sharing set of peers.

## Example

```js
const Anternet = require('anternet');
const Peer = require('anternet-peer');
const PeersSet = require('anternet-peers-set');

const address = '127.0.0.1';
const port = 12345;
const peer = new Peer(port, address);

const peersSet = new PeersSet();
peersSet.add(peer);

console.log(peersSet.has(peer)); // true
console.log(peersSet.size); // 1
       
// use with Anternet
const anternet = new Anternet();
PeersSet.extend(anternet);

// send peers on request
anternet.request(msgType, [peersSet], 123123, '127.0.0.1');

// send peers on response
anternet.response(rid, [peersSet], 123123, '127.0.0.1');
```

## License

[MIT License](LICENSE).
Copyright &copy; 2016 [Moshe Simantov](https://github.com/moshest)



