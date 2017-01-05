'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = (function () {
  function DiffViewEditor(editor) {
    _classCallCheck(this, DiffViewEditor);

    this._editor = editor;
    this._markers = [];
    this._currentSelection = null;
    this._oldPlaceholderText = editor.getPlaceholderText();
    editor.setPlaceholderText('Paste what you want to diff here!');
    // add split-diff css selector to editors for keybindings #73
    atom.views.getView(this._editor).classList.add('split-diff');
  }

  /**
   * Creates a decoration for an offset. Adds the marker to this._markers.
   *
   * @param lineNumber The line number to add the block decoration to.
   * @param numberOfLines The number of lines that the block decoration's height will be.
   * @param blockPosition Specifies whether to put the decoration before the line or after.
   */

  _createClass(DiffViewEditor, [{
    key: '_addOffsetDecoration',
    value: function _addOffsetDecoration(lineNumber, numberOfLines, blockPosition) {
      var element = document.createElement('div');
      element.className += 'split-diff-offset';
      // if no text, set height for blank lines
      element.style.minHeight = numberOfLines * this._editor.getLineHeightInPixels() + 'px';

      var marker = this._editor.markScreenPosition([lineNumber, 0], { invalidate: 'never', persistent: false });
      this._editor.decorateMarker(marker, { type: 'block', position: blockPosition, item: element });
      this._markers.push(marker);
    }

    /**
     * Adds offsets (blank lines) into the editor.
     *
     * @param lineOffsets An array of offsets (blank lines) to insert into this editor.
     */
  }, {
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
     * Creates markers for line highlights. Adds them to this._markers. Should be
     * called before setLineOffsets since this initializes this._markers.
     *
     * @param changedLines An array of buffer line numbers that should be highlighted.
     * @param type The type of highlight to be applied to the line.
     */
  }, {
    key: 'setLineHighlights',
    value: function setLineHighlights(changedLines, highlightType) {
      if (changedLines === undefined) changedLines = [];

      var highlightClass = 'split-diff-' + highlightType;
      for (var i = 0; i < changedLines.length; i++) {
        this._markers.push(this._createLineMarker(changedLines[i][0], changedLines[i][1], highlightClass));
      }
    }

    /**
     * Creates a marker and decorates its line and line number.
     *
     * @param startLineNumber A buffer line number to start highlighting at.
     * @param endLineNumber A buffer line number to end highlighting at.
     * @param highlightClass The type of highlight to be applied to the line.
     *    Could be a value of: ['split-diff-insert', 'split-diff-delete',
     *    'split-diff-select'].
     * @return The created line marker.
     */
  }, {
    key: '_createLineMarker',
    value: function _createLineMarker(startLineNumber, endLineNumber, highlightClass) {
      var marker = this._editor.markBufferRange([[startLineNumber, 0], [endLineNumber, 0]], { invalidate: 'never', persistent: false, 'class': highlightClass });

      this._editor.decorateMarker(marker, { type: 'line-number', 'class': highlightClass });
      this._editor.decorateMarker(marker, { type: 'line', 'class': highlightClass });

      return marker;
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
            var marker = this._editor.markBufferRange([[lineNumber, count], [lineNumber, count + wordDiff[i].value.length]], { invalidate: 'never', persistent: false, 'class': klass });

            this._editor.decorateMarker(marker, { type: 'highlight', 'class': klass });
            this._markers.push(marker);
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
      for (var i = 0; i < this._markers.length; i++) {
        this._markers[i].destroy();
      }
      this._markers = [];

      this.deselectAllLines();
    }

    /**
     * Destroys the instance of the DiffViewEditor and cleans up after itself.
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      this.destroyMarkers();
      this._editor.setPlaceholderText(this._oldPlaceholderText);
      // remove split-diff css selector from editors for keybindings #73
      atom.views.getView(this._editor).classList.remove('split-diff');
    }

    /**
     * Not added to this._markers because we want it to persist between updates.
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
        this._currentSelection = this._createLineMarker(startLine, endLine, 'split-diff-selected');
      }
    }

    /**
     * Destroy the selection markers.
     */
  }, {
    key: 'deselectAllLines',
    value: function deselectAllLines() {
      if (this._currentSelection) {
        this._currentSelection.destroy();
        this._currentSelection = null;
      }
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
      if (this._currentSelection) {
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
        this._editor.setText('');
        this._editor.destroy();
      }
    }

    /**
     * Finds cursor-touched line ranges that are marked as different in an editor
     * view.
     *
     * @return The line ranges of diffs that are touched by a cursor.
     */
  }, {
    key: 'getCursorDiffLines',
    value: function getCursorDiffLines() {
      var cursorPositions = this._editor.getCursorBufferPositions();
      var touchedLines = [];

      for (var i = 0; i < cursorPositions.length; i++) {
        for (var j = 0; j < this._markers.length; j++) {
          var markerRange = this._markers[j].getBufferRange();

          if (cursorPositions[i].row >= markerRange.start.row && cursorPositions[i].row < markerRange.end.row) {
            touchedLines.push(markerRange);
            break;
          }
        }
      }

      // put the chunks in order so the copy function doesn't mess up
      touchedLines.sort(function (lineA, lineB) {
        return lineA.start.row - lineB.start.row;
      });

      return touchedLines;
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
  }]);

  return DiffViewEditor;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9hbHBoYS8uYXRvbS9wYWNrYWdlcy9zcGxpdC1kaWZmL2xpYi9idWlsZC1saW5lcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7OztBQUVYLE1BQU0sQ0FBQyxPQUFPO0FBS0QsV0FMVSxjQUFjLENBS3ZCLE1BQU0sRUFBRTswQkFMQyxjQUFjOztBQU1qQyxRQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUN0QixRQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNuQixRQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO0FBQzlCLFFBQUksQ0FBQyxtQkFBbUIsR0FBRyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztBQUN2RCxVQUFNLENBQUMsa0JBQWtCLENBQUMsbUNBQW1DLENBQUMsQ0FBQzs7QUFFL0QsUUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7R0FDOUQ7Ozs7Ozs7Ozs7ZUFib0IsY0FBYzs7V0FzQmYsOEJBQUMsVUFBVSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQVE7QUFDbkUsVUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM1QyxhQUFPLENBQUMsU0FBUyxJQUFJLG1CQUFtQixDQUFDOztBQUV6QyxhQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxBQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFLEdBQUksSUFBSSxDQUFDOztBQUV4RixVQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztB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LEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO09BQzFDLENBQUMsQ0FBQzs7QUFFSCxhQUFPLFlBQVksQ0FBQztLQUNyQjs7Ozs7Ozs7OztXQVFRLHFCQUFlO0FBQ3RCLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztLQUNyQjs7O1NBblBvQixjQUFjO0lBb1BwQyxDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9hbHBoYS8uYXRvbS9wYWNrYWdlcy9zcGxpdC1kaWZmL2xpYi9idWlsZC1saW5lcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRGlmZlZpZXdFZGl0b3Ige1xuICBfZWRpdG9yOiBPYmplY3Q7XG4gIF9tYXJrZXJzOiBBcnJheTxhdG9tJE1hcmtlcj47XG4gIF9jdXJyZW50U2VsZWN0aW9uOiBBcnJheTxhdG9tJE1hcmtlcj47XG5cbiAgY29uc3RydWN0b3IoZWRpdG9yKSB7XG4gICAgdGhpcy5fZWRpdG9yID0gZWRpdG9yO1xuICAgIHRoaXMuX21hcmtlcnMgPSBbXTtcbiAgICB0aGlzLl9jdXJyZW50U2VsZWN0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9vbGRQbGFjZWhvbGRlclRleHQgPSBlZGl0b3IuZ2V0UGxhY2Vob2xkZXJUZXh0KCk7XG4gICAgZWRpdG9yLnNldFBsYWNlaG9sZGVyVGV4dCgnUGFzdGUgd2hhdCB5b3Ugd2FudCB0byBkaWZmIGhlcmUhJyk7XG4gICAgLy8gYWRkIHNwbGl0LWRpZmYgY3NzIHNlbGVjdG9yIHRvIGVkaXRvcnMgZm9yIGtleWJpbmRpbmdzICM3M1xuICAgIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9lZGl0b3IpLmNsYXNzTGlzdC5hZGQoJ3NwbGl0LWRpZmYnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgZGVjb3JhdGlvbiBmb3IgYW4gb2Zmc2V0LiBBZGRzIHRoZSBtYXJrZXIgdG8gdGhpcy5fbWFya2Vycy5cbiAgICpcbiAgICogQHBhcmFtIGxpbmVOdW1iZXIgVGhlIGxpbmUgbnVtYmVyIHRvIGFkZCB0aGUgYmxvY2sgZGVjb3JhdGlvbiB0by5cbiAgICogQHBhcmFtIG51bWJlck9mTGluZXMgVGhlIG51bWJlciBvZiBsaW5lcyB0aGF0IHRoZSBibG9jayBkZWNvcmF0aW9uJ3MgaGVpZ2h0IHdpbGwgYmUuXG4gICAqIEBwYXJhbSBibG9ja1Bvc2l0aW9uIFNwZWNpZmllcyB3aGV0aGVyIHRvIHB1dCB0aGUgZGVjb3JhdGlvbiBiZWZvcmUgdGhlIGxpbmUgb3IgYWZ0ZXIuXG4gICAqL1xuICBfYWRkT2Zmc2V0RGVjb3JhdGlvbihsaW5lTnVtYmVyLCBudW1iZXJPZkxpbmVzLCBibG9ja1Bvc2l0aW9uKTogdm9pZCB7XG4gICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBlbGVtZW50LmNsYXNzTmFtZSArPSAnc3BsaXQtZGlmZi1vZmZzZXQnO1xuICAgIC8vIGlmIG5vIHRleHQsIHNldCBoZWlnaHQgZm9yIGJsYW5rIGxpbmVzXG4gICAgZWxlbWVudC5zdHlsZS5taW5IZWlnaHQgPSAobnVtYmVyT2ZMaW5lcyAqIHRoaXMuX2VkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKSkgKyAncHgnO1xuXG4gICAgdmFyIG1hcmtlciA9IHRoaXMuX2VkaXRvci5tYXJrU2NyZWVuUG9zaXRpb24oW2xpbmVOdW1iZXIsIDBdLCB7aW52YWxpZGF0ZTogJ25ldmVyJywgcGVyc2lzdGVudDogZmFsc2V9KTtcbiAgICB0aGlzLl9lZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZTogJ2Jsb2NrJywgcG9zaXRpb246IGJsb2NrUG9zaXRpb24sIGl0ZW06IGVsZW1lbnR9KTtcbiAgICB0aGlzLl9tYXJrZXJzLnB1c2gobWFya2VyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIG9mZnNldHMgKGJsYW5rIGxpbmVzKSBpbnRvIHRoZSBlZGl0b3IuXG4gICAqXG4gICAqIEBwYXJhbSBsaW5lT2Zmc2V0cyBBbiBhcnJheSBvZiBvZmZzZXRzIChibGFuayBsaW5lcykgdG8gaW5zZXJ0IGludG8gdGhpcyBlZGl0b3IuXG4gICAqL1xuICBzZXRMaW5lT2Zmc2V0cyhsaW5lT2Zmc2V0czogYW55KTogdm9pZCB7XG4gICAgdmFyIG9mZnNldExpbmVOdW1iZXJzID0gT2JqZWN0LmtleXMobGluZU9mZnNldHMpLm1hcChsaW5lTnVtYmVyID0+IHBhcnNlSW50KGxpbmVOdW1iZXIsIDEwKSkuc29ydCgoeCwgeSkgPT4geCAtIHkpO1xuXG4gICAgZm9yICh2YXIgb2Zmc2V0TGluZU51bWJlciBvZiBvZmZzZXRMaW5lTnVtYmVycykge1xuICAgICAgaWYgKG9mZnNldExpbmVOdW1iZXIgPT0gMCkge1xuICAgICAgICAvLyBhZGQgYmxvY2sgZGVjb3JhdGlvbiBiZWZvcmUgaWYgYWRkaW5nIHRvIGxpbmUgMFxuICAgICAgICB0aGlzLl9hZGRPZmZzZXREZWNvcmF0aW9uKG9mZnNldExpbmVOdW1iZXItMSwgbGluZU9mZnNldHNbb2Zmc2V0TGluZU51bWJlcl0sICdiZWZvcmUnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGFkZCBibG9jayBkZWNvcmF0aW9uIGFmdGVyIGlmIGFkZGluZyB0byBsaW5lcyA+IDBcbiAgICAgICAgdGhpcy5fYWRkT2Zmc2V0RGVjb3JhdGlvbihvZmZzZXRMaW5lTnVtYmVyLTEsIGxpbmVPZmZzZXRzW29mZnNldExpbmVOdW1iZXJdLCAnYWZ0ZXInKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBtYXJrZXJzIGZvciBsaW5lIGhpZ2hsaWdodHMuIEFkZHMgdGhlbSB0byB0aGlzLl9tYXJrZXJzLiBTaG91bGQgYmVcbiAgICogY2FsbGVkIGJlZm9yZSBzZXRMaW5lT2Zmc2V0cyBzaW5jZSB0aGlzIGluaXRpYWxpemVzIHRoaXMuX21hcmtlcnMuXG4gICAqXG4gICAqIEBwYXJhbSBjaGFuZ2VkTGluZXMgQW4gYXJyYXkgb2YgYnVmZmVyIGxpbmUgbnVtYmVycyB0aGF0IHNob3VsZCBiZSBoaWdobGlnaHRlZC5cbiAgICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgb2YgaGlnaGxpZ2h0IHRvIGJlIGFwcGxpZWQgdG8gdGhlIGxpbmUuXG4gICAqL1xuICBzZXRMaW5lSGlnaGxpZ2h0cyhjaGFuZ2VkTGluZXM6IEFycmF5PG51bWJlcj4gPSBbXSwgaGlnaGxpZ2h0VHlwZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdmFyIGhpZ2hsaWdodENsYXNzID0gJ3NwbGl0LWRpZmYtJyArIGhpZ2hsaWdodFR5cGU7XG4gICAgZm9yICh2YXIgaT0wOyBpPGNoYW5nZWRMaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5fbWFya2Vycy5wdXNoKHRoaXMuX2NyZWF0ZUxpbmVNYXJrZXIoY2hhbmdlZExpbmVzW2ldWzBdLCBjaGFuZ2VkTGluZXNbaV1bMV0sIGhpZ2hsaWdodENsYXNzKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBtYXJrZXIgYW5kIGRlY29yYXRlcyBpdHMgbGluZSBhbmQgbGluZSBudW1iZXIuXG4gICAqXG4gICAqIEBwYXJhbSBzdGFydExpbmVOdW1iZXIgQSBidWZmZXIgbGluZSBudW1iZXIgdG8gc3RhcnQgaGlnaGxpZ2h0aW5nIGF0LlxuICAgKiBAcGFyYW0gZW5kTGluZU51bWJlciBBIGJ1ZmZlciBsaW5lIG51bWJlciB0byBlbmQgaGlnaGxpZ2h0aW5nIGF0LlxuICAgKiBAcGFyYW0gaGlnaGxpZ2h0Q2xhc3MgVGhlIHR5cGUgb2YgaGlnaGxpZ2h0IHRvIGJlIGFwcGxpZWQgdG8gdGhlIGxpbmUuXG4gICAqICAgIENvdWxkIGJlIGEgdmFsdWUgb2Y6IFsnc3BsaXQtZGlmZi1pbnNlcnQnLCAnc3BsaXQtZGlmZi1kZWxldGUnLFxuICAgKiAgICAnc3BsaXQtZGlmZi1zZWxlY3QnXS5cbiAgICogQHJldHVybiBUaGUgY3JlYXRlZCBsaW5lIG1hcmtlci5cbiAgICovXG4gIF9jcmVhdGVMaW5lTWFya2VyKHN0YXJ0TGluZU51bWJlcjogbnVtYmVyLCBlbmRMaW5lTnVtYmVyOiBudW1iZXIsIGhpZ2hsaWdodENsYXNzOiBzdHJpbmcpOiBhdG9tJE1hcmtlciB7XG4gICAgdmFyIG1hcmtlciA9IHRoaXMuX2VkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1tzdGFydExpbmVOdW1iZXIsIDBdLCBbZW5kTGluZU51bWJlciwgMF1dLCB7aW52YWxpZGF0ZTogJ25ldmVyJywgcGVyc2lzdGVudDogZmFsc2UsIGNsYXNzOiBoaWdobGlnaHRDbGFzc30pXG5cbiAgICB0aGlzLl9lZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZTogJ2xpbmUtbnVtYmVyJywgY2xhc3M6IGhpZ2hsaWdodENsYXNzfSk7XG4gICAgdGhpcy5fZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge3R5cGU6ICdsaW5lJywgY2xhc3M6IGhpZ2hsaWdodENsYXNzfSk7XG5cbiAgICByZXR1cm4gbWFya2VyO1xuICB9XG5cbiAgLyoqXG4gICAqIEhpZ2hsaWdodHMgd29yZHMgaW4gYSBnaXZlbiBsaW5lLlxuICAgKlxuICAgKiBAcGFyYW0gbGluZU51bWJlciBUaGUgbGluZSBudW1iZXIgdG8gaGlnaGxpZ2h0IHdvcmRzIG9uLlxuICAgKiBAcGFyYW0gd29yZERpZmYgQW4gYXJyYXkgb2Ygb2JqZWN0cyB3aGljaCBsb29rIGxpa2UuLi5cbiAgICogICAgYWRkZWQ6IGJvb2xlYW4gKG5vdCB1c2VkKVxuICAgKiAgICBjb3VudDogbnVtYmVyIChub3QgdXNlZClcbiAgICogICAgcmVtb3ZlZDogYm9vbGVhbiAobm90IHVzZWQpXG4gICAqICAgIHZhbHVlOiBzdHJpbmdcbiAgICogICAgY2hhbmdlZDogYm9vbGVhblxuICAgKiBAcGFyYW0gdHlwZSBUaGUgdHlwZSBvZiBoaWdobGlnaHQgdG8gYmUgYXBwbGllZCB0byB0aGUgd29yZHMuXG4gICAqL1xuICBzZXRXb3JkSGlnaGxpZ2h0cyhsaW5lTnVtYmVyOiBudW1iZXIsIHdvcmREaWZmOiBBcnJheTxhbnk+ID0gW10sIHR5cGU6IHN0cmluZywgaXNXaGl0ZXNwYWNlSWdub3JlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIHZhciBrbGFzcyA9ICdzcGxpdC1kaWZmLXdvcmQtJyArIHR5cGU7XG4gICAgdmFyIGNvdW50ID0gMDtcblxuICAgIGZvciAodmFyIGk9MDsgaTx3b3JkRGlmZi5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHdvcmREaWZmW2ldLnZhbHVlKSB7IC8vIGZpeCBmb3IgIzQ5XG4gICAgICAgIC8vIGlmIHRoZXJlIHdhcyBhIGNoYW5nZVxuICAgICAgICAvLyBBTkQgb25lIG9mIHRoZXNlIGlzIHRydWU6XG4gICAgICAgIC8vIGlmIHRoZSBzdHJpbmcgaXMgbm90IHNwYWNlcywgaGlnaGxpZ2h0XG4gICAgICAgIC8vIE9SXG4gICAgICAgIC8vIGlmIHRoZSBzdHJpbmcgaXMgc3BhY2VzIGFuZCB3aGl0ZXNwYWNlIG5vdCBpZ25vcmVkLCBoaWdobGlnaHRcbiAgICAgICAgaWYgKHdvcmREaWZmW2ldLmNoYW5nZWRcbiAgICAgICAgICAmJiAoL1xcUy8udGVzdCh3b3JkRGlmZltpXS52YWx1ZSlcbiAgICAgICAgICB8fCAoIS9cXFMvLnRlc3Qod29yZERpZmZbaV0udmFsdWUpICYmICFpc1doaXRlc3BhY2VJZ25vcmVkKSkpIHtcbiAgICAgICAgICB2YXIgbWFya2VyID0gdGhpcy5fZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbW2xpbmVOdW1iZXIsIGNvdW50XSwgW2xpbmVOdW1iZXIsIChjb3VudCArIHdvcmREaWZmW2ldLnZhbHVlLmxlbmd0aCldXSwge2ludmFsaWRhdGU6ICduZXZlcicsIHBlcnNpc3RlbnQ6IGZhbHNlLCBjbGFzczoga2xhc3N9KVxuXG4gICAgICAgICAgdGhpcy5fZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge3R5cGU6ICdoaWdobGlnaHQnLCBjbGFzczoga2xhc3N9KTtcbiAgICAgICAgICB0aGlzLl9tYXJrZXJzLnB1c2gobWFya2VyKTtcbiAgICAgICAgfVxuICAgICAgICBjb3VudCArPSB3b3JkRGlmZltpXS52YWx1ZS5sZW5ndGg7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGFsbCBtYXJrZXJzIGFkZGVkIHRvIHRoaXMgZWRpdG9yIGJ5IHNwbGl0LWRpZmYuXG4gICAqL1xuICBkZXN0cm95TWFya2VycygpOiB2b2lkIHtcbiAgICBmb3IgKHZhciBpPTA7IGk8dGhpcy5fbWFya2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5fbWFya2Vyc1tpXS5kZXN0cm95KCk7XG4gICAgfVxuICAgIHRoaXMuX21hcmtlcnMgPSBbXTtcblxuICAgIHRoaXMuZGVzZWxlY3RBbGxMaW5lcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBpbnN0YW5jZSBvZiB0aGUgRGlmZlZpZXdFZGl0b3IgYW5kIGNsZWFucyB1cCBhZnRlciBpdHNlbGYuXG4gICAqL1xuICBkZXN0cm95KCk6IHZvaWQge1xuICAgICAgdGhpcy5kZXN0cm95TWFya2VycygpO1xuICAgICAgdGhpcy5fZWRpdG9yLnNldFBsYWNlaG9sZGVyVGV4dCh0aGlzLl9vbGRQbGFjZWhvbGRlclRleHQpO1xuICAgICAgLy8gcmVtb3ZlIHNwbGl0LWRpZmYgY3NzIHNlbGVjdG9yIGZyb20gZWRpdG9ycyBmb3Iga2V5YmluZGluZ3MgIzczXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fZWRpdG9yKS5jbGFzc0xpc3QucmVtb3ZlKCdzcGxpdC1kaWZmJylcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3QgYWRkZWQgdG8gdGhpcy5fbWFya2VycyBiZWNhdXNlIHdlIHdhbnQgaXQgdG8gcGVyc2lzdCBiZXR3ZWVuIHVwZGF0ZXMuXG4gICAqXG4gICAqIEBwYXJhbSBzdGFydExpbmUgVGhlIGxpbmUgbnVtYmVyIHRoYXQgdGhlIHNlbGVjdGlvbiBzdGFydHMgYXQuXG4gICAqIEBwYXJhbSBlbmRMaW5lIFRoZSBsaW5lIG51bWJlciB0aGF0IHRoZSBzZWxlY3Rpb24gZW5kcyBhdCAobm9uLWluY2x1c2l2ZSkuXG4gICAqL1xuICBzZWxlY3RMaW5lcyhzdGFydExpbmU6IG51bWJlciwgZW5kTGluZTogbnVtYmVyKTogdm9pZCB7XG4gICAgLy8gZG9uJ3Qgd2FudCB0byBoaWdobGlnaHQgaWYgdGhleSBhcmUgdGhlIHNhbWUgKHNhbWUgbnVtYmVycyBtZWFucyBjaHVuayBpc1xuICAgIC8vIGp1c3QgcG9pbnRpbmcgdG8gYSBsb2NhdGlvbiB0byBjb3B5LXRvLXJpZ2h0L2NvcHktdG8tbGVmdClcbiAgICBpZiAoc3RhcnRMaW5lIDwgZW5kTGluZSkge1xuICAgICAgdGhpcy5fY3VycmVudFNlbGVjdGlvbiA9IHRoaXMuX2NyZWF0ZUxpbmVNYXJrZXIoc3RhcnRMaW5lLCBlbmRMaW5lLCAnc3BsaXQtZGlmZi1zZWxlY3RlZCcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95IHRoZSBzZWxlY3Rpb24gbWFya2Vycy5cbiAgICovXG4gIGRlc2VsZWN0QWxsTGluZXMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2N1cnJlbnRTZWxlY3Rpb24pIHtcbiAgICAgIHRoaXMuX2N1cnJlbnRTZWxlY3Rpb24uZGVzdHJveSgpO1xuICAgICAgdGhpcy5fY3VycmVudFNlbGVjdGlvbiA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gdGVzdCB3aGV0aGVyIHRoZXJlIGlzIGN1cnJlbnRseSBhbiBhY3RpdmUgc2VsZWN0aW9uIGhpZ2hsaWdodCBpblxuICAgKiB0aGUgZWRpdG9yLlxuICAgKlxuICAgKiBAcmV0dXJuIEEgYm9vbGVhbiBzaWduaWZ5aW5nIHdoZXRoZXIgdGhlcmUgaXMgYW4gYWN0aXZlIHNlbGVjdGlvbiBoaWdobGlnaHQuXG4gICAqL1xuICBoYXNTZWxlY3Rpb24oKTogYm9vbGVhbiB7XG4gICAgaWYodGhpcy5fY3VycmVudFNlbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuYWJsZSBzb2Z0IHdyYXAgZm9yIHRoaXMgZWRpdG9yLlxuICAgKi9cbiAgZW5hYmxlU29mdFdyYXAoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX2VkaXRvci5zZXRTb2Z0V3JhcHBlZCh0cnVlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvL2NvbnNvbGUubG9nKCdTb2Z0IHdyYXAgd2FzIGVuYWJsZWQgb24gYSB0ZXh0IGVkaXRvciB0aGF0IGRvZXMgbm90IGV4aXN0LicpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSB0ZXh0IGVkaXRvciB3aXRob3V0IHByb21wdGluZyBhIHNhdmUuXG4gICAqL1xuICBjbGVhblVwKCk6IHZvaWQge1xuICAgIC8vIGlmIHRoZSBwYW5lIHRoYXQgdGhpcyBlZGl0b3Igd2FzIGluIGlzIG5vdyBlbXB0eSwgd2Ugd2lsbCBkZXN0cm95IGl0XG4gICAgdmFyIGVkaXRvclBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzLl9lZGl0b3IpO1xuICAgIGlmICh0eXBlb2YgZWRpdG9yUGFuZSAhPT0gJ3VuZGVmaW5lZCcgJiYgZWRpdG9yUGFuZSAhPSBudWxsICYmIGVkaXRvclBhbmUuZ2V0SXRlbXMoKS5sZW5ndGggPT0gMSkge1xuICAgICAgZWRpdG9yUGFuZS5kZXN0cm95KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2VkaXRvci5zZXRUZXh0KCcnKTtcbiAgICAgIHRoaXMuX2VkaXRvci5kZXN0cm95KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZpbmRzIGN1cnNvci10b3VjaGVkIGxpbmUgcmFuZ2VzIHRoYXQgYXJlIG1hcmtlZCBhcyBkaWZmZXJlbnQgaW4gYW4gZWRpdG9yXG4gICAqIHZpZXcuXG4gICAqXG4gICAqIEByZXR1cm4gVGhlIGxpbmUgcmFuZ2VzIG9mIGRpZmZzIHRoYXQgYXJlIHRvdWNoZWQgYnkgYSBjdXJzb3IuXG4gICAqL1xuICBnZXRDdXJzb3JEaWZmTGluZXMoKTogYW55IHtcbiAgICB2YXIgY3Vyc29yUG9zaXRpb25zID0gdGhpcy5fZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpO1xuICAgIHZhciB0b3VjaGVkTGluZXMgPSBbXTtcblxuICAgIGZvciAodmFyIGk9MDsgaTxjdXJzb3JQb3NpdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGZvciAodmFyIGo9MDsgajx0aGlzLl9tYXJrZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciBtYXJrZXJSYW5nZSA9IHRoaXMuX21hcmtlcnNbal0uZ2V0QnVmZmVyUmFuZ2UoKTtcblxuICAgICAgICBpZiAoY3Vyc29yUG9zaXRpb25zW2ldLnJvdyA+PSBtYXJrZXJSYW5nZS5zdGFydC5yb3dcbiAgICAgICAgICAmJiBjdXJzb3JQb3NpdGlvbnNbaV0ucm93IDwgbWFya2VyUmFuZ2UuZW5kLnJvdykge1xuICAgICAgICAgICAgdG91Y2hlZExpbmVzLnB1c2gobWFya2VyUmFuZ2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBwdXQgdGhlIGNodW5rcyBpbiBvcmRlciBzbyB0aGUgY29weSBmdW5jdGlvbiBkb2Vzbid0IG1lc3MgdXBcbiAgICB0b3VjaGVkTGluZXMuc29ydChmdW5jdGlvbihsaW5lQSwgbGluZUIpIHtcbiAgICAgIHJldHVybiBsaW5lQS5zdGFydC5yb3cgLSBsaW5lQi5zdGFydC5yb3c7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdG91Y2hlZExpbmVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gZ2V0IHRoZSBUZXh0IEVkaXRvciBvYmplY3QgZm9yIHRoaXMgdmlldy4gSGVscGZ1bCBmb3IgY2FsbGluZyBiYXNpY1xuICAgKiBBdG9tIFRleHQgRWRpdG9yIGZ1bmN0aW9ucy5cbiAgICpcbiAgICogQHJldHVybiBUaGUgVGV4dCBFZGl0b3Igb2JqZWN0IGZvciB0aGlzIHZpZXcuXG4gICAqL1xuICBnZXRFZGl0b3IoKTogVGV4dEVkaXRvciB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRvcjtcbiAgfVxufTtcbiJdfQ==