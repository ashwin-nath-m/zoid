/* @flow */

import { wrapPromise } from 'belter/src';
import { getDomain } from 'cross-domain-utils/src';

describe('parent domain check', () => {

    describe('should not throw error when: ', () => {

        it('allowedParentDomains is a wildcard', () => {
            window.__component__ = () => {
                return window.zoid.create({
                    tag:                  'test-parent-domain-wildcard',
                    url:                  '/base/test/windows/child/index.htm',
                    domain:               'mock://www.child.com',
                    allowedParentDomains: '*'
                });
            };

            const component = window.__component__();
            return component().render(document.body);
        });

        it('allowedParentDomains is specified as string', () => {
            it('allowedParentDomains is a wildcard', () => {
                window.__component__ = () => {
                    return window.zoid.create({
                        tag:                  'test-parent-domain-string',
                        url:                  '/base/test/windows/child/index.htm',
                        domain:               'mock://www.child.com',
                        allowedParentDomains: getDomain()
                    });
                };
    
                const component = window.__component__();
                return component().render(document.body);
            });
        });

        it('allowedParentDomains is specified as array of strings and parent domian match', () => {
            it('allowedParentDomains is a wildcard', () => {
                window.__component__ = () => {
                    return window.zoid.create({
                        tag:                  'test-parent-domain-array',
                        url:                  '/base/test/windows/child/index.htm',
                        domain:               'mock://www.child.com',
                        allowedParentDomains: [ getDomain(), 'https://www.foo.com' ]
                    });
                };
    
                const component = window.__component__();
                return component().render(document.body);
            });
        });

        it('allowedParentDomains is specified as array of strings with a wildcard', () => {
            window.__component__ = () => {
                return window.zoid.create({
                    tag:                  'test-parent-domain-array-wildcard',
                    url:                  '/base/test/windows/child/index.htm',
                    domain:               'mock://www.child.com',
                    allowedParentDomains: [ '*', 'https://www.foo.com' ]
                });
            };

            const component = window.__component__();
            return component().render(document.body);
        });

        it('allowedParentDomains is specified as a regex and parent domian match', () => {
            window.__component__ = () => {
                return window.zoid.create({
                    tag:                  'test-parent-domain-regex',
                    url:                  '/base/test/windows/child/index.htm',
                    domain:               'mock://www.child.com',
                    allowedParentDomains: /.+/
                });
            };

            const component = window.__component__();
            return component().render(document.body);
        });

    });

    describe('should throw error when: ', () => {
        it('allowedParentDomains is specified as string and parent domain does not match', () => {
            return wrapPromise(({ expect }) => {
                window.__component__ = () => {
                    return window.zoid.create({
                        tag:                  'test-parent-domain-string-nomatch',
                        url:                  '/base/test/windows/child/index.htm',
                        domain:               'mock://www.child.com',
                        allowedParentDomains: 'https://www.foo.com'
                    });
                };
    
                const component = window.__component__();
                return component().render(document.body).catch(expect('onError'));
            });
        });

        it('allowedParentDomains is specified as array of strings and parent domain does not match', () => {
            return wrapPromise(({ expect }) => {
                window.__component__ = () => {
                    return window.zoid.create({
                        tag:                  'test-parent-domain-array-nomatch',
                        url:                  '/base/test/windows/child/index.htm',
                        domain:               'mock://www.child.com',
                        allowedParentDomains: [ 'https://www.foo.com', 'https://www.bar.com' ]
                    });
                };
    
                const component = window.__component__();
                return component().render(document.body).catch(expect('onError'));
            });
        });

        it('allowedParentDomains is specified as array of regex expressions and parent domain does not match', () => {
            return wrapPromise(({ expect }) => {
                window.__component__ = () => {
                    return window.zoid.create({
                        tag:                  'test-parent-domain-regex-nomatch',
                        url:                  '/base/test/windows/child/index.htm',
                        domain:               'mock://www.child.com',
                        allowedParentDomains: /^https:\/\/www\.foo\.com$/
                    });
                };
    
                const component = window.__component__();
                return component().render(document.body).catch(expect('onError'));
            });
        });

        it('xprops.getParentDomain should pass the correct domain', () => {
            return wrapPromise(({ expect }) => {
                window.__component__ = () => {
                    return window.zoid.create({
                        tag:    'test-get-parent-domain',
                        url:    '/base/test/windows/child/index.htm',
                        domain: 'mock://www.child.com'
                    });
                };
    
                const component = window.__component__();
                return component({
                    passParentDomain: expect('passParentDomain', (parentDomain) => {
                        if (!parentDomain || parentDomain !== getDomain()) {
                            throw new Error(`Expected parent domain to be ${ getDomain() }, got ${ parentDomain }`);
                        }
                    }),
                    run: () => {
                        return `
                            window.xprops.passParentDomain(window.xprops.getParentDomain());
                        `;
                    }
                }).render(document.body);
            });
        });

        it('xprops.getParentDomain should pass the correct domain', () => {
            return wrapPromise(({ expect }) => {
                window.__component__ = () => {
                    return window.zoid.create({
                        tag:    'test-get-parent',
                        url:    '/base/test/windows/child/index.htm',
                        domain: 'mock://www.child.com'
                    });
                };
    
                const component = window.__component__();
                return component({
                    isParentCorrect: expect('isParentCorrect', (result) => {
                        if (!result) {
                            throw new Error(`Expected parent window to be correct`);
                        }
                    }),
                    run: () => {
                        return `
                            window.xprops.isParentCorrect(window.xprops.getParent() === window.parent);
                        `;
                    }
                }).render(document.body);
            });
        });
    });

});