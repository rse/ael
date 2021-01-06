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

/*  load external depdendencies  */
import sourceCodeError from "source-code-error"

/*  the exported class  */
export default class AELError extends Error {
    constructor (message, params = {}) {
        /*  pass-through to Error  */
        super(message)

        /*  provide parameter defaults  */
        params = {
            above:   2,
            below:   2,
            newline: true,
            colors:  true,
            ...params
        }

        /*  optionally ensure correct stack trace  */
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, AELError)

        /*  brand the error  */
        this.name = "AELError"

        /*  provide optional position  */
        if (params.line)   this.line   = params.line
        if (params.column) this.column = params.column

        /*  generate optional human readable error report  */
        if (params.code && params.line && params.column) {
            this.report = sourceCodeError({
                type:     "ERROR",
                message:  message,
                ...(params.origin ? { origin: params.origin } : {}),
                code:     params.code,
                line:     params.line,
                column:   params.column,
                above:    params.above,
                below:    params.below,
                newline:  params.newline,
                colors:   params.colors
            })
        }
    }

    /*  provide string serialization  */
    toString () {
        let report
        if (this.report)
            report = this.report
        else {
            report = `${this.name}:`
            if (this.line)   report += ` line ${this.line}`
            if (this.column) report += `, column ${this.column}:`
            report += this.message
        }
        return report
    }
}

