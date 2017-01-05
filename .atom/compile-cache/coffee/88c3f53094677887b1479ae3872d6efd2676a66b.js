(function() {
  var IndentGuideImprovedElement, Point, createElementsForGuides, realLength, styleGuide;

  Point = require('atom').Point;

  styleGuide = function(element, point, length, stack, active, editor, basePixelPos, lineHeightPixel, baseScreenRow, scrollTop, scrollLeft) {
    var indentSize, left, row, top;
    element.classList.add('indent-guide-improved');
    element.classList[stack ? 'add' : 'remove']('indent-guide-stack');
    element.classList[active ? 'add' : 'remove']('indent-guide-active');
    if (editor.isFoldedAtBufferRow(Math.max(point.row - 1, 0))) {
      element.style.height = '0px';
      return;
    }
    row = editor.screenRowForBufferRow(point.row);
    indentSize = editor.getTabLength();
    left = point.column * indentSize * editor.getDefaultCharWidth() - scrollLeft;
    top = basePixelPos + lineHeightPixel * (row - baseScreenRow) - scrollTop;
    element.style.left = "" + left + "px";
    element.style.top = "" + top + "px";
    element.style.height = "" + (editor.getLineHeightInPixels() * realLength(point.row, length, editor)) + "px";
    element.style.display = 'block';
    return element.style['z-index'] = 0;
  };

  realLength = function(row, length, editor) {
    var row1, row2;
    row1 = editor.screenRowForBufferRow(row);
    row2 = editor.screenRowForBufferRow(row + length);
    return row2 - row1;
  };

  IndentGuideImprovedElement = document.registerElement('indent-guide-improved');

  createElementsForGuides = function(editorElement, fns) {
    var count, createNum, existNum, items, neededNum, recycleNum, _i, _j, _results, _results1;
    items = editorElement.querySelectorAll('.indent-guide-improved');
    existNum = items.length;
    neededNum = fns.length;
    createNum = Math.max(neededNum - existNum, 0);
    recycleNum = Math.min(neededNum, existNum);
    count = 0;
    (function() {
      _results = [];
      for (var _i = 0; 0 <= existNum ? _i < existNum : _i > existNum; 0 <= existNum ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this).forEach(function(i) {
      var node;
      node = items.item(i);
      if (i < recycleNum) {
        return fns[count++](node);
      } else {
        return node.parentNode.removeChild(node);
      }
    });
    (function() {
      _results1 = [];
      for (var _j = 0; 0 <= createNum ? _j < createNum : _j > createNum; 0 <= createNum ? _j++ : _j--){ _results1.push(_j); }
      return _results1;
    }).apply(this).forEach(function(i) {
      var newNode;
      newNode = new IndentGuideImprovedElement();
      newNode.classList.add('overlayer');
      fns[count++](newNode);
      return editorElement.appendChild(newNode);
    });
    if (count !== neededNum) {
      throw 'System Error';
    }
  };

  module.exports = {
    createElementsForGuides: createElementsForGuides,
    styleGuide: styleGuide
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2FscGhhLy5hdG9tL3BhY2thZ2VzL2luZGVudC1ndWlkZS1pbXByb3ZlZC9saWIvaW5kZW50LWd1aWRlLWltcHJvdmVkLWVsZW1lbnQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtGQUFBOztBQUFBLEVBQUMsUUFBUyxPQUFBLENBQVEsTUFBUixFQUFULEtBQUQsQ0FBQTs7QUFBQSxFQUVBLFVBQUEsR0FBYSxTQUFDLE9BQUQsRUFBVSxLQUFWLEVBQWlCLE1BQWpCLEVBQXlCLEtBQXpCLEVBQWdDLE1BQWhDLEVBQXdDLE1BQXhDLEVBQWdELFlBQWhELEVBQThELGVBQTlELEVBQStFLGFBQS9FLEVBQThGLFNBQTlGLEVBQXlHLFVBQXpHLEdBQUE7QUFDWCxRQUFBLDBCQUFBO0FBQUEsSUFBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQWxCLENBQXNCLHVCQUF0QixDQUFBLENBQUE7QUFBQSxJQUNBLE9BQU8sQ0FBQyxTQUFVLENBQUcsS0FBSCxHQUFjLEtBQWQsR0FBeUIsUUFBekIsQ0FBbEIsQ0FBcUQsb0JBQXJELENBREEsQ0FBQTtBQUFBLElBRUEsT0FBTyxDQUFDLFNBQVUsQ0FBRyxNQUFILEdBQWUsS0FBZixHQUEwQixRQUExQixDQUFsQixDQUFzRCxxQkFBdEQsQ0FGQSxDQUFBO0FBSUEsSUFBQSxJQUFHLE1BQU0sQ0FBQyxtQkFBUCxDQUEyQixJQUFJLENBQUMsR0FBTCxDQUFTLEtBQUssQ0FBQyxHQUFOLEdBQVksQ0FBckIsRUFBd0IsQ0FBeEIsQ0FBM0IsQ0FBSDtBQUNFLE1BQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFkLEdBQXVCLEtBQXZCLENBQUE7QUFDQSxZQUFBLENBRkY7S0FKQTtBQUFBLElBUUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxxQkFBUCxDQUE2QixLQUFLLENBQUMsR0FB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

//# sourceURL=/Users/alpha/.atom/packages/indent-guide-improved/lib/indent-guide-improved-element.coffee
