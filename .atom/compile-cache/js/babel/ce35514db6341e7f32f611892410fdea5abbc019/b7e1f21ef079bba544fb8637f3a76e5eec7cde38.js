'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = (function () {
  function EditorDiffExtender(editor) {
    _classCallCheck(this, EditorDiffExtender);

    this._editor = editor;
    this._lineMarkerLayer = this._editor.addMarkerLayer();
    this._miscMarkers = [];
    this._selectionMarkerLayer = this._editor.addMarkerLayer();
    this._oldPlaceholderText = editor.getPlaceholderText();
    editor.setPlaceholderText('Paste what you want to diff here!');
    // add split-diff css selector to editors for keybindings #73
    atom.views.getView(this._editor).classList.add('split-diff');
  }

  /**
   * Adds offsets (blank lines) into the editor.
   *
   * @param lineOffsets An array of offsets (blank lines) to insert into this editor.
   */

  _createClass(EditorDiffExtender, [{
    key: 'setLineOffsets',
    value: function setLineOffsets(lineOffsets) {
      var offsetLineNumbers = Object.keys(lineOffsets).map(function (lineNumber) {
        return parseInt(lineNumber, 10);
      }).sort(function (x, y) {
        return x - y;
      });

      for (var offsetLineNumber of offsetLineNumbers) {
        if (offsetLineNumber == 0) {
          // add block decoration before if adding to line 0
          this._addOffsetDecoration(offsetLineNumber - 1, lineOffsets[offsetLineNumber], 'before');
        } else {
          // add block decoration after if adding to lines > 0
          this._addOffsetDecoration(offsetLineNumber - 1, lineOffsets[offsetLineNumber], 'after');
        }
      }
    }

    /**
     * Creates marker for line highlight.
     *
     * @param startIndex The start index of the line chunk to highlight.
     * @param endIndex The end index of the line chunk to highlight.
     * @param highlightType The type of highlight to be applied to the line.
     */
  }, {
    key: 'highlightLines',
    value: function highlightLines(startIndex, endIndex, highlightType) {
      if (startIndex != endIndex) {
        var highlightClass = 'split-diff-line split-diff-' + highlightType;
        this._createLineMarker(this._lineMarkerLayer, startIndex, endIndex, highlightClass);
      }
    }

    /**
     * The line marker layer holds all added/removed line markers.
     *
     * @return The line marker layer.
     */
  }, {
    key: 'getLineMarkerLayer',
    value: function getLineMarkerLayer() {
      return this._lineMarkerLayer;
    }

    /**
     * The selection marker layer holds all line highlight selection markers.
     *
     * @return The selection marker layer.
     */
  }, {
    key: 'getSelectionMarkerLayer',
    value: function getSelectionMarkerLayer() {
      return this._selectionMarkerLayer;
    }

    /**
     * Highlights words in a given line.
     *
     * @param lineNumber The line number to highlight words on.
     * @param wordDiff An array of objects which look like...
     *    added: boolean (not used)
     *    count: number (not used)
     *    removed: boolean (not used)
     *    value: string
     *    changed: boolean
     * @param type The type of highlight to be applied to the words.
     */
  }, {
    key: 'setWordHighlights',
    value: function setWordHighlights(lineNumber, wordDiff, type, isWhitespaceIgnored) {
      if (wordDiff === undefined) wordDiff = [];

      var klass = 'split-diff-word-' + type;
      var count = 0;

      for (var i = 0; i < wordDiff.length; i++) {
        if (wordDiff[i].value) {
          // fix for #49
          // if there was a change
          // AND one of these is true:
          // if the string is not spaces, highlight
          // OR
          // if the string is spaces and whitespace not ignored, highlight
          if (wordDiff[i].changed && (/\S/.test(wordDiff[i].value) || !/\S/.test(wordDiff[i].value) && !isWhitespaceIgnored)) {
            var marker = this._editor.markBufferRange([[lineNumber, count], [lineNumber, count + wordDiff[i].value.length]], { invalidate: 'never' });
            this._editor.decorateMarker(marker, { type: 'highlight', 'class': klass });
            this._miscMarkers.push(marker);
          }
          count += wordDiff[i].value.length;
        }
      }
    }

    /**
     * Destroys all markers added to this editor by split-diff.
     */
  }, {
    key: 'destroyMarkers',
    value: function destroyMarkers() {
      this._lineMarkerLayer.clear();

      this._miscMarkers.forEach(function (marker) {
        marker.destroy();
      });
      this._miscMarkers = [];

      this._selectionMarkerLayer.clear();
    }

    /**
     * Destroys the instance of the EditorDiffExtender and cleans up after itself.
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      this.destroyMarkers();
      this._lineMarkerLayer.destroy();
      this._editor.setPlaceholderText(this._oldPlaceholderText);
      // remove split-diff css selector from editors for keybindings #73
      atom.views.getView(this._editor).classList.remove('split-diff');
    }

    /**
     * Selects lines.
     *
     * @param startLine The line number that the selection starts at.
     * @param endLine The line number that the selection ends at (non-inclusive).
     */
  }, {
    key: 'selectLines',
    value: function selectLines(startLine, endLine) {
      // don't want to highlight if they are the same (same numbers means chunk is
      // just pointing to a location to copy-to-right/copy-to-left)
      if (startLine < endLine) {
        var selectionMarker = this._selectionMarkerLayer.findMarkers({
          startBufferRow: startLine,
          endBufferRow: endLine
        })[0];
        if (!selectionMarker) {
          this._createLineMarker(this._selectionMarkerLayer, startLine, endLine, 'split-diff-selected');
        }
      }
    }
  }, {
    key: 'deselectLines',
    value: function deselectLines(startLine, endLine) {
      var selectionMarker = this._selectionMarkerLayer.findMarkers({
        startBufferRow: startLine,
        endBufferRow: endLine
      })[0];
      if (selectionMarker) {
        selectionMarker.destroy();
      }
    }

    /**
     * Destroy the selection markers.
     */
  }, {
    key: 'deselectAllLines',
    value: function deselectAllLines() {
      this._selectionMarkerLayer.clear();
    }

    /**
     * Used to test whether there is currently an active selection highlight in
     * the editor.
     *
     * @return A boolean signifying whether there is an active selection highlight.
     */
  }, {
    key: 'hasSelection',
    value: function hasSelection() {
      if (this._selectionMarkerLayer.getMarkerCount() > 0) {
        return true;
      }
      return false;
    }

    /**
     * Enable soft wrap for this editor.
     */
  }, {
    key: 'enableSoftWrap',
    value: function enableSoftWrap() {
      try {
        this._editor.setSoftWrapped(true);
      } catch (e) {
        //console.log('Soft wrap was enabled on a text editor that does not exist.');
      }
    }

    /**
     * Removes the text editor without prompting a save.
     */
  }, {
    key: 'cleanUp',
    value: function cleanUp() {
      // if the pane that this editor was in is now empty, we will destroy it
      var editorPane = atom.workspace.paneForItem(this._editor);
      if (typeof editorPane !== 'undefined' && editorPane != null && editorPane.getItems().length == 1) {
        editorPane.destroy();
      } else {
        this._editor.destroy();
      }
    }

    /**
     * Used to get the Text Editor object for this view. Helpful for calling basic
     * Atom Text Editor functions.
     *
     * @return The Text Editor object for this view.
     */
  }, {
    key: 'getEditor',
    value: function getEditor() {
      return this._editor;
    }

    // ----------------------------------------------------------------------- //
    // --------------------------- PRIVATE METHODS --------------------------- //
    // ----------------------------------------------------------------------- //

    /**
     * Creates a marker and decorates its line and line number.
     *
     * @param markerLayer The marker layer to put the marker in.
     * @param startLineNumber A buffer line number to start highlighting at.
     * @param endLineNumber A buffer line number to end highlighting at.
     * @param highlightClass The type of highlight to be applied to the line.
     *    Could be a value of: ['split-diff-insert', 'split-diff-delete',
     *    'split-diff-select'].
     * @return The created line marker.
     */
  }, {
    key: '_createLineMarker',
    value: function _createLineMarker(markerLayer, startLineNumber, endLineNumber, highlightClass) {
      var marker = markerLayer.markBufferRange([[startLineNumber, 0], [endLineNumber, 0]], { invalidate: 'never' });

      this._editor.decorateMarker(marker, { type: 'line-number', 'class': highlightClass });
      this._editor.decorateMarker(marker, { type: 'line', 'class': highlightClass });

      return marker;
    }

    /**
     * Creates a decoration for an offset.
     *
     * @param lineNumber The line number to add the block decoration to.
     * @param numberOfLines The number of lines that the block decoration's height will be.
     * @param blockPosition Specifies whether to put the decoration before the line or after.
     */
  }, {
    key: '_addOffsetDecoration',
    value: function _addOffsetDecoration(lineNumber, numberOfLines, blockPosition) {
      var element = document.createElement('div');
      element.className += 'split-diff-offset';
      // if no text, set height for blank lines
      element.style.minHeight = numberOfLines * this._editor.getLineHeightInPixels() + 'px';

      var marker = this._editor.markScreenPosition([lineNumber, 0], { invalidate: 'never' });
      this._editor.decorateMarker(marker, { type: 'block', position: blockPosition, item: element });
      this._miscMarkers.push(marker);
    }
  }]);

  return EditorDiffExtender;
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9ub2Vsd29yZGVuLy5hdG9tL3BhY2thZ2VzL3NwbGl0LWRpZmYvbGliL2VkaXRvci1kaWZmLWV4dGVuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7O0FBRVgsTUFBTSxDQUFDLE9BQU87QUFFRCxXQUZVLGtCQUFrQixDQUUzQixNQUFNLEVBQUU7MEJBRkMsa0JBQWtCOztBQUdyQyxRQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUN0QixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUN0RCxRQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQztBQUN2QixRQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUMzRCxRQUFJLENBQUMsbUJBQW1CLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFDdkQsVUFBTSxDQUFDLGtCQUFrQixDQUFDLG1DQUFtQyxDQUFDLENBQUM7O0FBRS9ELFFBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0dBQzlEOzs7Ozs7OztlQVhvQixrQkFBa0I7O1dBa0J6Qix3QkFBQyxXQUFXLEVBQUU7QUFDMUIsVUFBSSxpQkFBaUIsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLFVBQVU7ZUFBSSxRQUFRLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQztPQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQztlQUFLLENBQUMsR0FBRyxDQUFDO09BQUEsQ0FBQyxDQUFDOztBQUVuSCxXQUFJLElBQUksZ0JBQWdCLElBQUksaUJBQWlCLEVBQUU7QUFDN0MsWUFBRyxn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RUFBRSxTQUFPLGNBQWMsRUFBQyxDQUFDLENBQUM7O0FBRTNFLGFBQU8sTUFBTSxDQUFDO0tBQ2Y7Ozs7Ozs7Ozs7O1dBU21CLDhCQUFDLFVBQVUsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFO0FBQzdELFVBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDNUMsYUFBTyxDQUFDLFNBQVMsSUFBSSxtQkFBbUIsQ0FBQzs7QUFFekMsYUFBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsQUFBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxHQUFJLElBQUksQ0FBQzs7QUFFeEYsVUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDO0FBQ3JGLFVBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQztBQUM3RixVQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNoQzs7O1NBeFBvQixrQkFBa0I7SUF5UHhDLENBQUMiLCJmaWxlIjoiL1VzZXJzL25vZWx3b3JkZW4vLmF0b20vcGFja2FnZXMvc3BsaXQtZGlmZi9saWIvZWRpdG9yLWRpZmYtZXh0ZW5kZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEVkaXRvckRpZmZFeHRlbmRlciB7XG5cbiAgY29uc3RydWN0b3IoZWRpdG9yKSB7XG4gICAgdGhpcy5fZWRpdG9yID0gZWRpdG9yO1xuICAgIHRoaXMuX2xpbmVNYXJrZXJMYXllciA9IHRoaXMuX2VkaXRvci5hZGRNYXJrZXJMYXllcigpO1xuICAgIHRoaXMuX21pc2NNYXJrZXJzID0gW107XG4gICAgdGhpcy5fc2VsZWN0aW9uTWFya2VyTGF5ZXIgPSB0aGlzLl9lZGl0b3IuYWRkTWFya2VyTGF5ZXIoKTtcbiAgICB0aGlzLl9vbGRQbGFjZWhvbGRlclRleHQgPSBlZGl0b3IuZ2V0UGxhY2Vob2xkZXJUZXh0KCk7XG4gICAgZWRpdG9yLnNldFBsYWNlaG9sZGVyVGV4dCgnUGFzdGUgd2hhdCB5b3Ugd2FudCB0byBkaWZmIGhlcmUhJyk7XG4gICAgLy8gYWRkIHNwbGl0LWRpZmYgY3NzIHNlbGVjdG9yIHRvIGVkaXRvcnMgZm9yIGtleWJpbmRpbmdzICM3M1xuICAgIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9lZGl0b3IpLmNsYXNzTGlzdC5hZGQoJ3NwbGl0LWRpZmYnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIG9mZnNldHMgKGJsYW5rIGxpbmVzKSBpbnRvIHRoZSBlZGl0b3IuXG4gICAqXG4gICAqIEBwYXJhbSBsaW5lT2Zmc2V0cyBBbiBhcnJheSBvZiBvZmZzZXRzIChibGFuayBsaW5lcykgdG8gaW5zZXJ0IGludG8gdGhpcyBlZGl0b3IuXG4gICAqL1xuICBzZXRMaW5lT2Zmc2V0cyhsaW5lT2Zmc2V0cykge1xuICAgIHZhciBvZmZzZXRMaW5lTnVtYmVycyA9IE9iamVjdC5rZXlzKGxpbmVPZmZzZXRzKS5tYXAobGluZU51bWJlciA9PiBwYXJzZUludChsaW5lTnVtYmVyLCAxMCkpLnNvcnQoKHgsIHkpID0+IHggLSB5KTtcblxuICAgIGZvcih2YXIgb2Zmc2V0TGluZU51bWJlciBvZiBvZmZzZXRMaW5lTnVtYmVycykge1xuICAgICAgaWYob2Zmc2V0TGluZU51bWJlciA9PSAwKSB7XG4gICAgICAgIC8vIGFkZCBibG9jayBkZWNvcmF0aW9uIGJlZm9yZSBpZiBhZGRpbmcgdG8gbGluZSAwXG4gICAgICAgIHRoaXMuX2FkZE9mZnNldERlY29yYXRpb24ob2Zmc2V0TGluZU51bWJlci0xLCBsaW5lT2Zmc2V0c1tvZmZzZXRMaW5lTnVtYmVyXSwgJ2JlZm9yZScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYWRkIGJsb2NrIGRlY29yYXRpb24gYWZ0ZXIgaWYgYWRkaW5nIHRvIGxpbmVzID4gMFxuICAgICAgICB0aGlzLl9hZGRPZmZzZXREZWNvcmF0aW9uKG9mZnNldExpbmVOdW1iZXItMSwgbGluZU9mZnNldHNbb2Zmc2V0TGluZU51bWJlcl0sICdhZnRlcicpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIG1hcmtlciBmb3IgbGluZSBoaWdobGlnaHQuXG4gICAqXG4gICAqIEBwYXJhbSBzdGFydEluZGV4IFRoZSBzdGFydCBpbmRleCBvZiB0aGUgbGluZSBjaHVuayB0byBoaWdobGlnaHQuXG4gICAqIEBwYXJhbSBlbmRJbmRleCBUaGUgZW5kIGluZGV4IG9mIHRoZSBsaW5lIGNodW5rIHRvIGhpZ2hsaWdodC5cbiAgICogQHBhcmFtIGhpZ2hsaWdodFR5cGUgVGhlIHR5cGUgb2YgaGlnaGxpZ2h0IHRvIGJlIGFwcGxpZWQgdG8gdGhlIGxpbmUuXG4gICAqL1xuICBoaWdobGlnaHRMaW5lcyhzdGFydEluZGV4LCBlbmRJbmRleCwgaGlnaGxpZ2h0VHlwZSkge1xuICAgIGlmKHN0YXJ0SW5kZXggIT0gZW5kSW5kZXgpIHtcbiAgICAgIHZhciBoaWdobGlnaHRDbGFzcyA9ICdzcGxpdC1kaWZmLWxpbmUgc3BsaXQtZGlmZi0nICsgaGlnaGxpZ2h0VHlwZTtcbiAgICAgIHRoaXMuX2NyZWF0ZUxpbmVNYXJrZXIodGhpcy5fbGluZU1hcmtlckxheWVyLCBzdGFydEluZGV4LCBlbmRJbmRleCwgaGlnaGxpZ2h0Q2xhc3MpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbGluZSBtYXJrZXIgbGF5ZXIgaG9sZHMgYWxsIGFkZGVkL3JlbW92ZWQgbGluZSBtYXJrZXJzLlxuICAgKlxuICAgKiBAcmV0dXJuIFRoZSBsaW5lIG1hcmtlciBsYXllci5cbiAgICovXG4gIGdldExpbmVNYXJrZXJMYXllcigpIHtcbiAgICByZXR1cm4gdGhpcy5fbGluZU1hcmtlckxheWVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzZWxlY3Rpb24gbWFya2VyIGxheWVyIGhvbGRzIGFsbCBsaW5lIGhpZ2hsaWdodCBzZWxlY3Rpb24gbWFya2Vycy5cbiAgICpcbiAgICogQHJldHVybiBUaGUgc2VsZWN0aW9uIG1hcmtlciBsYXllci5cbiAgICovXG4gIGdldFNlbGVjdGlvbk1hcmtlckxheWVyKCkge1xuICAgIHJldHVybiB0aGlzLl9zZWxlY3Rpb25NYXJrZXJMYXllcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWdobGlnaHRzIHdvcmRzIGluIGEgZ2l2ZW4gbGluZS5cbiAgICpcbiAgICogQHBhcmFtIGxpbmVOdW1iZXIgVGhlIGxpbmUgbnVtYmVyIHRvIGhpZ2hsaWdodCB3b3JkcyBvbi5cbiAgICogQHBhcmFtIHdvcmREaWZmIEFuIGFycmF5IG9mIG9iamVjdHMgd2hpY2ggbG9vayBsaWtlLi4uXG4gICAqICAgIGFkZGVkOiBib29sZWFuIChub3QgdXNlZClcbiAgICogICAgY291bnQ6IG51bWJlciAobm90IHVzZWQpXG4gICAqICAgIHJlbW92ZWQ6IGJvb2xlYW4gKG5vdCB1c2VkKVxuICAgKiAgICB2YWx1ZTogc3RyaW5nXG4gICAqICAgIGNoYW5nZWQ6IGJvb2xlYW5cbiAgICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgb2YgaGlnaGxpZ2h0IHRvIGJlIGFwcGxpZWQgdG8gdGhlIHdvcmRzLlxuICAgKi9cbiAgc2V0V29yZEhpZ2hsaWdodHMobGluZU51bWJlciwgd29yZERpZmYgPSBbXSwgdHlwZSwgaXNXaGl0ZXNwYWNlSWdub3JlZCkge1xuICAgIHZhciBrbGFzcyA9ICdzcGxpdC1kaWZmLXdvcmQtJyArIHR5cGU7XG4gICAgdmFyIGNvdW50ID0gMDtcblxuICAgIGZvcih2YXIgaT0wOyBpPHdvcmREaWZmLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZih3b3JkRGlmZltpXS52YWx1ZSkgeyAvLyBmaXggZm9yICM0OVxuICAgICAgICAvLyBpZiB0aGVyZSB3YXMgYSBjaGFuZ2VcbiAgICAgICAgLy8gQU5EIG9uZSBvZiB0aGVzZSBpcyB0cnVlOlxuICAgICAgICAvLyBpZiB0aGUgc3RyaW5nIGlzIG5vdCBzcGFjZXMsIGhpZ2hsaWdodFxuICAgICAgICAvLyBPUlxuICAgICAgICAvLyBpZiB0aGUgc3RyaW5nIGlzIHNwYWNlcyBhbmQgd2hpdGVzcGFjZSBub3QgaWdub3JlZCwgaGlnaGxpZ2h0XG4gICAgICAgIGlmKHdvcmREaWZmW2ldLmNoYW5nZWRcbiAgICAgICAgICAmJiAoL1xcUy8udGVzdCh3b3JkRGlmZltpXS52YWx1ZSlcbiAgICAgICAgICB8fCAoIS9cXFMvLnRlc3Qod29yZERpZmZbaV0udmFsdWUpICYmICFpc1doaXRlc3BhY2VJZ25vcmVkKSkpIHtcbiAgICAgICAgICB2YXIgbWFya2VyID0gdGhpcy5fZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbW2xpbmVOdW1iZXIsIGNvdW50XSwgW2xpbmVOdW1iZXIsIChjb3VudCArIHdvcmREaWZmW2ldLnZhbHVlLmxlbmd0aCldXSwge2ludmFsaWRhdGU6ICduZXZlcid9KVxuICAgICAgICAgIHRoaXMuX2VkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHt0eXBlOiAnaGlnaGxpZ2h0JywgY2xhc3M6IGtsYXNzfSk7XG4gICAgICAgICAgdGhpcy5fbWlzY01hcmtlcnMucHVzaChtYXJrZXIpO1xuICAgICAgICB9XG4gICAgICAgIGNvdW50ICs9IHdvcmREaWZmW2ldLnZhbHVlLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYWxsIG1hcmtlcnMgYWRkZWQgdG8gdGhpcyBlZGl0b3IgYnkgc3BsaXQtZGlmZi5cbiAgICovXG4gIGRlc3Ryb3lNYXJrZXJzKCkge1xuICAgIHRoaXMuX2xpbmVNYXJrZXJMYXllci5jbGVhcigpO1xuXG4gICAgdGhpcy5fbWlzY01hcmtlcnMuZm9yRWFjaChmdW5jdGlvbihtYXJrZXIpIHtcbiAgICAgIG1hcmtlci5kZXN0cm95KCk7XG4gICAgfSk7XG4gICAgdGhpcy5fbWlzY01hcmtlcnMgPSBbXTtcblxuICAgIHRoaXMuX3NlbGVjdGlvbk1hcmtlckxheWVyLmNsZWFyKCk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIGluc3RhbmNlIG9mIHRoZSBFZGl0b3JEaWZmRXh0ZW5kZXIgYW5kIGNsZWFucyB1cCBhZnRlciBpdHNlbGYuXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuZGVzdHJveU1hcmtlcnMoKTtcbiAgICB0aGlzLl9saW5lTWFya2VyTGF5ZXIuZGVzdHJveSgpO1xuICAgIHRoaXMuX2VkaXRvci5zZXRQbGFjZWhvbGRlclRleHQodGhpcy5fb2xkUGxhY2Vob2xkZXJUZXh0KTtcbiAgICAvLyByZW1vdmUgc3BsaXQtZGlmZiBjc3Mgc2VsZWN0b3IgZnJvbSBlZGl0b3JzIGZvciBrZXliaW5kaW5ncyAjNzNcbiAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fZWRpdG9yKS5jbGFzc0xpc3QucmVtb3ZlKCdzcGxpdC1kaWZmJyk7XG4gIH1cblxuICAvKipcbiAgICogU2VsZWN0cyBsaW5lcy5cbiAgICpcbiAgICogQHBhcmFtIHN0YXJ0TGluZSBUaGUgbGluZSBudW1iZXIgdGhhdCB0aGUgc2VsZWN0aW9uIHN0YXJ0cyBhdC5cbiAgICogQHBhcmFtIGVuZExpbmUgVGhlIGxpbmUgbnVtYmVyIHRoYXQgdGhlIHNlbGVjdGlvbiBlbmRzIGF0IChub24taW5jbHVzaXZlKS5cbiAgICovXG4gIHNlbGVjdExpbmVzKHN0YXJ0TGluZSwgZW5kTGluZSkge1xuICAgIC8vIGRvbid0IHdhbnQgdG8gaGlnaGxpZ2h0IGlmIHRoZXkgYXJlIHRoZSBzYW1lIChzYW1lIG51bWJlcnMgbWVhbnMgY2h1bmsgaXNcbiAgICAvLyBqdXN0IHBvaW50aW5nIHRvIGEgbG9jYXRpb24gdG8gY29weS10by1yaWdodC9jb3B5LXRvLWxlZnQpXG4gICAgaWYoc3RhcnRMaW5lIDwgZW5kTGluZSkge1xuICAgICAgdmFyIHNlbGVjdGlvbk1hcmtlciA9IHRoaXMuX3NlbGVjdGlvbk1hcmtlckxheWVyLmZpbmRNYXJrZXJzKHtcbiAgICAgICAgc3RhcnRCdWZmZXJSb3c6IHN0YXJ0TGluZSxcbiAgICAgICAgZW5kQnVmZmVyUm93OiBlbmRMaW5lXG4gICAgICB9KVswXTtcbiAgICAgIGlmKCFzZWxlY3Rpb25NYXJrZXIpIHtcbiAgICAgICAgdGhpcy5fY3JlYXRlTGluZU1hcmtlcih0aGlzLl9zZWxlY3Rpb25NYXJrZXJMYXllciwgc3RhcnRMaW5lLCBlbmRMaW5lLCAnc3BsaXQtZGlmZi1zZWxlY3RlZCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGRlc2VsZWN0TGluZXMoc3RhcnRMaW5lLCBlbmRMaW5lKSB7XG4gICAgdmFyIHNlbGVjdGlvbk1hcmtlciA9IHRoaXMuX3NlbGVjdGlvbk1hcmtlckxheWVyLmZpbmRNYXJrZXJzKHtcbiAgICAgIHN0YXJ0QnVmZmVyUm93OiBzdGFydExpbmUsXG4gICAgICBlbmRCdWZmZXJSb3c6IGVuZExpbmVcbiAgICB9KVswXTtcbiAgICBpZihzZWxlY3Rpb25NYXJrZXIpIHtcbiAgICAgIHNlbGVjdGlvbk1hcmtlci5kZXN0cm95KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3kgdGhlIHNlbGVjdGlvbiBtYXJrZXJzLlxuICAgKi9cbiAgZGVzZWxlY3RBbGxMaW5lcygpIHtcbiAgICB0aGlzLl9zZWxlY3Rpb25NYXJrZXJMYXllci5jbGVhcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gdGVzdCB3aGV0aGVyIHRoZXJlIGlzIGN1cnJlbnRseSBhbiBhY3RpdmUgc2VsZWN0aW9uIGhpZ2hsaWdodCBpblxuICAgKiB0aGUgZWRpdG9yLlxuICAgKlxuICAgKiBAcmV0dXJuIEEgYm9vbGVhbiBzaWduaWZ5aW5nIHdoZXRoZXIgdGhlcmUgaXMgYW4gYWN0aXZlIHNlbGVjdGlvbiBoaWdobGlnaHQuXG4gICAqL1xuICBoYXNTZWxlY3Rpb24oKSB7XG4gICAgaWYodGhpcy5fc2VsZWN0aW9uTWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKSA+IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogRW5hYmxlIHNvZnQgd3JhcCBmb3IgdGhpcyBlZGl0b3IuXG4gICAqL1xuICBlbmFibGVTb2Z0V3JhcCgpIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5fZWRpdG9yLnNldFNvZnRXcmFwcGVkKHRydWUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vY29uc29sZS5sb2coJ1NvZnQgd3JhcCB3YXMgZW5hYmxlZCBvbiBhIHRleHQgZWRpdG9yIHRoYXQgZG9lcyBub3QgZXhpc3QuJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIHRleHQgZWRpdG9yIHdpdGhvdXQgcHJvbXB0aW5nIGEgc2F2ZS5cbiAgICovXG4gIGNsZWFuVXAoKSB7XG4gICAgLy8gaWYgdGhlIHBhbmUgdGhhdCB0aGlzIGVkaXRvciB3YXMgaW4gaXMgbm93IGVtcHR5LCB3ZSB3aWxsIGRlc3Ryb3kgaXRcbiAgICB2YXIgZWRpdG9yUGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKHRoaXMuX2VkaXRvcik7XG4gICAgaWYodHlwZW9mIGVkaXRvclBhbmUgIT09ICd1bmRlZmluZWQnICYmIGVkaXRvclBhbmUgIT0gbnVsbCAmJiBlZGl0b3JQYW5lLmdldEl0ZW1zKCkubGVuZ3RoID09IDEpIHtcbiAgICAgIGVkaXRvclBhbmUuZGVzdHJveSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9lZGl0b3IuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGdldCB0aGUgVGV4dCBFZGl0b3Igb2JqZWN0IGZvciB0aGlzIHZpZXcuIEhlbHBmdWwgZm9yIGNhbGxpbmcgYmFzaWNcbiAgICogQXRvbSBUZXh0IEVkaXRvciBmdW5jdGlvbnMuXG4gICAqXG4gICAqIEByZXR1cm4gVGhlIFRleHQgRWRpdG9yIG9iamVjdCBmb3IgdGhpcyB2aWV3LlxuICAgKi9cbiAgZ2V0RWRpdG9yKCkge1xuICAgIHJldHVybiB0aGlzLl9lZGl0b3I7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUFJJVkFURSBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbWFya2VyIGFuZCBkZWNvcmF0ZXMgaXRzIGxpbmUgYW5kIGxpbmUgbnVtYmVyLlxuICAgKlxuICAgKiBAcGFyYW0gbWFya2VyTGF5ZXIgVGhlIG1hcmtlciBsYXllciB0byBwdXQgdGhlIG1hcmtlciBpbi5cbiAgICogQHBhcmFtIHN0YXJ0TGluZU51bWJlciBBIGJ1ZmZlciBsaW5lIG51bWJlciB0byBzdGFydCBoaWdobGlnaHRpbmcgYXQuXG4gICAqIEBwYXJhbSBlbmRMaW5lTnVtYmVyIEEgYnVmZmVyIGxpbmUgbnVtYmVyIHRvIGVuZCBoaWdobGlnaHRpbmcgYXQuXG4gICAqIEBwYXJhbSBoaWdobGlnaHRDbGFzcyBUaGUgdHlwZSBvZiBoaWdobGlnaHQgdG8gYmUgYXBwbGllZCB0byB0aGUgbGluZS5cbiAgICogICAgQ291bGQgYmUgYSB2YWx1ZSBvZjogWydzcGxpdC1kaWZmLWluc2VydCcsICdzcGxpdC1kaWZmLWRlbGV0ZScsXG4gICAqICAgICdzcGxpdC1kaWZmLXNlbGVjdCddLlxuICAgKiBAcmV0dXJuIFRoZSBjcmVhdGVkIGxpbmUgbWFya2VyLlxuICAgKi9cbiAgX2NyZWF0ZUxpbmVNYXJrZXIobWFya2VyTGF5ZXIsIHN0YXJ0TGluZU51bWJlciwgZW5kTGluZU51bWJlciwgaGlnaGxpZ2h0Q2xhc3MpIHtcbiAgICB2YXIgbWFya2VyID0gbWFya2VyTGF5ZXIubWFya0J1ZmZlclJhbmdlKFtbc3RhcnRMaW5lTnVtYmVyLCAwXSwgW2VuZExpbmVOdW1iZXIsIDBdXSwge2ludmFsaWRhdGU6ICduZXZlcid9KVxuXG4gICAgdGhpcy5fZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge3R5cGU6ICdsaW5lLW51bWJlcicsIGNsYXNzOiBoaWdobGlnaHRDbGFzc30pO1xuICAgIHRoaXMuX2VkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHt0eXBlOiAnbGluZScsIGNsYXNzOiBoaWdobGlnaHRDbGFzc30pO1xuXG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgZGVjb3JhdGlvbiBmb3IgYW4gb2Zmc2V0LlxuICAgKlxuICAgKiBAcGFyYW0gbGluZU51bWJlciBUaGUgbGluZSBudW1iZXIgdG8gYWRkIHRoZSBibG9jayBkZWNvcmF0aW9uIHRvLlxuICAgKiBAcGFyYW0gbnVtYmVyT2ZMaW5lcyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRoYXQgdGhlIGJsb2NrIGRlY29yYXRpb24ncyBoZWlnaHQgd2lsbCBiZS5cbiAgICogQHBhcmFtIGJsb2NrUG9zaXRpb24gU3BlY2lmaWVzIHdoZXRoZXIgdG8gcHV0IHRoZSBkZWNvcmF0aW9uIGJlZm9yZSB0aGUgbGluZSBvciBhZnRlci5cbiAgICovXG4gIF9hZGRPZmZzZXREZWNvcmF0aW9uKGxpbmVOdW1iZXIsIG51bWJlck9mTGluZXMsIGJsb2NrUG9zaXRpb24pIHtcbiAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGVsZW1lbnQuY2xhc3NOYW1lICs9ICdzcGxpdC1kaWZmLW9mZnNldCc7XG4gICAgLy8gaWYgbm8gdGV4dCwgc2V0IGhlaWdodCBmb3IgYmxhbmsgbGluZXNcbiAgICBlbGVtZW50LnN0eWxlLm1pbkhlaWdodCA9IChudW1iZXJPZkxpbmVzICogdGhpcy5fZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpKSArICdweCc7XG5cbiAgICB2YXIgbWFya2VyID0gdGhpcy5fZWRpdG9yLm1hcmtTY3JlZW5Qb3NpdGlvbihbbGluZU51bWJlciwgMF0sIHtpbnZhbGlkYXRlOiAnbmV2ZXInfSk7XG4gICAgdGhpcy5fZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge3R5cGU6ICdibG9jaycsIHBvc2l0aW9uOiBibG9ja1Bvc2l0aW9uLCBpdGVtOiBlbGVtZW50fSk7XG4gICAgdGhpcy5fbWlzY01hcmtlcnMucHVzaChtYXJrZXIpO1xuICB9XG59O1xuIl19