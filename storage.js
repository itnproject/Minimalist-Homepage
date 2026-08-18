(function() {
    'use strict';
    function isExtensionEnvironment() {
        return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
    }

    window.StorageUtil = {
        get: function(key, defaultValue) {
            return new Promise(function(resolve) {
                if (isExtensionEnvironment()) {
                    chrome.storage.local.get([key], function(result) {
                        var value = result[key];
                        if (value === undefined || value === null) {
                            resolve(defaultValue);
                        } else {
                            resolve(value);
                        }
                    });
                } else {
                    try {
                        var value = localStorage.getItem(key);
                        if (value === null) {
                            resolve(defaultValue);
                        } else {
                            resolve(JSON.parse(value));
                        }
                    } catch (e) {
                        resolve(defaultValue);
                    }
                }
            });
        },
        set: function(key, value) {
            return new Promise(function(resolve) {
                if (isExtensionEnvironment()) {
                    var obj = {};
                    obj[key] = value;
                    chrome.storage.local.set(obj, function() {
                        if (resolve) resolve();
                    });
                } else {
                    try {
                        localStorage.setItem(key, JSON.stringify(value));
                        if (resolve) resolve();
                    } catch (e) {
                        console.error('Storage set error:', e);
                        if (resolve) resolve();
                    }
                }
            });
        },
        getMultiple: function(keys, defaults) {
            return new Promise(function(resolve) {
                if (isExtensionEnvironment()) {
                    chrome.storage.local.get(keys, function(result) {
                        var values = {};
                        keys.forEach(function(key) {
                            values[key] = result[key] !== undefined ? result[key] : (defaults[key] || null);
                        });
                        resolve(values);
                    });
                } else {
                    var values = {};
                    keys.forEach(function(key) {
                        try {
                            var value = localStorage.getItem(key);
                            values[key] = value !== null ? JSON.parse(value) : (defaults[key] || null);
                        } catch (e) {
                            values[key] = defaults[key] || null;
                        }
                    });
                    resolve(values);
                }
            });
        },
        setMultiple: function(values) {
            return new Promise(function(resolve) {
                if (isExtensionEnvironment()) {
                    chrome.storage.local.set(values, function() {
                        if (resolve) resolve();
                    });
                } else {
                    try {
                        Object.keys(values).forEach(function(key) {
                            localStorage.setItem(key, JSON.stringify(values[key]));
                        });
                        if (resolve) resolve();
                    } catch (e) {
                        console.error('Storage setMultiple error:', e);
                        if (resolve) resolve();
                    }
                }
            });
        },
        remove: function(key) {
            return new Promise(function(resolve) {
                if (isExtensionEnvironment()) {
                    chrome.storage.local.remove(key, function() {
                        if (resolve) resolve();
                    });
                } else {
                    try {
                        localStorage.removeItem(key);
                        if (resolve) resolve();
                    } catch (e) {
                        if (resolve) resolve();
                    }
                }
            });
        },
        sync: function(key, value) {
            return new Promise(function(resolve) {
                if (isExtensionEnvironment()) {
                    var obj = {};
                    obj[key] = value;
                    chrome.storage.sync.set(obj, function() {
                        if (resolve) resolve();
                    });
                } else {
                    try {
                        localStorage.setItem(key, JSON.stringify(value));
                        if (resolve) resolve();
                    } catch (e) {
                        if (resolve) resolve();
                    }
                }
            });
        }
    };
    window.SyncStorage = (function() {
        var cache = {};
        var initialized = false;
        var initCallbacks = [];

        function initCache() {
            if (initialized) return;
            
            var keys = [
                'customLinks', 'searchHistory', 'searchEngine', 
                'selectedTheme', 'customBackground', 'customEngines',
                'showTimeOnHome', 'showQuickNav', 'expandDir', 
                'extensions', 'devOption', 'modernUiEnabled', 'showQuote',
                'showEngineSwitch', 'showDate', 'autoHideNav', 'hideSettingsBtn', 'enableExtensions'
            ];

            var defaults = {
                customLinks: [],
                searchHistory: [],
                searchEngine: 'bing',
                selectedTheme: 'default',
                customBackground: '',
                customEngines: [],
                showTimeOnHome: '1',
                showQuickNav: '1',
                expandDir: 'Expand',
                extensions: [],
                devOption: '0',
                modernUiEnabled: false,
                showQuote: '1',
                showEngineSwitch: '1',
                showDate: '1',
                autoHideNav: '0',
                hideSettingsBtn: '0',
                enableExtensions: '1'
            };

            if (isExtensionEnvironment()) {
                chrome.storage.local.get(keys, function(result) {
                    keys.forEach(function(key) {
                        cache[key] = result[key] !== undefined ? result[key] : defaults[key];
                    });
                    initialized = true;
                    initCallbacks.forEach(function(cb) { cb(); });
                });
            } else {
                keys.forEach(function(key) {
                    try {
                        var value = localStorage.getItem(key);
                        cache[key] = value !== null ? JSON.parse(value) : defaults[key];
                    } catch (e) {
                        cache[key] = defaults[key];
                    }
                });
                initialized = true;
                initCallbacks.forEach(function(cb) { cb(); });
            }
        }

        initCache();

        return {
            isInitialized: function() {
                return initialized;
            },
            onInitialized: function(callback) {
                if (initialized) {
                    callback();
                } else {
                    initCallbacks.push(callback);
                }
            },
            getItem: function(key, defaultValue) {
                var value = cache[key];
                return value !== undefined ? value : defaultValue;
            },
            setItem: function(key, value) {
                cache[key] = value;
                if (isExtensionEnvironment()) {
                    var obj = {};
                    obj[key] = value;
                    chrome.storage.local.set(obj);
                } else {
                    try {
                        localStorage.setItem(key, JSON.stringify(value));
                    } catch (e) {
                        console.error('SyncStorage setItem error:', e);
                    }
                }
            },
            removeItem: function(key) {
                delete cache[key];
                if (isExtensionEnvironment()) {
                    chrome.storage.local.remove(key);
                } else {
                    try {
                        localStorage.removeItem(key);
                    } catch (e) {
                        console.error('SyncStorage removeItem error:', e);
                    }
                }
            },
            getCache: function() {
                return Object.assign({}, cache);
            }
        };
    })();

})();