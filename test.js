/* eslint-disable */
const path = require('path');

const a = '/a/b/c/';

const b = '/a/d';

const result = path.relative(a, b);

console.log(result);
