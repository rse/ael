
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
JavaScript-style expressions. The expressions are based on sequence,
assignment, conditional, logical, bitwise, relational, arithmetical,
functional, selective and literal constructs and hence can express
arbitrary complex matchings and lookups. The result can be an arbitrary
value, but usually is just a boolean one. AEL is primarily intended
to be used for evaluating access control rules or expanding template
variables.

Installation
------------

```shell
$ npm install ael
```

Usage
-----

```
$ cat sample.js
const AEL = require("ael")

const ael = new AEL({
    trace: (msg) => console.log(msg)
})

const data = {
    session: {
        user: {
            login: "rse",
            email: "rse@engelschall.com"
        },
        tokens: [
            "455c3026-50cf-11eb-8d93-7085c287160d",
            "4600b07e-50cf-11eb-8d57-7085c287160d"
        ]
    },
}

const expr = `
    grant =~ /^login:(.+)$/ ? session.user.login =~ $1 :
    grant =~ /^email:(.+)$/ ? session.user.email =~ $1 :
    grant =~ /^token:(.+)$/ ? session.tokens     >= $1 : false
`

const grants = [
    "login:^(?:rse|foo|bar)$",
    "email:^.+@engelschall\\.com$",
    "email:^.+@example\\.com$",
    "token:4600b07e-50cf-11eb-8d57-7085c287160d"
]

try {
    let granted = false
    for (const grant of grants) {
        if (ael.evaluate(expr, { ...data, grant })) {
            granted = true
            break
        }
    }
    console.log("GRANTED", granted)
}
catch (ex) {
    console.log("ERROR", ex.toString())
}

$ node sample.js
compile: +---(expression string)---------------------------------------------------------------------------------
compile: |
compile: |     grant =~ /^login:(.+)$/ ? session.user.login =~ $1 :
compile: |     grant =~ /^email:(.+)$/ ? session.user.email =~ $1 :
compile: |     grant =~ /^token:(.+)$/ ? session.tokens     >= $1 : false
compile: +---(abstract syntax tree)------------------------------------------------------------------------------
compile: | ConditionalTernary (expr: "\n    grant =~ /^login:(.+)$/ ? session.user.login =~ $1 :\n    grant =~ /^email:(.+)$/ ? session.user.email =~ $1 :\n    grant =~ /^token:(.+)$/ ? session.tokens     >= $1 : false\n") [2,5]
compile: | ├── Relational (op: "=~") [2,5]
compile: | │   ├── Variable (id: "grant") [2,5]
compile: | │   └── LiteralRegExp (value: /^login:(.+)$/) [2,14]
compile: | ├── Relational (op: "=~") [2,31]
compile: | │   ├── Select [2,31]
compile: | │   │   ├── Variable (id: "session") [2,31]
compile: | │   │   ├── SelectItem [2,38]
compile: | │   │   │   └── Identifier (id: "user") [2,39]
compile: | │   │   └── SelectItem [2,43]
compile: | │   │       └── Identifier (id: "login") [2,44]
compile: | │   └── Variable (id: "$1") [2,53]
compile: | └── ConditionalTernary [3,5]
compile: |     ├── Relational (op: "=~") [3,5]
compile: |     │   ├── Variable (id: "grant") [3,5]
compile: |     │   └── LiteralRegExp (value: /^email:(.+)$/) [3,14]
compile: |     ├── Relational (op: "=~") [3,31]
compile: |     │   ├── Select [3,31]
compile: |     │   │   ├── Variable (id: "session") [3,31]
compile: |     │   │   ├── SelectItem [3,38]
compile: |     │   │   │   └── Identifier (id: "user") [3,39]
compile: |     │   │   └── SelectItem [3,43]
compile: |     │   │       └── Identifier (id: "email") [3,44]
compile: |     │   └── Variable (id: "$1") [3,53]
compile: |     └── ConditionalTernary [4,5]
compile: |         ├── Relational (op: "=~") [4,5]
compile: |         │   ├── Variable (id: "grant") [4,5]
compile: |         │   └── LiteralRegExp (value: /^token:(.+)$/) [4,14]
compile: |         ├── Relational (op: ">=") [4,31]
compile: |         │   ├── Select [4,31]
compile: |         │   │   ├── Variable (id: "session") [4,31]
compile: |         │   │   └── SelectItem [4,38]
compile: |         │   │       └── Identifier (id: "tokens") [4,39]
compile: |         │   └── Variable (id: "$1") [4,53]
compile: |         └── LiteralValue (value: false) [4,58]
execute: +---(evaluation recursion tree)-------------------------------------------------------------------------
execute: | ConditionalTernary {
execute: |     Relational {
execute: |         Variable {
execute: |         }: "login:^(?:rse|foo|bar)$"
execute: |         LiteralRegExp {
execute: |         }: {}
execute: |     }: true
execute: |     Relational {
execute: |         Select {
execute: |             Variable {
execute: |             }: {"user":{"login":"rse","email":"rse@enge...
execute: |                 Identifier {
execute: |                 }: "user"
execute: |                 Identifier {
execute: |                 }: "login"
execute: |         }: "rse"
execute: |         Variable {
execute: |         }: "^(?:rse|foo|bar)$"
execute: |     }: true
execute: | }: true
GRANTED true
```

Expression Language
-------------------

The following BNF-style grammar shows the supported expression language:

```
//  top-level
expr             ::= sequence
                   | assignment
                   | conditional
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
sequence         ::= expr ("," expr)+
assignment       ::= id "=" expr
conditional      ::= expr "?" expr ":" expr
                   | expr "??" expr
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
literal          ::= array | object | template | string | regexp | number | value
parenthesis      ::= "(" expr ")"

//  literals
id               ::= /[a-zA-Z_][a-zA-Z0-9_-]*/
array            ::= "[" (expr ("," expr)*)? "]"
object           ::= "{" (key ":" expr ("," key ":" expr)*)? "}"
key              ::= "[" expr "]"
                   | id
template         ::= "`" ("${" expr "}" / ("\\`"|.))* "`"
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
                cache?:    number,   /*  number of LRU-cached ASTs (default: 0)      */
                trace?: (            /*  optional tracing callback (default: null)   */
                    msg:   string    /*  tracing message                             */
                ) => void
            }
        )

        /*  individual step 1: compile (and cache) expression into AST  */
        compile(
            expr:          string    /*  expression string                           */
        ): any                       /*  abstract syntax tree                        */

        /*  individual step 2: execute AST  */
        execute(
            ast:           any,      /*  abstract syntax tree                        */
            vars?:         object,   /*  data variables  (read-only)  (default: {})  */
            state?:        object    /*  state variables (read-write) (default: {})  */
        ): void

        /*  all-in-one step: evaluate (compile and execute) expression  */
        evaluate(
            expr:          string,   /*  expression string                           */
            vars?:         object,   /*  data variables  (read-only)  (default: {})  */
            state?:        object    /*  state variables (read-write) (default: {})  */
        ): any
    }
    export = AEL
}
```

Implementation Notice
---------------------

Although AEL is written in ECMAScript 2020, it is transpiled to older
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

Copyright &copy; 2021 Dr. Ralf S. Engelschall (http://engelschall.com/)

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

