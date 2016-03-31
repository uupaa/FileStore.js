(function moduleExporter(name, closure) {
"use strict";

var entity = GLOBAL["WebModule"]["exports"](name, closure);

if (typeof module !== "undefined") {
    module["exports"] = entity;
}
return entity;

})("FileStoreSandBox", function moduleClosure(global, WebModule, VERIFY, VERBOSE) {
"use strict";

// --- technical terms / data structure --------------------
// --- dependency modules ----------------------------------
var URI        = WebModule["URI"];
var MimeType   = WebModule["MimeType"];
// --- import / local extract functions --------------------
// --- define / local variables ----------------------------
var _storage           = _getStorage();
var _requestFileSystem = global["requestFileSystem"] ||
                         global["webkitRequestFileSystem"] || null;
var _enableFileSystem  = !!(_requestFileSystem && _storage);

// --- class / interfaces ----------------------------------
var FileStoreSandBox = {
    "ready":            _enableFileSystem,
    "quota":            1024 * 1024 * 5,        // 5MB
    "load":             FileStoreSandBox_load,  // FileStoreSandBox.load(url:URLString, type:String,
                                                //                       readyCallback:Function, errorCallback:Function = null):void
    "save":             FileStoreSandBox_save,  // FileStoreSandBox_save(resource:Object,
                                                //                       readyCallback:Function, errorCallback:Function = null):void
};

// --- implements ------------------------------------------
function FileStoreSandBox_load(url,             // @arg URLString
                               type,            // @arg String  - "text", "json", "blob", "arraybuffer"
                               readyCallback,   // @arg Function - readyCallback(event:Event, url:URLString):void
                               errorCallback) { // @arg Function = null - errorCallback(error:Error, url:URLString):void
                                                // @desc Load from SandBox
//{@dev
    if (VERIFY) {
        $valid($type(url,           "URLString"),     FileStoreSandBox_load, "url");
        $valid($type(type,          "String"),        FileStoreSandBox_load, "type");
        $valid($type(readyCallback, "Function"),      FileStoreSandBox_load, "readyCallback");
        $valid($type(errorCallback, "Function|omit"), FileStoreSandBox_load, "errorCallback");
    }
//}@dev

    if (!_enableFileSystem) {
        errorCallback( new Error("NOT_IMPL"), url );
        return;
    }
    _storage["requestQuota"](FileStoreSandBox["quota"], function(grantedBytes) {
        _requestFileSystem(global["PERSISTENT"], grantedBytes, function(fs) {
           fs["root"]["getFile"](url, {}, function(fileEntry) {
                fileEntry["file"](function(file) {
                    var reader = new FileReader();

                    reader["onloadend"] = function() {
                        if (type === "json") {
                            readyCallback(JSON.parse(reader.result), url);
                        } else {
                            readyCallback(reader.result, url);
                        }
                    };
                    switch (type) {
                    case "text": reader["readAsText"](file); break;
                    case "json": reader["readAsText"](file); break;
                    case "blob": reader["readAsBinaryString"](file); break;
                    case "arraybuffer": reader["readAsArrayBuffer"](file); break;
                    default:
                        errorCallback( new Error("NOT_IMPL"), url );
                    }
                });
            });
        });
    });
}

function FileStoreSandBox_save(resource,        // @arg Object - { url:URLString, mime:MimeTypeString, src:TypedArray|ArrayBuffer|Blob|JSONObject|String }
                               readyCallback,   // @arg Function - readyCallback(event:Event, url:URLString):void
                               errorCallback) { // @arg Function = null - errorCallback(error:Error, url:URLString):void
                                                // @desc Save to SandBox
//{@dev
    if (VERIFY) {
        $valid($type(resource,      "Object"),        FileStoreSandBox_save, "resource");
        $valid($keys(resource,      "url|mime|src"),  FileStoreSandBox_save, "resource");
        $valid($type(resource.url,  "URLString"),     FileStoreSandBox_save, "resource.url");
        $valid($type(resource.mime, "String|omit"),   FileStoreSandBox_save, "resource.mime");
        $valid($type(resource.src,  "TypedArray|ArrayBuffer|Blob|JSONObject|String"), FileStoreSandBox_save, "resource.src");
        $valid($type(readyCallback, "Function"),      FileStoreSandBox_save, "readyCallback");
        $valid($type(errorCallback, "Function|omit"), FileStoreSandBox_save, "errorCallback");
    }
//}@dev
//
    errorCallback = errorCallback || _defaultErrorCallback;

    var url  = resource["url"];
    var mime = resource["mime"] || MimeType["getMimeType"]( URI["getExt"](url) );
    var src  = resource["src"];

    if (!_enableFileSystem) {
        errorCallback( new Error("NOT_IMPL"), url );
        return;
    }
    _storage["requestQuota"](FileStoreSandBox["quota"], function(grantedBytes) {
        _requestFileSystem(global["PERSISTENT"], grantedBytes, function(fs) {

            fs["root"]["getFile"](url, { "create": true }, function(fileEntry) { // @arg FileEntry - { isFile, isDirectory, url, fullPath, filesystem }
                if (VERBOSE) {
                    console.info(fileEntry["toURL"]()); // -> "filesystem:http://localhost:8000/persistent/aaaaa.txt"
                }
                fileEntry["createWriter"](function(fileWriter) {
                    fileWriter["onwriteend"] = function(event) { // @arg ProgressEvent
                        readyCallback(event, url); // { type: "writeend" }
                    };
                    fileWriter["onerror"] = function(error) {
                        errorCallback(error, url);
                    };

                    var blob = null;

                    switch ( _getContentType(src) ) {
                    case "TypedArray":  blob = new Blob([src], { "type": mime }); break;
                    case "ArrayBuffer": blob = new Blob([src], { "type": mime }); break;
                    case "Blob":        blob = src; break;
                    case "Text":        blob = new Blob([src], { "type": mime }); break;
                    case "Object":      blob = new Blob([JSON.stringify(src)], { "type": mime }); break;
                    default:
                        errorCallback(new Error("NOT_IMPL"), url);
                        return;
                    }
                    fileWriter["write"](blob); // FileWriter#write(blob:Blob):void
                }, function(error) {
                    errorCallback(error, url);
                });
            });
        });
    }, function(error) {
        errorCallback(error, url);
    });
}

function _defaultErrorCallback(error) {
    var FileError = global["FileError"];

    switch (error["code"]) {
    case FileError["QUOTA_EXCEEDED_ERR"]:      console.error("QUOTA_EXCEEDED_ERR"); break;
    case FileError["NOT_FOUND_ERR"]:           console.error("NOT_FOUND_ERR"); break;
    case FileError["SECURITY_ERR"]:            console.error("SECURITY_ERR"); break;
    case FileError["INVALID_MODIFICATION_ERR"]:console.error("INVALID_MODIFICATION_ERR"); break;
    case FileError["INVALID_STATE_ERR"]:       console.error("INVALID_STATE_ERR"); break;
    default:                                   console.error("Unknown Error:" + error.message);
    }
}

function _getStorage() { // @ret PersistentStorage
    if (global["navigator"]) {
        return navigator["persistentStorage"]       ||
               navigator["webkitPersistentStorage"] || null;
    }
    return null;
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

return FileStoreSandBox; // return entity

});

