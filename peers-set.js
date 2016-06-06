const Anternet = require('anternet');
const Peer = require('anternet-peer');

const IPV4_PEER_LENGTH = 6;
const IPV6_PEER_LENGTH = 18;

// allowed values: 0..127
const PARSER_REG_PEERS_SET = 102;

class PeersSet extends Map {

  constructor(iterator) {
    super();

    if (iterator) {
      for (const peer of iterator) {
        this.add(peer);
      }
    }
  }

  static extend(anternet) {
    if (!(anternet instanceof Anternet)) {
      throw new Error('Invalid instance; Anternet instance expected');
    }

    const type = (anternet.type === 'udp6' ? 'IPv6' : 'IPv4');

    anternet.register(PARSER_REG_PEERS_SET, this,
        peersSet => peersSet.toBuffer(),
        buf => this.fromBuffer(buf, type)
    );
  }

  static fromBuffer(buffer, type) {
    const peerLength = (type === 'IPv6' ? IPV6_PEER_LENGTH : IPV4_PEER_LENGTH);
    if (buffer.length % peerLength !== 0) throw new Error('Invalid buffer length');

    const peers = [];
    for (let pos = 0, end = peerLength; pos < buffer.length; pos = end, end += peerLength) {
      peers.push(Peer.fromBuffer(buffer.slice(pos, end)));
    }

    return new this(peers);
  }

  toBuffer() {
    const buffers = [];
    let len = 0;

    this.forEach(peer => {
      const buffer = peer.toBuffer();
      buffers.push(buffer);
      len += buffer.length;
    });

    return Buffer.concat(buffers, len);
  }

  add(value) {
    if (!(value instanceof Peer)) throw new Error('Expect value to be instance of Peer');

    this.set(value.key, value);
    return this;
  }

  delete(value) {
    if (!(value instanceof Peer)) throw new Error('Expect value to be instance of Peer');

    return super.delete(value.key);
  }

  has(value) {
    if (!(value instanceof Peer)) throw new Error('Expect value to be instance of Peer');

    return super.has(value.key);
  }

  slice(start, end) {
    const sliceSet = new this.constructor();
    const it = this.values();

    if (start >= 0) {
      for (let i = 0; i < start; i++) it.next();
    } else {
      for (let i = this.size + start; i > 0; i--) it.next();
    }

    if (end != null) {
      for (let pos = start; pos < end; pos++) {
        const item = it.next();
        if (item.done) break;

        sliceSet.add(item.value);
      }
    } else {
      for (let item = it.next(); !item.done; item = it.next()) {
        sliceSet.add(item.value);
      }
    }

    return sliceSet;
  }
}

module.exports = PeersSet;
