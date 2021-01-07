
AEL
===

Advanced Expression Language (AEL)

<p/>
<img src="https://nodei.co/npm/ael.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/ael.png" alt=""/>

About
-----

Advanced Expression Language (AEL) is a JavaScript library for use
in the Browser and Node.js to parse/compile and execute/evaluate
JavaScript-style expressions. The expressions are based on conditional,
logical, bitwise, relational, arithmetical, functional, selective and
literal constructs and hence can express arbitrary complex matchings and
lookups. The result can be an arbitrary value, but usually is just a
boolean one.

Installation
------------

```shell
$ npm install ael
```

Usage
-----

```
$ cat sample.js
const AEL = require("..")

const ael = new AEL({ trace: (msg) => console.log(msg) })

const expr = `foo.quux =~ /ux$/ && foo.bar.a == 1`

const data = {
    foo: {
        bar: { a: 1, b: 2, c: 3 },
        baz: [ "a", "b", "c", "d", "e" ],
        quux: "quux"
    }
}

try {
    const result = ael.evaluate(expr, data)
    console.log("RESULT", result)
}
catch (ex) {
    console.log("ERROR", ex.toString())
}

$ node sample.js
AEL: compile: +---(expression string)---------------------------------------------------------------------------------
AEL: compile: | foo.quux =~ /ux$/ && foo.bar.a == 1
AEL: compile: +---(abstract syntax tree)------------------------------------------------------------------------------
AEL: compile: | Logical (op: "&&", expr: "foo.quux =~ /ux$/ && foo.bar.a == 1") [1,1]
AEL: compile: | ├── Relational (op: "=~") [1,1]
AEL: compile: | │   ├── Select [1,1]
AEL: compile: | │   │   ├── Variable (id: "foo") [1,1]
AEL: compile: | │   │   └── SelectItem [1,4]
AEL: compile: | │   │       └── Identifier (id: "quux") [1,5]
AEL: compile: | │   └── LiteralRegExp (value: /ux$/) [1,13]
AEL: compile: | └── Relational (op: "==") [1,22]
AEL: compile: |     ├── Select [1,22]
AEL: compile: |     │   ├── Variable (id: "foo") [1,22]
AEL: compile: |     │   ├── SelectItem [1,25]
AEL: compile: |     │   │   └── Identifier (id: "bar") [1,26]
AEL: compile: |     │   └── SelectItem [1,29]
AEL: compile: |     │       └── Identifier (id: "a") [1,30]
AEL: compile: |     └── LiteralNumber (value: 1) [1,35]
AEL: execute: +---(evaluation recursion tree)-------------------------------------------------------------------------
AEL: execute: | Logical {
AEL: execute: |     Relational {
AEL: execute: |         Select {
AEL: execute: |             Variable {
AEL: execute: |             }: {"bar":{"a":1,"b":2,"c":3},"baz":["a","b...
AEL: execute: |                 Identifier {
AEL: execute: |                 }: "quux"
AEL: execute: |         }: "quux"
AEL: execute: |         LiteralRegExp {
AEL: execute: |         }: {}
AEL: execute: |     }: true
AEL: execute: |     Relational {
AEL: execute: |         Select {
AEL: execute: |             Variable {
AEL: execute: |             }: {"bar":{"a":1,"b":2,"c":3},"baz":["a","b...
AEL: execute: |                 Identifier {
AEL: execute: |                 }: "bar"
AEL: execute: |                 Identifier {
AEL: execute: |                 }: "a"
AEL: execute: |         }: 1
AEL: execute: |         LiteralNumber {
AEL: execute: |         }: 1
AEL: execute: |     }: true
AEL: execute: | }: true
```

Expression Language
-------------------

The following BNF-style grammar shows the supported expression language:

```
//  top-level
expr             ::= conditional
                   | logical
                   | bitwise
                   | relational
                   | arithmentical
                   | functional
                   | selective
                   | variable
                   | literal
                   | parenthesis

//  expressions
conditional      ::= expr "?" expr ":" expr
                   | expr "?:" expr
logical          ::= expr ("&&" | "||") expr
                   | "!" expr
bitwise          ::= expr ("&" | "^" | "|" | "<<" | ">>") expr
                   | "~" expr
relational       ::= expr ("==" | "!=" | "<=" | ">=" | "<" | ">" | "=~" | "!~") expr
arithmethical    ::= expr ("+" | "-" | "*" | "/" | "%" | "**") expr
functional       ::= expr "?."? "(" (expr ("," expr)*)? ")"
selective        ::= expr "?."? "." ud
                   | expr "?."? "[" expr "]"
variable         ::= id
literal          ::= array | object | string | regexp | number | value
parenthesis      ::= "(" expr ")"

//  literals
id               ::= /[a-zA-Z_][a-zA-Z0-9_-]*/
array            ::= "[" (expr ("," expr)*)? "]"
object           ::= "{" (key ":" expr ("," key ":" expr)*)? "}"
key              ::= "[" expr "]"
                   | id
string           ::= /"(\\"|.)*"/
                   | /'(\\'|.)*'/
regexp           ::= /`(\\`|.)*`/
number           ::= /[+-]?/ number-value
number-value     ::= "0b" /[01]+/
                   | "0o" /[0-7]+/
                   | "0x" /[0-9a-fA-F]+/
                   | /[0-9]*\.[0-9]+([eE][+-]?[0-9]+)?/
                   | /[0-9]+/
value            ::= "true" | "false" | "null" | "NaN" | "undefined"
```

Application Programming Interface (API)
---------------------------------------

The following TypeScript definition shows the supported Application Programming Interface (API):

```ts
declare module "AEL" {
    class AEL {
        /*  create AEL instance  */
        public constructor(
            options?: {
                cache?:    number,   /*  number of LRU-cached ASTs (default: 0)  */
                trace?: (            /*  optional tracing callback (default: null)  */
                    msg: string      /*  tracing message  */
                ) => void
            }
        )

        /*  individual step 1: compile (and cache) expression into AST  */
        compile(
            expr:          string    /*  expression string  */
        ): any                       /*  abstract syntax tree  */

        /*  individual step 2: execute AST  */
        execute(
            ast:           any,      /*  abstract syntax tree  */
            vars:          object    /*  expression variables  */
        ): void

        /*  all-in-one step: evaluate (compile and execute) expression  */
        evaluate(
            expr:          string,   /*  expression string  */
            vars:          object    /*  expression variables  */
        ): any
    }
    export = AEL
}
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

