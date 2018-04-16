var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _editorDiffExtender = require('./editor-diff-extender');

var _editorDiffExtender2 = _interopRequireDefault(_editorDiffExtender);

var _computeWordDiff = require('./compute-word-diff');

var _computeWordDiff2 = _interopRequireDefault(_computeWordDiff);

'use babel';

module.exports = (function () {
  /*
   * @param editors Array of editors being diffed.
   */

  function DiffView(editors) {
    _classCallCheck(this, DiffView);

    this._editorDiffExtender1 = new _editorDiffExtender2['default'](editors.editor1);
    this._editorDiffExtender2 = new _editorDiffExtender2['default'](editors.editor2);
    this._chunks = [];
    this._isSelectionActive = false;
    this._selectedChunkIndex = 0;
    this._COPY_HELP_MESSAGE = 'No differences selected.';
    this._markerLayers = {};
  }

  /**
   * Adds highlighting to the editors to show the diff.
   *
   * @param diff The diff to highlight.
   * @param addedColorSide The side that the added highlights should be applied to. Either 'left' or 'right'.
   * @param isWordDiffEnabled Whether differences between words per line should be highlighted.
   * @param isWhitespaceIgnored Whether whitespace should be ignored.
   * @param useCustomStyle Whether to use the user's customized highlight colors.
   */

  _createClass(DiffView, [{
    key: 'displayDiff',
    value: function displayDiff(diff, addedColorSide, isWordDiffEnabled, isWhitespaceIgnored, useCustomStyle) {
      this._chunks = diff.chunks || [];

      var leftHighlightType = 'added';
      var rightHighlightType = 'removed';
      if (addedColorSide == 'right') {
        leftHighlightType = 'removed';
        rightHighlightType = 'added';
      }
      if (useCustomStyle) {
        leftHighlightType += '-custom';
        rightHighlightType += '-custom';
      }

      // make the last chunk equal size on both screens so the editors retain sync scroll #58
      if (this.getNumDifferences() > 0) {
        var lastChunk = this._chunks[this._chunks.length - 1];
        var oldChunkRange = lastChunk.oldLineEnd - lastChunk.oldLineStart;
        var newChunkRange = lastChunk.newLineEnd - lastChunk.newLineStart;
        if (oldChunkRange > newChunkRange) {
          // make the offset as large as needed to make the chunk the same size in both editors
          diff.newLineOffsets[lastChunk.newLineStart + newChunkRange] = oldChunkRange - newChunkRange;
        } else if (newChunkRange > oldChunkRange) {
          // make the offset as large as needed to make the chunk the same size in both editors
          diff.oldLineOffsets[lastChunk.oldLineStart + oldChunkRange] = newChunkRange - oldChunkRange;
        }
      }

      for (var chunk of this._chunks) {
        this._editorDiffExtender1.highlightLines(chunk.oldLineStart, chunk.oldLineEnd, leftHighlightType);
        this._editorDiffExtender2.highlightLines(chunk.newLineStart, chunk.newLineEnd, rightHighlightType);

        if (isWordDiffEnabled) {
          this._highlightWordsInChunk(chunk, leftHighlightType, rightHighlightType, isWhitespaceIgnored);
        }
      }

      this._editorDiffExtender1.setLineOffsets(diff.oldLineOffsets);
      this._editorDiffExtender2.setLineOffsets(diff.newLineOffsets);

      this._markerLayers = {
        editor1: {
          id: this._editorDiffExtender1.getEditor().id,
          lineMarkerLayer: this._editorDiffExtender1.getLineMarkerLayer(),
          highlightType: leftHighlightType,
          selectionMarkerLayer: this._editorDiffExtender1.getSelectionMarkerLayer()
        },
        editor2: {
          id: this._editorDiffExtender2.getEditor().id,
          lineMarkerLayer: this._editorDiffExtender2.getLineMarkerLayer(),
          highlightType: rightHighlightType,
          selectionMarkerLayer: this._editorDiffExtender2.getSelectionMarkerLayer()
        }
      };
    }

    /**
     * Clears the diff highlighting and offsets from the editors.
     */
  }, {
    key: 'clearDiff',
    value: function clearDiff() {
      this._editorDiffExtender1.destroyMarkers();
      this._editorDiffExtender2.destroyMarkers();
    }

    /**
     * Called to move the current selection highlight to the next diff chunk.
     * @param isSyncScrollEnabled Only autoscroll one editor if sync scroll is enabled or we will get in an infinite loop
     */
  }, {
    key: 'nextDiff',
    value: function nextDiff(isSyncScrollEnabled) {
      if (this._isSelectionActive) {
        this._selectedChunkIndex++;
        if (this._selectedChunkIndex >= this.getNumDifferences()) {
          this._selectedChunkIndex = 0;
        }
      } else {
        this._isSelectionActive = true;
      }

      var success = this._selectChunk(this._selectedChunkIndex, true, isSyncScrollEnabled);
      if (!success) {
        return -1;
      }

      return this._selectedChunkIndex;
    }

    /**
     * Called to move the current selection highlight to the previous diff chunk.
     * @param isSyncScrollEnabled Only autoscroll one editor if sync scroll is enabled or we will get in an infinite loop
     */
  }, {
    key: 'prevDiff',
    value: function prevDiff(isSyncScrollEnabled) {
      if (this._isSelectionActive) {
        this._selectedChunkIndex--;
        if (this._selectedChunkIndex < 0) {
          this._selectedChunkIndex = this.getNumDifferences() - 1;
        }
      } else {
        this._isSelectionActive = true;
      }

      var success = this._selectChunk(this._selectedChunkIndex, true, isSyncScrollEnabled);
      if (!success) {
        return -1;
      }

      return this._selectedChunkIndex;
    }

    /**
     * Copies the currently selected diff chunk from the left editor to the right
     * editor.
     */
  }, {
    key: 'copyToRight',
    value: function copyToRight() {
      var foundSelection = false;
      var offset = 0; // keep track of line offset (used when there are multiple chunks being moved)

      for (var diffChunk of this._chunks) {
        if (diffChunk.isSelected) {
          foundSelection = true;

          var textToCopy = this._editorDiffExtender1.getEditor().getTextInBufferRange([[diffChunk.oldLineStart, 0], [diffChunk.oldLineEnd, 0]]);
          var lastBufferRow = this._editorDiffExtender2.getEditor().getLastBufferRow();

          // insert new line if the chunk we want to copy will be below the last line of the other editor
          if (diffChunk.newLineStart + offset > lastBufferRow) {
            this._editorDiffExtender2.getEditor().setCursorBufferPosition([lastBufferRow, 0], { autoscroll: false });
            this._editorDiffExtender2.getEditor().insertNewline();
          }

          this._editorDiffExtender2.getEditor().setTextInBufferRange([[diffChunk.newLineStart + offset, 0], [diffChunk.newLineEnd + offset, 0]], textToCopy);
          // offset will be the amount of lines to be copied minus the amount of lines overwritten
          offset += diffChunk.oldLineEnd - diffChunk.oldLineStart - (diffChunk.newLineEnd - diffChunk.newLineStart);
          // move the selection pointer back so the next diff chunk is not skipped
          if (this._editorDiffExtender1.hasSelection() || this._editorDiffExtender2.hasSelection()) {
            this._selectedChunkIndex--;
          }
        }
      }

      if (!foundSelection) {
        atom.notifications.addWarning('Split Diff', { detail: this._COPY_HELP_MESSAGE, dismissable: false, icon: 'diff' });
      }
    }

    /**
     * Copies the currently selected diff chunk from the right editor to the left
     * editor.
     */
  }, {
    key: 'copyToLeft',
    value: function copyToLeft() {
      var foundSelection = false;
      var offset = 0; // keep track of line offset (used when there are multiple chunks being moved)

      for (var diffChunk of this._chunks) {
        if (diffChunk.isSelected) {
          foundSelection = true;

          var textToCopy = this._editorDiffExtender2.getEditor().getTextInBufferRange([[diffChunk.newLineStart, 0], [diffChunk.newLineEnd, 0]]);
          var lastBufferRow = this._editorDiffExtender1.getEditor().getLastBufferRow();
          // insert new line if the chunk we want to copy will be below the last line of the other editor
          if (diffChunk.oldLineStart + offset > lastBufferRow) {
            this._editorDiffExtender1.getEditor().setCursorBufferPosition([lastBufferRow, 0], { autoscroll: false });
            this._editorDiffExtender1.getEditor().insertNewline();
          }

          this._editorDiffExtender1.getEditor().setTextInBufferRange([[diffChunk.oldLineStart + offset, 0], [diffChunk.oldLineEnd + offset, 0]], textToCopy);
          // offset will be the amount of lines to be copied minus the amount of lines overwritten
          offset += diffChunk.newLineEnd - diffChunk.newLineStart - (diffChunk.oldLineEnd - diffChunk.oldLineStart);
          // move the selection pointer back so the next diff chunk is not skipped
          if (this._editorDiffExtender1.hasSelection() || this._editorDiffExtender2.hasSelection()) {
            this._selectedChunkIndex--;
          }
        }
      }

      if (!foundSelection) {
        atom.notifications.addWarning('Split Diff', { detail: this._COPY_HELP_MESSAGE, dismissable: false, icon: 'diff' });
      }
    }

    /**
     * Cleans up the editor indicated by index. A clean up will remove the editor
     * or the pane if necessary. Typically left editor == 1 and right editor == 2.
     *
     * @param editorIndex The index of the editor to clean up.
     */
  }, {
    key: 'cleanUpEditor',
    value: function cleanUpEditor(editorIndex) {
      if (editorIndex === 1) {
        this._editorDiffExtender1.cleanUp();
      } else if (editorIndex === 2) {
        this._editorDiffExtender2.cleanUp();
      }
    }

    /**
     * Restores soft wrap to the appropriate editor.
     * @param editorIndex The index of the editor to restore soft wrap to.
     */
  }, {
    key: 'restoreEditorSoftWrap',
    value: function restoreEditorSoftWrap(editorIndex) {
      if (editorIndex === 1) {
        this._editorDiffExtender1.getEditor().setSoftWrapped(true);
      } else if (editorIndex === 2) {
        this._editorDiffExtender2.getEditor().setSoftWrapped(true);
      }
    }

    /**
     * Destroys the editor diff extenders.
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      this._editorDiffExtender1.destroy();
      this._editorDiffExtender2.destroy();
    }

    /**
     * Gets the number of differences between the editors.
     *
     * @return int The number of differences between the editors.
     */
  }, {
    key: 'getNumDifferences',
    value: function getNumDifferences() {
      return Array.isArray(this._chunks) ? this._chunks.length : 0;
    }

    /**
     * Gets the marker layers in use by the editors.
     * @return An object containing the marker layers and approriate information.
     */
  }, {
    key: 'getMarkerLayers',
    value: function getMarkerLayers() {
      return this._markerLayers;
    }

    /**
     * Handles when the cursor moves in the editor. Will highlight chunks that have a cursor in them.
     * @param cursor The cursor object from the event.
     * @param oldBufferPosition The old position of the cursor in the buffer.
     * @param newBufferPosition The new position of the cursor in the buffer.
     */
  }, {
    key: 'handleCursorChange',
    value: function handleCursorChange(cursor, oldBufferPosition, newBufferPosition) {
      var editorIndex = cursor.editor === this._editorDiffExtender1.getEditor() ? 1 : 2;
      var oldPositionChunkIndex = this._getChunkIndexByLineNumber(editorIndex, oldBufferPosition.row);
      var newPositionChunkIndex = this._getChunkIndexByLineNumber(editorIndex, newBufferPosition.row);

      if (oldPositionChunkIndex >= 0) {
        var diffChunk = this._chunks[oldPositionChunkIndex];
        diffChunk.isSelected = false;
        this._editorDiffExtender1.deselectLines(diffChunk.oldLineStart, diffChunk.oldLineEnd);
        this._editorDiffExtender2.deselectLines(diffChunk.newLineStart, diffChunk.newLineEnd);
      }
      if (newPositionChunkIndex >= 0) {
        this._selectChunk(newPositionChunkIndex, false);
      }
    }

    // ----------------------------------------------------------------------- //
    // --------------------------- PRIVATE METHODS --------------------------- //
    // ----------------------------------------------------------------------- //

    /**
     * Selects and highlights the diff chunk in both editors according to the
     * given index.
     *
     * @param index The index of the diff chunk to highlight in both editors.
     * @param isNextOrPrev Whether we are moving to a direct sibling (if not, this is a click)
     * @param isSyncScrollEnabled Only autoscroll one editor if sync scroll is enabled or we will get in an infinite loop
     */
  }, {
    key: '_selectChunk',
    value: function _selectChunk(index, isNextOrPrev, isSyncScrollEnabled) {
      var diffChunk = this._chunks[index];
      if (diffChunk != null) {
        diffChunk.isSelected = true;

        if (isNextOrPrev) {
          // deselect previous next/prev highlights
          this._editorDiffExtender1.deselectAllLines();
          this._editorDiffExtender2.deselectAllLines();
          // scroll the editors
          this._editorDiffExtender1.getEditor().setCursorBufferPosition([diffChunk.oldLineStart, 0], { autoscroll: true });
          this._editorDiffExtender2.getEditor().setCursorBufferPosition([diffChunk.newLineStart, 0], { autoscroll: !isSyncScrollEnabled });
        }

        // highlight selection in both editors
        this._editorDiffExtender1.selectLines(diffChunk.oldLineStart, diffChunk.oldLineEnd);
        this._editorDiffExtender2.selectLines(diffChunk.newLineStart, diffChunk.newLineEnd);

        return true;
      }

      return false;
    }

    /**
     * Gets the index of a chunk by the line number.
     * @param editorIndex The index of the editor to check.
     * @param lineNumber  The line number to use to check if it is in a chunk.
     * @return The index of the chunk.
     */
  }, {
    key: '_getChunkIndexByLineNumber',
    value: function _getChunkIndexByLineNumber(editorIndex, lineNumber) {
      for (var i = 0; i < this._chunks.length; i++) {
        var diffChunk = this._chunks[i];
        if (editorIndex === 1) {
          if (diffChunk.oldLineStart <= lineNumber && diffChunk.oldLineEnd > lineNumber) {
            return i;
          }
        } else if (editorIndex === 2) {
          if (diffChunk.newLineStart <= lineNumber && diffChunk.newLineEnd > lineNumber) {
            return i;
          }
        }
      }

      return -1;
    }

    /**
     * Highlights the word diff of the chunk passed in.
     *
     * @param chunk The chunk that should have its words highlighted.
     */
  }, {
    key: '_highlightWordsInChunk',
    value: function _highlightWordsInChunk(chunk, leftHighlightType, rightHighlightType, isWhitespaceIgnored) {
      var leftLineNumber = chunk.oldLineStart;
      var rightLineNumber = chunk.newLineStart;
      // for each line that has a corresponding line
      while (leftLineNumber < chunk.oldLineEnd && rightLineNumber < chunk.newLineEnd) {
        var editor1LineText = this._editorDiffExtender1.getEditor().lineTextForBufferRow(leftLineNumber);
        var editor2LineText = this._editorDiffExtender2.getEditor().lineTextForBufferRow(rightLineNumber);

        if (editor1LineText == '') {
          // computeWordDiff returns empty for lines that are paired with empty lines
          // need to force a highlight
          this._editorDiffExtender2.setWordHighlights(rightLineNumber, [{ changed: true, value: editor2LineText }], rightHighlightType, isWhitespaceIgnored);
        } else if (editor2LineText == '') {
          // computeWordDiff returns empty for lines that are paired with empty lines
          // need to force a highlight
          this._editorDiffExtender1.setWordHighlights(leftLineNumber, [{ changed: true, value: editor1LineText }], leftHighlightType, isWhitespaceIgnored);
        } else {
          // perform regular word diff
          var wordDiff = _computeWordDiff2['default'].computeWordDiff(editor1LineText, editor2LineText);
          this._editorDiffExtender1.setWordHighlights(leftLineNumber, wordDiff.removedWords, leftHighlightType, isWhitespaceIgnored);
          this._editorDiffExtender2.setWordHighlights(rightLineNumber, wordDiff.addedWords, rightHighlightType, isWhitespaceIgnored);
        }

        leftLineNumber++;
        rightLineNumber++;
      }

      // highlight remaining lines in left editor
      while (leftLineNumber < chunk.oldLineEnd) {
        var editor1LineText = this._editorDiffExtender1.getEditor().lineTextForBufferRow(leftLineNumber);
        this._editorDiffExtender1.setWordHighlights(leftLineNumber, [{ changed: true, value: editor1LineText }], leftHighlightType, isWhitespaceIgnored);
        leftLineNumber++;
      }
      // highlight remaining lines in the right editor
      while (rightLineNumber < chunk.newLineEnd) {
        this._editorDiffExtender2.setWordHighlights(rightLineNumber, [{ changed: true, value: this._editorDiffExtender2.getEditor().lineTextForBufferRow(rightLineNumber) }], rightHighlightType, isWhitespaceIgnored);
        rightLineNumber++;
      }
    }
  }]);

  return DiffView;
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9ub2Vsd29yZGVuLy5hdG9tL3BhY2thZ2VzL3NwbGl0LWRpZmYvbGliL2RpZmYtdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7a0NBRStCLHdCQUF3Qjs7OzsrQkFDM0IscUJBQXFCOzs7O0FBSGpELFdBQVcsQ0FBQTs7QUFNWCxNQUFNLENBQUMsT0FBTzs7Ozs7QUFJRCxXQUpVLFFBQVEsQ0FJakIsT0FBTyxFQUFFOzBCQUpBLFFBQVE7O0FBSzNCLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxvQ0FBdUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3BFLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxvQ0FBdUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3BFLFFBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7QUFDaEMsUUFBSSxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQztBQUM3QixRQUFJLENBQUMsa0JBQWtCLEdBQUcsMEJBQTBCLENBQUM7QUFDckQsUUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7R0FDekI7Ozs7Ozs7Ozs7OztlQVpvQixRQUFROztXQXVCbEIscUJBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxpQkFBaUIsRUFBRSxtQkFBbUIsRUFBRSxjQUFjLEVBQUU7QUFDeEYsVUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQzs7QUFFakMsVUFBSSxpQkFBaUIsR0FBRyxPQUFPLENBQUM7QUFDaEMsVUFBSSxrQkFBa0IsR0FBRyxTQUFTLENBQUM7QUFDbkMsVUFBRyxjQUFjLElBQUksT0FBTyxFQUFFO0FBQzVCLHlCQUFpQixHQUFHLFNBQVMsQ0FBQztBQUM5QiwwQkFBa0IsR0FBRyxPQUFPLENBQUM7T0FDOUI7QUFDRCxVQUFHLGNBQWMsRUFBRTtBQUNqQix5QkFBaUIsSUFBSSxTQUFTLENB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ZSxFQUFDLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0FBQy9JLHNCQUFjLEVBQUUsQ0FBQztPQUNsQjs7QUFFRCxhQUFNLGVBQWUsR0FBRyxLQUFLLENBQUMsVUFBVSxFQUFFO0FBQ3hDLFlBQUksQ0FBQyxvQkFBb0IsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxlQUFlLENBQUMsRUFBQyxDQUFDLEVBQUUsa0JBQWtCLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztBQUM3TSx1QkFBZSxFQUFFLENBQUM7T0FDbkI7S0FDRjs7O1NBelhvQixRQUFRO0lBMFg5QixDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9ub2Vsd29yZGVuLy5hdG9tL3BhY2thZ2VzL3NwbGl0LWRpZmYvbGliL2RpZmYtdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBFZGl0b3JEaWZmRXh0ZW5kZXIgZnJvbSAnLi9lZGl0b3ItZGlmZi1leHRlbmRlcic7XG5pbXBvcnQgQ29tcHV0ZVdvcmREaWZmIGZyb20gJy4vY29tcHV0ZS13b3JkLWRpZmYnO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRGlmZlZpZXcge1xuICAvKlxuICAgKiBAcGFyYW0gZWRpdG9ycyBBcnJheSBvZiBlZGl0b3JzIGJlaW5nIGRpZmZlZC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVkaXRvcnMpIHtcbiAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxID0gbmV3IEVkaXRvckRpZmZFeHRlbmRlcihlZGl0b3JzLmVkaXRvcjEpO1xuICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIgPSBuZXcgRWRpdG9yRGlmZkV4dGVuZGVyKGVkaXRvcnMuZWRpdG9yMik7XG4gICAgdGhpcy5fY2h1bmtzID0gW107XG4gICAgdGhpcy5faXNTZWxlY3Rpb25BY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXggPSAwO1xuICAgIHRoaXMuX0NPUFlfSEVMUF9NRVNTQUdFID0gJ05vIGRpZmZlcmVuY2VzIHNlbGVjdGVkLic7XG4gICAgdGhpcy5fbWFya2VyTGF5ZXJzID0ge307XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBoaWdobGlnaHRpbmcgdG8gdGhlIGVkaXRvcnMgdG8gc2hvdyB0aGUgZGlmZi5cbiAgICpcbiAgICogQHBhcmFtIGRpZmYgVGhlIGRpZmYgdG8gaGlnaGxpZ2h0LlxuICAgKiBAcGFyYW0gYWRkZWRDb2xvclNpZGUgVGhlIHNpZGUgdGhhdCB0aGUgYWRkZWQgaGlnaGxpZ2h0cyBzaG91bGQgYmUgYXBwbGllZCB0by4gRWl0aGVyICdsZWZ0JyBvciAncmlnaHQnLlxuICAgKiBAcGFyYW0gaXNXb3JkRGlmZkVuYWJsZWQgV2hldGhlciBkaWZmZXJlbmNlcyBiZXR3ZWVuIHdvcmRzIHBlciBsaW5lIHNob3VsZCBiZSBoaWdobGlnaHRlZC5cbiAgICogQHBhcmFtIGlzV2hpdGVzcGFjZUlnbm9yZWQgV2hldGhlciB3aGl0ZXNwYWNlIHNob3VsZCBiZSBpZ25vcmVkLlxuICAgKiBAcGFyYW0gdXNlQ3VzdG9tU3R5bGUgV2hldGhlciB0byB1c2UgdGhlIHVzZXIncyBjdXN0b21pemVkIGhpZ2hsaWdodCBjb2xvcnMuXG4gICAqL1xuICBkaXNwbGF5RGlmZihkaWZmLCBhZGRlZENvbG9yU2lkZSwgaXNXb3JkRGlmZkVuYWJsZWQsIGlzV2hpdGVzcGFjZUlnbm9yZWQsIHVzZUN1c3RvbVN0eWxlKSB7XG4gICAgdGhpcy5fY2h1bmtzID0gZGlmZi5jaHVua3MgfHwgW107XG5cbiAgICB2YXIgbGVmdEhpZ2hsaWdodFR5cGUgPSAnYWRkZWQnO1xuICAgIHZhciByaWdodEhpZ2hsaWdodFR5cGUgPSAncmVtb3ZlZCc7XG4gICAgaWYoYWRkZWRDb2xvclNpZGUgPT0gJ3JpZ2h0Jykge1xuICAgICAgbGVmdEhpZ2hsaWdodFR5cGUgPSAncmVtb3ZlZCc7XG4gICAgICByaWdodEhpZ2hsaWdodFR5cGUgPSAnYWRkZWQnO1xuICAgIH1cbiAgICBpZih1c2VDdXN0b21TdHlsZSkge1xuICAgICAgbGVmdEhpZ2hsaWdodFR5cGUgKz0gJy1jdXN0b20nO1xuICAgICAgcmlnaHRIaWdobGlnaHRUeXBlICs9ICctY3VzdG9tJztcbiAgICB9XG5cbiAgICAvLyBtYWtlIHRoZSBsYXN0IGNodW5rIGVxdWFsIHNpemUgb24gYm90aCBzY3JlZW5zIHNvIHRoZSBlZGl0b3JzIHJldGFpbiBzeW5jIHNjcm9sbCAjNThcbiAgICBpZih0aGlzLmdldE51bURpZmZlcmVuY2VzKCkgPiAwKSB7XG4gICAgICB2YXIgbGFzdENodW5rID0gdGhpcy5fY2h1bmtzW3RoaXMuX2NodW5rcy5sZW5ndGggLSAxXTtcbiAgICAgIHZhciBvbGRDaHVua1JhbmdlID0gbGFzdENodW5rLm9sZExpbmVFbmQgLSBsYXN0Q2h1bmsub2xkTGluZVN0YXJ0O1xuICAgICAgdmFyIG5ld0NodW5rUmFuZ2UgPSBsYXN0Q2h1bmsubmV3TGluZUVuZCAtIGxhc3RDaHVuay5uZXdMaW5lU3RhcnQ7XG4gICAgICBpZihvbGRDaHVua1JhbmdlID4gbmV3Q2h1bmtSYW5nZSkge1xuICAgICAgICAvLyBtYWtlIHRoZSBvZmZzZXQgYXMgbGFyZ2UgYXMgbmVlZGVkIHRvIG1ha2UgdGhlIGNodW5rIHRoZSBzYW1lIHNpemUgaW4gYm90aCBlZGl0b3JzXG4gICAgICAgIGRpZmYubmV3TGluZU9mZnNldHNbbGFzdENodW5rLm5ld0xpbmVTdGFydCArIG5ld0NodW5rUmFuZ2VdID0gb2xkQ2h1bmtSYW5nZSAtIG5ld0NodW5rUmFuZ2U7XG4gICAgICB9IGVsc2UgaWYobmV3Q2h1bmtSYW5nZSA+IG9sZENodW5rUmFuZ2UpIHtcbiAgICAgICAgLy8gbWFrZSB0aGUgb2Zmc2V0IGFzIGxhcmdlIGFzIG5lZWRlZCB0byBtYWtlIHRoZSBjaHVuayB0aGUgc2FtZSBzaXplIGluIGJvdGggZWRpdG9yc1xuICAgICAgICBkaWZmLm9sZExpbmVPZmZzZXRzW2xhc3RDaHVuay5vbGRMaW5lU3RhcnQgKyBvbGRDaHVua1JhbmdlXSA9IG5ld0NodW5rUmFuZ2UgLSBvbGRDaHVua1JhbmdlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvcih2YXIgY2h1bmsgb2YgdGhpcy5fY2h1bmtzKSB7XG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmhpZ2hsaWdodExpbmVzKGNodW5rLm9sZExpbmVTdGFydCwgY2h1bmsub2xkTGluZUVuZCwgbGVmdEhpZ2hsaWdodFR5cGUpO1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5oaWdobGlnaHRMaW5lcyhjaHVuay5uZXdMaW5lU3RhcnQsIGNodW5rLm5ld0xpbmVFbmQsIHJpZ2h0SGlnaGxpZ2h0VHlwZSk7XG5cbiAgICAgIGlmKGlzV29yZERpZmZFbmFibGVkKSB7XG4gICAgICAgIHRoaXMuX2hpZ2hsaWdodFdvcmRzSW5DaHVuayhjaHVuaywgbGVmdEhpZ2hsaWdodFR5cGUsIHJpZ2h0SGlnaGxpZ2h0VHlwZSwgaXNXaGl0ZXNwYWNlSWdub3JlZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5zZXRMaW5lT2Zmc2V0cyhkaWZmLm9sZExpbmVPZmZzZXRzKTtcbiAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLnNldExpbmVPZmZzZXRzKGRpZmYubmV3TGluZU9mZnNldHMpO1xuXG4gICAgdGhpcy5fbWFya2VyTGF5ZXJzID0ge1xuICAgICAgZWRpdG9yMToge1xuICAgICAgICBpZDogdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5nZXRFZGl0b3IoKS5pZCxcbiAgICAgICAgbGluZU1hcmtlckxheWVyOiB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldExpbmVNYXJrZXJMYXllcigpLFxuICAgICAgICBoaWdobGlnaHRUeXBlOiBsZWZ0SGlnaGxpZ2h0VHlwZSxcbiAgICAgICAgc2VsZWN0aW9uTWFya2VyTGF5ZXI6IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0U2VsZWN0aW9uTWFya2VyTGF5ZXIoKVxuICAgICAgfSxcbiAgICAgIGVkaXRvcjI6IHtcbiAgICAgICAgaWQ6IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0RWRpdG9yKCkuaWQsXG4gICAgICAgIGxpbmVNYXJrZXJMYXllcjogdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRMaW5lTWFya2VyTGF5ZXIoKSxcbiAgICAgICAgaGlnaGxpZ2h0VHlwZTogcmlnaHRIaWdobGlnaHRUeXBlLFxuICAgICAgICBzZWxlY3Rpb25NYXJrZXJMYXllcjogdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRTZWxlY3Rpb25NYXJrZXJMYXllcigpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENsZWFycyB0aGUgZGlmZiBoaWdobGlnaHRpbmcgYW5kIG9mZnNldHMgZnJvbSB0aGUgZWRpdG9ycy5cbiAgICovXG4gIGNsZWFyRGlmZigpIHtcbiAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmRlc3Ryb3lNYXJrZXJzKCk7XG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5kZXN0cm95TWFya2VycygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB0byBtb3ZlIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBoaWdobGlnaHQgdG8gdGhlIG5leHQgZGlmZiBjaHVuay5cbiAgICogQHBhcmFtIGlzU3luY1Njcm9sbEVuYWJsZWQgT25seSBhdXRvc2Nyb2xsIG9uZSBlZGl0b3IgaWYgc3luYyBzY3JvbGwgaXMgZW5hYmxlZCBvciB3ZSB3aWxsIGdldCBpbiBhbiBpbmZpbml0ZSBsb29wXG4gICAqL1xuICBuZXh0RGlmZihpc1N5bmNTY3JvbGxFbmFibGVkKSB7XG4gICAgaWYodGhpcy5faXNTZWxlY3Rpb25BY3RpdmUpIHtcbiAgICAgIHRoaXMuX3NlbGVjdGVkQ2h1bmtJbmRleCsrO1xuICAgICAgaWYodGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4ID49IHRoaXMuZ2V0TnVtRGlmZmVyZW5jZXMoKSkge1xuICAgICAgICB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXggPSAwO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9pc1NlbGVjdGlvbkFjdGl2ZSA9IHRydWU7XG4gICAgfVxuXG4gICAgdmFyIHN1Y2Nlc3MgPSB0aGlzLl9zZWxlY3RDaHVuayh0aGlzLl9zZWxlY3RlZENodW5rSW5kZXgsIHRydWUsIGlzU3luY1Njcm9sbEVuYWJsZWQpO1xuICAgIGlmKCFzdWNjZXNzKSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB0byBtb3ZlIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBoaWdobGlnaHQgdG8gdGhlIHByZXZpb3VzIGRpZmYgY2h1bmsuXG4gICAqIEBwYXJhbSBpc1N5bmNTY3JvbGxFbmFibGVkIE9ubHkgYXV0b3Njcm9sbCBvbmUgZWRpdG9yIGlmIHN5bmMgc2Nyb2xsIGlzIGVuYWJsZWQgb3Igd2Ugd2lsbCBnZXQgaW4gYW4gaW5maW5pdGUgbG9vcFxuICAgKi9cbiAgcHJldkRpZmYoaXNTeW5jU2Nyb2xsRW5hYmxlZCkge1xuICAgIGlmKHRoaXMuX2lzU2VsZWN0aW9uQWN0aXZlKSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXgtLTtcbiAgICAgIGlmKHRoaXMuX3NlbGVjdGVkQ2h1bmtJbmRleCA8IDApIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4ID0gdGhpcy5nZXROdW1EaWZmZXJlbmNlcygpIC0gMVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9pc1NlbGVjdGlvbkFjdGl2ZSA9IHRydWU7XG4gICAgfVxuXG4gICAgdmFyIHN1Y2Nlc3MgPSB0aGlzLl9zZWxlY3RDaHVuayh0aGlzLl9zZWxlY3RlZENodW5rSW5kZXgsIHRydWUsIGlzU3luY1Njcm9sbEVuYWJsZWQpO1xuICAgIGlmKCFzdWNjZXNzKSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIENvcGllcyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGRpZmYgY2h1bmsgZnJvbSB0aGUgbGVmdCBlZGl0b3IgdG8gdGhlIHJpZ2h0XG4gICAqIGVkaXRvci5cbiAgICovXG4gIGNvcHlUb1JpZ2h0KCkge1xuICAgIHZhciBmb3VuZFNlbGVjdGlvbiA9IGZhbHNlO1xuICAgIHZhciBvZmZzZXQgPSAwOyAvLyBrZWVwIHRyYWNrIG9mIGxpbmUgb2Zmc2V0ICh1c2VkIHdoZW4gdGhlcmUgYXJlIG11bHRpcGxlIGNodW5rcyBiZWluZyBtb3ZlZClcblxuICAgIGZvcih2YXIgZGlmZkNodW5rIG9mIHRoaXMuX2NodW5rcykge1xuICAgICAgaWYoZGlmZkNodW5rLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgZm91bmRTZWxlY3Rpb24gPSB0cnVlO1xuXG4gICAgICAgIHZhciB0ZXh0VG9Db3B5ID0gdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5nZXRFZGl0b3IoKS5nZXRUZXh0SW5CdWZmZXJSYW5nZShbW2RpZmZDaHVuay5vbGRMaW5lU3RhcnQsIDBdLCBbZGlmZkNodW5rLm9sZExpbmVFbmQsIDBdXSk7XG4gICAgICAgIHZhciBsYXN0QnVmZmVyUm93ID0gdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRFZGl0b3IoKS5nZXRMYXN0QnVmZmVyUm93KCk7XG5cbiAgICAgICAgLy8gaW5zZXJ0IG5ldyBsaW5lIGlmIHRoZSBjaHVuayB3ZSB3YW50IHRvIGNvcHkgd2lsbCBiZSBiZWxvdyB0aGUgbGFzdCBsaW5lIG9mIHRoZSBvdGhlciBlZGl0b3JcbiAgICAgICAgaWYoKGRpZmZDaHVuay5uZXdMaW5lU3RhcnQgKyBvZmZzZXQpID4gbGFzdEJ1ZmZlclJvdykge1xuICAgICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0RWRpdG9yKCkuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2xhc3RCdWZmZXJSb3csIDBdLCB7YXV0b3Njcm9sbDogZmFsc2V9KTtcbiAgICAgICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmdldEVkaXRvcigpLmluc2VydE5ld2xpbmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0RWRpdG9yKCkuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW1tkaWZmQ2h1bmsubmV3TGluZVN0YXJ0ICsgb2Zmc2V0LCAwXSwgW2RpZmZDaHVuay5uZXdMaW5lRW5kICsgb2Zmc2V0LCAwXV0sIHRleHRUb0NvcHkpO1xuICAgICAgICAvLyBvZmZzZXQgd2lsbCBiZSB0aGUgYW1vdW50IG9mIGxpbmVzIHRvIGJlIGNvcGllZCBtaW51cyB0aGUgYW1vdW50IG9mIGxpbmVzIG92ZXJ3cml0dGVuXG4gICAgICAgIG9mZnNldCArPSAoZGlmZkNodW5rLm9sZExpbmVFbmQgLSBkaWZmQ2h1bmsub2xkTGluZVN0YXJ0KSAtIChkaWZmQ2h1bmsubmV3TGluZUVuZCAtIGRpZmZDaHVuay5uZXdMaW5lU3RhcnQpO1xuICAgICAgICAvLyBtb3ZlIHRoZSBzZWxlY3Rpb24gcG9pbnRlciBiYWNrIHNvIHRoZSBuZXh0IGRpZmYgY2h1bmsgaXMgbm90IHNraXBwZWRcbiAgICAgICAgaWYodGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5oYXNTZWxlY3Rpb24oKSB8fCB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmhhc1NlbGVjdGlvbigpKSB7XG4gICAgICAgICAgdGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4LS07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZighZm91bmRTZWxlY3Rpb24pIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdTcGxpdCBEaWZmJywge2RldGFpbDogdGhpcy5fQ09QWV9IRUxQX01FU1NBR0UsIGRpc21pc3NhYmxlOiBmYWxzZSwgaWNvbjogJ2RpZmYnfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvcGllcyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGRpZmYgY2h1bmsgZnJvbSB0aGUgcmlnaHQgZWRpdG9yIHRvIHRoZSBsZWZ0XG4gICAqIGVkaXRvci5cbiAgICovXG4gIGNvcHlUb0xlZnQoKSB7XG4gICAgdmFyIGZvdW5kU2VsZWN0aW9uID0gZmFsc2U7XG4gICAgdmFyIG9mZnNldCA9IDA7IC8vIGtlZXAgdHJhY2sgb2YgbGluZSBvZmZzZXQgKHVzZWQgd2hlbiB0aGVyZSBhcmUgbXVsdGlwbGUgY2h1bmtzIGJlaW5nIG1vdmVkKVxuXG4gICAgZm9yKHZhciBkaWZmQ2h1bmsgb2YgdGhpcy5fY2h1bmtzKSB7XG4gICAgICBpZihkaWZmQ2h1bmsuaXNTZWxlY3RlZCkge1xuICAgICAgICBmb3VuZFNlbGVjdGlvbiA9IHRydWU7XG5cbiAgICAgICAgdmFyIHRleHRUb0NvcHkgPSB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmdldEVkaXRvcigpLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtbZGlmZkNodW5rLm5ld0xpbmVTdGFydCwgMF0sIFtkaWZmQ2h1bmsubmV3TGluZUVuZCwgMF1dKTtcbiAgICAgICAgdmFyIGxhc3RCdWZmZXJSb3cgPSB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldEVkaXRvcigpLmdldExhc3RCdWZmZXJSb3coKTtcbiAgICAgICAgLy8gaW5zZXJ0IG5ldyBsaW5lIGlmIHRoZSBjaHVuayB3ZSB3YW50IHRvIGNvcHkgd2lsbCBiZSBiZWxvdyB0aGUgbGFzdCBsaW5lIG9mIHRoZSBvdGhlciBlZGl0b3JcbiAgICAgICAgaWYoKGRpZmZDaHVuay5vbGRMaW5lU3RhcnQgKyBvZmZzZXQpID4gbGFzdEJ1ZmZlclJvdykge1xuICAgICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0RWRpdG9yKCkuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2xhc3RCdWZmZXJSb3csIDBdLCB7YXV0b3Njcm9sbDogZmFsc2V9KTtcbiAgICAgICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldEVkaXRvcigpLmluc2VydE5ld2xpbmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0RWRpdG9yKCkuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW1tkaWZmQ2h1bmsub2xkTGluZVN0YXJ0ICsgb2Zmc2V0LCAwXSwgW2RpZmZDaHVuay5vbGRMaW5lRW5kICsgb2Zmc2V0LCAwXV0sIHRleHRUb0NvcHkpO1xuICAgICAgICAvLyBvZmZzZXQgd2lsbCBiZSB0aGUgYW1vdW50IG9mIGxpbmVzIHRvIGJlIGNvcGllZCBtaW51cyB0aGUgYW1vdW50IG9mIGxpbmVzIG92ZXJ3cml0dGVuXG4gICAgICAgIG9mZnNldCArPSAoZGlmZkNodW5rLm5ld0xpbmVFbmQgLSBkaWZmQ2h1bmsubmV3TGluZVN0YXJ0KSAtIChkaWZmQ2h1bmsub2xkTGluZUVuZCAtIGRpZmZDaHVuay5vbGRMaW5lU3RhcnQpO1xuICAgICAgICAvLyBtb3ZlIHRoZSBzZWxlY3Rpb24gcG9pbnRlciBiYWNrIHNvIHRoZSBuZXh0IGRpZmYgY2h1bmsgaXMgbm90IHNraXBwZWRcbiAgICAgICAgaWYodGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5oYXNTZWxlY3Rpb24oKSB8fCB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmhhc1NlbGVjdGlvbigpKSB7XG4gICAgICAgICAgdGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4LS07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZighZm91bmRTZWxlY3Rpb24pIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdTcGxpdCBEaWZmJywge2RldGFpbDogdGhpcy5fQ09QWV9IRUxQX01FU1NBR0UsIGRpc21pc3NhYmxlOiBmYWxzZSwgaWNvbjogJ2RpZmYnfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENsZWFucyB1cCB0aGUgZWRpdG9yIGluZGljYXRlZCBieSBpbmRleC4gQSBjbGVhbiB1cCB3aWxsIHJlbW92ZSB0aGUgZWRpdG9yXG4gICAqIG9yIHRoZSBwYW5lIGlmIG5lY2Vzc2FyeS4gVHlwaWNhbGx5IGxlZnQgZWRpdG9yID09IDEgYW5kIHJpZ2h0IGVkaXRvciA9PSAyLlxuICAgKlxuICAgKiBAcGFyYW0gZWRpdG9ySW5kZXggVGhlIGluZGV4IG9mIHRoZSBlZGl0b3IgdG8gY2xlYW4gdXAuXG4gICAqL1xuICBjbGVhblVwRWRpdG9yKGVkaXRvckluZGV4KSB7XG4gICAgaWYoZWRpdG9ySW5kZXggPT09IDEpIHtcbiAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuY2xlYW5VcCgpO1xuICAgIH0gZWxzZSBpZihlZGl0b3JJbmRleCA9PT0gMikge1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5jbGVhblVwKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc3RvcmVzIHNvZnQgd3JhcCB0byB0aGUgYXBwcm9wcmlhdGUgZWRpdG9yLlxuICAgKiBAcGFyYW0gZWRpdG9ySW5kZXggVGhlIGluZGV4IG9mIHRoZSBlZGl0b3IgdG8gcmVzdG9yZSBzb2Z0IHdyYXAgdG8uXG4gICAqL1xuICByZXN0b3JlRWRpdG9yU29mdFdyYXAoZWRpdG9ySW5kZXgpIHtcbiAgICBpZihlZGl0b3JJbmRleCA9PT0gMSkge1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5nZXRFZGl0b3IoKS5zZXRTb2Z0V3JhcHBlZCh0cnVlKTtcbiAgICB9IGVsc2UgaWYoZWRpdG9ySW5kZXggPT09IDIpIHtcbiAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0RWRpdG9yKCkuc2V0U29mdFdyYXBwZWQodHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBlZGl0b3IgZGlmZiBleHRlbmRlcnMuXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZGVzdHJveSgpO1xuICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZGVzdHJveSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG51bWJlciBvZiBkaWZmZXJlbmNlcyBiZXR3ZWVuIHRoZSBlZGl0b3JzLlxuICAgKlxuICAgKiBAcmV0dXJuIGludCBUaGUgbnVtYmVyIG9mIGRpZmZlcmVuY2VzIGJldHdlZW4gdGhlIGVkaXRvcnMuXG4gICAqL1xuICBnZXROdW1EaWZmZXJlbmNlcygpIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh0aGlzLl9jaHVua3MpID8gdGhpcy5fY2h1bmtzLmxlbmd0aCA6IDA7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgbWFya2VyIGxheWVycyBpbiB1c2UgYnkgdGhlIGVkaXRvcnMuXG4gICAqIEByZXR1cm4gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG1hcmtlciBsYXllcnMgYW5kIGFwcHJvcmlhdGUgaW5mb3JtYXRpb24uXG4gICAqL1xuICBnZXRNYXJrZXJMYXllcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcmtlckxheWVycztcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHdoZW4gdGhlIGN1cnNvciBtb3ZlcyBpbiB0aGUgZWRpdG9yLiBXaWxsIGhpZ2hsaWdodCBjaHVua3MgdGhhdCBoYXZlIGEgY3Vyc29yIGluIHRoZW0uXG4gICAqIEBwYXJhbSBjdXJzb3IgVGhlIGN1cnNvciBvYmplY3QgZnJvbSB0aGUgZXZlbnQuXG4gICAqIEBwYXJhbSBvbGRCdWZmZXJQb3NpdGlvbiBUaGUgb2xkIHBvc2l0aW9uIG9mIHRoZSBjdXJzb3IgaW4gdGhlIGJ1ZmZlci5cbiAgICogQHBhcmFtIG5ld0J1ZmZlclBvc2l0aW9uIFRoZSBuZXcgcG9zaXRpb24gb2YgdGhlIGN1cnNvciBpbiB0aGUgYnVmZmVyLlxuICAgKi9cbiAgaGFuZGxlQ3Vyc29yQ2hhbmdlKGN1cnNvciwgb2xkQnVmZmVyUG9zaXRpb24sIG5ld0J1ZmZlclBvc2l0aW9uKSB7XG4gICAgdmFyIGVkaXRvckluZGV4ID0gKGN1cnNvci5lZGl0b3IgPT09IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0RWRpdG9yKCkpID8gMSA6IDI7XG4gICAgdmFyIG9sZFBvc2l0aW9uQ2h1bmtJbmRleCA9IHRoaXMuX2dldENodW5rSW5kZXhCeUxpbmVOdW1iZXIoZWRpdG9ySW5kZXgsIG9sZEJ1ZmZlclBvc2l0aW9uLnJvdyk7XG4gICAgdmFyIG5ld1Bvc2l0aW9uQ2h1bmtJbmRleCA9IHRoaXMuX2dldENodW5rSW5kZXhCeUxpbmVOdW1iZXIoZWRpdG9ySW5kZXgsIG5ld0J1ZmZlclBvc2l0aW9uLnJvdyk7XG5cbiAgICBpZihvbGRQb3NpdGlvbkNodW5rSW5kZXggPj0gMCkge1xuICAgICAgdmFyIGRpZmZDaHVuayA9IHRoaXMuX2NodW5rc1tvbGRQb3NpdGlvbkNodW5rSW5kZXhdO1xuICAgICAgZGlmZkNodW5rLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZGVzZWxlY3RMaW5lcyhkaWZmQ2h1bmsub2xkTGluZVN0YXJ0LCBkaWZmQ2h1bmsub2xkTGluZUVuZCk7XG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmRlc2VsZWN0TGluZXMoZGlmZkNodW5rLm5ld0xpbmVTdGFydCwgZGlmZkNodW5rLm5ld0xpbmVFbmQpO1xuICAgIH1cbiAgICBpZihuZXdQb3NpdGlvbkNodW5rSW5kZXggPj0gMCkge1xuICAgICAgdGhpcy5fc2VsZWN0Q2h1bmsobmV3UG9zaXRpb25DaHVua0luZGV4LCBmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFBSSVZBVEUgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuICAvKipcbiAgICogU2VsZWN0cyBhbmQgaGlnaGxpZ2h0cyB0aGUgZGlmZiBjaHVuayBpbiBib3RoIGVkaXRvcnMgYWNjb3JkaW5nIHRvIHRoZVxuICAgKiBnaXZlbiBpbmRleC5cbiAgICpcbiAgICogQHBhcmFtIGluZGV4IFRoZSBpbmRleCBvZiB0aGUgZGlmZiBjaHVuayB0byBoaWdobGlnaHQgaW4gYm90aCBlZGl0b3JzLlxuICAgKiBAcGFyYW0gaXNOZXh0T3JQcmV2IFdoZXRoZXIgd2UgYXJlIG1vdmluZyB0byBhIGRpcmVjdCBzaWJsaW5nIChpZiBub3QsIHRoaXMgaXMgYSBjbGljaylcbiAgICogQHBhcmFtIGlzU3luY1Njcm9sbEVuYWJsZWQgT25seSBhdXRvc2Nyb2xsIG9uZSBlZGl0b3IgaWYgc3luYyBzY3JvbGwgaXMgZW5hYmxlZCBvciB3ZSB3aWxsIGdldCBpbiBhbiBpbmZpbml0ZSBsb29wXG4gICAqL1xuICBfc2VsZWN0Q2h1bmsoaW5kZXgsIGlzTmV4dE9yUHJldiwgaXNTeW5jU2Nyb2xsRW5hYmxlZCkge1xuICAgIHZhciBkaWZmQ2h1bmsgPSB0aGlzLl9jaHVua3NbaW5kZXhdO1xuICAgIGlmKGRpZmZDaHVuayAhPSBudWxsKSB7XG4gICAgICBkaWZmQ2h1bmsuaXNTZWxlY3RlZCA9IHRydWU7XG5cbiAgICAgIGlmKGlzTmV4dE9yUHJldikge1xuICAgICAgICAvLyBkZXNlbGVjdCBwcmV2aW91cyBuZXh0L3ByZXYgaGlnaGxpZ2h0c1xuICAgICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmRlc2VsZWN0QWxsTGluZXMoKTtcbiAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5kZXNlbGVjdEFsbExpbmVzKCk7XG4gICAgICAgIC8vIHNjcm9sbCB0aGUgZWRpdG9yc1xuICAgICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldEVkaXRvcigpLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtkaWZmQ2h1bmsub2xkTGluZVN0YXJ0LCAwXSwge2F1dG9zY3JvbGw6IHRydWV9KTtcbiAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRFZGl0b3IoKS5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbZGlmZkNodW5rLm5ld0xpbmVTdGFydCwgMF0sIHthdXRvc2Nyb2xsOiAhaXNTeW5jU2Nyb2xsRW5hYmxlZH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBoaWdobGlnaHQgc2VsZWN0aW9uIGluIGJvdGggZWRpdG9yc1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5zZWxlY3RMaW5lcyhkaWZmQ2h1bmsub2xkTGluZVN0YXJ0LCBkaWZmQ2h1bmsub2xkTGluZUVuZCk7XG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLnNlbGVjdExpbmVzKGRpZmZDaHVuay5uZXdMaW5lU3RhcnQsIGRpZmZDaHVuay5uZXdMaW5lRW5kKTtcblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGluZGV4IG9mIGEgY2h1bmsgYnkgdGhlIGxpbmUgbnVtYmVyLlxuICAgKiBAcGFyYW0gZWRpdG9ySW5kZXggVGhlIGluZGV4IG9mIHRoZSBlZGl0b3IgdG8gY2hlY2suXG4gICAqIEBwYXJhbSBsaW5lTnVtYmVyICBUaGUgbGluZSBudW1iZXIgdG8gdXNlIHRvIGNoZWNrIGlmIGl0IGlzIGluIGEgY2h1bmsuXG4gICAqIEByZXR1cm4gVGhlIGluZGV4IG9mIHRoZSBjaHVuay5cbiAgICovXG4gIF9nZXRDaHVua0luZGV4QnlMaW5lTnVtYmVyKGVkaXRvckluZGV4LCBsaW5lTnVtYmVyKSB7XG4gICAgZm9yKHZhciBpPTA7IGk8dGhpcy5fY2h1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZGlmZkNodW5rID0gdGhpcy5fY2h1bmtzW2ldO1xuICAgICAgaWYoZWRpdG9ySW5kZXggPT09IDEpIHtcbiAgICAgICAgaWYoZGlmZkNodW5rLm9sZExpbmVTdGFydCA8PSBsaW5lTnVtYmVyICYmIGRpZmZDaHVuay5vbGRMaW5lRW5kID4gbGluZU51bWJlcikge1xuICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYoZWRpdG9ySW5kZXggPT09IDIpIHtcbiAgICAgICAgaWYoZGlmZkNodW5rLm5ld0xpbmVTdGFydCA8PSBsaW5lTnVtYmVyICYmIGRpZmZDaHVuay5uZXdMaW5lRW5kID4gbGluZU51bWJlcikge1xuICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgLyoqXG4gICAqIEhpZ2hsaWdodHMgdGhlIHdvcmQgZGlmZiBvZiB0aGUgY2h1bmsgcGFzc2VkIGluLlxuICAgKlxuICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRoYXQgc2hvdWxkIGhhdmUgaXRzIHdvcmRzIGhpZ2hsaWdodGVkLlxuICAgKi9cbiAgX2hpZ2hsaWdodFdvcmRzSW5DaHVuayhjaHVuaywgbGVmdEhpZ2hsaWdodFR5cGUsIHJpZ2h0SGlnaGxpZ2h0VHlwZSwgaXNXaGl0ZXNwYWNlSWdub3JlZCkge1xuICAgIHZhciBsZWZ0TGluZU51bWJlciA9IGNodW5rLm9sZExpbmVTdGFydDtcbiAgICB2YXIgcmlnaHRMaW5lTnVtYmVyID0gY2h1bmsubmV3TGluZVN0YXJ0O1xuICAgIC8vIGZvciBlYWNoIGxpbmUgdGhhdCBoYXMgYSBjb3JyZXNwb25kaW5nIGxpbmVcbiAgICB3aGlsZShsZWZ0TGluZU51bWJlciA8IGNodW5rLm9sZExpbmVFbmQgJiYgcmlnaHRMaW5lTnVtYmVyIDwgY2h1bmsubmV3TGluZUVuZCkge1xuICAgICAgdmFyIGVkaXRvcjFMaW5lVGV4dCA9IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0RWRpdG9yKCkubGluZVRleHRGb3JCdWZmZXJSb3cobGVmdExpbmVOdW1iZXIpO1xuICAgICAgdmFyIGVkaXRvcjJMaW5lVGV4dCA9IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0RWRpdG9yKCkubGluZVRleHRGb3JCdWZmZXJSb3cocmlnaHRMaW5lTnVtYmVyKTtcblxuICAgICAgaWYoZWRpdG9yMUxpbmVUZXh0ID09ICcnKSB7XG4gICAgICAgIC8vIGNvbXB1dGVXb3JkRGlmZiByZXR1cm5zIGVtcHR5IGZvciBsaW5lcyB0aGF0IGFyZSBwYWlyZWQgd2l0aCBlbXB0eSBsaW5lc1xuICAgICAgICAvLyBuZWVkIHRvIGZvcmNlIGEgaGlnaGxpZ2h0XG4gICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuc2V0V29yZEhpZ2hsaWdodHMocmlnaHRMaW5lTnVtYmVyLCBbe2NoYW5nZWQ6IHRydWUsIHZhbHVlOiBlZGl0b3IyTGluZVRleHR9XSwgcmlnaHRIaWdobGlnaHRUeXBlLCBpc1doaXRlc3BhY2VJZ25vcmVkKTtcbiAgICAgIH0gZWxzZSBpZiggZWRpdG9yMkxpbmVUZXh0ID09ICcnICkge1xuICAgICAgICAvLyBjb21wdXRlV29yZERpZmYgcmV0dXJucyBlbXB0eSBmb3IgbGluZXMgdGhhdCBhcmUgcGFpcmVkIHdpdGggZW1wdHkgbGluZXNcbiAgICAgICAgLy8gbmVlZCB0byBmb3JjZSBhIGhpZ2hsaWdodFxuICAgICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLnNldFdvcmRIaWdobGlnaHRzKGxlZnRMaW5lTnVtYmVyLCBbe2NoYW5nZWQ6IHRydWUsIHZhbHVlOiBlZGl0b3IxTGluZVRleHR9XSwgbGVmdEhpZ2hsaWdodFR5cGUsIGlzV2hpdGVzcGFjZUlnbm9yZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcGVyZm9ybSByZWd1bGFyIHdvcmQgZGlmZlxuICAgICAgICB2YXIgd29yZERpZmYgPSBDb21wdXRlV29yZERpZmYuY29tcHV0ZVdvcmREaWZmKGVkaXRvcjFMaW5lVGV4dCwgZWRpdG9yMkxpbmVUZXh0KTtcbiAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5zZXRXb3JkSGlnaGxpZ2h0cyhsZWZ0TGluZU51bWJlciwgd29yZERpZmYucmVtb3ZlZFdvcmRzLCBsZWZ0SGlnaGxpZ2h0VHlwZSwgaXNXaGl0ZXNwYWNlSWdub3JlZCk7XG4gICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuc2V0V29yZEhpZ2hsaWdodHMocmlnaHRMaW5lTnVtYmVyLCB3b3JkRGlmZi5hZGRlZFdvcmRzLCByaWdodEhpZ2hsaWdodFR5cGUsIGlzV2hpdGVzcGFjZUlnbm9yZWQpO1xuICAgICAgfVxuXG4gICAgICBsZWZ0TGluZU51bWJlcisrO1xuICAgICAgcmlnaHRMaW5lTnVtYmVyKys7XG4gICAgfVxuXG4gICAgLy8gaGlnaGxpZ2h0IHJlbWFpbmluZyBsaW5lcyBpbiBsZWZ0IGVkaXRvclxuICAgIHdoaWxlKGxlZnRMaW5lTnVtYmVyIDwgY2h1bmsub2xkTGluZUVuZCkge1xuICAgICAgdmFyIGVkaXRvcjFMaW5lVGV4dCA9IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0RWRpdG9yKCkubGluZVRleHRGb3JCdWZmZXJSb3cobGVmdExpbmVOdW1iZXIpO1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5zZXRXb3JkSGlnaGxpZ2h0cyhsZWZ0TGluZU51bWJlciwgW3tjaGFuZ2VkOiB0cnVlLCB2YWx1ZTogZWRpdG9yMUxpbmVUZXh0fV0sIGxlZnRIaWdobGlnaHRUeXBlLCBpc1doaXRlc3BhY2VJZ25vcmVkKTtcbiAgICAgIGxlZnRMaW5lTnVtYmVyKys7XG4gICAgfVxuICAgIC8vIGhpZ2hsaWdodCByZW1haW5pbmcgbGluZXMgaW4gdGhlIHJpZ2h0IGVkaXRvclxuICAgIHdoaWxlKHJpZ2h0TGluZU51bWJlciA8IGNodW5rLm5ld0xpbmVFbmQpIHtcbiAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuc2V0V29yZEhpZ2hsaWdodHMocmlnaHRMaW5lTnVtYmVyLCBbe2NoYW5nZWQ6IHRydWUsIHZhbHVlOiB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmdldEVkaXRvcigpLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJpZ2h0TGluZU51bWJlcil9XSwgcmlnaHRIaWdobGlnaHRUeXBlLCBpc1doaXRlc3BhY2VJZ25vcmVkKTtcbiAgICAgIHJpZ2h0TGluZU51bWJlcisrO1xuICAgIH1cbiAgfVxufTtcbiJdfQ==