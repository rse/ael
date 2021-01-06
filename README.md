
AEL
===

Advanced Expression Language (AEL)

<p/>
<img src="https://nodei.co/npm/ael.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/ael.png" alt=""/>

Installation
------------

```shell
$ npm install ael
```

About
-----

Advanced Expression Language (AEL) is a library in JavaScript for use
in the Browser and Node.js to parse and evaluate JavaScript-style
expressions.

Expression Language
-------------------

### By Example

FIXME

### By Grammar

FIXME

    expr             ::= conditional
                       | logical
                       | bitwise
                       | relational
                       | arithmentical
                       | function-call
                       | attribute-ref
                       | query-parameter
                       | literal
                       | parenthesis
                       | sub-query
    conditional      ::= expr "?" expr ":" expr
                       | expr "?:" expr
    logical          ::= expr ("&&" | "||") expr
                       | "!" expr
    bitwise          ::= expr ("&" | "|" | "<<" | ">>") expr
                       | "~" expr
    relational       ::= expr ("==" | "!=" | "<=" | ">=" | "<" | ">" | "=~" | "!~") expr
    arithmethical    ::= expr ("+" | "-" | "*" | "/" | "%" | "**") expr
    function-call    ::= id "(" (expr ("," expr)*)? ")"
    attribute-ref    ::= "@" (id | string)
    query-parameter  ::= "{" id "}"
    id               ::= /[a-zA-Z_][a-zA-Z0-9_-]*/
    literal          ::= string | regexp | number | value
    string           ::= /"(\\"|.)*"/ | /'(\\'|.)*'/
    regexp           ::= /`(\\`|.)*`/
    number           ::= /\d+(\.\d+)?$/
    value            ::= "true" | "false" | "null" | "NaN" | "undefined"
    parenthesis      ::= "(" expr ")"
    sub-query        ::= path           // <-- ESSENTIAL RECURSION !!

Application Programming Interface (API)
---------------------------------------

### AEL API

- `new AEL(): AEL`:<br/>
  Create a new AEL instance.

- `AEL#version(): { major: Number, minor: Number, micro: Number, date: Number }`:<br/>
  Return the current AEL library version details.

- `AEL#func(name: String, func: (adapter: Adapter, node: Object, [...]) => Any): AEL`:<br/>
  Register function named `name` by providing the callback `func` which has
  to return an arbitrary value and optionally can access the current `node` with
  the help of the selected `adapter`. Returns the API itself.

        /*  the built-in implementation for "depth"  */
        ael.func("depth", function (adapter, node) => {
            var depth = 1
            while ((node = adapter.getParentNode(node)) !== null)
                depth++
            return depth
        })

- `AEL#cache(num: Number): AEL`:<br/>
  Set the upper limit for the internal query cache to `num`, i.e.,
  up to `num` ASTs of parsed queries will be cached. Set `num` to
  `0` to disable the cache at all. Returns the API itself.

- `AEL#compile(selector: String, trace?: Boolean): AELQuery {
  Compile `selector` DSL into an internal query object for subsequent
  processing by `AEL#execute`.
  If `trace` is `true` the compiling is dumped to the console.
  Returns the query object.

- `AEL#execute(node: Object, query: AELQuery, params?: Object, trace?: Boolean): Object[]`:<br/>
  Execute the previously compiled `query` (see `compile` above) at `node`.
  The optional `params` object can provide parameters for the `{name}` query constructs.
  If `trace` is `true` the execution is dumped to the console.
  Returns an array of zero or more matching AST nodes.

- `AEL#evaluate(node: Object, selector: String, params?: Object, trace?: Boolean): Object[]`: <br/>
  Just the convenient combination of `compile` and `execute`:
  `execute(node, compile(selector, trace), params, trace)`.
  Use this as the standard query method except you need more control.
  The optional `params` object can provide parameters for the `{name}` query constructs.
  If `trace` is `true` the compiling and execution is dumped to the console.
  Returns an array of zero or more matching AST nodes.

Example
-------

```
$ cat sample.js
FIXME

$ node sample.js
FIXME
```

Implementation Notice
---------------------

Although AEL is written in ECMAScript 2018, it is transpiled to older
environments and this way runs in really all current (as of 2021)
JavaScript environments, of course.

Additionally, there are two transpilation results: first, there is a
compressed `ael.browser.js` for Browser environments. Second, there is
an uncompressed `ael.node.js` for Node.js environments.

The Browser variant `ael.browser.js` has all external dependencies `asty`,
`pegjs-otf`, `pegjs-util`, and `cache-lru` directly embedded. The
Node.js variant `ael.node.js` still requires the external dependencies
`asty`, `pegjs-otf`, `pegjs-util`, and `cache-lru`.

License
-------

Copyright (c) 2021 Dr. Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

