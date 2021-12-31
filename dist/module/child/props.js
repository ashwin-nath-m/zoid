"use strict";

exports.__esModule = true;
exports.normalizeChildProp = normalizeChildProp;
exports.normalizeChildProps = normalizeChildProps;

var _src = require("cross-domain-utils/src");

// $FlowFixMe
function normalizeChildProp(propsDef, props, key, value, helpers) {
  if (!propsDef.hasOwnProperty(key)) {
    return value;
  }

  const prop = propsDef[key];

  if (typeof prop.childDecorate === 'function') {
    const {
      uid,
      tag,
      close,
      focus,
      onError,
      onProps,
      resize,
      getParent,
      getParentDomain,
      show,
      hide,
      export: xport,
      getSiblings
    } = helpers;
    const decoratedValue = prop.childDecorate({
      value,
      uid,
      tag,
      close,
      focus,
      onError,
      onProps,
      resize,
      getParent,
      getParentDomain,
      show,
      hide,
      export: xport,
      getSiblings
    }); // $FlowFixMe

    return decoratedValue;
  }

  return value;
} // eslint-disable-next-line max-params


function normalizeChildProps(parentComponentWindow, propsDef, props, origin, helpers, isUpdate = false) {
  const result = {};

  for (const key of Object.keys(props)) {
    const prop = propsDef[key];

    if (prop && prop.sameDomain && (origin !== (0, _src.getDomain)(window) || !(0, _src.isSameDomain)(parentComponentWindow))) {
      continue;
    } // $FlowFixMe


    const value = normalizeChildProp(propsDef, props, key, props[key], helpers);
    result[key] = value;

    if (prop && prop.alias && !result[prop.alias]) {
      result[prop.alias] = value;
    }
  }

  if (!isUpdate) {
    for (const key of Object.keys(propsDef)) {
      if (!props.hasOwnProperty(key)) {
        result[key] = normalizeChildProp(propsDef, props, key, undefined, helpers);
      }
    }
  } // $FlowFixMe


  return result;
}