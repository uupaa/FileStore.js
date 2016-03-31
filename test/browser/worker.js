// FileStore test

onmessage = function(event) {
    self.unitTest = event.data; // { message, setting: { secondary, baseDir } }

    if (!self.console) { // polyfill WebWorkerConsole
        self.console = function() {};
        self.console.dir = function() {};
        self.console.log = function() {};
        self.console.warn = function() {};
        self.console.error = function() {};
        self.console.table = function() {};
    }

    importScripts("../../lib/WebModule.js");

    WebModule.VERIFY  = true;
    WebModule.VERBOSE = true;
    WebModule.PUBLISH = true;

    importScripts("../../node_modules/uupaa.uri.js/lib/URI.js");
    importScripts("../../node_modules/uupaa.mimetype.js/lib/MimeType.js");
    importScripts("../wmtools.js");
    importScripts("../../lib/FileStoreSandBox.js");
    importScripts("../../lib/FileStore.js");
    importScripts("../../release/FileStore.w.min.js");
    importScripts("../testcase.js");

    self.postMessage(self.unitTest);
};

