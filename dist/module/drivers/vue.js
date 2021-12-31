"use strict";

exports.__esModule = true;
exports.vue = void 0;

var _src = require("belter/src");

var _constants = require("../constants");

function propsToCamelCase(props) {
  return Object.keys(props).reduce((acc, key) => {
    const value = props[key]; // In vue `style` is a reserved prop name

    if (key === 'style-object' || key === 'styleObject') {
      acc.style = value; // To keep zoid as generic as possible, passing in the original prop name as well

      acc.styleObject = value;
    } else if (key.includes('-')) {
      acc[(0, _src.dasherizeToCamel)(key)] = value;
    } else {
      acc[key] = value;
    }

    return acc;
  }, {});
}

const vue = {
  register: (tag, propsDef, init, Vue) => {
    return Vue.component(tag, {
      render(createElement) {
        return createElement('div');
      },

      inheritAttrs: false,

      mounted() {
        // $FlowFixMe[object-this-reference]
        const el = this.$el; // $FlowFixMe[object-this-reference]

        this.parent = init({ ...propsToCamelCase(this.$attrs)
        }); // $FlowFixMe[object-this-reference]

        this.parent.render(el, _constants.CONTEXT.IFRAME);
      },

      watch: {
        $attrs: {
          handler: function handler() {
            if (this.parent && this.$attrs) {
              this.parent.updateProps({ ...this.$attrs
              }).catch(_src.noop);
            }
          },
          deep: true
        }
      }
    });
  }
};
exports.vue = vue;