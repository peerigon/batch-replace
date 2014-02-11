batch-replace
===========
**Perform multiple str.replace() with one operation.**

In some situations it's not possible to chain multiple calls of `replace()`, because you don't want to pass the result of the first operation to the second:

```javascript
"ab".replace(/a/g, "b")
    .replace(/b/g, "c"); // returns "cc" instead of "bc"
```

With **batch-replace** it's possible to replace all patterns at once:

```javascript
var replace = require("batch-replace");

replace(/a/g).with("b")
    .and(/b/g).with("c)
    .in("ab"); // returns bc
```

You can create modules for common tasks and to improve readability:

```javascript
replace.hyperlinks().emoticons().in(message);
```

[![Build Status](https://secure.travis-ci.org/peerigon/batch-replace?branch=master)](http://travis-ci.org/jhnns/rewire)
[![Dependency Status](https://david-dm.org/peerigon/batch-replace/status.png)](http://david-dm.org/peerigon/batch-replace)

<br />

Installation
------------

`npm install batch-replace`

<br />

Modules
------------

A replacement module is an object with a `pattern`- and a `replace`-property:

```javascript
{
    pattern: /abc/g,
    replace: "ABC"
}
```

The `replace`-property may also be a function which accepts the `match` returned by `pattern.exec()` and returns the new string:

```javascript
{
    pattern: /abc/g,
    replace: function (match) {
        return match[0].toUpperCase();
    }
}
```

You can add these modules by calling `module()`:

```javascript
replace.module("abcToUppercase", {
    pattern: /abc/g,
    replace: "ABC"
});
```

After that you can chain them like this:

```javascript
replace.abcToUppercase().in("abcdefgh"); // returns "ABCdefgh"
``` 

<br />

License
-------

MIT
