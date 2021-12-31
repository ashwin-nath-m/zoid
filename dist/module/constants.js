"use strict";

exports.__esModule = true;
exports.ZOID = exports.WINDOW_REFERENCE = exports.WILDCARD = exports.PROP_TYPE = exports.PROP_SERIALIZATION = exports.POST_MESSAGE = exports.METHOD = exports.EVENT = exports.DEFAULT_DIMENSIONS = exports.CONTEXT = void 0;

var _src = require("cross-domain-utils/src");

const ZOID = `zoid`;
exports.ZOID = ZOID;
const POST_MESSAGE = {
  DELEGATE: `${ZOID}_delegate`,
  ALLOW_DELEGATE: `${ZOID}_allow_delegate`
};
exports.POST_MESSAGE = POST_MESSAGE;
const PROP_TYPE = {
  STRING: 'string',
  OBJECT: 'object',
  FUNCTION: 'function',
  BOOLEAN: 'boolean',
  NUMBER: 'number',
  ARRAY: 'array'
};
exports.PROP_TYPE = PROP_TYPE;
const WINDOW_REFERENCE = {
  OPENER: 'opener',
  PARENT: 'parent',
  GLOBAL: 'global',
  NAME: 'name'
};
exports.WINDOW_REFERENCE = WINDOW_REFERENCE;
const PROP_SERIALIZATION = {
  JSON: 'json',
  DOTIFY: 'dotify',
  BASE64: 'base64'
};
exports.PROP_SERIALIZATION = PROP_SERIALIZATION;
const CONTEXT = _src.WINDOW_TYPE;
exports.CONTEXT = CONTEXT;
const WILDCARD = '*';
exports.WILDCARD = WILDCARD;
const DEFAULT_DIMENSIONS = {
  WIDTH: '300px',
  HEIGHT: '150px'
};
exports.DEFAULT_DIMENSIONS = DEFAULT_DIMENSIONS;
const EVENT = {
  RENDER: 'zoid-render',
  RENDERED: 'zoid-rendered',
  DISPLAY: 'zoid-display',
  ERROR: 'zoid-error',
  CLOSE: 'zoid-close',
  DESTROY: 'zoid-destroy',
  PROPS: 'zoid-props',
  RESIZE: 'zoid-resize',
  FOCUS: 'zoid-focus'
};
exports.EVENT = EVENT;
const METHOD = {
  GET: 'get',
  POST: 'post'
};
exports.METHOD = METHOD;