batch-replace
========================================================================
**Perform multiple str.replace() with one operation.**

In some situations it's not possible to chain multiple calls of `replace()` because you don't want to pass the result of the first operation to the second:

```javascript
"ab".replace(/a/g, "b")
    .replace(/b/g, "c"); // returns "cc" instead of "bc"
```

With **batch-replace** it's possible to replace all patterns at once:

```javascript
var replace = require("batch-replace");

replace(/a/g).with("b")
    .and(/b/g).with("c")
    .in("ab"); // returns bc
```

You can even create "replacement modules" for common tasks and to improve readability:

```javascript
replace.hyperlinks().emoticons().in(message);
```

The chainable api creates a queue of replacement modules behind the scenes. If you need the same queue over and over again you can save a reference to the queue by calling `.queue()`:

```javascript
var enhanceMessage = replace.hyperlinks().emoticons().queue();

enhanceMessage("Check out example.com :)");
// returns 'Check out <a href="http://example.com" target="_blank">example.com</a> <img srg="/img/smilies/grin.jpg" />'

enhanceMessage("Check out nodejs.org :)");
// returns 'Check out <a href="http://nodejs.org" target="_blank">nodejs.org</a> <img srg="/img/smilies/grin.jpg" />'
```

<br>

Setup
------------------------------------------------------------------------

[![npm status](https://nodei.co/npm/batch-replace.svg?downloads=true&stars=true)](https://npmjs.org/package/batch-replace)

[![build status](https://travis-ci.org/peerigon/batch-replace.svg)](http://travis-ci.org/peerigon/batch-replace)
[![dependencies](https://david-dm.org/peerigon/batch-replace.svg)](http://david-dm.org/peerigon/batch-replace)
[![devDependency Status](https://david-dm.org/peerigon/batch-replace/dev-status.svg)](https://david-dm.org/peerigon/batch-replace#info=devDependencies)
[![coverage status](https://img.shields.io/coveralls/peerigon/batch-replace.svg)](https://coveralls.io/r/peerigon/peerigon/batch-replace?branch=master)

[![browser support](https://ci.testling.com/peerigon/batch-replace.png)
](https://ci.testling.com/peerigon/batch-replace)

<br>

Conflicts
---------

If multiple patterns match the exact same string, the latter will succeed:

```javascript
replace(/./g).with(" ")
    .and(/b/g).with("B")
    .in("b");
// returns 'B'
```

If multiple patterns match parts of the same string, the match with the lower index succeeds:

```javascript
replace(/abc/g).with("ABC")        // index = 0
    .and(/abc/g).with("Alphabet")  // index = 0
    .and(/b/g).with("B")           // index = 1
    .and(/c/g).with("C")           // index = 2
    .in("abc")
// returns 'Alphabet'
```

<br>

Replacement modules
------------------------------------------------------------------------

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

**batch-replace** comes with useful modules which are completely optional to use (see below). Please feel free to open a pull request if you implemented another useful replacement module.

### hyperlinks

This module wraps all url-like patterns in a text with `<a>`-tags:

```javascript
replace.use(require("batch-replace/plugins/hyperlinks"));

replace.hyperlinks().in("Hi, please take a look at example.com");
// returns 'Hi, please take a look at <a href="http://example.com" target="_blank">example.com</a>'
```

In case you need to modify the generated html just overwrite the `hyperlink`-function just like that:

```javascript
var hyperlinks = require("batch-replace/plugins/hyperlinks");

// If the text was 'Hi, please take a look at example.com'
// url will be 'http://example.com' and str will be 'example.com'
hyperlinks.hyperlink = function (url, str) {
    return '<a href="' + url + '">' + str + '</a>';
};
```

### html

This module escapes all special html characters like `&` `<` `>` `"` and `'` with their save entity counterparts. Use this module if you need to escape user data to prevent XSS attacks.

```javascript
replace.use(require("batch-replace/plugins/html"));

replace.html().in("This is a mean <script>alert('XSS attack!')</script>");
// returns 'This is a mean &lt;script&gt;alert(&#x27;XSS attack!&#x27;)&lt;/script&gt;'
```

<br>

API
------------------------------------------------------------------------

### replace(pattern: RegExp)

Creates a new queue where patterns and replacements can be registered. The given `pattern` is pushed into the new queue.

### .with(replacement: String|Function)

Registers the `replacement` to the current pattern in the queue.

### .and(pattern: RegExp)

Pushes a new `pattern` into the queue.

### .in(str: String)

Runs all replacement modules in the queue on the given string.

### .queue(): Function

Returns a standalone function that takes a string and runs the configured replacement modules on it. Use this function if you need the same queue over and over again.

### .module(name: String, module: Object)

Publishes the `module` under `replace[name]`. Write replacement modules for common replacement tasks and don't hesitate to create a pull-request so everyone benefits.

<br>

Compatibility
------------------------------------------------------------------------

It is worth noting that the current api is not designed for ES3-environments (IE8 and Android 2.x) due usage of reserved keywords like `with` and `in`. If you need to support these environments and you don't want to use bracket notation (e.g. `["in"]`), you can also use the "ugly api":

### replace(str: String, modules: Array): String

Applies all `modules` on the given string and returns the result. Example:

```javascript
replace("abcd", [
    {
        pattern: /a/g,
        replace: "b"
    },
    {
        pattern: /b/g,
        replace: "c"
    }
]); // returns 'bccd'
```

**batch-replace** requires several polyfills for ES5-features, so you should be sure to include [es5-shims](https://github.com/es-shims/es5-shim).

<br>

License
------------------------------------------------------------------------

MIT
