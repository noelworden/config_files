'use strict';
module.exports = function (linter) {
  var Linter = linter.constructor;
  if (!Linter.prototype.executeOnText) {
    Linter.prototype.executeOnText = function (text, filename, warnIgnored) {
      return new this.eslint.CLIEngine(this.eslintConfig).executeOnText(
        text,
        filename,
        warnIgnored
      );
    };
  }
  return function () {
    return linter;
  };
};
