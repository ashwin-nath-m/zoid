"use strict";

exports.__esModule = true;
exports.component = component;
exports.create = void 0;
exports.destroy = destroy;
exports.destroyAll = void 0;
exports.destroyComponents = destroyComponents;

var _src = require("post-robot/src");

var _src2 = require("zalgo-promise/src");

var _src3 = require("cross-domain-utils/src");

var _src4 = require("belter/src");

var _child = require("../child");

var _parent = require("../parent/parent");

var _constants = require("../constants");

var _drivers = require("../drivers");

var _lib = require("../lib");

var _validate = require("./validate");

var _templates = require("./templates");

var _props = require("./props");

/* eslint max-lines: 0 */
const getDefaultAttributes = () => {
  // $FlowFixMe
  return {};
};

const getDefaultAutoResize = () => {
  // $FlowFixMe
  return {};
};

const getDefaultExports = () => {
  // $FlowFixMe
  return _src4.noop;
};

const getDefaultDimensions = () => {
  // $FlowFixMe
  return {};
};

function normalizeOptions(options) {
  const {
    tag,
    url,
    domain,
    bridgeUrl,
    props = {},
    dimensions = getDefaultDimensions(),
    autoResize = getDefaultAutoResize(),
    allowedParentDomains = _constants.WILDCARD,
    attributes = getDefaultAttributes(),
    defaultContext = _constants.CONTEXT.IFRAME,
    containerTemplate = __ZOID__.__DEFAULT_CONTAINER__ ? _templates.defaultContainerTemplate : null,
    prerenderTemplate = __ZOID__.__DEFAULT_PRERENDER__ ? _templates.defaultPrerenderTemplate : null,
    validate,
    eligible = () => ({
      eligible: true
    }),
    logger = {
      info: _src4.noop
    },
    exports: xportsDefinition = getDefaultExports(),
    method,
    children = () => {
      // $FlowFixMe
      return {};
    }
  } = options;
  const name = tag.replace(/-/g, '_'); // $FlowFixMe[incompatible-type]
  // $FlowFixMe[cannot-spread-inexact]

  const propsDef = { ...(0, _props.getBuiltInProps)(),
    ...props
  };

  if (!containerTemplate) {
    throw new Error(`Container template required`);
  }

  const xports = typeof xportsDefinition === 'function' ? xportsDefinition : ({
    getExports
  }) => {
    const result = {};

    for (const key of Object.keys(xportsDefinition)) {
      const {
        type
      } = xportsDefinition[key];
      const valuePromise = getExports().then(res => {
        // $FlowFixMe
        return res[key];
      });

      if (type === _constants.PROP_TYPE.FUNCTION) {
        result[key] = (...args) => valuePromise.then(value => value(...args));
      } else {
        result[key] = valuePromise;
      }
    } // $FlowFixMe


    return result;
  };
  return {
    name,
    tag,
    url,
    domain,
    bridgeUrl,
    method,
    propsDef,
    dimensions,
    autoResize,
    allowedParentDomains,
    attributes,
    defaultContext,
    containerTemplate,
    prerenderTemplate,
    validate,
    logger,
    eligible,
    children,
    exports: xports
  };
}

let cleanInstances = (0, _src4.cleanup)();
const cleanZoid = (0, _src4.cleanup)();

function component(opts) {
  if (__DEBUG__) {
    (0, _validate.validateOptions)(opts);
  }

  const options = normalizeOptions(opts);
  const {
    name,
    tag,
    defaultContext,
    propsDef,
    eligible,
    children
  } = options;
  const global = (0, _lib.getGlobal)(window);
  const driverCache = {};
  const instances = [];

  const isChild = () => {
    if ((0, _lib.isChildComponentWindow)(name)) {
      const {
        payload
      } = (0, _lib.getInitialParentPayload)();

      if (payload.tag === tag && (0, _src3.matchDomain)(payload.childDomainMatch, (0, _src3.getDomain)())) {
        return true;
      }
    }

    return false;
  };

  const registerChild = (0, _src4.memoize)(() => {
    if (isChild()) {
      if (window.xprops) {
        delete global.components[tag];
        throw new Error(`Can not register ${name} as child - child already registered`);
      }

      const child = (0, _child.childComponent)(options);
      child.init();
      return child;
    }
  });

  const listenForDelegate = () => {
    const allowDelegateListener = (0, _src.on)(`${_constants.POST_MESSAGE.ALLOW_DELEGATE}_${name}`, () => {
      return true;
    });
    const delegateListener = (0, _src.on)(`${_constants.POST_MESSAGE.DELEGATE}_${name}`, ({
      source,
      data: {
        uid,
        overrides
      }
    }) => {
      return {
        parent: (0, _parent.parentComponent)({
          uid,
          options,
          overrides,
          parentWin: source
        })
      };
    });
    cleanZoid.register(allowDelegateListener.cancel);
    cleanZoid.register(delegateListener.cancel);
  };

  const canRenderTo = win => {
    return (0, _src.send)(win, `${_constants.POST_MESSAGE.ALLOW_DELEGATE}_${name}`).then(({
      data
    }) => {
      return data;
    }).catch(() => {
      return false;
    });
  };

  const getDefaultContainer = (context, container) => {
    if (container) {
      if (typeof container !== 'string' && !(0, _src4.isElement)(container)) {
        throw new TypeError(`Expected string or element selector to be passed`);
      }

      return container;
    }

    if (context === _constants.CONTEXT.POPUP) {
      return 'body';
    }

    throw new Error(`Expected element to be passed to render iframe`);
  };

  const getDefaultContext = (props, context) => {
    return _src2.ZalgoPromise.try(() => {
      if (props.window) {
        return (0, _src.toProxyWindow)(props.window).getType();
      }

      if (context) {
        if (context !== _constants.CONTEXT.IFRAME && context !== _constants.CONTEXT.POPUP) {
          throw new Error(`Unrecognized context: ${context}`);
        }

        return context;
      }

      return defaultContext;
    });
  };

  const getDefaultInputProps = () => {
    // $FlowFixMe
    return {};
  };

  const init = inputProps => {
    // eslint-disable-next-line prefer-const
    let instance;
    const uid = `${_constants.ZOID}-${tag}-${(0, _src4.uniqueID)()}`;
    const props = inputProps || getDefaultInputProps();
    const {
      eligible: eligibility,
      reason
    } = eligible({
      props
    });

    const isEligible = () => eligibility;

    const onDestroy = props.onDestroy;

    props.onDestroy = (...args) => {
      if (instance && eligibility) {
        instances.splice(instances.indexOf(instance), 1);
      }

      if (onDestroy) {
        return onDestroy(...args);
      }
    };

    const parent = (0, _parent.parentComponent)({
      uid,
      options
    });
    parent.init();

    if (eligibility) {
      parent.setProps(props);
    } else {
      if (props.onDestroy) {
        props.onDestroy();
      }
    }

    cleanInstances.register(err => {
      return parent.destroy(err || new Error(`zoid destroyed all components`));
    });

    const clone = ({
      decorate = _src4.identity
    } = {}) => {
      return init(decorate(props));
    };

    const getChildren = () => {
      // $FlowFixMe
      const childComponents = children();
      const result = {};

      for (const childName of Object.keys(childComponents)) {
        const Child = childComponents[childName];

        result[childName] = childInputProps => {
          const parentProps = parent.getProps();
          const parentExport = parent.export;
          const childParent = {
            uid,
            props: parentProps,
            export: parentExport
          };
          const childProps = { ...childInputProps,
            parent: childParent
          };
          return Child(childProps);
        };
      } // $FlowFixMe


      return result;
    };

    const render = (target, container, context) => {
      return _src2.ZalgoPromise.try(() => {
        if (!eligibility) {
          const err = new Error(reason || `${name} component is not eligible`);
          return parent.destroy(err).then(() => {
            throw err;
          });
        }

        if (!(0, _src3.isWindow)(target)) {
          throw new Error(`Must pass window to renderTo`);
        }

        return getDefaultContext(props, context);
      }).then(finalContext => {
        container = getDefaultContainer(finalContext, container);

        if (target !== window && typeof container !== 'string') {
          throw new Error(`Must pass string element when rendering to another window`);
        }

        return parent.render({
          target,
          container,
          context: finalContext,
          rerender: () => {
            const newInstance = clone();
            (0, _src4.extend)(instance, newInstance);
            return newInstance.renderTo(target, container, context);
          }
        });
      }).catch(err => {
        return parent.destroy(err).then(() => {
          throw err;
        });
      });
    };

    instance = { ...parent.getExports(),
      ...parent.getHelpers(),
      ...getChildren(),
      isEligible,
      clone,
      render: (container, context) => render(window, container, context),
      renderTo: (target, container, context) => render(target, container, context)
    };

    if (eligibility) {
      instances.push(instance);
    }

    return instance;
  };

  const driver = (driverName, dep) => {
    if (__ZOID__.__FRAMEWORK_SUPPORT__) {
      const drivers = {
        react: _drivers.react,
        angular: _drivers.angular,
        vue: _drivers.vue,
        vue3: _drivers.vue3,
        angular2: _drivers.angular2
      };

      if (!drivers[driverName]) {
        throw new Error(`Could not find driver for framework: ${driverName}`);
      }

      if (!driverCache[driverName]) {
        driverCache[driverName] = drivers[driverName].register(tag, propsDef, init, dep);
      }

      return driverCache[driverName];
    } else {
      throw new Error(`Driver support not enabled`);
    }
  };

  registerChild();
  listenForDelegate();
  global.components = global.components || {};

  if (global.components[tag]) {
    throw new Error(`Can not register multiple components with the same tag: ${tag}`);
  }

  global.components[tag] = true;
  return {
    init,
    instances,
    driver,
    isChild,
    canRenderTo,
    registerChild
  };
}

const create = options => {
  (0, _src.setup)();
  const comp = component(options);

  const init = props => comp.init(props);

  init.driver = (name, dep) => comp.driver(name, dep);

  init.isChild = () => comp.isChild();

  init.canRenderTo = win => comp.canRenderTo(win);

  init.instances = comp.instances;
  const child = comp.registerChild();

  if (child) {
    window.xprops = init.xprops = child.getProps();
  }

  return init;
};

exports.create = create;

function destroyComponents(err) {
  if (_src.bridge) {
    _src.bridge.destroyBridges();
  }

  const destroyPromise = cleanInstances.all(err);
  cleanInstances = (0, _src4.cleanup)();
  return destroyPromise;
}

const destroyAll = destroyComponents;
exports.destroyAll = destroyAll;

function destroy(err) {
  destroyAll();
  (0, _lib.destroyGlobal)();
  (0, _src.destroy)();
  return cleanZoid.all(err);
}