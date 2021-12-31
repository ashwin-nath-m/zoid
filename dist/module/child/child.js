"use strict";

exports.__esModule = true;
exports.childComponent = childComponent;

var _src = require("cross-domain-utils/src");

var _src2 = require("post-robot/src");

var _src3 = require("zalgo-promise/src");

var _src4 = require("belter/src");

var _lib = require("../lib");

var _constants = require("../constants");

var _props = require("./props");

/* eslint max-lines: 0 */
function checkParentDomain(allowedParentDomains, domain) {
  if (!(0, _src.matchDomain)(allowedParentDomains, domain)) {
    throw new Error(`Can not be rendered by domain: ${domain}`);
  }
}

function focus() {
  return _src3.ZalgoPromise.try(() => {
    window.focus();
  });
}

function destroy() {
  return _src3.ZalgoPromise.try(() => {
    window.close();
  });
}

function childComponent(options) {
  const {
    tag,
    propsDef,
    autoResize,
    allowedParentDomains
  } = options;
  const onPropHandlers = [];
  const {
    parent,
    payload
  } = (0, _lib.getInitialParentPayload)();
  const {
    win: parentComponentWindow,
    domain: parentDomain
  } = parent;
  let props;
  const exportsPromise = new _src3.ZalgoPromise();
  const {
    version,
    uid,
    exports: parentExports,
    context,
    props: initialProps
  } = payload;

  if (version !== __ZOID__.__VERSION__) {
    throw new Error(`Parent window has zoid version ${version}, child window has version ${__ZOID__.__VERSION__}`);
  }

  const {
    show,
    hide,
    close,
    onError,
    checkClose,
    export: parentExport,
    resize: parentResize,
    init: parentInit
  } = parentExports;

  const getParent = () => parentComponentWindow;

  const getParentDomain = () => parentDomain;

  const onProps = handler => {
    onPropHandlers.push(handler);
    return {
      cancel: () => {
        onPropHandlers.splice(onPropHandlers.indexOf(handler), 1);
      }
    };
  };

  const resize = ({
    width,
    height
  }) => {
    return parentResize.fireAndForget({
      width,
      height
    });
  };

  const xport = xports => {
    exportsPromise.resolve(xports);
    return parentExport(xports);
  };

  const getSiblings = ({
    anyParent
  } = {}) => {
    const result = [];
    const currentParent = props.parent;

    if (typeof anyParent === 'undefined') {
      anyParent = !currentParent;
    }

    if (!anyParent && !currentParent) {
      throw new Error(`No parent found for ${tag} child`);
    }

    for (const win of (0, _src.getAllFramesInWindow)(window)) {
      if (!(0, _src.isSameDomain)(win)) {
        continue;
      }

      const xprops = (0, _src.assertSameDomain)(win).xprops;

      if (!xprops || getParent() !== xprops.getParent()) {
        continue;
      }

      const winParent = xprops.parent;

      if (!anyParent && currentParent) {
        if (!winParent || winParent.uid !== currentParent.uid) {
          continue;
        }
      }

      const xports = (0, _lib.tryGlobal)(win, global => global.exports);
      result.push({
        props: xprops,
        exports: xports
      });
    }

    return result;
  };

  const getHelpers = () => {
    return {
      tag,
      show,
      hide,
      close,
      focus,
      onError,
      resize,
      getSiblings,
      onProps,
      getParent,
      getParentDomain,
      uid,
      export: xport
    };
  };

  const watchForClose = () => {
    window.addEventListener('beforeunload', () => {
      checkClose.fireAndForget();
    });
    window.addEventListener('unload', () => {
      checkClose.fireAndForget();
    });
    (0, _src.onCloseWindow)(parentComponentWindow, () => {
      destroy();
    });
  };

  const setProps = (newProps, origin, isUpdate = false) => {
    const helpers = getHelpers();
    const normalizedProps = (0, _props.normalizeChildProps)(parentComponentWindow, propsDef, newProps, origin, helpers, isUpdate);

    if (props) {
      (0, _src4.extend)(props, normalizedProps);
    } else {
      props = normalizedProps;
    }

    for (const handler of onPropHandlers) {
      handler(props);
    }
  };

  const getAutoResize = () => {
    const {
      width = false,
      height = false,
      element: elementRef = 'body'
    } = autoResize;
    return (0, _src4.elementReady)(elementRef).catch(_src4.noop).then(element => {
      return {
        width,
        height,
        element
      };
    });
  };

  const watchForResize = () => {
    return getAutoResize().then(({
      width,
      height,
      element
    }) => {
      if (!element || !width && !height || context === _constants.CONTEXT.POPUP) {
        return;
      }

      (0, _src4.onResize)(element, ({
        width: newWidth,
        height: newHeight
      }) => {
        resize({
          width: width ? newWidth : undefined,
          height: height ? newHeight : undefined
        });
      }, {
        width,
        height
      });
    });
  };

  const updateProps = newProps => {
    return _src3.ZalgoPromise.try(() => setProps(newProps, parentDomain, true));
  };

  const init = () => {
    return _src3.ZalgoPromise.try(() => {
      if ((0, _src.isSameDomain)(parentComponentWindow)) {
        (0, _lib.updateChildWindowNameWithRef)({
          componentName: options.name,
          parentComponentWindow
        });
      }

      (0, _lib.getGlobal)(window).exports = options.exports({
        getExports: () => exportsPromise
      });
      checkParentDomain(allowedParentDomains, parentDomain);
      (0, _src2.markWindowKnown)(parentComponentWindow);
      watchForClose();
      return parentInit({
        updateProps,
        close: destroy
      });
    }).then(() => {
      return watchForResize();
    }).catch(err => {
      onError(err);
    });
  };

  const getProps = () => {
    if (props) {
      return props;
    } else {
      setProps(initialProps, parentDomain);
      return props;
    }
  };

  return {
    init,
    getProps
  };
}