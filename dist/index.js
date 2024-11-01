"use strict";
/** @format */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettyPrint = void 0;
var seen = [];
/**
 * Check if a value is an object or a function. Keep in mind that array, function, regexp, etc, are objects in JavaScript.
 *
 * @param value the value to check
 * @return true if the value is an object or a function
 */
function isObj(value) {
    var type = typeof value;
    return value !== null && (type === 'object' || type === 'function');
}
/**
 * Check if a value is a regular expression.
 *
 * @param value the value to check
 * @return true if the value is a regular expression
 */
function isRegexp(value) {
    return Object.prototype.toString.call(value) === '[object RegExp]';
}
/**
 * Get an array of all of the enumerable symbols for an object.
 *
 * @param object the object to get the enumerable symbols for
 */
function getOwnEnumPropSymbols(object) {
    return Object.getOwnPropertySymbols(object).filter(function (keySymbol) {
        return Object.prototype.propertyIsEnumerable.call(object, keySymbol);
    });
}
/**
 * pretty print an object
 *
 * @param input the object to pretty print
 * @param options the formatting options, transforms, and filters
 * @param pad the padding string
 */
function prettyPrint(input, options, pad) {
    if (pad === void 0) { pad = ''; }
    // sensible option defaults
    var defaultOptions = {
        indent: '\t',
        singleQuotes: true
    };
    var combinedOptions = __assign(__assign({}, defaultOptions), options);
    var tokens;
    if (combinedOptions.inlineCharacterLimit === undefined) {
        tokens = {
            newLine: '\n',
            newLineOrSpace: '\n',
            pad: pad,
            indent: pad + combinedOptions.indent
        };
    }
    else {
        tokens = {
            newLine: '@@__PRETTY_PRINT_NEW_LINE__@@',
            newLineOrSpace: '@@__PRETTY_PRINT_NEW_LINE_OR_SPACE__@@',
            pad: '@@__PRETTY_PRINT_PAD__@@',
            indent: '@@__PRETTY_PRINT_INDENT__@@'
        };
    }
    var expandWhiteSpace = function (string) {
        if (combinedOptions.inlineCharacterLimit === undefined) {
            return string;
        }
        var oneLined = string
            .replace(new RegExp(tokens.newLine, 'g'), '')
            .replace(new RegExp(tokens.newLineOrSpace, 'g'), ' ')
            .replace(new RegExp(tokens.pad + '|' + tokens.indent, 'g'), '');
        if (oneLined.length <= combinedOptions.inlineCharacterLimit) {
            return oneLined;
        }
        return string
            .replace(new RegExp(tokens.newLine + '|' + tokens.newLineOrSpace, 'g'), '\n')
            .replace(new RegExp(tokens.pad, 'g'), pad)
            .replace(new RegExp(tokens.indent, 'g'), pad + combinedOptions.indent);
    };
    if (seen.indexOf(input) !== -1) {
        return '"[Circular]"';
    }
    if (input === null ||
        input === undefined ||
        typeof input === 'number' ||
        typeof input === 'boolean' ||
        typeof input === 'function' ||
        typeof input === 'symbol' ||
        isRegexp(input)) {
        return String(input);
    }
    if (input instanceof Date) {
        return "new Date('".concat(input.toISOString(), "')");
    }
    if (Array.isArray(input)) {
        if (input.length === 0) {
            return '[]';
        }
        seen.push(input);
        var ret = '[' +
            tokens.newLine +
            input
                .map(function (el, i) {
                var eol = input.length - 1 === i
                    ? tokens.newLine
                    : ',' + tokens.newLineOrSpace;
                var value;
                if (combinedOptions.transform) {
                    value = combinedOptions.transform(input, i, function () {
                        return prettyPrint(el, combinedOptions, pad + combinedOptions.indent);
                    });
                }
                else {
                    value = prettyPrint(el, combinedOptions, pad + combinedOptions.indent);
                }
                return tokens.indent + value + eol;
            })
                .join('') +
            tokens.pad +
            ']';
        seen.pop();
        return expandWhiteSpace(ret);
    }
    if (isObj(input)) {
        var objKeys_1 = __spreadArray(__spreadArray([], Object.keys(input), true), getOwnEnumPropSymbols(input), true);
        if (combinedOptions.filter) {
            objKeys_1 = objKeys_1.filter(function (el) {
                return combinedOptions.filter && combinedOptions.filter(input, el);
            });
        }
        if (objKeys_1.length === 0) {
            return '{}';
        }
        seen.push(input);
        var ret = '{' +
            tokens.newLine +
            objKeys_1
                .map(function (el, i) {
                var eol = objKeys_1.length - 1 === i
                    ? tokens.newLine
                    : ',' + tokens.newLineOrSpace;
                var isSymbol = typeof el === 'symbol';
                var isClassic = !isSymbol &&
                    /^[a-z$_][a-z$_0-9]*$/i.test(el.toString());
                var key = isSymbol || isClassic
                    ? el
                    : prettyPrint(el, combinedOptions);
                var value;
                if (combinedOptions.transform) {
                    value = combinedOptions.transform(input, el, function () {
                        return prettyPrint(input[el], combinedOptions, pad + combinedOptions.indent);
                    });
                }
                else {
                    value = prettyPrint(input[el], combinedOptions, pad + combinedOptions.indent);
                }
                return tokens.indent + String(key) + ': ' + value + eol;
            })
                .join('') +
            tokens.pad +
            '}';
        seen.pop();
        return expandWhiteSpace(ret);
    }
    input = String(input).replace(/[\r\n]/g, function (x) {
        return x === '\n' ? '\\n' : '\\r';
    });
    if (!combinedOptions.singleQuotes) {
        input = input.replace(/"/g, '\\"');
        return "\"".concat(input, "\"");
    }
    input = input.replace(/\\?'/g, "\\'");
    return "'".concat(input, "'");
}
exports.prettyPrint = prettyPrint;
