"use strict";

exports.__esModule = true;
exports.eachProp = eachProp;
exports.getBuiltInProps = getBuiltInProps;
exports.mapProps = mapProps;

var _src = require("zalgo-promise/src");

var _src2 = require("belter/src");

var _src3 = require("cross-domain-utils/src");

var _src4 = require("post-robot/src");

var _constants = require("../constants");

const defaultNoop = () => _src2.noop; // eslint-disable-next-line flowtype/require-exact-type


const decorateOnce = ({
  value
}) => (0, _src2.once)(value);

function getBuiltInProps() {
  return {
    window: {
      type: _constants.PROP_TYPE.OBJECT,
      sendToChild: false,
      required: false,
      allowDelegate: true,
      validate: ({
        value
      }) => {
        if (!(0, _src3.isWindow)(value) && !_src4.ProxyWindow.isProxyWindow(value)) {
          throw new Error(`Expected Window or ProxyWindow`);
        }

        if ((0, _src3.isWindow)(value)) {
          // $FlowFixMe
          if ((0, _src3.isWindowClosed)(value)) {
            throw new Error(`Window is closed`);
          } // $FlowFixMe


          if (!(0, _src3.isSameDomain)(value)) {
            throw new Error(`Window is not same domain`);
          }
        }
      },
      decorate: ({
        value
      }) => {
        return (0, _src4.toProxyWindow)(value);
      }
    },
    timeout: {
      type: _constants.PROP_TYPE.NUMBER,
      required: false,
      sendToChild: false
    },
    cspNonce: {
      type: _constants.PROP_TYPE.STRING,
      required: false
    },
    onDisplay: {
      type: _constants.PROP_TYPE.FUNCTION,
      required: false,
      sendToChild: false,
      allowDelegate: true,
      default: defaultNoop,
      decorate: decorateOnce
    },
    onRendered: {
      type: _constants.PROP_TYPE.FUNCTION,
      required: false,
      sendToChild: false,
      default: defaultNoop,
      decorate: decorateOnce
    },
    onRender: {
      type: _constants.PROP_TYPE.FUNCTION,
      required: false,
      sendToChild: false,
      default: defaultNoop,
      decorate: decorateOnce
    },
    onClose: {
      type: _constants.PROP_TYPE.FUNCTION,
      required: false,
      sendToChild: false,
      allowDelegate: true,
      default: defaultNoop,
      decorate: decorateOnce
    },
    onDestroy: {
      type: _constants.PROP_TYPE.FUNCTION,
      required: false,
      sendToChild: false,
      allowDelegate: true,
      default: defaultNoop,
      decorate: decorateOnce
    },
    onResize: {
      type: _constants.PROP_TYPE.FUNCTION,
      required: false,
      sendToChild: false,
      allowDelegate: true,
      default: defaultNoop
    },
    onFocus: {
      type: _constants.PROP_TYPE.FUNCTION,
      required: false,
      sendToChild: false,
      allowDelegate: true,
      default: defaultNoop
    },
    close: {
      type: _constants.PROP_TYPE.FUNCTION,
      required: false,
      sendToChild: false,
      childDecorate: ({
        close
      }) => close
    },
    focus: {
      type: _constants.PROP_TYPE.FUNCTION,
      required: false,
      sendToChild: false,
      childDecorate: ({
        focus
      }) => focus
    },
    resize: {
      type: _constants.PROP_TYPE.FUNCTION,
      required: false,
      sendToChild: false,
      childDecorate: ({
        resize
      }) => resize
    },
    uid: {
      type: _constants.PROP_TYPE.STRING,
      required: false,
      sendToChild: false,
      childDecorate: ({
        uid
      }) => uid
    },
    tag: {
      type: _constants.PROP_TYPE.STRING,
      required: false,
      sendToChild: false,
      childDecorate: ({
        tag
      }) => tag
    },
    getParent: {
      type: _constants.PROP_TYPE.FUNCTION,
      required: false,
      sendToChild: false,
      childDecorate: ({
        getParent
      }) => getParent
    },
    getParentDomain: {
      type: _constants.PROP_TYPE.FUNCTION,
      required: false,
      sendToChild: false,
      childDecorate: ({
        getParentDomain
      }) => getParentDomain
    },
    show: {
      type: _constants.PROP_TYPE.FUNCTION,
      required: false,
      sendToChild: false,
      childDecorate: ({
        show
      }) => show
    },
    hide: {
      type: _constants.PROP_TYPE.FUNCTION,
      required: false,
      sendToChild: false,
      childDecorate: ({
        hide
      }) => hide
    },
    export: {
      type: _constants.PROP_TYPE.FUNCTION,
      required: false,
      sendToChild: false,
      childDecorate: ({
        'export': xport
      }) => xport
    },
    onError: {
      type: _constants.PROP_TYPE.FUNCTION,
      required: false,
      sendToChild: false,
      childDecorate: ({
        onError
      }) => onError
    },
    onProps: {
      type: _constants.PROP_TYPE.FUNCTION,
      required: false,
      sendToChild: false,
      childDecorate: ({
        onProps
      }) => onProps
    },
    getSiblings: {
      type: _constants.PROP_TYPE.FUNCTION,
      required: false,
      sendToChild: false,
      childDecorate: ({
        getSiblings
      }) => getSiblings
    }
  };
}

function eachProp(props, propsDef, handler) {
  for (const key of Object.keys(props)) {
    const propDef = propsDef[key];
    const value = props[key];

    if (!propDef) {
      continue;
    } // $FlowFixMe[incompatible-call]


    handler(key, propDef, value);
  }
}

function mapProps(props, propsDef, handler) {
  const results = [];
  eachProp(props, propsDef, (key, propDef, value) => {
    // $FlowFixMe[incompatible-call]
    const result = handler(key, propDef, value);
    results.push(result);
  });
  return results;
}