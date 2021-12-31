"use strict";

exports.__esModule = true;

var _parent = require("./parent");

Object.keys(_parent).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _parent[key]) return;
  exports[key] = _parent[key];
});