var ModuleTestFileStore = (function(global) {

var test = new Test(["FileStore"], { // Add the ModuleName to be tested here (if necessary).
        disable:    false, // disable all tests.
        browser:    true,  // enable browser test.
        worker:     false, // enable worker test.
        node:       true,  // enable node test.
        nw:         true,  // enable nw.js test.
        el:         true,  // enable electron (render process) test.
        button:     true,  // show button.
        both:       false,  // test the primary and secondary modules.
        ignoreError:false, // ignore error.
        callback:   function() {
        },
        errorback:  function(error) {
            console.error(error.message);
        }
    });

//if (IN_BROWSER || IN_WORKER || IN_NW || IN_EL || IN_NODE) {
if (IN_BROWSER || IN_NW || IN_EL || IN_NODE) {
    test.add([
        testFileStore_Text,
        testFileStore_JSON,
        testFileStore_Blob,
        testFileStore_ArrayBuffer,
    ]);
}

var MimeType = global.WebModule.MimeType;

// --- test cases ------------------------------------------
function testFileStore_Text(test, pass, miss) {
    var src = "hello";
    var fileName = "test.txt"

    FileStore.save({ url: fileName, src: src }, function() {
        test.done(pass());
    }, function(error) {
        test.done(miss());
    });
}

function testFileStore_JSON(test, pass, miss) {
    var src = { "msg": "hello" };
    var fileName = "test.json"

    FileStore.save({ url: fileName, src: src }, function() {
        test.done(pass());
    }, function(error) {
        test.done(miss());
    });
}

function testFileStore_Blob(test, pass, miss) {
    if (!global["Blob"]) {
        test.done(pass()); // Node.js has not Blob impl.
        return;
    }
    var src = new Blob(["hello"], { "type": "text/plain" });
    var fileName = "test.blob"
    var mime = MimeType.getMimeType("bin");

    FileStore.save({ url: fileName, src: src, mime: mime }, function() {
        test.done(pass());
    }, function(error) {
        test.done(miss());
    });
}

function testFileStore_ArrayBuffer(test, pass, miss) {
    var src = new Uint8Array([0x68,0x65,0x6c,0x6c,0x6f]); // "hello"
    var fileName = "test.bin"

    FileStore.save({ url: fileName, src: src }, function() {
        test.done(pass());
    }, function(error) {
        test.done(miss());
    });
}


return test.run();

})(GLOBAL);

