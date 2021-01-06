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

/*  load internal depdendencies  */
import util            from "./ael-util.js"
import AELTrace        from "./ael-trace.js"
import AELError        from "./ael-error.js"

/*  the exported class  */
export default class AELEval extends AELTrace {
    constructor (expr, vars, trace) {
        super()
        this.expr  = expr
        this.vars  = vars
        this.trace = trace
    }

    /*  raise an error  */
    error (N, origin, message) {
        let pos = N.pos()
        return new AELError(message, {
            origin: origin,
            code:   this.expr,
            line:   pos.line,
            column: pos.column
        })
    }

    /*  evaluate an arbitrary node  */
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
                throw this.error(N, "eval", "invalid AST node (should not happen)")
        }
    }

    /*  evaluate conditional binary operator  */
    evalConditionalBinary (N) {
        this.traceBegin(N)
        let result = this.eval(N.child(0))
        if (!util.truthy(result))
            result = this.eval(N.child(1))
        this.traceEnd(N, result)
        return result
    }

    /*  evaluate conditional ternary operator  */
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

    /*  evaluate logical operator  */
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

    /*  evaluate bitwise operator  */
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

    /*  evaluate relational operator  */
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

    /*  evaluate arithmetical operator  */
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

    /*  evaluate unary operator  */
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

    /*  evaluate selection  */
    evalSelect (N, provideParent = false) {
        this.traceBegin(N)
        let parent
        let result = this.eval(N.child(0))
        for (const child of N.childs(1)) {
            const optional = child.get("optional") ?? false
            if ((result === null || result === undefined) && optional) {
                result = undefined
                break
            }
            if (result === null || typeof result !== "object")
                throw this.error(child, "evalSelect", "selector base object does not evaluate into a non-null object")
            const selector = this.eval(child.child(0))
            const key = util.coerce(selector, "string")
            parent = result
            result = result[key]
        }
        this.traceEnd(N, result)
        return provideParent ? [ parent, result ] : result
    }

    /*  evaluate function call  */
    evalFuncCall (N) {
        this.traceBegin(N)
        let S = N.child(0)
        let ctx
        let fn  = null
        if (S.type() === "Select")
            [ ctx, fn ] = this.evalSelect(S, true)
        else
            fn = this.eval(S)
        const optional = N.get("optional") ?? false
        let result
        if ((fn === null || fn === undefined) && optional)
            result = undefined
        else {
            if (typeof fn !== "function")
                throw this.error(S, "evalFuncCall", "object does not evaluate into a function")
            let args = []
            N.childs().forEach((child) => {
                args.push(this.eval(child))
            })
            result = fn.apply(ctx, args)
        }
        this.traceEnd(N, result)
        return result
    }

    /*  evaluate identifier  */
    evalIdentifier (N) {
        this.traceBegin(N)
        let result = N.get("id")
        this.traceEnd(N, result)
        return result
    }

    /*  evaluate variable  */
    evalVariable (N) {
        this.traceBegin(N)
        let id = N.get("id")
        if (typeof this.vars[id] === "undefined")
            throw this.error(N, "evalVariable", "invalid variable reference")
        let result = this.vars[id]
        this.traceEnd(N, result)
        return result
    }

    /*  evaluate string literal  */
    evalLiteralString (N) {
        this.traceBegin(N)
        let result = N.get("value")
        this.traceEnd(N, result)
        return result
    }

    /*  evaluate regular expression literal  */
    evalLiteralRegExp (N) {
        this.traceBegin(N)
        let result = N.get("value")
        this.traceEnd(N, result)
        return result
    }

    /*  evaluate number literal  */
    evalLiteralNumber (N) {
        this.traceBegin(N)
        let result = N.get("value")
        this.traceEnd(N, result)
        return result
    }

    /*  evaluate special value literal  */
    evalLiteralValue (N) {
        this.traceBegin(N)
        let result = N.get("value")
        this.traceEnd(N, result)
        return result
    }
}

