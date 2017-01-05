'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = (function () {
  function BufferExtender(buffer) {
    _classCallCheck(this, BufferExtender);

    this._buffer = buffer;
  }

  /**
   * Gets the line ending for the buffer.
   *
   * @return The line ending as a string.
   */

  _createClass(BufferExtender, [{
    key: 'getLineEnding',
    value: function getLineEnding() {
      var lineEndings = new Set();
      for (var i = 0; i < this._buffer.getLineCount() - 1; i++) {
        lineEndings.add(this._buffer.lineEndingForRow(i));
      }

      if (lineEndings.size > 1) {
        return 'Mixed';
      } else if (lineEndings.has('\n')) {
        return '\n';
      } else if (lineEndings.has('\r\n')) {
        return '\r\n';
      } else if (lineEndings.has('\r')) {
        return '\r';
      } else {
        return '';
      }
    }
  }]);

  return BufferExtender;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9hbHBoYS8uYXRvbS9wYWNrYWdlcy9zcGxpdC1kaWZmL2xpYi9idWZmZXItZXh0ZW5kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7QUFFWCxNQUFNLENBQUMsT0FBTztBQUdELFdBSFUsY0FBYyxDQUd2QixNQUFNLEVBQUU7MEJBSEMsY0FBYzs7QUFJakMsUUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7R0FDdkI7Ozs7Ozs7O2VBTG9CLGNBQWM7O1dBWXRCLHlCQUFXO0FBQ3RCLFVBQUksV0FBVyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDNUIsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3hELG1CQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUNuRDs7QUFFRCxVQUFJLFdBQVcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO0FBQ3hCLGVBQU8sT0FBTyxDQUFDO09BQ2hCLE1BQU0sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ2hDLGVBQU8sSUFBSSxDQUFDO09BQ2IsTUFBTSxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDbEMsZUFBTyxNQUFNLENBQUM7T0FDZixNQUFNLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNoQyxlQUFPLElBQUksQ0FBQztPQUNiLE1BQU07QUFDTCxlQUFPLEVBQUUsQ0FBQztPQUNYO0tBQ0Y7OztTQTdCb0IsY0FBYztJQThCcEMsQ0FBQyIsImZpbGUiOiIvVXNlcnMvYWxwaGEvLmF0b20vcGFja2FnZXMvc3BsaXQtZGlmZi9saWIvYnVmZmVyLWV4dGVuZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBCdWZmZXJFeHRlbmRlciB7XG4gIF9idWZmZXI6IE9iamVjdDtcblxuICBjb25zdHJ1Y3RvcihidWZmZXIpIHtcbiAgICB0aGlzLl9idWZmZXIgPSBidWZmZXI7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgbGluZSBlbmRpbmcgZm9yIHRoZSBidWZmZXIuXG4gICAqXG4gICAqIEByZXR1cm4gVGhlIGxpbmUgZW5kaW5nIGFzIGEgc3RyaW5nLlxuICAgKi9cbiAgZ2V0TGluZUVuZGluZygpOiBzdHJpbmcge1xuICAgIGxldCBsaW5lRW5kaW5ncyA9IG5ldyBTZXQoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2J1ZmZlci5nZXRMaW5lQ291bnQoKSAtIDE7IGkrKykge1xuICAgICAgbGluZUVuZGluZ3MuYWRkKHRoaXMuX2J1ZmZlci5saW5lRW5kaW5nRm9yUm93KGkpKTtcbiAgICB9XG5cbiAgICBpZiAobGluZUVuZGluZ3Muc2l6ZSA+IDEpIHtcbiAgICAgIHJldHVybiAnTWl4ZWQnO1xuICAgIH0gZWxzZSBpZiAobGluZUVuZGluZ3MuaGFzKCdcXG4nKSkge1xuICAgICAgcmV0dXJuICdcXG4nO1xuICAgIH0gZWxzZSBpZiAobGluZUVuZGluZ3MuaGFzKCdcXHJcXG4nKSkge1xuICAgICAgcmV0dXJuICdcXHJcXG4nO1xuICAgIH0gZWxzZSBpZiAobGluZUVuZGluZ3MuaGFzKCdcXHInKSkge1xuICAgICAgcmV0dXJuICdcXHInO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9XG59O1xuIl19