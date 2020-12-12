# standard-prettier-eslint

[![npm version](https://badge.fury.io/js/standard-prettier-eslint.svg)](https://badge.fury.io/js/standard-prettier-eslint)
[![npm downloads](https://img.shields.io/npm/dm/standard-prettier-eslint.svg?style=flat-square)](https://www.npmjs.com/package/standard-prettier-eslint)

Formats your JavaScript using [`prettier`](https://github.com/jlongster/prettier) followed by [`standard --fix`][standard]

*  [prettier](https://github.com/prettier/prettier) is a wonderful tool for code prettify.
*  [standard][standard] is `zero configuration pain` tool based on ESLint.

The two packages are great and very well designed, that can be used together with a minimum effort


## Installation
    $ npm install standard-prettier-eslint --save-dev

## Usage
Ex: package.json
```json
"scripts": {
  ...
  "lint": "standard --verbose | snazzy",
  "format": "npm run __format -- --write '**/*.js'",
  "__format": "prettier-eslint --no-bracket-spacing --eslint-path=node_modules/standard-prettier-eslint"
}
```

## Standalone CLI
[prettier-std-cli](https://github.com/bySabi/prettier-std-cli) is the cli version.
Created for simplify package.json `scripts` settings and use globally.

### If you prefer `semicolons` use **semistandard** version
* [semistandard-prettier-eslint](https://github.com/bySabi/semistandard-prettier-eslint)

## Contributing

* Documentation improvement
* Feel free to send any PR

## License

[MIT][mit-license]

[mit-license]:./LICENSE

[standard]: https://github.com/standard/standard
