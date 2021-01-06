
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

Advanced Expression Language (AEL) is a JavaScript library for use
in the Browser and Node.js to parse/compile and execute/evaluate
JavaScript-style expressions. The expressions are based on conditional,
logical, bitwise, relational, arithmetical, functional, literal and
value constructs and hence can express arbitrary complex matching. The
result can be an arbitrary value, but usually is just a boolean one.

Expression Language
-------------------

### By Example

    foo bar quux

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

```ts
declare module "AEL" {
    class AEL {
        /*  create AEL instance  */
        public constructor()

        /*  set AST cache size  */
        public cache (
            entries: number          /*  number of AST cache entries  */
        ): AEL

        /*  individual step 1: compile (and cache) expression into AST  */
        compile(
            expr:          string,   /*  expression string  */
            trace?:        boolean   /*  whether to output trace information (default: false)  */
        ): any                       /*  abstract syntax tree  */

        /*  individual step 2: execute AST  */
        execute(
            ast:           any,      /*  abstract syntax tree  */
            vars:          object,   /*  expression variables  */
            trace?:        boolean   /*  whether to output trace information (default: false)  */
        ): void

        /*  all-in-one step: evaluate (compile and execute) expression  */
        evaluate(
            expr:          string,   /*  expression string  */
            vars:          object,   /*  expression variables  */
            trace?:        boolean   /*  whether to output trace information (default: false)  */
        ): any
    }
    export = AEL
}
```

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

