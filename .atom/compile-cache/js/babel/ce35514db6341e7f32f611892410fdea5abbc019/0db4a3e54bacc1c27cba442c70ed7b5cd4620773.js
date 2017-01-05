'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var SyncScroll = (function () {
  function SyncScroll(editor1, editor2, syncHorizontalScroll) {
    var _this = this;

    _classCallCheck(this, SyncScroll);

    this._syncHorizontalScroll = syncHorizontalScroll;
    this._subscriptions = new CompositeDisposable();
    this._syncInfo = [{
      editor: editor1,
      editorView: atom.views.getView(editor1),
      scrolling: false
    }, {
      editor: editor2,
      editorView: atom.views.getView(editor2),
      scrolling: false
    }];

    this._syncInfo.forEach(function (editorInfo, i) {
      // Note that 'onDidChangeScrollTop' isn't technically in the public API.
      _this._subscriptions.add(editorInfo.editorView.onDidChangeScrollTop(function () {
        return _this._scrollPositionChanged(i);
      }));
      // Note that 'onDidChangeScrollLeft' isn't technically in the public API.
      if (_this._syncHorizontalScroll) {
        _this._subscriptions.add(editorInfo.editorView.onDidChangeScrollLeft(function () {
          return _this._scrollPositionChanged(i);
        }));
      }
      // bind this so that the editors line up on start of package
      _this._subscriptions.add(editorInfo.editor.emitter.on('did-change-scroll-top', function () {
        return _this._scrollPositionChanged(i);
      }));
    });
  }

  _createClass(SyncScroll, [{
    key: '_scrollPositionChanged',
    value: function _scrollPositionChanged(changeScrollIndex) {
      var thisInfo = this._syncInfo[changeScrollIndex];
      var otherInfo = this._syncInfo[1 - changeScrollIndex];

      if (thisInfo.scrolling) {
        return;
      }
      otherInfo.scrolling = true;
      try {
        otherInfo.editorView.setScrollTop(thisInfo.editorView.getScrollTop());
        if (this._syncHorizontalScroll) {
          otherInfo.editorView.setScrollLeft(thisInfo.editorView.getScrollLeft());
        }
      } catch (e) {
        //console.log(e);
      }
      otherInfo.scrolling = false;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._subscriptions) {
        this._subscriptions.dispose();
        this._subscriptions = null;
      }
    }
  }, {
    key: 'syncPositions',
    value: function syncPositions() {
      var activeTextEditor = atom.workspace.getActiveTextEditor();
      this._syncInfo.forEach(function (editorInfo, i) {
        if (editorInfo.editor == activeTextEditor) {
          editorInfo.editor.emitter.emit('did-change-scroll-top', editorInfo.editorView.getScrollTop());
        }
      });
    }
  }]);

  return SyncScroll;
})();

module.exports = SyncScroll;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9hbHBoYS8uYXRvbS9wYWNrYWdlcy9zcGxpdC1kaWZmL2xpYi9zeW5jLXNjcm9sbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7OztlQUVnQixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF0QyxtQkFBbUIsWUFBbkIsbUJBQW1COztJQUVsQixVQUFVO0FBRUgsV0FGUCxVQUFVLENBRUYsT0FBbUIsRUFBRSxPQUFtQixFQUFFLG9CQUE2QixFQUFFOzs7MEJBRmpGLFVBQVU7O0FBR1osUUFBSSxDQUFDLHFCQUFxQixHQUFHLG9CQUFvQixDQUFDO0FBQ2xELFFBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO0FBQ2hELFFBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQztBQUNoQixZQUFNLEVBQUUsT0FBTztBQUNmLGdCQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO0FBQ3ZDLGVBQVMsRUFBRSxLQUFLO0tBQ2pCLEVBQUU7QUFDRCxZQUFNLEVBQUUsT0FBTztBQUNmLGdCQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO0FBQ3ZDLGVBQVMsRUFBRSxLQUFLO0tBQ2pCLENBQUMsQ0FBQzs7QUFFSCxRQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUs7O0FBRXhDLFlBQUssY0FBYyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDO2VBQU0sTUFBSyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7T0FBQSxDQUFDLENBQUMsQ0FBQzs7QUFFMUcsVUFBRyxNQUFLLHFCQUFxQixFQUFFO0FBQzdCLGNBQUssY0FBYyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDO2lCQUFNLE1BQUssc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1NBQUEsQ0FBQyxDQUFDLENBQUM7T0FDNUc7O0FBRUQsWUFBSyxjQUFjLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyx1QkFBdUIsRUFBRTtlQUFNLE1BQUssc0JBQXNCLENBQUMsQ0FBQyxDQUFDO09BQUEsQ0FBQyxDQUFDLENBQUM7S0FDdEgsQ0FBQyxDQUFDO0dBQ0o7O2VBekJHLFVBQVU7O1dBMkJRLGdDQUFDLGlCQUF5QixFQUFRO0FBQ3RELFVBQUksUUFBUSxHQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNsRCxVQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDOztBQUV0RCxVQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUU7QUFDdEIsZUFBTztPQUNSO0FBQ0QsZUFBUyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDM0IsVUFBSTtBQUNGLGlCQUFTLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7QUFDdEUsWUFBRyxJQUFJLENBQUMscUJBQXFCLEVBQUU7QUFDN0IsbUJBQVMsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztTQUN6RTtPQUNGLENBQUMsT0FBTyxDQUFDLEVBQUU7O09BRVg7QUFDRCxlQUFTLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztLQUM3Qjs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDdkIsWUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5QixZQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztPQUM1QjtLQUNGOzs7V0FFWSx5QkFBUztBQUNwQixVQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUM1RCxVQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUs7QUFDeEMsWUFBRyxVQUFVLENBQUMsTUFBTSxJQUFJLGdCQUFnQixFQUFFO0FBQ3hDLG9CQUFVLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1NBQy9GO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztTQTVERyxVQUFVOzs7QUErRGhCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9hbHBoYS8uYXRvbS9wYWNrYWdlcy9zcGxpdC1kaWZmL2xpYi9zeW5jLXNjcm9sbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG52YXIge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuXG5jbGFzcyBTeW5jU2Nyb2xsIHtcblxuICBjb25zdHJ1Y3RvcihlZGl0b3IxOiBUZXh0RWRpdG9yLCBlZGl0b3IyOiBUZXh0RWRpdG9yLCBzeW5jSG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbikge1xuICAgIHRoaXMuX3N5bmNIb3Jpem9udGFsU2Nyb2xsID0gc3luY0hvcml6b250YWxTY3JvbGw7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fc3luY0luZm8gPSBbe1xuICAgICAgZWRpdG9yOiBlZGl0b3IxLFxuICAgICAgZWRpdG9yVmlldzogYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcjEpLFxuICAgICAgc2Nyb2xsaW5nOiBmYWxzZSxcbiAgICB9LCB7XG4gICAgICBlZGl0b3I6IGVkaXRvcjIsXG4gICAgICBlZGl0b3JWaWV3OiBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yMiksXG4gICAgICBzY3JvbGxpbmc6IGZhbHNlLFxuICAgIH1dO1xuXG4gICAgdGhpcy5fc3luY0luZm8uZm9yRWFjaCgoZWRpdG9ySW5mbywgaSkgPT4ge1xuICAgICAgLy8gTm90ZSB0aGF0ICdvbkRpZENoYW5nZVNjcm9sbFRvcCcgaXNuJ3QgdGVjaG5pY2FsbHkgaW4gdGhlIHB1YmxpYyBBUEkuXG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChlZGl0b3JJbmZvLmVkaXRvclZpZXcub25EaWRDaGFuZ2VTY3JvbGxUb3AoKCkgPT4gdGhpcy5fc2Nyb2xsUG9zaXRpb25DaGFuZ2VkKGkpKSk7XG4gICAgICAvLyBOb3RlIHRoYXQgJ29uRGlkQ2hhbmdlU2Nyb2xsTGVmdCcgaXNuJ3QgdGVjaG5pY2FsbHkgaW4gdGhlIHB1YmxpYyBBUEkuXG4gICAgICBpZih0aGlzLl9zeW5jSG9yaXpvbnRhbFNjcm9sbCkge1xuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChlZGl0b3JJbmZvLmVkaXRvclZpZXcub25EaWRDaGFuZ2VTY3JvbGxMZWZ0KCgpID0+IHRoaXMuX3Njcm9sbFBvc2l0aW9uQ2hhbmdlZChpKSkpO1xuICAgICAgfVxuICAgICAgLy8gYmluZCB0aGlzIHNvIHRoYXQgdGhlIGVkaXRvcnMgbGluZSB1cCBvbiBzdGFydCBvZiBwYWNrYWdlXG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChlZGl0b3JJbmZvLmVkaXRvci5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLXNjcm9sbC10b3AnLCAoKSA9PiB0aGlzLl9zY3JvbGxQb3NpdGlvbkNoYW5nZWQoaSkpKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9zY3JvbGxQb3NpdGlvbkNoYW5nZWQoY2hhbmdlU2Nyb2xsSW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgIHZhciB0aGlzSW5mbyAgPSB0aGlzLl9zeW5jSW5mb1tjaGFuZ2VTY3JvbGxJbmRleF07XG4gICAgdmFyIG90aGVySW5mbyA9IHRoaXMuX3N5bmNJbmZvWzEgLSBjaGFuZ2VTY3JvbGxJbmRleF07XG5cbiAgICBpZiAodGhpc0luZm8uc2Nyb2xsaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIG90aGVySW5mby5zY3JvbGxpbmcgPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICBvdGhlckluZm8uZWRpdG9yVmlldy5zZXRTY3JvbGxUb3AodGhpc0luZm8uZWRpdG9yVmlldy5nZXRTY3JvbGxUb3AoKSk7XG4gICAgICBpZih0aGlzLl9zeW5jSG9yaXpvbnRhbFNjcm9sbCkge1xuICAgICAgICBvdGhlckluZm8uZWRpdG9yVmlldy5zZXRTY3JvbGxMZWZ0KHRoaXNJbmZvLmVkaXRvclZpZXcuZ2V0U2Nyb2xsTGVmdCgpKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvL2NvbnNvbGUubG9nKGUpO1xuICAgIH1cbiAgICBvdGhlckluZm8uc2Nyb2xsaW5nID0gZmFsc2U7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHN5bmNQb3NpdGlvbnMoKTogdm9pZCB7XG4gICAgdmFyIGFjdGl2ZVRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgdGhpcy5fc3luY0luZm8uZm9yRWFjaCgoZWRpdG9ySW5mbywgaSkgPT4ge1xuICAgICAgaWYoZWRpdG9ySW5mby5lZGl0b3IgPT0gYWN0aXZlVGV4dEVkaXRvcikge1xuICAgICAgICBlZGl0b3JJbmZvLmVkaXRvci5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2Utc2Nyb2xsLXRvcCcsIGVkaXRvckluZm8uZWRpdG9yVmlldy5nZXRTY3JvbGxUb3AoKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTeW5jU2Nyb2xsO1xuIl19