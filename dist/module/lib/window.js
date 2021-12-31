"use strict";

exports.__esModule = true;
exports.buildChildWindowName = buildChildWindowName;
exports.getInitialParentPayload = getInitialParentPayload;
exports.getWindowRef = getWindowRef;
exports.isChildComponentWindow = isChildComponentWindow;
exports.updateChildWindowNameWithRef = updateChildWindowNameWithRef;

var _src = require("belter/src");

var _src2 = require("cross-domain-utils/src");

var _constants = require("../constants");

var _serialize = require("./serialize");

var _global = require("./global");

function getWindowByRef(windowRef) {
  if (windowRef.type === _constants.WINDOW_REFERENCE.OPENER) {
    return (0, _src.assertExists)('opener', (0, _src2.getOpener)(window));
  } else if (windowRef.type === _constants.WINDOW_REFERENCE.PARENT && typeof windowRef.distance === 'number') {
    return (0, _src.assertExists)('parent', (0, _src2.getNthParentFromTop)(window, windowRef.distance));
  } else if (windowRef.type === _constants.WINDOW_REFERENCE.GLOBAL && windowRef.uid && typeof windowRef.uid === 'string') {
    const {
      uid
    } = windowRef;
    const ancestor = (0, _src2.getAncestor)(window);

    if (!ancestor) {
      throw new Error(`Can not find ancestor window`);
    }

    for (const frame of (0, _src2.getAllFramesInWindow)(ancestor)) {
      if ((0, _src2.isSameDomain)(frame)) {
        const win = (0, _global.tryGlobal)(frame, global => global.windows && global.windows[uid]);

        if (win) {
          return win;
        }
      }
    }
  } else if (windowRef.type === _constants.WINDOW_REFERENCE.NAME) {
    const {
      name
    } = windowRef;
    return (0, _src.assertExists)('namedWindow', (0, _src2.findFrameByName)((0, _src.assertExists)('ancestor', (0, _src2.getAncestor)(window)), name));
  }

  throw new Error(`Unable to find ${windowRef.type} parent component window`);
}

function buildChildWindowName({
  name,
  serializedPayload
}) {
  return `__${_constants.ZOID}__${name}__${serializedPayload}__`;
}

function parseWindowName(windowName) {
  if (!windowName) {
    throw new Error(`No window name`);
  }

  const [, zoidcomp, name, serializedInitialPayload] = windowName.split('__');

  if (zoidcomp !== _constants.ZOID) {
    throw new Error(`Window not rendered by zoid - got ${zoidcomp}`);
  }

  if (!name) {
    throw new Error(`Expected component name`);
  }

  if (!serializedInitialPayload) {
    throw new Error(`Expected serialized payload ref`);
  }

  return {
    name,
    serializedInitialPayload
  };
}

const parseInitialParentPayload = (0, _src.memoize)(windowName => {
  const {
    serializedInitialPayload
  } = parseWindowName(windowName);
  const {
    data: payload,
    sender: parent,
    reference
  } = (0, _serialize.crossDomainDeserialize)({
    data: serializedInitialPayload,
    sender: {
      win: ({
        metaData: {
          windowRef
        }
      }) => getWindowByRef(windowRef)
    }
  });
  return {
    parent,
    payload,
    reference
  };
});

function getInitialParentPayload() {
  return parseInitialParentPayload(window.name);
}

function isChildComponentWindow(name) {
  try {
    return parseWindowName(window.name).name === name;
  } catch (err) {// pass
  }

  return false;
}

function getWindowRef(targetWindow, currentWindow = window) {
  if (targetWindow === (0, _src2.getParent)(currentWindow)) {
    return {
      type: _constants.WINDOW_REFERENCE.PARENT,
      distance: (0, _src2.getDistanceFromTop)(targetWindow)
    };
  }

  if (targetWindow === (0, _src2.getOpener)(currentWindow)) {
    return {
      type: _constants.WINDOW_REFERENCE.OPENER
    };
  }

  if ((0, _src2.isSameDomain)(targetWindow) && !(0, _src2.isTop)(targetWindow)) {
    const windowName = (0, _src2.assertSameDomain)(targetWindow).name;

    if (windowName) {
      return {
        type: _constants.WINDOW_REFERENCE.NAME,
        name: windowName
      };
    }
  }
}

function updateChildWindowNameWithRef({
  componentName,
  parentComponentWindow
}) {
  const {
    serializedInitialPayload
  } = parseWindowName(window.name);
  const {
    data,
    sender,
    reference,
    metaData
  } = (0, _serialize.crossDomainDeserialize)({
    data: serializedInitialPayload,
    sender: {
      win: parentComponentWindow
    },
    basic: true
  });

  if (reference.type === _serialize.REFERENCE_TYPE.UID || metaData.windowRef.type === _constants.WINDOW_REFERENCE.GLOBAL) {
    const windowRef = getWindowRef(parentComponentWindow);
    const {
      serializedData: serializedPayload
    } = (0, _serialize.crossDomainSerialize)({
      data,
      metaData: {
        windowRef
      },
      sender: {
        domain: sender.domain
      },
      receiver: {
        win: window,
        domain: (0, _src2.getDomain)()
      },
      basic: true
    });
    window.name = buildChildWindowName({
      name: componentName,
      serializedPayload
    });
  }
}