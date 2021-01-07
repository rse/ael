/*
**  AEL -- Advanced Expression Language
**  Copyright (c) 2021 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

{
    /*  standard PEGUtil integration code  */
    var unroll = options.util.makeUnroll(location, options)
    var ast    = options.util.makeAST   (location, options)
}

/*
**  ==== EXPRESSION ====
*/

expression
    =   _ e:expr _ eof {
            return e
        }

expr
    =   exprConditional

exprConditional
    =   e1:exprLogicalOr _ "?" _ e2:exprConditional _ ":" _ e3:exprConditional {
            return ast("ConditionalTernary").add(e1, e2, e3)
        }
    /   e1:exprLogicalOr _ "??" _ e2:exprConditional {
            return ast("ConditionalBinary").add(e1, e2)
        }
    /   exprLogicalOr

exprLogicalOr
    =   head:exprLogicalAnd tail:(_ "||" _ exprLogicalAnd)+ {
            return tail.reduce((result, element) => {
                return ast("Logical").set({ op: element[1] }).add(result, element[3])
            }, head)
        }
    /   exprLogicalAnd

exprLogicalAnd
    =   head:exprRelational tail:(_ "&&" _ e2:exprRelational)+ {
            return tail.reduce((result, element) => {
                return ast("Logical").set({ op: element[1] }).add(result, element[3])
            }, head)
        }
    /   exprRelational

exprRelational
    =   head:exprBitwiseOr tail:(_ ("==" / "!=" / "<=" / ">=" / "<" / ">" / "=~" / "!~") _ exprBitwiseOr)+ {
            return tail.reduce((result, element) => {
                return ast("Relational").set({ op: element[1] }).add(result, element[3])
            }, head)
        }
    /   exprBitwiseOr

exprBitwiseOr
    =   head:exprBitwiseXOr tail:(_ "|" _ e2:exprBitwiseXOr)+ {
            return tail.reduce((result, element) => {
                return ast("Bitwise").set({ op: element[1] }).add(result, element[3])
            }, head)
        }
    /   exprBitwiseXOr

exprBitwiseXOr
    =   head:exprBitwiseAnd tail:(_ "^" _ exprBitwiseAnd)+ {
            return tail.reduce((result, element) => {
                return ast("Bitwise").set({ op: element[1] }).add(result, element[3])
            }, head)
        }
    /   exprBitwiseAnd

exprBitwiseAnd
    =   head:exprBitwiseShift tail:(_ "&" _ exprBitwiseShift)+ {
            return tail.reduce((result, element) => {
                return ast("Bitwise").set({ op: element[1] }).add(result, element[3])
            }, head)
        }
    /   exprBitwiseShift

exprBitwiseShift
    =   head:exprAdditive tail:(_ ("<<" / ">>") _ exprAdditive)+ {
            return tail.reduce((result, element) => {
                return ast("Bitwise").set({ op: element[1] }).add(result, element[3])
            }, head)
        }
    /   exprAdditive

exprAdditive
    =   head:exprMultiplicative tail:(_ ("+" / "-") _ exprMultiplicative)+ {
            return tail.reduce((result, element) => {
                return ast("Arithmetical").set({ op: element[1] }).add(result, element[3])
            }, head)
        }
    /   exprMultiplicative

exprMultiplicative
    =   head:exprExponential tail:(_ ("*" / "/" / "%") _ exprExponential)+ {
            return tail.reduce((result, element) => {
                return ast("Arithmetical").set({ op: element[1] }).add(result, element[3])
            }, head)
        }
    /   exprExponential

exprExponential
    =   head:(exprUnary _ "**" _)+ tail:exprUnary {
            return head.reduceRight((result, element) => {
                return ast("Arithmetical").set({ op: element[2] }).add(element[0], result)
            }, tail)
        }
    /   exprUnary

exprUnary
    =   op:$("!" / "~") e:exprUnary {
            return ast("Unary").set({ op: op }).add(e)
        }
    /   exprFunctionCall

exprFunctionCall
    =   e:exprSelect _ oc:"?."? _ "(" _ p:exprFunctionCallParams? _ ")" {
            return ast("FuncCall").set(oc ? { optional: true } : {}).add(e, p)
        }
    /   exprSelect

exprFunctionCallParams
    =   head:expr tail:(_ "," _ expr)* { /* RECURSION */
            return tail.reduce((result, element) => {
                return [ ...result, element[3] ]
            }, [ head ])
        }

exprSelect
    =   e1:exprOther e2:exprSelectItem+ {
            return ast("Select").add(e1, e2)
        }
    /   exprOther

exprSelectItem
    =   _ oc:"?."? _ "[" _ e:expr _ "]" { /* RECURSION */
            return ast("SelectItem").set(oc ? { optional: true } : {}).add(e)
        }
    /   _ "?." _ id:id {
            return ast("SelectItem").set({ optional: true }).add(id)
        }
    /   _ "." _ id:id {
            return ast("SelectItem").add(id)
        }

exprOther
    =   exprVariable
    /   exprLiteralArray
    /   exprLiteralObject
    /   exprLiteralOther
    /   exprParenthesis

exprVariable "variable"
    =   id:id {
            return ast("Variable").merge(id)
        }

exprLiteralArray
    =   "[" _ "]" {
            return ast("LiteralArray")
        }
    /   "[" _ l:exprLiteralArrayItems _ "]" {
            return ast("LiteralArray").add(l)
        }

exprLiteralArrayItems
    =   f:expr l:(_ "," _ expr)* { /* RECURSION */
            return unroll(f, l, 3)
        }

exprLiteralObject
    =   "{" _ "}" {
            return ast("LiteralObject")
        }
    /   "{" _ l:exprLiteralObjectItems _ "}" {
            return ast("LiteralObject").add(l)
        }

exprLiteralObjectItems
    =   f:exprLiteralObjectItem l:(_ "," _ exprLiteralObjectItem)* {
            return unroll(f, l, 3)
        }

exprLiteralObjectItem
    =   key:(string / id) _ ":" _ e:expr { /* RECURSION */
            return ast("LiteralObjectItem").add(key, e)
        }
    /   "[" _ key:expr _ "]" _ ":" _ e:expr { /* RECURSION */
            return ast("LiteralObjectItem").add(key, e)
        }

exprLiteralOther
    =   string
    /   regexp
    /   number
    /   value

exprParenthesis
    =   "(" _ e:expr _ ")" {  /* RECURSION */
             return e
        }

/*
**  ==== LITERALS ====
*/

id "identifier"
    =   id:$(!value [a-zA-Z_][a-zA-Z0-9_-]*) {
            return ast("Identifier").set({ id: id })
        }

string "quoted string literal"
    =   "\"" s:((stringEscapedCharDQ / [^"])*) "\"" {
            return ast("LiteralString").set({ value: s.join("") })
        }
    /   "'" s:((stringEscapedCharSQ / [^'])*) "'" {
            return ast("LiteralString").set({ value: s.join("") })
        }

stringEscapedCharDQ "escaped double-quoted-string character"
    =   "\\\\" { return "\\"   }
    /   "\\\"" { return "\""   }
    /   "\\b"  { return "\b"   }
    /   "\\v"  { return "\x0B" }
    /   "\\f"  { return "\f"   }
    /   "\\t"  { return "\t"   }
    /   "\\r"  { return "\r"   }
    /   "\\n"  { return "\n"   }
    /   "\\e"  { return "\x1B" }
    /   "\\x" n:$([0-9a-fA-F][0-9a-fA-F]) {
            return String.fromCharCode(parseInt(n, 16))
        }
    /   "\\u" n:$([0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F]) {
            return String.fromCharCode(parseInt(n, 16))
        }

stringEscapedCharSQ "escaped single-quoted-string character"
    =   "\\'"  { return "'"    }

regexp "regular expression literal"
    =   "/" re:$(("\\/" / [^/])*) "/" {
            var v
            try { v = new RegExp(re.replace(/\\\//g, "/")) }
            catch (e) { error(e.message) }
            return ast("LiteralRegExp").set({ value: v })
        }

number "numeric literal"
    =   s:$([+-]?) "0b" n:$([01]+) {
            return ast("LiteralNumber").set({ value: parseInt(s + n, 2) })
        }
    /   s:$([+-]?) "0o" n:$([0-7]+) {
            return ast("LiteralNumber").set({ value: parseInt(s + n, 8) })
        }
    /   s:$([+-]?) "0x" n:$([0-9a-fA-F]+) {
            return ast("LiteralNumber").set({ value: parseInt(s + n, 16) })
        }
    /   n:$([+-]? [0-9]* "." [0-9]+ ([eE] [+-]? [0-9]+)?) {
            return ast("LiteralNumber").set({ value: parseFloat(n) })
        }
    /   n:$([+-]? [0-9]+) {
            return ast("LiteralNumber").set({ value: parseInt(n, 10) })
        }

value "global value"
    =   "true"      { return ast("LiteralValue").set({ value: true      }) }
    /   "false"     { return ast("LiteralValue").set({ value: false     }) }
    /   "null"      { return ast("LiteralValue").set({ value: null      }) }
    /   "NaN"       { return ast("LiteralValue").set({ value: NaN       }) }
    /   "undefined" { return ast("LiteralValue").set({ value: undefined }) }

/*
**  ==== GLUE ====
*/

_ "optional blank"
    =   (co / ws)*

co "multi-line comment"
    =   "/*" (!"*/" .)* "*/"

ws "any whitespaces"
    =   [ \t\r\n]+

eof "end of file"
    =   !.

