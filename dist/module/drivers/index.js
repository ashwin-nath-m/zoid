"use strict";

exports.__esModule = true;

var _react = require("./react");

Object.keys(_react).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _react[key]) return;
  exports[key] = _react[key];
});

var _vue = require("./vue");

Object.keys(_vue).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _vue[key]) return;
  exports[key] = _vue[key];
});

var _vue2 = require("./vue3");

Object.keys(_vue2).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _vue2[key]) return;
  exports[key] = _vue2[key];
});

var _angular = require("./angular");

Object.keys(_angular).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _angular[key]) return;
  exports[key] = _angular[key];
});

var _angular2 = require("./angular2");

Object.keys(_angular2).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _angular2[key]) return;
  exports[key] = _angular2[key];
});