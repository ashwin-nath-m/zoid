"use strict";

exports.__esModule = true;
exports.destroyComponents = exports.destroyAll = exports.destroy = exports.create = exports.PopupOpenError = exports.PROP_TYPE = exports.PROP_SERIALIZATION = exports.EVENT = exports.CONTEXT = void 0;

var _src = require("belter/src");

exports.PopupOpenError = _src.PopupOpenError;

var _component = require("./component");

exports.create = _component.create;
exports.destroy = _component.destroy;
exports.destroyComponents = _component.destroyComponents;
exports.destroyAll = _component.destroyAll;

var _constants = require("./constants");

exports.PROP_TYPE = _constants.PROP_TYPE;
exports.PROP_SERIALIZATION = _constants.PROP_SERIALIZATION;
exports.CONTEXT = _constants.CONTEXT;
exports.EVENT = _constants.EVENT;