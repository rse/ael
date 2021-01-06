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

import util     from "./ael-util.js"
import AELTrace from "./ael-trace.js"

export default class AELEval extends AELTrace {
    constructor (vars, trace) {
        super()
        this.vars  = vars
        this.trace = trace
    }

    eval (N) {
        switch (N.type()) {
            case "ConditionalBinary":  return this.evalConditionalBinary(N)
            case "ConditionalTernary": return this.evalConditionalTernary(N)
            case "Logical":            return this.evalLogical(N)
            case "Bitwise":            return this.evalBitwise(N)
            case "Relational":         return this.evalRelational(N)
            case "Arithmetical":       return this.evalArithmetical(N)
            case "Unary":              return this.evalUnary(N)
            case "Select":             return this.evalSelect(N)
            case "FuncCall":           return this.evalFuncCall(N)
            case "Identifier":         return this.evalIdentifier(N)
            case "Variable":           return this.evalVariable(N)
            case "LiteralString":      return this.evalLiteralString(N)
            case "LiteralRegExp":      return this.evalLiteralRegExp(N)
            case "LiteralNumber":      return this.evalLiteralNumber(N)
            case "LiteralValue":       return this.evalLiteralValue(N)
            default:
                throw new Error("invalid AST node")
        }
    }

    evalConditionalBinary (N) {
        this.traceBegin(N)
        let result = this.eval(N.child(0))
        if (!util.truthy(result))
            result = this.eval(N.child(1))
        this.traceEnd(N, result)
        return result
    }

    evalConditionalTernary (N) {
        this.traceBegin(N)
        let result = this.eval(N.child(0))
        if (util.truthy(result))
            result = this.eval(N.child(1))
        else
            result = this.eval(N.child(2))
        this.traceEnd(N, result)
        return result
    }

    evalLogical (N) {
        this.traceBegin(N)
        let result = false
        switch (N.get("op")) {
            case "&&":
                result = util.truthy(this.eval(N.child(0)))
                if (result)
                    result = result && util.truthy(this.eval(N.child(1)))
                break
            case "||":
                result = util.truthy(this.eval(N.child(0)))
                if (!result)
                    result = result || util.truthy(this.eval(N.child(1)))
                break
        }
        this.traceEnd(N, result)
        return result
    }

    evalBitwise (N) {
        this.traceBegin(N)
        let v1 = util.coerce(this.eval(N.child(0)), "number")
        let v2 = util.coerce(this.eval(N.child(1)), "number")
        let result
        switch (N.get("op")) {
            case "&":  result = v1 &  v2; break
            case "|":  result = v1 |  v2; break
            case "<<": result = v1 << v2; break
            case ">>": result = v1 >> v2; break
        }
        this.traceEnd(N, result)
        return result
    }

    evalRelational (N) {
        this.traceBegin(N)
        let v1 = this.eval(N.child(0))
        let v2 = this.eval(N.child(1))
        let result
        switch (N.get("op")) {
            case "==": result = v1 === v2; break
            case "!=": result = v1 !== v2; break
            case "<=": result = util.coerce(v1, "number") <= util.coerce(v2, "number"); break
            case ">=": result = util.coerce(v1, "number") >= util.coerce(v2, "number"); break
            case "<":  result = util.coerce(v1, "number") <  util.coerce(v2, "number"); break
            case ">":  result = util.coerce(v1, "number") >  util.coerce(v2, "number"); break
            case "=~": result = util.coerce(v1, "string").match(util.coerce(v2, "regexp")) !== null; break
            case "!~": result = util.coerce(v1, "string").match(util.coerce(v2, "regexp")) === null; break
        }
        this.traceEnd(N, result)
        return result
    }

    evalArithmetical (N) {
        this.traceBegin(N)
        let v1 = this.eval(N.child(0))
        let v2 = this.eval(N.child(1))
        let result
        switch (N.get("op")) {
            case "+":
                if (typeof v1 === "string")
                    result = v1 + util.coerce(v2, "string")
                else
                    result = util.coerce(v1, "number") + util.coerce(v2, "number")
                break
            case "-":  result = util.coerce(v1, "number") + util.coerce(v2, "number"); break
            case "*":  result = util.coerce(v1, "number") * util.coerce(v2, "number"); break
            case "/":  result = util.coerce(v1, "number") / util.coerce(v2, "number"); break
            case "%":  result = util.coerce(v1, "number") % util.coerce(v2, "number"); break
            case "**": result = Math.pow(util.coerce(v1, "number"), util.coerce(v2, "number")); break
        }
        this.traceEnd(N, result)
        return result
    }

    evalUnary (N) {
        this.traceBegin(N)
        let v = this.eval(N.child(0))
        let result
        switch (N.get("op")) {
            case "!": result = !util.coerce(v, "boolean"); break
            case "~": result = ~util.coerce(v, "number");  break
        }
        this.traceEnd(N, result)
        return result
    }

    evalSelect (N, provideParent = false) {
        this.traceBegin(N)
        let parent
        let result = this.eval(N.child(0))
        for (const child of N.childs(1)) {
            if (typeof result !== "object")
                throw new Error("selector base object does not evaluate into an object")
            const selector = this.eval(child)
            const key = util.coerce(selector, "string")
            parent = result
            result = result[key]
        }
        this.traceEnd(N, result)
        return provideParent ? [ parent, result ] : result
    }

    evalFuncCall (N) {
        this.traceBegin(N)
        let S = N.child(0)
        let ctx
        let fn  = null
        if (S.type() === "Select")
            [ ctx, fn ] = this.evalSelect(S, true)
        else
            fn = this.eval(S)
        if (typeof fn !== "function")
            throw new Error("object does not evaluate into a function")
        let args = []
        N.childs().forEach((child) => {
            args.push(this.eval(child))
        })
        let result = fn.apply(ctx, args)
        this.traceEnd(N, result)
        return result
    }

    evalIdentifier (N) {
        this.traceBegin(N)
        let result = N.get("id")
        this.traceEnd(N, result)
        return result
    }

    evalVariable (N) {
        this.traceBegin(N)
        let id = N.get("id")
        if (typeof this.vars[id] === "undefined")
            throw new Error("invalid variable reference \"" + id + "\"")
        let result = this.vars[id]
        this.traceEnd(N, result)
        return result
    }

    evalLiteralString (N) {
        this.traceBegin(N)
        let result = N.get("value")
        this.traceEnd(N, result)
        return result
    }

    evalLiteralRegExp (N) {
        this.traceBegin(N)
        let result = N.get("value")
        this.traceEnd(N, result)
        return result
    }

    evalLiteralNumber (N) {
        this.traceBegin(N)
        let result = N.get("value")
        this.traceEnd(N, result)
        return result
    }

    evalLiteralValue (N) {
        this.traceBegin(N)
        let result = N.get("value")
        this.traceEnd(N, result)
        return result
    }
}

