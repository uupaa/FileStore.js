// FileStore test

require("../../lib/WebModule.js");

WebModule.VERIFY  = true;
WebModule.VERBOSE = true;
WebModule.PUBLISH = true;

require("../../node_modules/uupaa.uri.js/lib/URI.js");
require("../../node_modules/uupaa.mimetype.js/lib/MimeType.js");
require("../wmtools.js");
require("../../lib/FileStoreSandBox.js");
require("../../lib/FileStore.js");
require("../../release/FileStore.n.min.js");
require("../testcase.js");

