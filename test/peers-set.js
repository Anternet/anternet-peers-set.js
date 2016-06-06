const assert = require('assert');
const Peer = require('anternet-peer');
const PeersSet = require('../peers-set');
const { describe, it } = global;

describe('PeersSet', () => {
  describe('.constructor', () => {
    it('should create empty set', () => {
      const peersSet = new PeersSet();

      assert(peersSet instanceof PeersSet);
      assert.equal(peersSet.size, 0);
    });

    it('should create from array', () => {
      const peers = [
        new Peer(123, '127.0.0.1'),
        new Peer(124, '127.0.0.1'),
      ];

      const peersSet = new PeersSet(peers);

      assert(peersSet instanceof PeersSet);
      assert.equal(peersSet.size, peers.length);

      assert.equal(peersSet.has(peers[0]), true);
      assert.equal(peersSet.has(peers[1]), true);

      assert.equal(peersSet.has(new Peer(peers[0].port, peers[0].address)), true);
      assert.equal(peersSet.has(new Peer(8888, peers[0].address)), false);
    });
  });

  describe('.fromBuffer()', () => {
    it('should create from IPv4 buffer', () => {
      const peers = [
        new Peer(123, '127.0.0.1'),
        new Peer(124, '127.0.0.1'),
      ];

      const buffer = Buffer.concat(peers.map(peer => peer.toBuffer()));

      const peersSet = PeersSet.fromBuffer(buffer);

      assert(peersSet instanceof PeersSet);
      assert.equal(peersSet.size, peers.length);

      assert.equal(peersSet.has(peers[0]), true);
      assert.equal(peersSet.has(peers[1]), true);

      assert(buffer.equals(peersSet.toBuffer()));
    });

    it('should create from IPv6 buffer', () => {
      const peers = [
        new Peer(123, '2001:db8:85a3::8a2e:370:7334'),
        new Peer(124, '2001:0db8:85a3:0000:0000:8a2e:0371:7334'),
      ];

      const buffer = Buffer.concat(peers.map(peer => peer.toBuffer()));

      const peersSet = PeersSet.fromBuffer(buffer, 'IPv6');

      assert(peersSet instanceof PeersSet);
      assert.equal(peersSet.size, peers.length);

      assert.equal(peersSet.has(peers[0]), true);
      assert.equal(peersSet.has(peers[1]), true);

      assert(buffer.equals(peersSet.toBuffer()));
    });
  });

  describe('instance', () => {
    describe('.size', () => {
      it('should update on add', () => {
        const peersSet = new PeersSet();
        assert.equal(peersSet.size, 0);

        peersSet.add(new Peer(12345, '127.0.0.1'));
        assert.equal(peersSet.size, 1);
      });

      it('should not update on re-add', () => {
        const peersSet = new PeersSet();
        assert.equal(peersSet.size, 0);

        peersSet.add(new Peer(12345, '127.0.0.1'));
        assert.equal(peersSet.size, 1);

        peersSet.add(new Peer(12345, '127.0.0.1'));
        assert.equal(peersSet.size, 1);
      });

      it('should not update on delete', () => {
        const peersSet = new PeersSet();
        assert.equal(peersSet.size, 0);

        peersSet.add(new Peer(12345, '127.0.0.1'));
        assert.equal(peersSet.size, 1);

        peersSet.delete(new Peer(12345, '127.0.0.1'));
        assert.equal(peersSet.size, 0);
      });
    });

    describe('.add()', () => {
      it('should add peer', () => {
        const peersSet = new PeersSet();
        assert.equal(peersSet.size, 0);

        peersSet.add(new Peer(12345, '127.0.0.1'));
        assert.equal(peersSet.size, 1);
        assert.equal(peersSet.has(new Peer(12345, '127.0.0.1')), true);
      });

      it('should not re-add peer', () => {
        const peersSet = new PeersSet();
        assert.equal(peersSet.size, 0);

        peersSet.add(new Peer(12345, '127.0.0.1'));
        assert.equal(peersSet.size, 1);
        assert.equal(peersSet.has(new Peer(12345, '127.0.0.1')), true);

        peersSet.add(new Peer(12345, '127.0.0.1'));
        assert.equal(peersSet.size, 1);
      });
    });

    describe('.delete()', () => {
      it('should delete peer', () => {
        const peersSet = new PeersSet();
        assert.equal(peersSet.size, 0);

        peersSet.add(new Peer(12345, '127.0.0.1'));
        assert.equal(peersSet.size, 1);
        assert.equal(peersSet.has(new Peer(12345, '127.0.0.1')), true);

        peersSet.add(new Peer(123123, '127.0.0.1'));
        assert.equal(peersSet.size, 2);
        assert.equal(peersSet.has(new Peer(123123, '127.0.0.1')), true);

        peersSet.delete(new Peer(12345, '127.0.0.1'));
        assert.equal(peersSet.size, 1);

        assert.equal(peersSet.has(new Peer(12345, '127.0.0.1')), false);
        assert.equal(peersSet.has(new Peer(123123, '127.0.0.1')), true);
      });
    });

    describe('.has()', () => {
      it('should works on same peer', () => {
        const peer = new Peer(12345, '127.0.0.1');
        const peersSet = new PeersSet([peer]);

        assert.equal(peersSet.has(peer), true);
      });

      it('should works on equals peers', () => {
        const peer = new Peer(12345, '127.0.0.1');
        const peersSet = new PeersSet([peer]);

        assert.equal(peersSet.has(new Peer(peer.port, peer.address)), true);
      });

      it('should not works on different peers', () => {
        const peer = new Peer(12345, '127.0.0.1');
        const peersSet = new PeersSet([peer]);

        assert.equal(peersSet.has(new Peer(123123, peer.address)), false);
      });
    });

    describe('.get()', () => {
      it('should return the same peer', () => {
        const peer = new Peer(12345, '127.0.0.1');
        const peersSet = new PeersSet([peer]);

        assert.strictEqual(peersSet.get(peer), peer);
      });
    });

    describe('.toBuffer()', () => {
      it('should create from IPv4', () => {
        const peer = new Peer(15921, '83.54.192.20');
        const peerSet = new PeersSet([peer]);

        const buffer = peerSet.toBuffer();
        assert(buffer instanceof Buffer);

        assert(peer.toBuffer().equals(buffer));
      });

      it('should create from IPv6', () => {
        const peer = new Peer(15921, '2001:0db8:85a3:0000:0000:8a2e:0370:7334');
        const peerSet = new PeersSet([peer]);

        const buffer = peerSet.toBuffer();
        assert(buffer instanceof Buffer);

        assert(peer.toBuffer().equals(buffer));
      });

      it('should create from multiple peers', () => {
        const peers = [
          new Peer(15921, '83.54.192.20'),
          new Peer(15922, '83.54.192.21'),
          new Peer(15923, '83.55.192.20'),
        ];

        const peerSet = new PeersSet(peers);

        const buffer = peerSet.toBuffer();
        assert(buffer instanceof Buffer);

        const peersSet2 = PeersSet.fromBuffer(buffer);
        assert(peersSet2 instanceof PeersSet);

        assert.equal(peersSet2.size, peers.length);
        peers.forEach(peer => {
          assert.equal(peersSet2.has(peer), true);
        });
      });
    });

    describe('.slice()', () => {
      it('should slice correctly on the beginning', () => {
        const peers = [
          new Peer(101, '127.0.0.1'),
          new Peer(102, '127.0.0.1'),
          new Peer(103, '127.0.0.1'),
          new Peer(104, '127.0.0.1'),
          new Peer(105, '127.0.0.1'),
        ];

        const peersSet = new PeersSet(peers);

        const start = 0;
        const end = 3;
        const sliced = peersSet.slice(start, end);

        assert.equal(sliced.size, end - start);

        let i = start;
        sliced.forEach(peer => {
          assert(peers[i++].equals(peer));
        });
      });

      it('should slice correctly on the middle', () => {
        const peers = [
          new Peer(101, '127.0.0.1'),
          new Peer(102, '127.0.0.1'),
          new Peer(103, '127.0.0.1'),
          new Peer(104, '127.0.0.1'),
          new Peer(105, '127.0.0.1'),
        ];

        const peersSet = new PeersSet(peers);

        const start = 1;
        const end = 3;
        const sliced = peersSet.slice(start, end);

        assert.equal(sliced.size, end - start);

        let i = start;
        sliced.forEach(peer => {
          assert(peers[i++].equals(peer));
        });
      });

      it('should slice correctly on the end', () => {
        const peers = [
          new Peer(101, '127.0.0.1'),
          new Peer(102, '127.0.0.1'),
          new Peer(103, '127.0.0.1'),
          new Peer(104, '127.0.0.1'),
          new Peer(105, '127.0.0.1'),
        ];

        const peersSet = new PeersSet(peers);

        const start = 2;
        const end = 3;
        const sliced = peersSet.slice(start, end);

        assert.equal(sliced.size, end - start);

        let i = start;
        sliced.forEach(peer => {
          assert(peers[i++].equals(peer));
        });
      });

      it('should slice correctly from the middle', () => {
        const peers = [
          new Peer(101, '127.0.0.1'),
          new Peer(102, '127.0.0.1'),
          new Peer(103, '127.0.0.1'),
          new Peer(104, '127.0.0.1'),
          new Peer(105, '127.0.0.1'),
        ];

        const peersSet = new PeersSet(peers);

        const start = 2;
        const sliced = peersSet.slice(start);

        assert.equal(sliced.size, peers.length - start);

        let i = start;
        sliced.forEach(peer => {
          assert(peers[i++].equals(peer));
        });
      });

      it('should slice correctly from the end', () => {
        const peers = [
          new Peer(101, '127.0.0.1'),
          new Peer(102, '127.0.0.1'),
          new Peer(103, '127.0.0.1'),
          new Peer(104, '127.0.0.1'),
          new Peer(105, '127.0.0.1'),
        ];

        const peersSet = new PeersSet(peers);

        const start = -2;
        const sliced = peersSet.slice(start);

        assert.equal(sliced.size, -start);

        let i = peers.length + start;
        sliced.forEach(peer => {
          assert(peers[i++].equals(peer));
        });
      });
    });
  });
});
