"use strict";

exports.__esModule = true;
exports.parentComponent = parentComponent;

var _src = require("post-robot/src");

var _src2 = require("cross-domain-utils/src");

var _src3 = require("zalgo-promise/src");

var _src4 = require("belter/src");

var _constants = require("../constants");

var _lib = require("../lib");

var _props = require("./props");

/* eslint max-lines: 0 */
function getDefaultProps() {
  // $FlowFixMe
  return {};
}

const getDefaultOverrides = () => {
  // $FlowFixMe
  return {};
};

function parentComponent({
  uid,
  options,
  overrides = getDefaultOverrides(),
  parentWin = window
}) {
  const {
    propsDef,
    containerTemplate,
    prerenderTemplate,
    tag,
    name,
    attributes,
    dimensions,
    autoResize,
    url,
    domain: domainMatch,
    validate,
    exports: xports
  } = options;
  const initPromise = new _src3.ZalgoPromise();
  const handledErrors = [];
  const clean = (0, _src4.cleanup)();
  const state = {};
  let internalState = {
    visible: true
  };
  const event = overrides.event ? overrides.event : (0, _src4.eventEmitter)();
  const props = overrides.props ? overrides.props : getDefaultProps();
  let currentProxyWin;
  let currentProxyContainer;
  let childComponent;
  let currentChildDomain;
  const onErrorOverride = overrides.onError;
  let getProxyContainerOverride = overrides.getProxyContainer;
  let showOverride = overrides.show;
  let hideOverride = overrides.hide;
  const closeOverride = overrides.close;
  let renderContainerOverride = overrides.renderContainer;
  let getProxyWindowOverride = overrides.getProxyWindow;
  let setProxyWinOverride = overrides.setProxyWin;
  let openFrameOverride = overrides.openFrame;
  let openPrerenderFrameOverride = overrides.openPrerenderFrame;
  let prerenderOverride = overrides.prerender;
  let openOverride = overrides.open;
  let openPrerenderOverride = overrides.openPrerender;
  let watchForUnloadOverride = overrides.watchForUnload;
  const getInternalStateOverride = overrides.getInternalState;
  const setInternalStateOverride = overrides.setInternalState;

  const getDimensions = () => {
    if (typeof dimensions === 'function') {
      return dimensions({
        props
      });
    }

    return dimensions;
  };

  const resolveInitPromise = () => {
    return _src3.ZalgoPromise.try(() => {
      if (overrides.resolveInitPromise) {
        return overrides.resolveInitPromise();
      }

      return initPromise.resolve();
    });
  };

  const rejectInitPromise = err => {
    return _src3.ZalgoPromise.try(() => {
      if (overrides.rejectInitPromise) {
        return overrides.rejectInitPromise(err);
      }

      return initPromise.reject(err);
    });
  };

  const getPropsForChild = initialChildDomain => {
    const result = {};

    for (const key of Object.keys(props)) {
      const prop = propsDef[key];

      if (prop && prop.sendToChild === false) {
        continue;
      }

      if (prop && prop.sameDomain && !(0, _src2.matchDomain)(initialChildDomain, (0, _src2.getDomain)(window))) {
        continue;
      }

      result[key] = props[key];
    } // $FlowFixMe


    return _src3.ZalgoPromise.hash(result);
  };

  const setupEvents = () => {
    event.on(_constants.EVENT.RENDER, () => props.onRender());
    event.on(_constants.EVENT.DISPLAY, () => props.onDisplay());
    event.on(_constants.EVENT.RENDERED, () => props.onRendered());
    event.on(_constants.EVENT.CLOSE, () => props.onClose());
    event.on(_constants.EVENT.DESTROY, () => props.onDestroy());
    event.on(_constants.EVENT.RESIZE, () => props.onResize());
    event.on(_constants.EVENT.FOCUS, () => props.onFocus());
    event.on(_constants.EVENT.PROPS, newProps => props.onProps(newProps));
    event.on(_constants.EVENT.ERROR, err => {
      if (props && props.onError) {
        return props.onError(err);
      } else {
        return rejectInitPromise(err).then(() => {
          setTimeout(() => {
            throw err;
          }, 1);
        });
      }
    });
    clean.register(event.reset);
  };

  const getInternalState = () => {
    return _src3.ZalgoPromise.try(() => {
      if (getInternalStateOverride) {
        return getInternalStateOverride();
      }

      return internalState;
    });
  };

  const setInternalState = newInternalState => {
    return _src3.ZalgoPromise.try(() => {
      if (setInternalStateOverride) {
        return setInternalStateOverride(newInternalState);
      }

      internalState = { ...internalState,
        ...newInternalState
      };
      return internalState;
    });
  };

  const getProxyWindow = () => {
    if (getProxyWindowOverride) {
      return getProxyWindowOverride();
    }

    return _src3.ZalgoPromise.try(() => {
      const windowProp = props.window;

      if (windowProp) {
        const proxyWin = (0, _src.toProxyWindow)(windowProp);
        clean.register(() => windowProp.close());
        return proxyWin;
      }

      return new _src.ProxyWindow({
        send: _src.send
      });
    });
  };

  const getProxyContainer = container => {
    if (getProxyContainerOverride) {
      return getProxyContainerOverride(container);
    }

    return _src3.ZalgoPromise.try(() => {
      return (0, _src4.elementReady)(container);
    }).then(containerElement => {
      if ((0, _src4.isShadowElement)(containerElement)) {
        containerElement = (0, _src4.insertShadowSlot)(containerElement);
      }

      return (0, _lib.getProxyObject)(containerElement);
    });
  };

  const setProxyWin = proxyWin => {
    if (setProxyWinOverride) {
      return setProxyWinOverride(proxyWin);
    }

    return _src3.ZalgoPromise.try(() => {
      currentProxyWin = proxyWin;
    });
  };

  const show = () => {
    if (showOverride) {
      return showOverride();
    }

    return _src3.ZalgoPromise.hash({
      setState: setInternalState({
        visible: true
      }),
      showElement: currentProxyContainer ? currentProxyContainer.get().then(_src4.showElement) : null
    }).then(_src4.noop);
  };

  const hide = () => {
    if (hideOverride) {
      return hideOverride();
    }

    return _src3.ZalgoPromise.hash({
      setState: setInternalState({
        visible: false
      }),
      showElement: currentProxyContainer ? currentProxyContainer.get().then(_src4.hideElement) : null
    }).then(_src4.noop);
  };

  const getUrl = () => {
    if (typeof url === 'function') {
      return url({
        props
      });
    }

    return url;
  };

  const getAttributes = () => {
    if (typeof attributes === 'function') {
      return attributes({
        props
      });
    }

    return attributes;
  };

  const buildQuery = () => {
    return (0, _props.serializeProps)(propsDef, props, _constants.METHOD.GET);
  };

  const buildBody = () => {
    return (0, _props.serializeProps)(propsDef, props, _constants.METHOD.POST);
  };

  const buildUrl = () => {
    return buildQuery().then(query => {
      return (0, _src4.extendUrl)((0, _src2.normalizeMockUrl)(getUrl()), {
        query
      });
    });
  };

  const getInitialChildDomain = () => {
    return (0, _src2.getDomainFromUrl)(getUrl());
  };

  const getDomainMatcher = () => {
    if (domainMatch) {
      return domainMatch;
    }

    return getInitialChildDomain();
  };

  const openFrame = (context, {
    windowName
  }) => {
    if (openFrameOverride) {
      return openFrameOverride(context, {
        windowName
      });
    }

    return _src3.ZalgoPromise.try(() => {
      if (context === _constants.CONTEXT.IFRAME && __ZOID__.__IFRAME_SUPPORT__) {
        // $FlowFixMe
        const attrs = {
          name: windowName,
          title: name,
          ...getAttributes().iframe
        };
        return (0, _lib.getProxyObject)((0, _src4.iframe)({
          attributes: attrs
        }));
      }
    });
  };

  const openPrerenderFrame = context => {
    if (openPrerenderFrameOverride) {
      return openPrerenderFrameOverride(context);
    }

    return _src3.ZalgoPromise.try(() => {
      if (context === _constants.CONTEXT.IFRAME && __ZOID__.__IFRAME_SUPPORT__) {
        // $FlowFixMe
        const attrs = {
          name: `__${_constants.ZOID}_prerender_frame__${name}_${(0, _src4.uniqueID)()}__`,
          title: `prerender__${name}`,
          ...getAttributes().iframe
        };
        return (0, _lib.getProxyObject)((0, _src4.iframe)({
          attributes: attrs
        }));
      }
    });
  };

  const openPrerender = (context, proxyWin, proxyPrerenderFrame) => {
    if (openPrerenderOverride) {
      return openPrerenderOverride(context, proxyWin, proxyPrerenderFrame);
    }

    return _src3.ZalgoPromise.try(() => {
      if (context === _constants.CONTEXT.IFRAME && __ZOID__.__IFRAME_SUPPORT__) {
        if (!proxyPrerenderFrame) {
          throw new Error(`Expected proxy frame to be passed`);
        }

        return proxyPrerenderFrame.get().then(prerenderFrame => {
          clean.register(() => (0, _src4.destroyElement)(prerenderFrame));
          return (0, _src4.awaitFrameWindow)(prerenderFrame).then(prerenderFrameWindow => {
            return (0, _src2.assertSameDomain)(prerenderFrameWindow);
          }).then(win => {
            return (0, _src.toProxyWindow)(win);
          });
        });
      } else if (context === _constants.CONTEXT.POPUP && __ZOID__.__POPUP_SUPPORT__) {
        return proxyWin;
      } else {
        throw new Error(`No render context available for ${context}`);
      }
    });
  };

  const focus = () => {
    return _src3.ZalgoPromise.try(() => {
      if (currentProxyWin) {
        return _src3.ZalgoPromise.all([event.trigger(_constants.EVENT.FOCUS), currentProxyWin.focus()]).then(_src4.noop);
      }
    });
  };

  const getCurrentWindowReferenceUID = () => {
    const global = (0, _lib.getGlobal)(window);
    global.windows = global.windows || {};
    global.windows[uid] = window;
    clean.register(() => {
      delete global.windows[uid];
    });
    return uid;
  };

  const getWindowRef = (target, initialChildDomain, context, proxyWin) => {
    if (initialChildDomain === (0, _src2.getDomain)(window)) {
      return {
        type: _constants.WINDOW_REFERENCE.GLOBAL,
        uid: getCurrentWindowReferenceUID()
      };
    }

    if (target !== window) {
      throw new Error(`Can not construct cross-domain window reference for different target window`);
    }

    if (props.window) {
      const actualComponentWindow = proxyWin.getWindow();

      if (!actualComponentWindow) {
        throw new Error(`Can not construct cross-domain window reference for lazy window prop`);
      }

      if ((0, _src2.getAncestor)(actualComponentWindow) !== window) {
        throw new Error(`Can not construct cross-domain window reference for window prop with different ancestor`);
      }
    }

    if (context === _constants.CONTEXT.POPUP) {
      return {
        type: _constants.WINDOW_REFERENCE.OPENER
      };
    } else if (context === _constants.CONTEXT.IFRAME) {
      return {
        type: _constants.WINDOW_REFERENCE.PARENT,
        distance: (0, _src2.getDistanceFromTop)(window)
      };
    }

    throw new Error(`Can not construct window reference for child`);
  };

  const runTimeout = () => {
    return _src3.ZalgoPromise.try(() => {
      const timeout = props.timeout;

      if (timeout) {
        return initPromise.timeout(timeout, new Error(`Loading component timed out after ${timeout} milliseconds`));
      }
    });
  };

  const initChild = (childDomain, childExports) => {
    return _src3.ZalgoPromise.try(() => {
      currentChildDomain = childDomain;
      childComponent = childExports;
      resolveInitPromise();
      clean.register(() => childExports.close.fireAndForget().catch(_src4.noop));
    });
  };

  const resize = ({
    width,
    height
  }) => {
    return _src3.ZalgoPromise.try(() => {
      event.trigger(_constants.EVENT.RESIZE, {
        width,
        height
      });
    });
  };

  const destroy = err => {
    // eslint-disable-next-line promise/no-promise-in-callback
    return _src3.ZalgoPromise.try(() => {
      return event.trigger(_constants.EVENT.DESTROY);
    }).catch(_src4.noop).then(() => {
      return clean.all(err);
    }).then(() => {
      initPromise.asyncReject(err || new Error('Component destroyed'));
    });
  };

  const close = (0, _src4.memoize)(err => {
    return _src3.ZalgoPromise.try(() => {
      if (closeOverride) {
        // $FlowFixMe
        const source = closeOverride.__source__;

        if ((0, _src2.isWindowClosed)(source)) {
          return;
        }

        return closeOverride();
      }

      return _src3.ZalgoPromise.try(() => {
        return event.trigger(_constants.EVENT.CLOSE);
      }).then(() => {
        return destroy(err || new Error(`Component closed`));
      });
    });
  });

  const open = (context, {
    proxyWin,
    proxyFrame,
    windowName
  }) => {
    if (openOverride) {
      return openOverride(context, {
        proxyWin,
        proxyFrame,
        windowName
      });
    }

    return _src3.ZalgoPromise.try(() => {
      if (context === _constants.CONTEXT.IFRAME && __ZOID__.__IFRAME_SUPPORT__) {
        if (!proxyFrame) {
          throw new Error(`Expected proxy frame to be passed`);
        }

        return proxyFrame.get().then(frame => {
          return (0, _src4.awaitFrameWindow)(frame).then(win => {
            clean.register(() => (0, _src4.destroyElement)(frame));
            clean.register(() => (0, _src.cleanUpWindow)(win));
            return win;
          });
        });
      } else if (context === _constants.CONTEXT.POPUP && __ZOID__.__POPUP_SUPPORT__) {
        let {
          width = _constants.DEFAULT_DIMENSIONS.WIDTH,
          height = _constants.DEFAULT_DIMENSIONS.HEIGHT
        } = getDimensions();
        width = (0, _src4.normalizeDimension)(width, window.outerWidth);
        height = (0, _src4.normalizeDimension)(height, window.outerWidth); // $FlowFixMe

        const attrs = {
          name: windowName,
          width,
          height,
          ...getAttributes().popup
        };
        const win = (0, _src4.popup)('', attrs);
        clean.register(() => (0, _src2.closeWindow)(win));
        clean.register(() => (0, _src.cleanUpWindow)(win));
        return win;
      } else {
        throw new Error(`No render context available for ${context}`);
      }
    }).then(win => {
      proxyWin.setWindow(win, {
        send: _src.send
      });
      return proxyWin.setName(windowName).then(() => {
        return proxyWin;
      });
    });
  };

  const watchForUnload = () => {
    return _src3.ZalgoPromise.try(() => {
      const unloadWindowListener = (0, _src4.addEventListener)(window, 'unload', (0, _src4.once)(() => {
        destroy(new Error(`Window navigated away`));
      }));
      const closeParentWindowListener = (0, _src2.onCloseWindow)(parentWin, destroy, 3000);
      clean.register(closeParentWindowListener.cancel);
      clean.register(unloadWindowListener.cancel);

      if (watchForUnloadOverride) {
        return watchForUnloadOverride();
      }
    });
  };

  const watchForClose = (proxyWin, context) => {
    let cancelled = false;
    clean.register(() => {
      cancelled = true;
    });
    return _src3.ZalgoPromise.delay(2000).then(() => {
      return proxyWin.isClosed();
    }).then(isClosed => {
      if (!cancelled) {
        if (isClosed) {
          return close(new Error(`Detected ${context} close`));
        } else {
          return watchForClose(proxyWin, context);
        }
      }
    });
  };

  const checkWindowClose = proxyWin => {
    let closed = false;
    return proxyWin.isClosed().then(isClosed => {
      if (isClosed) {
        closed = true;
        return close(new Error(`Detected component window close`));
      }

      return _src3.ZalgoPromise.delay(200).then(() => proxyWin.isClosed()).then(secondIsClosed => {
        if (secondIsClosed) {
          closed = true;
          return close(new Error(`Detected component window close`));
        }
      });
    }).then(() => {
      return closed;
    });
  };

  const onError = err => {
    if (onErrorOverride) {
      return onErrorOverride(err);
    }

    return _src3.ZalgoPromise.try(() => {
      if (handledErrors.indexOf(err) !== -1) {
        return;
      }

      handledErrors.push(err);
      initPromise.asyncReject(err);
      return event.trigger(_constants.EVENT.ERROR, err);
    });
  };

  const exportsPromise = new _src3.ZalgoPromise();

  const getExports = () => {
    return xports({
      getExports: () => exportsPromise
    });
  };

  const xport = actualExports => {
    return _src3.ZalgoPromise.try(() => {
      exportsPromise.resolve(actualExports);
    });
  };

  initChild.onError = onError;

  const buildParentExports = win => {
    const checkClose = () => checkWindowClose(win);

    function init(childExports) {
      return initChild(this.origin, childExports);
    }

    return {
      init,
      close,
      checkClose,
      resize,
      onError,
      show,
      hide,
      export: xport
    };
  };

  const buildInitialChildPayload = ({
    proxyWin,
    initialChildDomain,
    childDomainMatch,
    context
  } = {}) => {
    return getPropsForChild(initialChildDomain).then(childProps => {
      return {
        uid,
        context,
        tag,
        childDomainMatch,
        version: __ZOID__.__VERSION__,
        props: childProps,
        exports: buildParentExports(proxyWin)
      };
    });
  };

  const buildSerializedChildPayload = ({
    proxyWin,
    initialChildDomain,
    childDomainMatch,
    target = window,
    context
  } = {}) => {
    return buildInitialChildPayload({
      proxyWin,
      initialChildDomain,
      childDomainMatch,
      context
    }).then(childPayload => {
      const {
        serializedData,
        cleanReference
      } = (0, _lib.crossDomainSerialize)({
        data: childPayload,
        metaData: {
          windowRef: getWindowRef(target, initialChildDomain, context, proxyWin)
        },
        sender: {
          domain: (0, _src2.getDomain)(window)
        },
        receiver: {
          win: proxyWin,
          domain: childDomainMatch
        },
        passByReference: initialChildDomain === (0, _src2.getDomain)()
      });
      clean.register(cleanReference);
      return serializedData;
    });
  };

  const buildWindowName = ({
    proxyWin,
    initialChildDomain,
    childDomainMatch,
    target,
    context
  }) => {
    return buildSerializedChildPayload({
      proxyWin,
      initialChildDomain,
      childDomainMatch,
      target,
      context
    }).then(serializedPayload => {
      return (0, _lib.buildChildWindowName)({
        name,
        serializedPayload
      });
    });
  };

  const renderTemplate = (renderer, {
    context,
    container,
    doc,
    frame,
    prerenderFrame
  }) => {
    return renderer({
      uid,
      container,
      context,
      doc,
      frame,
      prerenderFrame,
      focus,
      close,
      state,
      props,
      tag,
      dimensions: getDimensions(),
      event
    });
  };

  const prerender = (proxyPrerenderWin, {
    context
  }) => {
    if (prerenderOverride) {
      return prerenderOverride(proxyPrerenderWin, {
        context
      });
    }

    return _src3.ZalgoPromise.try(() => {
      if (!prerenderTemplate) {
        return;
      }

      let prerenderWindow = proxyPrerenderWin.getWindow();

      if (!prerenderWindow || !(0, _src2.isSameDomain)(prerenderWindow) || !(0, _src2.isBlankDomain)(prerenderWindow)) {
        return;
      }

      prerenderWindow = (0, _src2.assertSameDomain)(prerenderWindow);
      const doc = prerenderWindow.document;
      const el = renderTemplate(prerenderTemplate, {
        context,
        doc
      });

      if (!el) {
        return;
      }

      if (el.ownerDocument !== doc) {
        throw new Error(`Expected prerender template to have been created with document from child window`);
      }

      (0, _src4.writeElementToWindow)(prerenderWindow, el);
      let {
        width = false,
        height = false,
        element = 'body'
      } = autoResize;
      element = (0, _src4.getElementSafe)(element, doc);

      if (element && (width || height)) {
        const prerenderResizeListener = (0, _src4.onResize)(element, ({
          width: newWidth,
          height: newHeight
        }) => {
          resize({
            width: width ? newWidth : undefined,
            height: height ? newHeight : undefined
          });
        }, {
          width,
          height,
          win: prerenderWindow
        });
        event.on(_constants.EVENT.RENDERED, prerenderResizeListener.cancel);
      }
    });
  };

  const renderContainer = (proxyContainer, {
    proxyFrame,
    proxyPrerenderFrame,
    context,
    rerender
  }) => {
    if (renderContainerOverride) {
      return renderContainerOverride(proxyContainer, {
        proxyFrame,
        proxyPrerenderFrame,
        context,
        rerender
      });
    }

    return _src3.ZalgoPromise.hash({
      container: proxyContainer.get(),
      // $FlowFixMe
      frame: proxyFrame ? proxyFrame.get() : null,
      // $FlowFixMe
      prerenderFrame: proxyPrerenderFrame ? proxyPrerenderFrame.get() : null,
      internalState: getInternalState()
    }).then(({
      container,
      frame,
      prerenderFrame,
      internalState: {
        visible
      }
    }) => {
      const innerContainer = renderTemplate(containerTemplate, {
        context,
        container,
        frame,
        prerenderFrame,
        doc: document
      });

      if (innerContainer) {
        if (!visible) {
          (0, _src4.hideElement)(innerContainer);
        }

        (0, _src4.appendChild)(container, innerContainer);
        const containerWatcher = (0, _src4.watchElementForClose)(innerContainer, () => {
          const removeError = new Error(`Detected container element removed from DOM`);
          return _src3.ZalgoPromise.delay(1).then(() => {
            if ((0, _src4.isElementClosed)(innerContainer)) {
              close(removeError);
            } else {
              clean.all(removeError);
              return rerender().then(resolveInitPromise, rejectInitPromise);
            }
          });
        });
        clean.register(() => containerWatcher.cancel());
        clean.register(() => (0, _src4.destroyElement)(innerContainer));
        currentProxyContainer = (0, _lib.getProxyObject)(innerContainer);
        return currentProxyContainer;
      }
    });
  };

  const getBridgeUrl = () => {
    if (typeof options.bridgeUrl === 'function') {
      return options.bridgeUrl({
        props
      });
    }

    return options.bridgeUrl;
  };

  const openBridge = (proxyWin, initialChildDomain, context) => {
    if (__POST_ROBOT__.__IE_POPUP_SUPPORT__) {
      return _src3.ZalgoPromise.try(() => {
        return proxyWin.awaitWindow();
      }).then(win => {
        if (!_src.bridge || !_src.bridge.needsBridge({
          win,
          domain: initialChildDomain
        }) || _src.bridge.hasBridge(initialChildDomain, initialChildDomain)) {
          return;
        }

        const bridgeUrl = getBridgeUrl();

        if (!bridgeUrl) {
          throw new Error(`Bridge needed to render ${context}`);
        }

        const bridgeDomain = (0, _src2.getDomainFromUrl)(bridgeUrl);

        _src.bridge.linkUrl(win, initialChildDomain);

        return _src.bridge.openBridge((0, _src2.normalizeMockUrl)(bridgeUrl), bridgeDomain);
      });
    }
  };

  const getHelpers = () => {
    return {
      state,
      event,
      close,
      focus,
      resize,
      // eslint-disable-next-line no-use-before-define
      onError,
      updateProps,
      show,
      hide
    };
  };

  const getProps = () => props;

  const setProps = (newProps, isUpdate = false) => {
    if (__DEBUG__ && validate) {
      validate({
        props: newProps
      });
    }

    const helpers = getHelpers();
    (0, _props.extendProps)(propsDef, props, newProps, helpers, isUpdate);
  };

  const updateProps = newProps => {
    setProps(newProps, true);
    return initPromise.then(() => {
      const child = childComponent;
      const proxyWin = currentProxyWin;
      const childDomain = currentChildDomain;

      if (!child || !proxyWin || !childDomain) {
        return;
      }

      return getPropsForChild(childDomain).then(childProps => {
        return child.updateProps(childProps).catch(err => {
          return checkWindowClose(proxyWin).then(closed => {
            if (!closed) {
              throw err;
            }
          });
        });
      });
    });
  };

  const delegate = (context, target) => {
    const delegateProps = {};

    for (const propName of Object.keys(props)) {
      const propDef = propsDef[propName];

      if (propDef && propDef.allowDelegate) {
        delegateProps[propName] = props[propName];
      }
    }

    const childOverridesPromise = (0, _src.send)(target, `${_constants.POST_MESSAGE.DELEGATE}_${name}`, {
      uid,
      overrides: {
        props: delegateProps,
        event,
        close,
        onError,
        getInternalState,
        setInternalState,
        resolveInitPromise,
        rejectInitPromise
      }
    }).then(({
      data: {
        parent
      }
    }) => {
      const parentComp = parent;
      clean.register(err => {
        if (!(0, _src2.isWindowClosed)(target)) {
          return parentComp.destroy(err);
        }
      });
      return parentComp.getDelegateOverrides();
    }).catch(err => {
      throw new Error(`Unable to delegate rendering. Possibly the component is not loaded in the target window.\n\n${(0, _src4.stringifyError)(err)}`);
    });

    getProxyContainerOverride = (...args) => childOverridesPromise.then(childOverrides => childOverrides.getProxyContainer(...args));

    renderContainerOverride = (...args) => childOverridesPromise.then(childOverrides => childOverrides.renderContainer(...args));

    showOverride = (...args) => childOverridesPromise.then(childOverrides => childOverrides.show(...args));

    hideOverride = (...args) => childOverridesPromise.then(childOverrides => childOverrides.hide(...args));

    watchForUnloadOverride = (...args) => childOverridesPromise.then(childOverrides => childOverrides.watchForUnload(...args));

    if (context === _constants.CONTEXT.IFRAME && __ZOID__.__IFRAME_SUPPORT__) {
      getProxyWindowOverride = (...args) => childOverridesPromise.then(childOverrides => childOverrides.getProxyWindow(...args));

      openFrameOverride = (...args) => childOverridesPromise.then(childOverrides => childOverrides.openFrame(...args));

      openPrerenderFrameOverride = (...args) => childOverridesPromise.then(childOverrides => childOverrides.openPrerenderFrame(...args));

      prerenderOverride = (...args) => childOverridesPromise.then(childOverrides => childOverrides.prerender(...args));

      openOverride = (...args) => childOverridesPromise.then(childOverrides => childOverrides.open(...args));

      openPrerenderOverride = (...args) => childOverridesPromise.then(childOverrides => childOverrides.openPrerender(...args));
    } else if (context === _constants.CONTEXT.POPUP && __ZOID__.__POPUP_SUPPORT__) {
      setProxyWinOverride = (...args) => childOverridesPromise.then(childOverrides => childOverrides.setProxyWin(...args));
    }

    return childOverridesPromise;
  };

  const getDelegateOverrides = () => {
    return _src3.ZalgoPromise.try(() => {
      return {
        getProxyContainer,
        show,
        hide,
        renderContainer,
        getProxyWindow,
        watchForUnload,
        openFrame,
        openPrerenderFrame,
        prerender,
        open,
        openPrerender,
        setProxyWin
      };
    });
  };

  const checkAllowRender = (target, childDomainMatch, container) => {
    if (target === window) {
      return;
    }

    if (!(0, _src2.isSameTopWindow)(window, target)) {
      throw new Error(`Can only renderTo an adjacent frame`);
    }

    const origin = (0, _src2.getDomain)();

    if (!(0, _src2.matchDomain)(childDomainMatch, origin) && !(0, _src2.isSameDomain)(target)) {
      throw new Error(`Can not render remotely to ${childDomainMatch.toString()} - can only render to ${origin}`);
    }

    if (container && typeof container !== 'string') {
      throw new Error(`Container passed to renderTo must be a string selector, got ${typeof container} }`);
    }
  };

  const init = () => {
    setupEvents();
  };

  const render = ({
    target,
    container,
    context,
    rerender
  }) => {
    return _src3.ZalgoPromise.try(() => {
      const initialChildDomain = getInitialChildDomain();
      const childDomainMatch = getDomainMatcher();
      checkAllowRender(target, childDomainMatch, container);

      const delegatePromise = _src3.ZalgoPromise.try(() => {
        if (target !== window) {
          return delegate(context, target);
        }
      });

      const windowProp = props.window;
      const watchForUnloadPromise = watchForUnload();
      const buildUrlPromise = buildUrl();
      const buildBodyPromise = buildBody();
      const onRenderPromise = event.trigger(_constants.EVENT.RENDER);
      const getProxyContainerPromise = getProxyContainer(container);
      const getProxyWindowPromise = getProxyWindow();
      const buildWindowNamePromise = getProxyWindowPromise.then(proxyWin => {
        return buildWindowName({
          proxyWin,
          initialChildDomain,
          childDomainMatch,
          target,
          context
        });
      });
      const openFramePromise = buildWindowNamePromise.then(windowName => openFrame(context, {
        windowName
      }));
      const openPrerenderFramePromise = openPrerenderFrame(context);

      const renderContainerPromise = _src3.ZalgoPromise.hash({
        proxyContainer: getProxyContainerPromise,
        proxyFrame: openFramePromise,
        proxyPrerenderFrame: openPrerenderFramePromise
      }).then(({
        proxyContainer,
        proxyFrame,
        proxyPrerenderFrame
      }) => {
        return renderContainer(proxyContainer, {
          context,
          proxyFrame,
          proxyPrerenderFrame,
          rerender
        });
      }).then(proxyContainer => {
        return proxyContainer;
      });

      const openPromise = _src3.ZalgoPromise.hash({
        windowName: buildWindowNamePromise,
        proxyFrame: openFramePromise,
        proxyWin: getProxyWindowPromise
      }).then(({
        windowName,
        proxyWin,
        proxyFrame
      }) => {
        return windowProp ? proxyWin : open(context, {
          windowName,
          proxyWin,
          proxyFrame
        });
      });

      const openPrerenderPromise = _src3.ZalgoPromise.hash({
        proxyWin: openPromise,
        proxyPrerenderFrame: openPrerenderFramePromise
      }).then(({
        proxyWin,
        proxyPrerenderFrame
      }) => {
        return openPrerender(context, proxyWin, proxyPrerenderFrame);
      });

      const setStatePromise = openPromise.then(proxyWin => {
        currentProxyWin = proxyWin;
        return setProxyWin(proxyWin);
      });

      const prerenderPromise = _src3.ZalgoPromise.hash({
        proxyPrerenderWin: openPrerenderPromise,
        state: setStatePromise
      }).then(({
        proxyPrerenderWin
      }) => {
        return prerender(proxyPrerenderWin, {
          context
        });
      });

      const setWindowNamePromise = _src3.ZalgoPromise.hash({
        proxyWin: openPromise,
        windowName: buildWindowNamePromise
      }).then(({
        proxyWin,
        windowName
      }) => {
        if (windowProp) {
          return proxyWin.setName(windowName);
        }
      });

      const getMethodPromise = _src3.ZalgoPromise.hash({
        body: buildBodyPromise
      }).then(({
        body
      }) => {
        if (options.method) {
          return options.method;
        }

        if (Object.keys(body).length) {
          return _constants.METHOD.POST;
        }

        return _constants.METHOD.GET;
      });

      const loadUrlPromise = _src3.ZalgoPromise.hash({
        proxyWin: openPromise,
        windowUrl: buildUrlPromise,
        body: buildBodyPromise,
        method: getMethodPromise,
        windowName: setWindowNamePromise,
        prerender: prerenderPromise
      }).then(({
        proxyWin,
        windowUrl,
        body,
        method
      }) => {
        return proxyWin.setLocation(windowUrl, {
          method,
          body
        });
      });

      const watchForClosePromise = openPromise.then(proxyWin => {
        watchForClose(proxyWin, context);
      });

      const onDisplayPromise = _src3.ZalgoPromise.hash({
        container: renderContainerPromise,
        prerender: prerenderPromise
      }).then(() => {
        return event.trigger(_constants.EVENT.DISPLAY);
      });

      const openBridgePromise = openPromise.then(proxyWin => {
        return openBridge(proxyWin, initialChildDomain, context);
      });
      const runTimeoutPromise = loadUrlPromise.then(() => {
        return runTimeout();
      });
      const onRenderedPromise = initPromise.then(() => {
        return event.trigger(_constants.EVENT.RENDERED);
      });
      return _src3.ZalgoPromise.hash({
        initPromise,
        buildUrlPromise,
        onRenderPromise,
        getProxyContainerPromise,
        openFramePromise,
        openPrerenderFramePromise,
        renderContainerPromise,
        openPromise,
        openPrerenderPromise,
        setStatePromise,
        prerenderPromise,
        loadUrlPromise,
        buildWindowNamePromise,
        setWindowNamePromise,
        watchForClosePromise,
        onDisplayPromise,
        openBridgePromise,
        runTimeoutPromise,
        onRenderedPromise,
        delegatePromise,
        watchForUnloadPromise
      });
    }).catch(err => {
      return _src3.ZalgoPromise.all([onError(err), destroy(err)]).then(() => {
        throw err;
      }, () => {
        throw err;
      });
    }).then(_src4.noop);
  };

  return {
    init,
    render,
    destroy,
    getProps,
    setProps,
    export: xport,
    getHelpers,
    getDelegateOverrides,
    getExports
  };
}