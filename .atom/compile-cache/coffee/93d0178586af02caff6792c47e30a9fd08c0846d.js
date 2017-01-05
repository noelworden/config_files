(function() {
  var Point, fillInNulls, getGuides, getVirtualIndent, mergeCropped, statesAboveVisible, statesBelowVisible, statesInvisible, supportingIndents, toG, toGuides, uniq,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Point = require('atom').Point;

  toG = function(indents, begin, depth, cursorRows) {
    var gs, isActive, isStack, ptr, r, _ref;
    ptr = begin;
    isActive = false;
    isStack = false;
    gs = [];
    while (ptr < indents.length && depth <= indents[ptr]) {
      if (depth < indents[ptr]) {
        r = toG(indents, ptr, depth + 1, cursorRows);
        if ((_ref = r.guides[0]) != null ? _ref.stack : void 0) {
          isStack = true;
        }
        Array.prototype.push.apply(gs, r.guides);
        ptr = r.ptr;
      } else {
        if (__indexOf.call(cursorRows, ptr) >= 0) {
          isActive = true;
          isStack = true;
        }
        ptr++;
      }
    }
    if (depth !== 0) {
      gs.unshift({
        length: ptr - begin,
        point: new Point(begin, depth - 1),
        active: isActive,
        stack: isStack
      });
    }
    return {
      guides: gs,
      ptr: ptr
    };
  };

  fillInNulls = function(indents) {
    var res;
    res = indents.reduceRight(function(acc, cur) {
      if (cur === null) {
        acc.r.unshift(acc.i);
        return {
          r: acc.r,
          i: acc.i
        };
      } else {
        acc.r.unshift(cur);
        return {
          r: acc.r,
          i: cur
        };
      }
    }, {
      r: [],
      i: 0
    });
    return res.r;
  };

  toGuides = function(indents, cursorRows) {
    var ind;
    ind = fillInNulls(indents.map(function(i) {
      if (i === null) {
        return null;
      } else {
        return Math.floor(i);
      }
    }));
    return toG(ind, 0, 0, cursorRows).guides;
  };

  getVirtualIndent = function(getIndentFn, row, lastRow) {
    var i, ind, _i;
    for (i = _i = row; row <= lastRow ? _i <= lastRow : _i >= lastRow; i = row <= lastRow ? ++_i : --_i) {
      ind = getIndentFn(i);
      if (ind != null) {
        return ind;
      }
    }
    return 0;
  };

  uniq = function(values) {
    var last, newVals, v, _i, _len;
    newVals = [];
    last = null;
    for (_i = 0, _len = values.length; _i < _len; _i++) {
      v = values[_i];
      if (newVals.length === 0 || last !== v) {
        newVals.push(v);
      }
      last = v;
    }
    return newVals;
  };

  mergeCropped = function(guides, above, below, height) {
    guides.forEach(function(g) {
      var _ref, _ref1, _ref2, _ref3;
      if (g.point.row === 0) {
        if (_ref = g.point.column, __indexOf.call(above.active, _ref) >= 0) {
          g.active = true;
        }
        if (_ref1 = g.point.column, __indexOf.call(above.stack, _ref1) >= 0) {
          g.stack = true;
        }
      }
      if (height < g.point.row + g.length) {
        if (_ref2 = g.point.column, __indexOf.call(below.active, _ref2) >= 0) {
          g.active = true;
        }
        if (_ref3 = g.point.column, __indexOf.call(below.stack, _ref3) >= 0) {
          return g.stack = true;
        }
      }
    });
    return guides;
  };

  supportingIndents = function(visibleLast, lastRow, getIndentFn) {
    var count, indent, indents;
    if (getIndentFn(visibleLast) != null) {
      return [];
    }
    indents = [];
    count = visibleLast + 1;
    while (count <= lastRow) {
      indent = getIndentFn(count);
      indents.push(indent);
      if (indent != null) {
        break;
      }
      count++;
    }
    return indents;
  };

  getGuides = function(visibleFrom, visibleTo, lastRow, cursorRows, getIndentFn) {
    var above, below, guides, support, visibleIndents, visibleLast, _i, _results;
    visibleLast = Math.min(visibleTo, lastRow);
    visibleIndents = (function() {
      _results = [];
      for (var _i = visibleFrom; visibleFrom <= visibleLast ? _i <= visibleLast : _i >= visibleLast; visibleFrom <= visibleLast ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this).map(getIndentFn);
    support = supportingIndents(visibleLast, lastRow, getIndentFn);
    guides = toGuides(visibleIndents.concat(support), cursorRows.map(function(c) {
      return c - visibleFrom;
    }));
    above = statesAboveVisible(cursorRows, visibleFrom - 1, getIndentFn, lastRow);
    below = statesBelowVisible(cursorRows, visibleLast + 1, getIndentFn, lastRow);
    return mergeCropped(guides, above, below, visibleLast - visibleFrom);
  };

  statesInvisible = function(cursorRows, start, getIndentFn, lastRow, isAbove) {
    var active, cursors, i, ind, minIndent, stack, vind, _i, _j, _k, _l, _len, _ref, _ref1, _results, _results1, _results2;
    if ((isAbove ? start < 0 : lastRow < start)) {
      return {
        stack: [],
        active: []
      };
    }
    cursors = isAbove ? uniq(cursorRows.filter(function(r) {
      return r <= start;
    }).sort(), true).reverse() : uniq(cursorRows.filter(function(r) {
      return start <= r;
    }).sort(), true);
    active = [];
    stack = [];
    minIndent = Number.MAX_VALUE;
    _ref = (isAbove ? (function() {
      _results = [];
      for (var _j = start; start <= 0 ? _j <= 0 : _j >= 0; start <= 0 ? _j++ : _j--){ _results.push(_j); }
      return _results;
    }).apply(this) : (function() {
      _results1 = [];
      for (var _k = start; start <= lastRow ? _k <= lastRow : _k >= lastRow; start <= lastRow ? _k++ : _k--){ _results1.push(_k); }
      return _results1;
    }).apply(this));
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      ind = getIndentFn(i);
      if (ind != null) {
        minIndent = Math.min(minIndent, ind);
      }
      if (cursors.length === 0 || minIndent === 0) {
        break;
      }
      if (cursors[0] === i) {
        cursors.shift();
        vind = getVirtualIndent(getIndentFn, i, lastRow);
        minIndent = Math.min(minIndent, vind);
        if (vind === minIndent) {
          active.push(vind - 1);
        }
        if (stack.length === 0) {
          stack = (function() {
            _results2 = [];
            for (var _l = 0, _ref1 = minIndent - 1; 0 <= _ref1 ? _l <= _ref1 : _l >= _ref1; 0 <= _ref1 ? _l++ : _l--){ _results2.push(_l); }
            return _results2;
          }).apply(this);
        }
      }
    }
    return {
      stack: uniq(stack.sort()),
      active: uniq(active.sort())
    };
  };

  statesAboveVisible = function(cursorRows, start, getIndentFn, lastRow) {
    return statesInvisible(cursorRows, start, getIndentFn, lastRow, true);
  };

  statesBelowVisible = function(cursorRows, start, getIndentFn, lastRow) {
    return statesInvisible(cursorRows, start, getIndentFn, lastRow, false);
  };

  module.exports = {
    toGuides: toGuides,
    getGuides: getGuides,
    uniq: uniq,
    statesAboveVisible: statesAboveVisible,
    statesBelowVisible: statesBelowVisible
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2FscGhhLy5hdG9tL3BhY2thZ2VzL2luZGVudC1ndWlkZS1pbXByb3ZlZC9saWIvZ3VpZGVzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw4SkFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUMsUUFBUyxPQUFBLENBQVEsTUFBUixFQUFULEtBQUQsQ0FBQTs7QUFBQSxFQUVBLEdBQUEsR0FBTSxTQUFDLE9BQUQsRUFBVSxLQUFWLEVBQWlCLEtBQWpCLEVBQXdCLFVBQXhCLEdBQUE7QUFDSixRQUFBLG1DQUFBO0FBQUEsSUFBQSxHQUFBLEdBQU0sS0FBTixDQUFBO0FBQUEsSUFDQSxRQUFBLEdBQVcsS0FEWCxDQUFBO0FBQUEsSUFFQSxPQUFBLEdBQVUsS0FGVixDQUFBO0FBQUEsSUFJQSxFQUFBLEdBQUssRUFKTCxDQUFBO0FBS0EsV0FBTSxHQUFBLEdBQU0sT0FBTyxDQUFDLE1BQWQsSUFBd0IsS0FBQSxJQUFTLE9BQVEsQ0FBQSxHQUFBLENBQS9DLEdBQUE7QUFDRSxNQUFBLElBQUcsS0FBQSxHQUFRLE9BQVEsQ0FBQSxHQUFBLENBQW5CO0FBQ0UsUUFBQSxDQUFBLEdBQUksR0FBQSxDQUFJLE9BQUosRUFBYSxHQUFiLEVBQWtCLEtBQUEsR0FBUSxDQUExQixFQUE2QixVQUE3QixDQUFKLENBQUE7QUFDQSxRQUFBLHVDQUFjLENBQUUsY0FBaEI7QUFDRSxVQUFBLE9BQUEsR0FBVSxJQUFWLENBREY7U0FEQTtBQUFBLFFBR0EsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBckIsQ0FBMkIsRUFBM0IsRUFBK0IsQ0FBQyxDQUFDLE1BQWpDLENBSEEsQ0FBQTtBQUFBLFFBSUEsR0FBQSxHQUFNLENBQUMsQ0FBQyxHQUpSLENBREY7T0FBQSxNQUFBO0FBT0UsUUFBQSxJQUFHLGVBQU8sVUFBUCxF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

//# sourceURL=/Users/alpha/.atom/packages/indent-guide-improved/lib/guides.coffee
