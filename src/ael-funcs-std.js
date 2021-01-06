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

/*  the exported standard functions  */
const stdfuncs = {
    /*  count number of keys/elements/characters/etc  */
    "count": (A, T, val) => {
        if (typeof val === "object" && val instanceof Array)
            return val.length
        else if (typeof val === "object")
            return Object.keys(val).length
        else if (typeof val === "string")
            return val.length
        else
            return String(val).length
    },

    /*  check whether node is in a list of nodes  */
    "in": (A, T, val) => {
        if (!(typeof val === "object" && val instanceof Array))
            throw new Error("invalid argument to function \"in\" (array expected)")
        for (let i = 0; i < val.length; i++)
            if (val[i] === T)
                return true
        return false
    },

    /*  retrieve a sub-string  */
    "substr": (A, T, str, pos, len) => {
        return String(str).substr(pos, len)
    },

    /*  retrieve index of a sub-string  */
    "index": (A, T, str, sub, from) => {
        return String(str).indexOf(sub, from)
    },

    /*  remove whitespaces at begin and end of string  */
    "trim": (A, T, str) => {
        return String(str).trim()
    },

    /*  convert string to lower-case  */
    "lc": (A, T, str) => {
        return String(str).toLowerCase()
    },

    /*  convert string to upper-case  */
    "uc": (A, T, str) => {
        return String(str).toUpperCase()
    }
}

export default stdfuncs

