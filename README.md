# FileStore.js [![Build Status](https://travis-ci.org/uupaa/FileStore.js.svg)](https://travis-ci.org/uupaa/FileStore.js)

[![npm](https://nodei.co/npm/uupaa.filestore.js.svg?downloads=true&stars=true)](https://nodei.co/npm/uupaa.filestore.js/)

File Store / Writer.

This module made of [WebModule](https://github.com/uupaa/WebModule).

## Documentation
- [Spec](https://github.com/uupaa/FileStore.js/wiki/)
- [API Spec](https://github.com/uupaa/FileStore.js/wiki/FileStore)

## Browser, NW.js and Electron

```js
<script src="<module-dir>/lib/WebModule.js"></script>
<script src="<module-dir>/lib/FileStore.js"></script>
<script>

var resource = {
    name:   "aaaaa.txt",
    src:    "hello",
};

FileStore.save(resource, function(event, fileName) {
    console.log(fileName);
}, function(error) {
});

FileStore.save(resource, function(event, fileName) {
    console.log(fileName);
}, function(error) {
});


</script>
```

## WebWorkers

```js
importScripts("<module-dir>lib/WebModule.js");
importScripts("<module-dir>lib/FileStore.js");

```

## Node.js

```js
require("<module-dir>lib/WebModule.js");
require("<module-dir>lib/FileStore.js");

```

