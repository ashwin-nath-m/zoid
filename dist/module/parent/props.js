"use strict";

exports.__esModule = true;
exports.extendProps = extendProps;
exports.serializeProps = serializeProps;

var _src = require("zalgo-promise/src");

var _src2 = require("belter/src");

var _props = require("../component/props");

var _constants = require("../constants");

function getDefaultInputProps() {
  // $FlowFixMe[incompatible-type]
  const defaultInputProps = {};
  return defaultInputProps;
}

function extendProps(propsDef, props, inputProps, helpers, isUpdate = false) {
  inputProps = inputProps || getDefaultInputProps();
  (0, _src2.extend)(props, inputProps);
  const propNames = isUpdate ? [] : [...Object.keys(propsDef)];

  for (const key of Object.keys(inputProps)) {
    if (propNames.indexOf(key) === -1) {
      propNames.push(key);
    }
  }

  const aliases = [];
  const {
    state,
    close,
    focus,
    event,
    onError
  } = helpers;

  for (const key of propNames) {
    const propDef = propsDef[key]; // $FlowFixMe

    let value = inputProps[key];

    if (!propDef) {
      continue;
    }

    const alias = propDef.alias;

    if (alias) {
      if (!(0, _src2.isDefined)(value) && (0, _src2.isDefined)(inputProps[alias])) {
        value = inputProps[alias];
      }

      aliases.push(alias);
    }

    if (propDef.value) {
      value = propDef.value({
        props,
        state,
        close,
        focus,
        event,
        onError
      });
    }

    if (!(0, _src2.isDefined)(value) && propDef.default) {
      value = propDef.default({
        props,
        state,
        close,
        focus,
        event,
        onError
      });
    }

    if ((0, _src2.isDefined)(value)) {
      if (propDef.type === 'array' ? !Array.isArray(value) : typeof value !== propDef.type) {
        throw new TypeError(`Prop is not of type ${propDef.type}: ${key}`);
      }
    } // $FlowFixMe


    props[key] = value;
  }

  for (const alias of aliases) {
    delete props[alias];
  }

  (0, _props.eachProp)(props, propsDef, (key, propDef, value) => {
    if (!propDef) {
      return;
    }

    if (__DEBUG__ && (0, _src2.isDefined)(value) && propDef.validate) {
      // $FlowFixMe[incompatible-call]
      // $FlowFixMe[incompatible-exact]
      propDef.validate({
        value,
        props
      });
    }

    if ((0, _src2.isDefined)(value) && propDef.decorate) {
      // $FlowFixMe[incompatible-call]
      const decoratedValue = propDef.decorate({
        value,
        props,
        state,
        close,
        focus,
        event,
        onError
      }); // $FlowFixMe[incompatible-type]

      props[key] = decoratedValue;
    }
  });

  for (const key of Object.keys(propsDef)) {
    const propDef = propsDef[key]; // $FlowFixMe

    const propVal = props[key];

    if (propDef.required !== false && !(0, _src2.isDefined)(propVal)) {
      throw new Error(`Expected prop "${key}" to be defined`);
    }
  }
}

function serializeProps(propsDef, props, method) {
  const params = {};
  return _src.ZalgoPromise.all((0, _props.mapProps)(props, propsDef, (key, propDef, value) => {
    return _src.ZalgoPromise.resolve().then(() => {
      if (value === null || typeof value === 'undefined') {
        return;
      }

      const getParam = {
        [_constants.METHOD.GET]: propDef.queryParam,
        [_constants.METHOD.POST]: propDef.bodyParam
      }[method];
      const getValue = {
        [_constants.METHOD.GET]: propDef.queryValue,
        [_constants.METHOD.POST]: propDef.bodyValue
      }[method];

      if (!getParam) {
        return;
      }

      return _src.ZalgoPromise.hash({
        finalParam: _src.ZalgoPromise.try(() => {
          if (typeof getParam === 'function') {
            // $FlowFixMe[incompatible-call]
            return getParam({
              value
            });
          } else if (typeof getParam === 'string') {
            return getParam;
          } else {
            return key;
          }
        }),
        finalValue: _src.ZalgoPromise.try(() => {
          if (typeof getValue === 'function' && (0, _src2.isDefined)(value)) {
            // $FlowFixMe[incompatible-call]
            // $FlowFixMe[incompatible-return]
            return getValue({
              value
            });
          } else {
            // $FlowFixMe[incompatible-return]
            return value;
          }
        })
      }).then(({
        finalParam,
        finalValue
      }) => {
        let result;

        if (typeof finalValue === 'boolean') {
          result = finalValue.toString();
        } else if (typeof finalValue === 'string') {
          result = finalValue.toString();
        } else if (typeof finalValue === 'object' && finalValue !== null) {
          if (propDef.serialization === _constants.PROP_SERIALIZATION.JSON) {
            result = JSON.stringify(finalValue);
          } else if (propDef.serialization === _constants.PROP_SERIALIZATION.BASE64) {
            result = (0, _src2.base64encode)(JSON.stringify(finalValue));
          } else if (propDef.serialization === _constants.PROP_SERIALIZATION.DOTIFY || !propDef.serialization) {
            result = (0, _src2.dotify)(finalValue, key);

            for (const dotkey of Object.keys(result)) {
              params[dotkey] = result[dotkey];
            }

            return;
          }
        } else if (typeof finalValue === 'number') {
          result = finalValue.toString();
        }

        params[finalParam] = result;
      });
    });
  })).then(() => {
    return params;
  });
}