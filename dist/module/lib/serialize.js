"use strict";

exports.__esModule = true;
exports.REFERENCE_TYPE = void 0;
exports.basicDeserialize = basicDeserialize;
exports.basicSerialize = basicSerialize;
exports.cleanupRef = cleanupRef;
exports.crossDomainDeserialize = crossDomainDeserialize;
exports.crossDomainSerialize = crossDomainSerialize;
exports.getProxyObject = getProxyObject;
exports.getRawRef = getRawRef;
exports.getRefValue = getRefValue;
exports.getUIDRef = getUIDRef;
exports.getUIDRefStore = getUIDRefStore;

var _src = require("zalgo-promise/src");

var _src2 = require("post-robot/src");

var _src3 = require("belter/src");

var _global = require("./global");

function getProxyObject(obj) {
  return {
    get() {
      return _src.ZalgoPromise.try(() => {
        // $FlowFixMe[object-this-reference]
        if (this.source && this.source !== window) {
          throw new Error(`Can not call get on proxy object from a remote window`);
        }

        return obj;
      });
    }

  };
}

function basicSerialize(data) {
  return (0, _src3.base64encode)(JSON.stringify(data));
}

function basicDeserialize(serializedData) {
  return JSON.parse((0, _src3.base64decode)(serializedData));
}

const REFERENCE_TYPE = {
  UID: 'uid',
  RAW: 'raw'
};
exports.REFERENCE_TYPE = REFERENCE_TYPE;

function getUIDRefStore(win) {
  const global = (0, _global.getGlobal)(win);
  global.references = global.references || {};
  return global.references;
}

function getUIDRef(val) {
  const uid = (0, _src3.uniqueID)();
  const references = getUIDRefStore(window);
  references[uid] = val;
  return {
    type: REFERENCE_TYPE.UID,
    uid
  };
}

function getRawRef(val) {
  return {
    type: REFERENCE_TYPE.RAW,
    val
  };
}

function getRefValue(win, ref) {
  if (ref.type === REFERENCE_TYPE.RAW) {
    return ref.val;
  }

  if (ref.type === REFERENCE_TYPE.UID) {
    const references = getUIDRefStore(win);
    return references[ref.uid];
  }

  throw new Error(`Unsupported ref type: ${ref.type}`);
}

function cleanupRef(win, ref) {
  if (ref.type === REFERENCE_TYPE.UID) {
    const references = getUIDRefStore(win);
    delete references[ref.uid];
  }
}

function crossDomainSerialize({
  data,
  metaData,
  sender,
  receiver,
  passByReference = false,
  basic = false
}) {
  const proxyWin = (0, _src2.toProxyWindow)(receiver.win);
  const serializedMessage = basic ? JSON.stringify(data) : (0, _src2.serializeMessage)(proxyWin, receiver.domain, data);
  const reference = passByReference ? getUIDRef(serializedMessage) : getRawRef(serializedMessage);
  const message = {
    sender: {
      domain: sender.domain
    },
    metaData,
    reference
  };

  const cleanReference = () => {
    cleanupRef(window, reference);
  };

  return {
    serializedData: basicSerialize(message),
    cleanReference
  };
}

function crossDomainDeserialize({
  data,
  sender,
  basic = false
}) {
  const message = basicDeserialize(data);
  const {
    reference,
    metaData
  } = message;
  let win;

  if (typeof sender.win === 'function') {
    win = sender.win({
      metaData
    });
  } else {
    win = sender.win;
  }

  let domain;

  if (typeof sender.domain === 'function') {
    domain = sender.domain({
      metaData
    });
  } else if (typeof sender.domain === 'string') {
    domain = sender.domain;
  } else {
    domain = message.sender.domain;
  }

  const serializedData = getRefValue(win, reference);
  const deserializedData = basic ? JSON.parse(serializedData) : (0, _src2.deserializeMessage)(win, domain, serializedData);
  return {
    data: deserializedData,
    metaData,
    sender: {
      win,
      domain
    },
    reference
  };
}