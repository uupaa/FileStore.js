(function moduleExporter(name, closure) {
"use strict";

var entity = GLOBAL["WebModule"]["exports"](name, closure);

if (typeof module !== "undefined") {
    module["exports"] = entity;
}
return entity;

})("FileStore", function moduleClosure(global, WebModule, VERIFY/*, VERBOSE */) {
"use strict";

// --- technical terms / data structure --------------------
// --- dependency modules ----------------------------------
var URI        = WebModule["URI"];
var MimeType   = WebModule["MimeType"];
var FileLoader = WebModule["FileLoader"];
var SandBox    = WebModule["FileStoreSandBox"];
// --- import / local extract functions --------------------
// --- define / local variables ----------------------------
// --- class / interfaces ----------------------------------
var FileStore = {
    "load":     FileStore_load, // FileStore.load(url:URLString, type:String,
                                //                readyCallback:Function, errorCallback:Function = null):void
    "save":     FileStore_save, // FileStore.save(resource:Object,
                                //                readyCallback:Function, errorCallback:Function = null):void
    "repository": "https://github.com/uupaa/FileStore.js",
};

// --- implements ------------------------------------------
function FileStore_load(url,             // @arg URLString
                        type,            // @arg String - "text", "json", "blob", "arraybuffer"
                        readyCallback,   // @arg Function - readyCallback(event:Event, url:URLString):void
                        errorCallback) { // @arg Function = null - errorCallback(error:Error, url:URLString):void
//{@dev
    if (VERIFY) {
        $valid($type(url,           "URLString"),     FileStore_load, "url");
        $valid($type(type,          "String"),        FileStore_load, "type");
        $valid($some(type,          "text|json|blob|arraybuffer"), FileStore_load, "type");
        $valid($type(readyCallback, "Function"),      FileStore_load, "readyCallback");
        $valid($type(errorCallback, "Function|omit"), FileStore_load, "errorCallback");
    }
//}@dev

    if (IN_BROWSER || IN_WORKER) {
        SandBox["load"](url, type, readyCallback, errorCallback);
    } else if (IN_NW || IN_EL || IN_NODE) {
        switch (type) {
        case "text":        FileLoader["loadText"](url, readyCallback, errorCallback); break;
        case "json":        FileLoader["loadJSON"](url, readyCallback, errorCallback); break;
        case "blob":        FileLoader["loadBlob"](url, readyCallback, errorCallback); break;
        case "arraybuffer": FileLoader["loadArrayBuffer"](url, readyCallback, errorCallback); break;
        default:
        }
    } else {
        errorCallback( new Error("NOT_IMPL"), url );
    }
}

function FileStore_save(resource,        // @arg Object - { url:URLString, mime:MimeTypeString, src:TypedArray|ArrayBuffer|Blob|JSONObject|String }
                        readyCallback,   // @arg Function - readyCallback(event:Event, url:URLString):void
                        errorCallback) { // @arg Function = null - errorCallback(error:Error, url:URLString):void
//{@dev
    if (VERIFY) {
        $valid($type(resource,          "Object"),        FileStore_save, "resource");
        $valid($keys(resource,          "url|mime|src"),  FileStore_save, "resource");
        if (resource.url) {
            $valid($type(resource.url,  "URLString"),     FileStore_save, "resource.url");
        }
        if (resource.mime) {
            $valid($type(resource.mime, "String|omit"),   FileStore_save, "resource.mime");
        }
        if (resource.src) {
            $valid($type(resource.src,  "TypedArray|ArrayBuffer|Blob|JSONObject|String"), FileStore_save, "resource.src");
        }
        $valid($type(readyCallback,     "Function"),      FileStore_save, "readyCallback");
        $valid($type(errorCallback,     "Function|omit"), FileStore_save, "errorCallback");
    }
//}@dev

    errorCallback = errorCallback || function(error, url) {
        console.error(error.message, url);
    };

    var url  = resource["url"];
    var mime = resource["mime"] || MimeType["getMimeType"]( URI["getExt"](url) );
    var src  = resource["src"];

    if (IN_BROWSER || IN_WORKER) {
        SandBox["save"]({ "url": url, "mime": mime, "src": src }, readyCallback, errorCallback);
    } else if (IN_NW || IN_EL || IN_NODE) {
        var fs = require("fs");

        switch ( _getContentType(src) ) {
        case "TypedArray":
            fs["writeFile"](url, new Buffer(src["buffer"]), function() {
                readyCallback( { "type": "writeend" }, url );
            });
            break;
        case "ArrayBuffer":
            fs["writeFile"](url, new Buffer(src), function() {
                readyCallback( { "type": "writeend" }, url );
            });
            break;
        case "Blob":
            errorCallback(new Error("NOT_IMPL"), url);
            break;
        case "Text":
            fs["writeFile"](url, src, "utf8", function() {
                readyCallback( { "type": "writeend" }, url );
            });
            break;
        case "Object":
            fs["writeFile"](url, JSON.stringify(src), "utf8", function() {
                readyCallback( { "type": "writeend" }, url );
            });
            break;
        default:
            errorCallback(new Error("NOT_IMPL"), url);
        }
    } else {
        errorCallback( new Error("NOT_IMPL"), url );
    }
}

function _getContentType(src) { // @arg Any
    if (src["BYTES_PER_ELEMENT"]) {
        return "TypedArray";
    } else if (src instanceof ArrayBuffer) {
        return "ArrayBuffer";
    } else if (src.constructor.name === "Blob") { // Blob not impl in Node.js
        return "Blob";
    } else if (typeof src === "string") {
        return "Text";
    } else if (typeof src === "object") { // Maybe JSON Object
        return "Object";
    }
    return "";
}

return FileStore; // return entity

});

