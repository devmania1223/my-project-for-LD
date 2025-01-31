import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DatePipe } from '@angular/common';

@Injectable()
export class Helpers {
    applyToolTipsToHeaderOnAgGrid(columnDefs: any[]) {
        columnDefs.forEach(column => {
            column.headerTooltip = column.headerName;
        });
    }

    today(): Date {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    }

    addDaysFromToday(days: number): Date {
        let date = this.today();
        date.setDate(date.getDate() + days);
        return date;
    }

    assign(obj1: any, value: any) {
        if (this.isEmpty(obj1)) {
            obj1 = {};
        }

        Object.assign(obj1, value);
    }
    toDate(dateString: string): Date {
        if (this.isNullOrEmpty(dateString)) {
            return null;
        }
        return new Date(dateString);
    }
    objectsAreEqual(obj1: any, obj2: any): boolean {
        if (obj1 === null || obj1 === undefined) {
            obj1 = null;
        }

        if (obj2 === null || obj2 === undefined) {
            obj2 = null;
        }

        if (obj1 === null && obj2 === null) {
            return true;
        }

        if (obj1 === null && obj2 !== null) {
            return false;
        }

        if (obj1 !== null && obj2 === null) {
            return false;
        }

        return JSON.stringify(obj1) === JSON.stringify(obj2);
    }

    clone(value: any): any {
        if (value === null || value === undefined) {
            return null;
        }
        return (JSON.parse(JSON.stringify(value)));
    }

    constructor(@Inject(PLATFORM_ID) private platformId: string, private datePipe: DatePipe) { }

    transformDate(date: Date, format: string) {
        if (!date) {
            return "";
        }
        return this.datePipe.transform(date, format);
    }

    toSlovenianDate(date: Date) {
        return this.datePipe.transform(date, "dd.MM.yyy");
    }

    public any<T>(array: Array<T>, functionToCompare: (value: T) => boolean): boolean;
    public any<T>(array: Array<T>, propertyToCompare: Object): boolean;
    public any<T>(array: Array<T>, functionOrPropertyToCompare: any): boolean {
        return this.where(array, functionOrPropertyToCompare).length > 0;
    }

    public camelCase(obj: any) {
        let build,
            key: string,
            destKey: string,
            value;

        if (obj instanceof Array) {
            build = [];

            for (key in obj) {
                value = obj[key];

                if (typeof value === "object") {
                    value = this.camelCase(value);
                }

                build.push(value);
            }
        } else if (this.isObject(obj)) {
            build = {};

            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    destKey = (key.charAt(0).toLowerCase() + key.slice(1) || key).toString();
                    value = obj[key];

                    if (value !== null && typeof value === "object") {
                        value = this.camelCase(value);
                    }

                    build[destKey] = value;
                }
            }
        }
        else if (this.isString(obj)) {
            build = (obj.charAt(0).toLowerCase() + obj.slice(1) || obj).toString();
        }

        return build;
    }

    public capitalize(text: string, format?: string) {
        if (!text) {
            return text;
        }

        format = format || 'first';

        if (format === 'first') {
            // Capitalize the first letter of a sentence
            return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        }
        else {
            var words = text.split(' '),
                result = new Array<string>();

            words.forEach((word) => {
                if (word.length === 2 && format === 'team') {
                    // Uppercase team abbreviations like FC, CD, SD
                    result.push(word.toUpperCase());
                }
                else {
                    result.push(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
                }
            });

            return result.join(' ');
        }
    }

    public cleanEmptyProperties(obj: any) {
        if (this.isArray(obj)) {
            for (var i = 0; i < obj.length; i++) {
                this.cleanEmptyProperties(obj[i]);
            }
        }

        for (let property in obj) {
            if (this.isEmpty(obj[property])) {
                delete obj[property];
            }
            else if (this.isArray(obj[property]) || this.isObject(obj[property])) {
                this.cleanEmptyProperties(obj[property]);
            }
        }

        return obj;
    }

    public createGuid() {
        let s4 = function () {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    public equals(...objects: Array<any>) {
        if (!objects || objects.length < 1) {
            return false;
        }

        let i: number,
            l = objects.length,
            leftChain: Array<any>,
            rightChain: Array<any>;

        for (i = 1, l = objects.length; i < l; i++) {
            leftChain = [];
            rightChain = [];

            if (!this.deepEquals(arguments[0], arguments[i], leftChain, rightChain)) {
                return false;
            }
        }

        return true;
    }

    public find<T>(array: Array<T>, functionToCompare: (item: T) => boolean): T;
    public find<T>(array: Array<T>, propertyToCompare: Object): T;
    public find<T>(array: Array<T>, functionOrPropertyToCompare: any) {
        if (this.isArray(array)) {
            return array[this.findIndex(array, functionOrPropertyToCompare)];
        }
        else {
            return null;
        }
    }

    public findIndex<T>(array: Array<T>, propertyToCompare: Object): number;
    public findIndex<T>(array: Array<T>, functionToCompare: Function): number;
    public findIndex<T>(array: Array<T>, functionOrPropertyToCompare: any) {
        if (!this.isEmpty(array)) {
            const isFunction = this.isFunction(functionOrPropertyToCompare),
                isObject = this.isObject(functionOrPropertyToCompare);

            if (isFunction || isObject) {
                for (let i = 0, length = array.length; i < length; i++) {
                    if (isFunction) {
                        if (functionOrPropertyToCompare(array[i])) {
                            return i;
                        }
                    }
                    else {
                        for (const property in functionOrPropertyToCompare) {
                            if ((this.isArray(array[i][property]) && (<Array<any>>array[i][property]).indexOf(functionOrPropertyToCompare[property]) != -1)
                                || array[i][property] === functionOrPropertyToCompare[property]) {
                                return i;
                            }
                        }
                    }
                }
            }
            else {
                return array.indexOf(functionOrPropertyToCompare);
            }
        }

        return -1;
    }

    public formatNumber(input: number | string, decPlaces?: number, thouSeparator?: string, decSeparator?: string) {
        let inputNumber: number;

        if (!this.isNumber(input)) {
            inputNumber = parseFloat(<string>input);

            if (isNaN(inputNumber)) {
                return '-1';
            }
        }
        else {
            inputNumber = <number>input;
        }

        decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces;
        decSeparator = decSeparator === undefined ? ',' : decSeparator;
        thouSeparator = thouSeparator === undefined ? '.' : thouSeparator;

        let sign = inputNumber < 0 ? '-' : '',
            i = parseInt(input = Math.abs(inputNumber).toFixed(decPlaces)) + '',
            j = i.length > 3 ? i.length % 3 : 0;

        return sign + (j ? i.substr(0, j) + thouSeparator : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thouSeparator)
            + (decPlaces ? decSeparator + Math.abs(inputNumber - <any>i).toFixed(decPlaces).slice(2) : '');
    }

    public getPropertyValue(obj: any, propertyName: string) {
        if (obj) {
            if (this.isString(propertyName)) {
                if (propertyName.length) {
                    let properties = propertyName.split('.'),
                        propertyValue = obj;

                    for (var i = 0; i < properties.length; i++) {
                        propertyValue = propertyValue[properties[i]];

                        if (!propertyValue) {
                            break;
                        }
                    }

                    return propertyValue;
                }
            }
            else {
                return null;
            }
        }

        return obj;
    }

    public isArray(arr: any) {
        return Array.isArray(arr) || arr instanceof Array;
    }

    public isBoolean(value: any) {
        return typeof value === 'boolean';
    }

    public isDate(value: any) {
        return (value instanceof Date)
    }

    public isBrowser() {
        return isPlatformBrowser(this.platformId);
    }

    public isEmpty(value: any): boolean {
        if (value === undefined || value == null) {
            return true;
        }

        if (value === "") {
            return true;
        }

        if (value === {}) {
            return true;
        }

        if (value === []) {
            return true;
        }

        return false;
    }

    notEmpty(value: any) {
        return !this.isEmpty(value);
    }

    public hasFiles(value: any) {
        if (this.isArray(value)) {
            return (value as any[]).some(q => this.isFile(q));
        }

        return this.isFile(value);
    }

    public isFile(value: any) {
        return !this.isEmpty(value) && value instanceof File;
    }

    public isFunction(value: any) {
        return typeof value === 'function';
    }

    public isNumber(value: any) {
        return typeof value === 'number' && !isNaN(value);
    }

    public isObject(value: any) {
        return value !== null && typeof value === 'object'
    }

    public isString(value: any) {
        return typeof value === 'string';
    }


    public merge(destination: any, sources: any) {
        return { ...destination, ...sources };
    }

    public move(array: Array<any>, from: number, to: number) {
        array.splice(to, 0, array.splice(from, 1)[0]);
    }

    omit(obj: Object, property: string): Object;
    omit(obj: Object, properties: Array<string>): Object;
    omit(obj: Object, properties: any) {
        let objCopy = this.merge({}, obj);

        if (!this.isArray(properties)) {
            properties = [properties];
        }

        for (let i = 0; i < properties.length; i++) {
            if (obj.hasOwnProperty(properties[i])) {
                delete objCopy[properties[i]];
            }
        }

        return objCopy;
    }

    public pick(objects: Object | Array<Object>, properties: string | Array<string>): any | Array<any>
    public pick(objects: any, properties: string | Array<string>): any {
        let returnObjects = <Object[]>[],
            arePropertiesArray = this.isArray(properties),
            areObjectsArray = this.isArray(objects);

        if (!areObjectsArray) {
            objects = [objects];
        }

        objects.forEach((obj: Object) => {
            if (obj) {
                let newObject = arePropertiesArray ? {} : null;

                if (arePropertiesArray) {
                    (<Array<string>>properties).forEach((property) => {
                        if (obj.hasOwnProperty(property)) {
                            newObject[property] = obj[property];
                        }
                    });
                }
                else if (obj.hasOwnProperty(<string>properties)) {
                    newObject = obj[<string>properties];
                }

                returnObjects.push(newObject);
            }
        });

        return areObjectsArray ? returnObjects : returnObjects[0];
    }

    public replaceProperties(obj: Object, objPropertiesToReplace: Object | Array<Object>) {
        if (!this.isArray(objPropertiesToReplace)) {
            objPropertiesToReplace = [objPropertiesToReplace];
        }

        (<Array<Object>>objPropertiesToReplace).forEach((objProperties: Object) => {
            for (let property in objProperties) {
                this.replaceProperty(obj, obj, property, objProperties[property]);
            }
        });

        return obj;
    }

    public roundNumber(num: number, numberOfDecimalPlaces?: number) {
        numberOfDecimalPlaces = numberOfDecimalPlaces || 0;

        return Math.round(num * Math.pow(10, numberOfDecimalPlaces)) / Math.pow(10, numberOfDecimalPlaces);
    }

    public safeUrlFormat(title: string) {
        if (!title) {
            return '';
        }

        title = title.trim();

        let maxlen = 80,
            len = title.length,
            prevdash = false,
            sb = new Array<string>(len),
            c: string,
            char: number;

        for (let i = 0; i < len; i++) {
            c = title[i];
            char = c.charCodeAt(0);

            if ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')) {
                sb.push(c);
                prevdash = false;
            }
            else if (c >= 'A' && c <= 'Z') {
                // tricky way to convert to lowercase
                sb.push(String.fromCharCode(char | 32));
                prevdash = false;
            }
            else if (c == ' ' || c == ',' || c == '.' || c == '/' ||
                c == '\\' || c == '-' || c == '_' || c == '=') {

                if (!prevdash && sb.length > 0) {
                    sb.push('-');
                    prevdash = true;
                }
            }
            else if (char >= 128) {
                let prevlen = sb.length;

                sb.push(this.remapInternationalCharToAscii(c));

                if (prevlen != sb.length) {
                    prevdash = false;
                }
            }

            if (i == maxlen) {
                break;
            }
        }

        if (prevdash) {
            return sb.join('').substr(0, sb.length - 1);
        }
        else {
            return sb.join('');
        }
    }

    public startsWith(text: string, compareText: string) {
        if (text && compareText) {
            return text.indexOf(compareText) == 0;
        }

        return false;
    }

    public trim(text: string) {
        if (text) {
            return text.trim();
        }

        return text;
    }

    public underscoreCase(obj: any, upperCase = false) {
        let build,
            key: string,
            destKey: string,
            value;

        if (obj instanceof Array) {
            build = [];

            for (key in obj) {
                value = obj[key];

                if (typeof value === "object") {
                    value = this.underscoreCase(value);
                }

                build.push(value);
            }
        } else if (this.isObject(obj)) {
            build = {};

            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    destKey = (key.charAt(0).toLowerCase() + key.slice(1) || key).toString();
                    value = obj[key];

                    if (value !== null && typeof value === "object") {
                        value = this.underscoreCase(value);
                    }

                    build[destKey] = value;
                }
            }
        }
        else if (this.isString(obj)) {
            if (upperCase && (<string>obj).toUpperCase() == obj) {
                return obj;
            }

            build = (<string>obj).replace(/(?:^|\.?)([A-Z])/g, (x, y: string) => {
                return `_${y.toLowerCase()}`;
            }).replace(/^_/, '');

            if (upperCase) {
                build = (<string>build).toUpperCase();
            }
        }

        return build;
    }

    public where<T>(array: Array<T>, functionToCompare: (value: T) => boolean): Array<T>;
    public where<T>(array: Array<T>, propertyToCompare: Object): Array<T>;
    public where<T>(array: Array<T>, functionOrPropertyToCompare: any): Array<T> {
        if (array) {
            if (this.isObject(functionOrPropertyToCompare)) {
                return array.filter((value, index) => {
                    for (let property in functionOrPropertyToCompare) {
                        if (value[property] !== functionOrPropertyToCompare[property]) {
                            return false;
                        }
                    }

                    return true;
                });
            }
            else if (this.isFunction(functionOrPropertyToCompare)) {
                return array.filter(functionOrPropertyToCompare);
            }
            else {
                return array.filter((value, index) => value === functionOrPropertyToCompare);
            }
        }

        return [];
    }

    private deepEquals(x: any, y: any, leftChain: Array<any>, rightChain: Array<any>) {
        let p;

        // remember that NaN === NaN returns false
        // and isNaN(undefined) returns true
        if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
            return true;
        }

        // Compare primitives and functions.
        // Check if both arguments link to the same object.
        // Especially useful on the step where we compare prototypes
        if (x === y) {
            return true;
        }

        // Works in case when functions are created in constructor.
        // Comparing dates is a common scenario. Another built-ins?
        // We can even handle functions passed across iframes
        if ((typeof x === 'function' && typeof y === 'function') ||
            (x instanceof Date && y instanceof Date) ||
            (x instanceof RegExp && y instanceof RegExp) ||
            (x instanceof String && y instanceof String) ||
            (x instanceof Number && y instanceof Number)) {
            return x.toString() === y.toString();
        }

        // At last checking prototypes as good as we can
        if (!(x instanceof Object && y instanceof Object)) {
            return false;
        }

        if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
            return false;
        }

        if (x.constructor !== y.constructor) {
            return false;
        }

        if (x.prototype !== y.prototype) {
            return false;
        }

        // Check for infinitive linking loops
        if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
            return false;
        }

        // Quick checking of one object being a subset of another.
        // todo: cache the structure of arguments[0] for performance
        for (p in y) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                return false;
            }
        }

        for (p in x) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                return false;
            }

            switch (typeof (x[p])) {
                case 'object':
                case 'function':

                    leftChain.push(x);
                    rightChain.push(y);

                    if (!this.deepEquals(x[p], y[p], leftChain, rightChain)) {
                        return false;
                    }

                    leftChain.pop();
                    rightChain.pop();
                    break;

                default:
                    if (x[p] !== y[p]) {
                        return false;
                    }
                    break;
            }
        }

        return true;
    }

    private propertyToField(objectPropery: Object, field: Array<string>) {
        let property: string;

        field.push('{');

        for (property in objectPropery) {
            field.push(property);

            if (this.isObject(objectPropery[property])) {
                this.propertyToField(objectPropery[property], field);
            }

            field.push(',');
        }

        field.splice(-1);
        field.push('}');

        return field.join('');
    }

    private remapInternationalCharToAscii(c: string) {
        let s = c.toLowerCase();

        if ('àåáâäãåą'.indexOf(s) != -1) {
            return 'a';
        }
        else if ('èéêëę'.indexOf(s) != -1) {
            return 'e';
        }
        else if ('ìíîïı'.indexOf(s) != -1) {
            return 'i';
        }
        else if ('òóôõöøőð'.indexOf(s) != -1) {
            return 'o';
        }
        else if ('ùúûüŭů'.indexOf(s) != -1) {
            return 'u';
        }
        else if ('çćčĉ'.indexOf(s) != -1) {
            return 'c';
        }
        else if ('żźž'.indexOf(s) != -1) {
            return 'z';
        }
        else if ('śşšŝ'.indexOf(s) != -1) {
            return 's';
        }
        else if ('ñń'.indexOf(s) != -1) {
            return 'n';
        }
        else if ('ýÿ'.indexOf(s) != -1) {
            return 'y';
        }
        else if ('ğĝ'.indexOf(s) != -1) {
            return 'g';
        }
        else if (c == 'ř') {
            return 'r';
        }
        else if (c == 'ł') {
            return 'l';
        }
        else if (c == 'đ') {
            return 'd';
        }
        else if (c == 'ß') {
            return 'ss';
        }
        else if (c == 'Þ') {
            return 'th';
        }
        else if (c == 'ĥ') {
            return 'h';
        }
        else if (c == 'ĵ') {
            return 'j';
        }
        else {
            return '';
        }
    }

    private replaceProperty(sourceObj: Object, destinationObj: Object, sourceProperty: string, destinationProperty: string) {
        let currentSourceObj = sourceObj,
            currentDestinationObj = destinationObj,
            splittedSourceProperty = sourceProperty.split('.'),
            splittedDestinationProperty = destinationProperty.split('.'),
            isLastSourceProperty = splittedSourceProperty.length == 1,
            isLastDestinationProperty = splittedDestinationProperty.length == 1,
            srcProperty = splittedSourceProperty[0],
            destProperty = splittedDestinationProperty[0];

        if (sourceObj.hasOwnProperty(srcProperty)) {
            if (sourceObj[srcProperty]) {
                if (this.isObject(sourceObj[srcProperty]) && !isLastSourceProperty) {
                    currentSourceObj = sourceObj[srcProperty];
                }
            }
            else {
                isLastSourceProperty = true;
            }

            if (destinationObj[destProperty]) {
                if (this.isObject(destinationObj[destProperty]) && !isLastDestinationProperty) {
                    currentDestinationObj = destinationObj[destProperty];
                }
            }
            else {
                isLastDestinationProperty = true;
            }

            if (!isLastSourceProperty) {
                splittedSourceProperty.splice(0, 1);
            }

            if (!isLastDestinationProperty) {
                splittedDestinationProperty.splice(0, 1);
            }

            if (!isLastSourceProperty || !isLastDestinationProperty) {
                this.replaceProperty(currentSourceObj, currentDestinationObj, splittedSourceProperty.join('.'), splittedDestinationProperty.join('.'));
            }
            else {
                currentDestinationObj[destinationProperty] = currentSourceObj[srcProperty];
                delete currentSourceObj[srcProperty];
            }
        }
    }

    public addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    public removeDoubleQuotes(value: string): any {
        value = value.replace(/\"/g, '');
        return value;
    }

    public toDateString(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [day, month, year].join('.');
    }

    public containsString(str: string, substring: string) {
        return str.includes(substring);
    }

    public isNullOrEmpty(value: any) {
        if (value === null || value === undefined) {
            return true;
        }

        if (value === "") {
            return true;
        }

        return false;
    }

    public getValueOrDefault(value: any) {
        if (value === null || value === undefined) {
            return "";
        }

        return value;
    }

    public getValueOrNull(value: any) {
        if (value === null || value === undefined || value === "") {
            return null;
        }

        return value;
    }
}