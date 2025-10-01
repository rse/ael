/*
**  AEL -- Advanced Expression Language
**  Copyright (c) 2021-2024 Dr. Ralf S. Engelschall <rse@engelschall.com>
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

/*  load internal dependencies  */
import util            from "./ael-util.js"
import AELTrace        from "./ael-trace.js"
import AELError        from "./ael-error.js"

/*  the exported class  */
export default class AELEval extends AELTrace {
    constructor (expr, vars, state, trace) {
        super(trace)
        this.expr  = expr
        this.vars  = vars
        this.state = state
    }

    /*  raise an error  */
    error (N, origin, message) {
        let pos = N.pos()
        return new AELError(message, {
            origin,
            code:   this.expr,
            line:   pos.line,
            column: pos.column
        })
    }

    /*  set regex match groups in state  */
    setMatchGroups (match) {
        for (let i = 0; i <= 9; i++) {
            if (match !== null && i < match.length)
                this.state[`$${i}`] = match[i]
            else
                delete this.state[`$${i}`]
        }
    }

    /*  evaluate an arbitrary node  */
    eval (N) {
        switch (N.type()) {
            case "Sequence":           return this.evalSequence(N)
            case "Assignment":         return this.evalAssignment(N)
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
            case "LiteralArray":       return this.evalLiteralArray(N)
            case "LiteralObject":      return this.evalLiteralObject(N)
            case "LiteralObjectItem":  return this.evalLiteralObjectItem(N)
            case "LiteralTemplate":    return this.evalLiteralTemplate(N)
            case "LiteralString":      return this.evalLiteralString(N)
            case "LiteralRegExp":      return this.evalLiteralRegExp(N)
            case "LiteralNumber":      return this.evalLiteralNumber(N)
            case "LiteralValue":       return this.evalLiteralValue(N)
            default:
                throw this.error(N, "eval", "invalid AST node (should not happen)")
        }
    }

    /*  evaluate sequence  */
    evalSequence (N) {
        this.traceBegin(N)
        let result
        for (const child of N.childs())
            result = this.eval(child)
        this.traceEnd(N, result)
        return result
    }

    /*  evaluate assignment  */
    evalAssignment (N) {
        this.traceBegin(N)
        let id     = this.eval(N.child(0))
        let result = this.eval(N.child(1))
        this.state[id] = result
        this.traceEnd(N, result)
        return result
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
        let match
        switch (N.get("op")) {
            case "==":
                switch (util.typePair(v1, v2)) {
                    case "array:array":
                    case "array:object":
                    case "array:scalar":
                    case "object:array":
                    case "object:object":
                    case "object:scalar":
                        v1 = util.coerce(v1, "array")
                        v2 = util.coerce(v2, "array")
                        result = v1.length === v2.length
                            && v1.filter((x) => !v2.includes(x)).length === 0
                            && v2.filter((x) => !v1.includes(x)).length === 0
                        break
                    default:
                        result = v1 === v2
                }
                break
            case "!=":
                switch (util.typePair(v1, v2)) {
                    case "array:array":
                    case "array:object":
                    case "array:scalar":
                    case "object:array":
                    case "object:object":
                    case "object:scalar":
                        v1 = util.coerce(v1, "array")
                        v2 = util.coerce(v2, "array")
                        result = v1.length !== v2.length
                            || v1.filter((x) => !v2.includes(x)).length > 0
                            || v2.filter((x) => !v1.includes(x)).length > 0
                        break
                    default:
                        result = v1 !== v2
                }
                break
            case "<=":
                switch (util.typePair(v1, v2)) {
                    case "string:any":
                        result = v1.localeCompare(util.coerce(v2, "string")) <= 0
                        break
                    case "array:array":
                    case "array:object":
                    case "array:scalar":
                    case "object:array":
                    case "object:object":
                    case "object:scalar":
                        v1 = util.coerce(v1, "array")
                        v2 = util.coerce(v2, "array")
                        result = v1.filter((x) => !v2.includes(x)).length === 0
                        break
                    default:
                        result = util.coerce(v1, "number") <= util.coerce(v2, "number")
                }
                break
            case "<":
                switch (util.typePair(v1, v2)) {
                    case "string:any":
                        result = v1.localeCompare(util.coerce(v2, "string")) < 0
                        break
                    case "array:array":
                    case "array:object":
                    case "array:scalar":
                    case "object:array":
                    case "object:object":
                    case "object:scalar":
                        v1 = util.coerce(v1, "array")
                        v2 = util.coerce(v2, "array")
                        result = v1.filter((x) => !v2.includes(x)).length === 0
                            && v2.filter((x) => !v1.includes(x)).length > 0
                        break
                    default:
                        result = util.coerce(v1, "number") < util.coerce(v2, "number")
                }
                break
            case ">=":
                switch (util.typePair(v1, v2)) {
                    case "string:any":
                        result = v1.localeCompare(util.coerce(v2, "string")) >= 0
                        break
                    case "array:array":
                    case "array:object":
                    case "array:scalar":
                    case "object:array":
                    case "object:object":
                    case "object:scalar":
                        v1 = util.coerce(v1, "array")
                        v2 = util.coerce(v2, "array")
                        result = v2.filter((x) => !v1.includes(x)).length === 0
                        break
                    default:
                        result = util.coerce(v1, "number") >= util.coerce(v2, "number")
                }
                break
            case ">":
                switch (util.typePair(v1, v2)) {
                    case "string:any":
                        result = v1.localeCompare(util.coerce(v2, "string")) > 0
                        break
                    case "array:array":
                    case "array:object":
                    case "array:scalar":
                    case "object:array":
                    case "object:object":
                    case "object:scalar":
                        v1 = util.coerce(v1, "array")
                        v2 = util.coerce(v2, "array")
                        result = v2.filter((x) => !v1.includes(x)).length === 0
                            && v1.filter((x) => !v2.includes(x)).length > 0
                        break
                    default:
                        result = util.coerce(v1, "number") > util.coerce(v2, "number")
                }
                break
            case "=~":
                match = util.coerce(v1, "string").match(util.coerce(v2, "regexp"))
                result = (match !== null)
                this.setMatchGroups(match)
                break
            case "!~":
                match = util.coerce(v1, "string").match(util.coerce(v2, "regexp"))
                result = (match === null)
                this.setMatchGroups(match)
                break
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
                switch (util.typePair(v1, v2)) {
                    case "string:any":
                        result = v1 + util.coerce(v2, "string")
                        break
                    case "array:array":
                        result = v1.concat(v2)
                        break
                    case "array:object":
                        result = v1.concat(Object.keys(v2).filter((x) => util.truthy(x)))
                        break
                    case "array:scalar":
                        result = v1.concat([ v2 ])
                        break
                    case "object:array":
                        result = { ...v1, ...v2.reduce((obj, key) => { obj[key] = true; return obj }, {}) }
                        break
                    case "object:object":
                        result = { ...v1, ...v2 }
                        break
                    case "object:scalar":
                        result = { ...v1, [util.coerce(v2, "string")]: true }
                        break
                    default:
                        result = util.coerce(v1, "number") + util.coerce(v2, "number")
                }
                break
            case "-":
                switch (util.typePair(v1, v2)) {
                    case "string:any": {
                        let i = v1.indexOf(v2)
                        result = i >= 0 ? v1.splice(i, v2.length) : v1
                        break
                    }
                    case "array:array":
                        result = v1.filter((x) => !v2.includes(x))
                        break
                    case "array:object":
                        result = v1.filter((x) => !util.truthy(v2[x]))
                        break
                    case "array:scalar":
                        result = v1.filter((x) => x !== v2)
                        break
                    case "object:array":
                        result = Object.keys(v1)
                            .filter((key) => !v2.includes(key))
                            .reduce((obj, key) => { obj[key] = v1[key]; return obj }, {})
                        break
                    case "object:object":
                        result = Object.keys(v1)
                            .filter((key) => !util.truthy(v2[key]))
                            .reduce((obj, key) => { obj[key] = v1[key]; return obj }, {})
                        break
                    case "object:scalar":
                        result = Object.keys(v1)
                            .filter((key) => key !== v2)
                            .reduce((obj, key) => { obj[key] = v1[key]; return obj }, {})
                        break
                    default:
                        result = util.coerce(v1, "number") - util.coerce(v2, "number")
                }
                break
            case "/":
                switch (util.typePair(v1, v2)) {
                    case "string:any": {
                        let i = v1.indexOf(v2)
                        result = i >= 0 ? v2 : ""
                        break
                    }
                    case "array:array":
                        result = v1.filter((x) => v2.includes(x))
                        break
                    case "array:object":
                        result = v1.filter((x) => util.truthy(v2[x]))
                        break
                    case "array:scalar":
                        result = v1.filter((x) => x === v2)
                        break
                    case "object:array":
                        result = Object.keys(v1)
                            .filter((key) => v2.includes(key))
                            .reduce((obj, key) => { obj[key] = v1[key]; return obj }, {})
                        break
                    case "object:object":
                        result = Object.keys(v1)
                            .filter((key) => util.truthy(v2[key]))
                            .reduce((obj, key) => { obj[key] = v1[key]; return obj }, {})
                        break
                    case "object:scalar":
                        result = Object.keys(v1)
                            .filter((key) => key === v2)
                            .reduce((obj, key) => { obj[key] = v1[key]; return obj }, {})
                        break
                    default:
                        result = util.coerce(v1, "number") / util.coerce(v2, "number")
                }
                break
            case "*":  result = util.coerce(v1, "number") * util.coerce(v2, "number"); break
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
        if (!(id in this.state) && !(id in this.vars))
            throw this.error(N, "evalVariable", "invalid variable reference")
        let result = (id in this.state ? this.state[id] : this.vars[id])
        this.traceEnd(N, result)
        return result
    }

    /*  evaluate array literal  */
    evalLiteralArray (N) {
        this.traceBegin(N)
        let result = []
        for (const child of N.childs())
            result.push(this.eval(child))
        this.traceEnd(N, result)
        return result
    }

    /*  evaluate object literal  */
    evalLiteralObject (N) {
        this.traceBegin(N)
        let result = {}
        for (const child of N.childs()) {
            const sub = this.eval(child)
            result = { ...result, ...sub }
        }
        this.traceEnd(N, result)
        return result
    }

    /*  evaluate object item  */
    evalLiteralObjectItem (N) {
        this.traceBegin(N)
        const key = this.eval(N.child(0))
        const val = this.eval(N.child(1))
        const result = { [key]: val }
        this.traceEnd(N, result)
        return result
    }

    /*  evaluate template literal  */
    evalLiteralTemplate (N) {
        this.traceBegin(N)
        const result = N.childs()
            .map((child) => this.eval(child))
            .join("")
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

