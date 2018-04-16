Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

//import {autobind} from 'core-decorators';

'use babel';

var StyleCalculator = (function () {
  function StyleCalculator(styles, config) {
    _classCallCheck(this, StyleCalculator);

    this.styles = styles;
    this.config = config;
  }

  _createClass(StyleCalculator, [{
    key: 'startWatching',
    value: function startWatching(sourcePath, configsToWatch, getStylesheetFn) {
      var _this = this;

      var subscriptions = new _atom.CompositeDisposable();
      var updateStyles = function updateStyles() {
        _this.updateStyles(sourcePath, getStylesheetFn);
      };
      configsToWatch.forEach(function (configToWatch) {
        subscriptions.add(_this.config.onDidChange(configToWatch, updateStyles));
      });
      updateStyles();
      return subscriptions;
    }

    //@autobind
  }, {
    key: 'updateStyles',
    value: function updateStyles(sourcePath, getStylesheetFn) {
      var stylesheet = getStylesheetFn(this.config);
      this.styles.addStyleSheet(stylesheet, { sourcePath: sourcePath });
    }
  }]);

  return StyleCalculator;
})();

exports['default'] = StyleCalculator;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9ub2Vsd29yZGVuLy5hdG9tL3BhY2thZ2VzL3NwbGl0LWRpZmYvbGliL3N0eWxlLWNhbGN1bGF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7b0JBRWtDLE1BQU07Ozs7QUFGeEMsV0FBVyxDQUFBOztJQUtVLGVBQWU7QUFDdkIsV0FEUSxlQUFlLENBQ3RCLE1BQU0sRUFBRSxNQUFNLEVBQUU7MEJBRFQsZUFBZTs7QUFFaEMsUUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDckIsUUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7R0FDdEI7O2VBSmtCLGVBQWU7O1dBTXJCLHVCQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFOzs7QUFDekQsVUFBTSxhQUFhLEdBQUcsK0JBQXlCLENBQUM7QUFDaEQsVUFBTSxZQUFZLEdBQUcsU0FBZixZQUFZLEdBQVM7QUFDekIsY0FBSyxZQUFZLENBQUMsVUFBVSxFQUFFLGVBQWUsQ0FBQyxDQUFDO09BQ2hELENBQUM7QUFDRixvQkFBYyxDQUFDLE9BQU8sQ0FBQyxVQUFBLGFBQWEsRUFBSTtBQUN0QyxxQkFBYSxDQUFDLEdBQUcsQ0FDZixNQUFLLE1BQU0sQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQyxDQUNyRCxDQUFDO09BQ0gsQ0FBQyxDQUFDO0FBQ0gsa0JBQVksRUFBRSxDQUFDO0FBQ2YsYUFBTyxhQUFhLENBQUM7S0FDdEI7Ozs7O1dBR1csc0JBQUMsVUFBVSxFQUFFLGVBQWUsRUFBRTtBQUN4QyxVQUFNLFVBQVUsR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hELFVBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxFQUFDLFVBQVUsRUFBVixVQUFVLEVBQUMsQ0FBQyxDQUFDO0tBQ3JEOzs7U0F4QmtCLGVBQWU7OztxQkFBZixlQUFlIiwiZmlsZSI6Ii9Vc2Vycy9ub2Vsd29yZGVuLy5hdG9tL3BhY2thZ2VzL3NwbGl0LWRpZmYvbGliL3N0eWxlLWNhbGN1bGF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuLy9pbXBvcnQge2F1dG9iaW5kfSBmcm9tICdjb3JlLWRlY29yYXRvcnMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdHlsZUNhbGN1bGF0b3Ige1xuICBjb25zdHJ1Y3RvcihzdHlsZXMsIGNvbmZpZykge1xuICAgIHRoaXMuc3R5bGVzID0gc3R5bGVzO1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICB9XG5cbiAgc3RhcnRXYXRjaGluZyhzb3VyY2VQYXRoLCBjb25maWdzVG9XYXRjaCwgZ2V0U3R5bGVzaGVldEZuKSB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgY29uc3QgdXBkYXRlU3R5bGVzID0gKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVTdHlsZXMoc291cmNlUGF0aCwgZ2V0U3R5bGVzaGVldEZuKTtcbiAgICB9O1xuICAgIGNvbmZpZ3NUb1dhdGNoLmZvckVhY2goY29uZmlnVG9XYXRjaCA9PiB7XG4gICAgICBzdWJzY3JpcHRpb25zLmFkZChcbiAgICAgICAgdGhpcy5jb25maWcub25EaWRDaGFuZ2UoY29uZmlnVG9XYXRjaCwgdXBkYXRlU3R5bGVzKSxcbiAgICAgICk7XG4gICAgfSk7XG4gICAgdXBkYXRlU3R5bGVzKCk7XG4gICAgcmV0dXJuIHN1YnNjcmlwdGlvbnM7XG4gIH1cblxuICAvL0BhdXRvYmluZFxuICB1cGRhdGVTdHlsZXMoc291cmNlUGF0aCwgZ2V0U3R5bGVzaGVldEZuKSB7XG4gICAgY29uc3Qgc3R5bGVzaGVldCA9IGdldFN0eWxlc2hlZXRGbih0aGlzLmNvbmZpZyk7XG4gICAgdGhpcy5zdHlsZXMuYWRkU3R5bGVTaGVldChzdHlsZXNoZWV0LCB7c291cmNlUGF0aH0pO1xuICB9XG59XG4iXX0=