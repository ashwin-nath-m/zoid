"use strict";

exports.__esModule = true;
exports.angular2 = void 0;

var _src = require("belter/src");

var _constants = require("../constants");

/* eslint new-cap: 0 */
const equals = (obj1, obj2) => {
  const checked = {};

  for (const key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      checked[key] = true;

      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
  }

  for (const key in obj2) {
    if (!checked[key]) {
      return false;
    }
  }

  return true;
};

const angular2 = {
  register: (tag, propsDef, init, {
    Component: AngularComponent,
    NgModule,
    ElementRef,
    NgZone,
    Inject
  }) => {
    class ComponentInstance {
      constructor(elementRef, zone) {
        this.elementRef = void 0;
        this.internalProps = void 0;
        this.parent = void 0;
        this.props = void 0;
        this.zone = void 0;
        this._props = void 0;
        this._props = {};
        this.elementRef = elementRef;
        this.zone = zone;
      }

      getProps() {
        return (0, _src.replaceObject)({ ...this.internalProps,
          ...this.props
        }, item => {
          if (typeof item === 'function') {
            const {
              zone
            } = this;
            return function angular2Wrapped() {
              // $FlowFixMe
              return zone.run(() => item.apply(this, arguments));
            };
          }

          return item;
        });
      }

      ngOnInit() {
        const targetElement = this.elementRef.nativeElement;
        this.parent = init(this.getProps());
        this.parent.render(targetElement, _constants.CONTEXT.IFRAME);
      }

      ngDoCheck() {
        if (this.parent && !equals(this._props, this.props)) {
          this._props = { ...this.props
          };
          this.parent.updateProps(this.getProps());
        }
      }

    }

    ComponentInstance.annotations = void 0;
    ComponentInstance.parameters = void 0;
    ComponentInstance.parameters = [[new Inject(ElementRef)], [new Inject(NgZone)]];
    ComponentInstance.annotations = [new AngularComponent({
      selector: tag,
      template: `<div></div>`,
      inputs: ['props']
    })];

    class ModuleInstance {}

    ModuleInstance.annotations = void 0;
    ModuleInstance.annotations = [new NgModule({
      declarations: [ComponentInstance],
      exports: [ComponentInstance]
    })];
    return ModuleInstance;
  }
};
exports.angular2 = angular2;