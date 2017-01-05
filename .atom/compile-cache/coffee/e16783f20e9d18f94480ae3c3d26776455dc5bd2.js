(function() {
  var CompositeDisposable, DiffViewEditor, Directory, File, FooterView, LoadingView, SplitDiff, SyncScroll, configSchema, path, ref;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Directory = ref.Directory, File = ref.File;

  DiffViewEditor = require('./build-lines');

  LoadingView = require('./loading-view');

  FooterView = require('./footer-view');

  SyncScroll = require('./sync-scroll');

  configSchema = require("./config-schema");

  path = require('path');

  module.exports = SplitDiff = {
    config: configSchema,
    subscriptions: null,
    diffViewEditor1: null,
    diffViewEditor2: null,
    editorSubscriptions: null,
    linkedDiffChunks: null,
    diffChunkPointer: 0,
    isFirstChunkSelect: true,
    isEnabled: false,
    wasEditor1Created: false,
    wasEditor2Created: false,
    hasGitRepo: false,
    process: null,
    loadingView: null,
    copyHelpMsg: 'Place your cursor in a chunk first!',
    activate: function(state) {
      this.subscriptions = new CompositeDisposable();
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'split-diff:enable': (function(_this) {
          return function() {
            return _this.diffPanes();
          };
        })(this),
        'split-diff:next-diff': (function(_this) {
          return function() {
            if (_this.isEnabled) {
              return _this.nextDiff();
            } else {
              return _this.diffPanes();
            }
          };
        })(this),
        'split-diff:prev-diff': (function(_this) {
          return function() {
            if (_this.isEnabled) {
              return _this.prevDiff();
            } else {
              return _this.diffPanes();
            }
          };
        })(this),
        'split-diff:copy-to-right': (function(_this) {
          return function() {
            if (_this.isEnabled) {
              return _this.copyChunkToRight();
            }
          };
        })(this),
        'split-diff:copy-to-left': (function(_this) {
          return function() {
            if (_this.isEnabled) {
              return _this.copyChunkToLeft();
            }
          };
        })(this),
        'split-diff:disable': (function(_this) {
          return function() {
            return _this.disable();
          };
        })(this),
        'split-diff:ignore-whitespace': (function(_this) {
          return function() {
            return _this.toggleIgnoreWhitespace();
          };
        })(this),
        'split-diff:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
    },
    deactivate: function() {
      this.disable();
      return this.subscriptions.dispose();
    },
    toggle: function() {
      if (this.isEnabled) {
        return this.disable();
      } else {
        return this.diffPanes();
      }
    },
    disable: function() {
      this.isEnabled = false;
      if (this.editorSubscriptions != null) {
        this.editorSubscriptions.dispose();
        this.editorSubscriptions = null;
      }
      if (this.diffViewEditor1 != null) {
        if (this.wasEditor1Created) {
          this.diffViewEditor1.cleanUp();
        }
      }
      if (this.diffViewEditor2 != null) {
        if (this.wasEditor2Created) {
          this.diffViewEditor2.cleanUp();
        }
      }
      if (this.footerView != null) {
        this.footerView.destroy();
        this.footerView = null;
      }
      this._clearDiff();
      this.diffChunkPointer = 0;
      this.isFirstChunkSelect = true;
      this.wasEditor1Created = false;
      this.wasEditor2Created = false;
      return this.hasGitRepo = false;
    },
    toggleIgnoreWhitespace: function() {
      var isWhitespaceIgnored;
      isWhitespaceIgnored = this._getConfig('ignoreWhitespace');
      return this._setConfig('ignoreWhitespace', !isWhitespaceIgnored);
    },
    nextDiff: function() {
      if (this.diffViewEditor1 && this.diffViewEditor2) {
        if (!this.isFirstChunkSelect) {
          this.diffChunkPointer++;
          if (this.diffChunkPointer >= this.linkedDiffChunks.length) {
            this.diffChunkPointer = 0;
          }
        } else {
          this.isFirstChunkSelect = false;
        }
        return this._selectDiffs(this.linkedDiffChunks[this.diffChunkPointer], this.diffChunkPointer);
      }
    },
    prevDiff: function() {
      if (this.diffViewEditor1 && this.diffViewEditor2) {
        if (!this.isFirstChunkSelect) {
          this.diffChunkPointer--;
          if (this.diffChunkPointer < 0) {
            this.diffChunkPointer = this.linkedDiffChunks.length - 1;
          }
        } else {
          this.isFirstChunkSelect = false;
        }
        return this._selectDiffs(this.linkedDiffChunks[this.diffChunkPointer], this.diffChunkPointer);
      }
    },
    copyChunkToRight: function() {
      var diffChunk, k, lastBufferRow, len, lineRange, linesToMove, moveText, offset, results;
      if (this.diffViewEditor1 && this.diffViewEditor2) {
        linesToMove = this.diffViewEditor1.getCursorDiffLines();
        if (linesToMove.length === 0) {
          atom.notifications.addWarning('Split Diff', {
            detail: this.copyHelpMsg,
            dismissable: false,
            icon: 'diff'
          });
        }
        offset = 0;
        results = [];
        for (k = 0, len = linesToMove.length; k < len; k++) {
          lineRange = linesToMove[k];
          results.push((function() {
            var l, len1, ref1, results1;
            ref1 = this.linkedDiffChunks;
            results1 = [];
            for (l = 0, len1 = ref1.length; l < len1; l++) {
              diffChunk = ref1[l];
              if (lineRange.start.row === diffChunk.oldLineStart) {
                moveText = this.diffViewEditor1.getEditor().getTextInBufferRange([[diffChunk.oldLineStart, 0], [diffChunk.oldLineEnd, 0]]);
                lastBufferRow = this.diffViewEditor2.getEditor().getLastBufferRow();
                if ((diffChunk.newLineStart + offset) > lastBufferRow) {
                  this.diffViewEditor2.getEditor().setCursorBufferPosition([lastBufferRow, 0], {
                    autoscroll: false
                  });
                  this.diffViewEditor2.getEditor().insertNewline();
                }
                this.diffViewEditor2.getEditor().setTextInBufferRange([[diffChunk.newLineStart + offset, 0], [diffChunk.newLineEnd + offset, 0]], moveText);
                offset += (diffChunk.oldLineEnd - diffChunk.oldLineStart) - (diffChunk.newLineEnd - diffChunk.newLineStart);
                if (this.diffViewEditor1.hasSelection() || this.diffViewEditor2.hasSelection()) {
                  results1.push(this.diffChunkPointer--);
                } else {
                  results1.push(void 0);
                }
              } else {
                results1.push(void 0);
              }
            }
            return results1;
          }).call(this));
        }
        return results;
      }
    },
    copyChunkToLeft: function() {
      var diffChunk, k, lastBufferRow, len, lineRange, linesToMove, moveText, offset, results;
      if (this.diffViewEditor1 && this.diffViewEditor2) {
        linesToMove = this.diffViewEditor2.getCursorDiffLines();
        if (linesToMove.length === 0) {
          atom.notifications.addWarning('Split Diff', {
            detail: this.copyHelpMsg,
            dismissable: false,
            icon: 'diff'
          });
        }
        offset = 0;
        results = [];
        for (k = 0, len = linesToMove.length; k < len; k++) {
          lineRange = linesToMove[k];
          results.push((function() {
            var l, len1, ref1, results1;
            ref1 = this.linkedDiffChunks;
            results1 = [];
            for (l = 0, len1 = ref1.length; l < len1; l++) {
              diffChunk = ref1[l];
              if (lineRange.start.row === diffChunk.newLineStart) {
                moveText = this.diffViewEditor2.getEditor().getTextInBufferRange([[diffChunk.newLineStart, 0], [diffChunk.newLineEnd, 0]]);
                lastBufferRow = this.diffViewEditor1.getEditor().getLastBufferRow();
                if ((diffChunk.oldLineStart + offset) > lastBufferRow) {
                  this.diffViewEditor1.getEditor().setCursorBufferPosition([lastBufferRow, 0], {
                    autoscroll: false
                  });
                  this.diffViewEditor1.getEditor().insertNewline();
                }
                this.diffViewEditor1.getEditor().setTextInBufferRange([[diffChunk.oldLineStart + offset, 0], [diffChunk.oldLineEnd + offset, 0]], moveText);
                offset += (diffChunk.newLineEnd - diffChunk.newLineStart) - (diffChunk.oldLineEnd - diffChunk.oldLineStart);
                if (this.diffViewEditor1.hasSelection() || this.diffViewEditor2.hasSelection()) {
                  results1.push(this.diffChunkPointer--);
                } else {
                  results1.push(void 0);
                }
              } else {
                results1.push(void 0);
              }
            }
            return results1;
          }).call(this));
        }
        return results;
      }
    },
    diffPanes: function() {
      var editors, isWhitespaceIgnored;
      this.disable();
      this.editorSubscriptions = new CompositeDisposable();
      editors = this._getVisibleEditors();
      this.editorSubscriptions.add(editors.editor1.onDidStopChanging((function(_this) {
        return function() {
          return _this.updateDiff(editors);
        };
      })(this)));
      this.editorSubscriptions.add(editors.editor2.onDidStopChanging((function(_this) {
        return function() {
          return _this.updateDiff(editors);
        };
      })(this)));
      this.editorSubscriptions.add(editors.editor1.onDidDestroy((function(_this) {
        return function() {
          return _this.disable();
        };
      })(this)));
      this.editorSubscriptions.add(editors.editor2.onDidDestroy((function(_this) {
        return function() {
          return _this.disable();
        };
      })(this)));
      this.editorSubscriptions.add(atom.config.onDidChange('split-diff', (function(_this) {
        return function() {
          return _this.updateDiff(editors);
        };
      })(this)));
      isWhitespaceIgnored = this._getConfig('ignoreWhitespace');
      if (this.footerView == null) {
        this.footerView = new FooterView(isWhitespaceIgnored);
        this.footerView.createPanel();
      }
      this.footerView.show();
      if (!this.hasGitRepo) {
        this.updateDiff(editors);
      }
      this.editorSubscriptions.add(atom.menu.add([
        {
          'label': 'Packages',
          'submenu': [
            {
              'label': 'Split Diff',
              'submenu': [
                {
                  'label': 'Ignore Whitespace',
                  'command': 'split-diff:ignore-whitespace'
                }, {
                  'label': 'Move to Next Diff',
                  'command': 'split-diff:next-diff'
                }, {
                  'label': 'Move to Previous Diff',
                  'command': 'split-diff:prev-diff'
                }, {
                  'label': 'Copy to Right',
                  'command': 'split-diff:copy-to-right'
                }, {
                  'label': 'Copy to Left',
                  'command': 'split-diff:copy-to-left'
                }
              ]
            }
          ]
        }
      ]));
      return this.editorSubscriptions.add(atom.contextMenu.add({
        'atom-text-editor': [
          {
            'label': 'Split Diff',
            'submenu': [
              {
                'label': 'Ignore Whitespace',
                'command': 'split-diff:ignore-whitespace'
              }, {
                'label': 'Move to Next Diff',
                'command': 'split-diff:next-diff'
              }, {
                'label': 'Move to Previous Diff',
                'command': 'split-diff:prev-diff'
              }, {
                'label': 'Copy to Right',
                'command': 'split-diff:copy-to-right'
              }, {
                'label': 'Copy to Left',
                'command': 'split-diff:copy-to-left'
              }
            ]
          }
        ]
      }));
    },
    updateDiff: function(editors) {
      var BufferedNodeProcess, args, command, computedDiff, editorPaths, exit, isWhitespaceIgnored, stderr, stdout, theOutput;
      this.isEnabled = true;
      if (this.process != null) {
        this.process.kill();
        this.process = null;
      }
      isWhitespaceIgnored = this._getConfig('ignoreWhitespace');
      editorPaths = this._createTempFiles(editors);
      if (this.loadingView == null) {
        this.loadingView = new LoadingView();
        this.loadingView.createModal();
      }
      this.loadingView.show();
      BufferedNodeProcess = require('atom').BufferedNodeProcess;
      command = path.resolve(__dirname, "./compute-diff.js");
      args = [editorPaths.editor1Path, editorPaths.editor2Path, isWhitespaceIgnored];
      computedDiff = '';
      theOutput = '';
      stdout = (function(_this) {
        return function(output) {
          var ref1;
          theOutput = output;
          computedDiff = JSON.parse(output);
          _this.process.kill();
          _this.process = null;
          if ((ref1 = _this.loadingView) != null) {
            ref1.hide();
          }
          return _this._resumeUpdateDiff(editors, computedDiff);
        };
      })(this);
      stderr = (function(_this) {
        return function(err) {
          return theOutput = err;
        };
      })(this);
      exit = (function(_this) {
        return function(code) {
          var ref1;
          if ((ref1 = _this.loadingView) != null) {
            ref1.hide();
          }
          if (code !== 0) {
            console.log('BufferedNodeProcess code was ' + code);
            return console.log(theOutput);
          }
        };
      })(this);
      return this.process = new BufferedNodeProcess({
        command: command,
        args: args,
        stdout: stdout,
        stderr: stderr,
        exit: exit
      });
    },
    _resumeUpdateDiff: function(editors, computedDiff) {
      var isWordDiffEnabled, lastDiffChunk, newChunkRange, oldChunkRange, ref1, scrollSyncType;
      this.linkedDiffChunks = this._evaluateDiffOrder(computedDiff.chunks);
      if ((ref1 = this.footerView) != null) {
        ref1.setNumDifferences(this.linkedDiffChunks.length);
      }
      if (this.linkedDiffChunks.length > 0) {
        lastDiffChunk = this.linkedDiffChunks[this.linkedDiffChunks.length - 1];
        oldChunkRange = lastDiffChunk.oldLineEnd - lastDiffChunk.oldLineStart;
        newChunkRange = lastDiffChunk.newLineEnd - lastDiffChunk.newLineStart;
        if (oldChunkRange > newChunkRange) {
          computedDiff.newLineOffsets[lastDiffChunk.newLineStart + newChunkRange] = oldChunkRange - newChunkRange;
        } else if (newChunkRange > oldChunkRange) {
          computedDiff.oldLineOffsets[lastDiffChunk.oldLineStart + oldChunkRange] = newChunkRange - oldChunkRange;
        }
      }
      this._clearDiff();
      this._displayDiff(editors, computedDiff);
      isWordDiffEnabled = this._getConfig('diffWords');
      if (isWordDiffEnabled) {
        this._highlightWordDiff(this.linkedDiffChunks);
      }
      scrollSyncType = this._getConfig('scrollSyncType');
      if (scrollSyncType === 'Vertical + Horizontal') {
        this.syncScroll = new SyncScroll(editors.editor1, editors.editor2, true);
        return this.syncScroll.syncPositions();
      } else if (scrollSyncType === 'Vertical') {
        this.syncScroll = new SyncScroll(editors.editor1, editors.editor2, false);
        return this.syncScroll.syncPositions();
      }
    },
    _getVisibleEditors: function() {
      var BufferExtender, activeItem, buffer1LineEnding, buffer2LineEnding, editor1, editor2, editors, k, leftPane, len, lineEndingMsg, p, panes, rightPane, shouldNotify, softWrapMsg;
      editor1 = null;
      editor2 = null;
      panes = atom.workspace.getPanes();
      for (k = 0, len = panes.length; k < len; k++) {
        p = panes[k];
        activeItem = p.getActiveItem();
        if (atom.workspace.isTextEditor(activeItem)) {
          if (editor1 === null) {
            editor1 = activeItem;
          } else if (editor2 === null) {
            editor2 = activeItem;
            break;
          }
        }
      }
      if (editor1 === null) {
        editor1 = atom.workspace.buildTextEditor();
        this.wasEditor1Created = true;
        leftPane = atom.workspace.getActivePane();
        leftPane.addItem(editor1);
      }
      if (editor2 === null) {
        editor2 = atom.workspace.buildTextEditor();
        this.wasEditor2Created = true;
        editor2.setGrammar(editor1.getGrammar());
        rightPane = atom.workspace.getActivePane().splitRight();
        rightPane.addItem(editor2);
      }
      BufferExtender = require('./buffer-extender');
      buffer1LineEnding = (new BufferExtender(editor1.getBuffer())).getLineEnding();
      if (this.wasEditor2Created) {
        atom.views.getView(editor1).focus();
        if (buffer1LineEnding === '\n' || buffer1LineEnding === '\r\n') {
          this.editorSubscriptions.add(editor2.onWillInsertText(function() {
            return editor2.getBuffer().setPreferredLineEnding(buffer1LineEnding);
          }));
        }
      }
      this._setupGitRepo(editor1, editor2);
      editor1.unfoldAll();
      editor2.unfoldAll();
      shouldNotify = !this._getConfig('muteNotifications');
      softWrapMsg = 'Warning: Soft wrap enabled! (Line diffs may not align)';
      if (editor1.isSoftWrapped() && shouldNotify) {
        atom.notifications.addWarning('Split Diff', {
          detail: softWrapMsg,
          dismissable: false,
          icon: 'diff'
        });
      } else if (editor2.isSoftWrapped() && shouldNotify) {
        atom.notifications.addWarning('Split Diff', {
          detail: softWrapMsg,
          dismissable: false,
          icon: 'diff'
        });
      }
      buffer2LineEnding = (new BufferExtender(editor2.getBuffer())).getLineEnding();
      if (buffer2LineEnding !== '' && (buffer1LineEnding !== buffer2LineEnding) && shouldNotify) {
        lineEndingMsg = 'Warning: Line endings differ!';
        atom.notifications.addWarning('Split Diff', {
          detail: lineEndingMsg,
          dismissable: false,
          icon: 'diff'
        });
      }
      editors = {
        editor1: editor1,
        editor2: editor2
      };
      return editors;
    },
    _setupGitRepo: function(editor1, editor2) {
      var directory, editor1Path, gitHeadText, i, k, len, projectRepo, ref1, relativeEditor1Path, results;
      editor1Path = editor1.getPath();
      if ((editor1Path != null) && (editor2.getLineCount() === 1 && editor2.lineTextForBufferRow(0) === '')) {
        ref1 = atom.project.getDirectories();
        results = [];
        for (i = k = 0, len = ref1.length; k < len; i = ++k) {
          directory = ref1[i];
          if (editor1Path === directory.getPath() || directory.contains(editor1Path)) {
            projectRepo = atom.project.getRepositories()[i];
            if ((projectRepo != null) && (projectRepo.repo != null)) {
              relativeEditor1Path = projectRepo.relativize(editor1Path);
              gitHeadText = projectRepo.repo.getHeadBlob(relativeEditor1Path);
              if (gitHeadText != null) {
                editor2.selectAll();
                editor2.insertText(gitHeadText);
                this.hasGitRepo = true;
                break;
              } else {
                results.push(void 0);
              }
            } else {
              results.push(void 0);
            }
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    },
    _createTempFiles: function(editors) {
      var editor1Path, editor1TempFile, editor2Path, editor2TempFile, editorPaths, tempFolderPath;
      editor1Path = '';
      editor2Path = '';
      tempFolderPath = atom.getConfigDirPath() + '/split-diff';
      editor1Path = tempFolderPath + '/split-diff 1';
      editor1TempFile = new File(editor1Path);
      editor1TempFile.writeSync(editors.editor1.getText());
      editor2Path = tempFolderPath + '/split-diff 2';
      editor2TempFile = new File(editor2Path);
      editor2TempFile.writeSync(editors.editor2.getText());
      editorPaths = {
        editor1Path: editor1Path,
        editor2Path: editor2Path
      };
      return editorPaths;
    },
    _selectDiffs: function(diffChunk, selectionCount) {
      if (diffChunk != null) {
        this.diffViewEditor1.deselectAllLines();
        this.diffViewEditor2.deselectAllLines();
        this.diffViewEditor1.selectLines(diffChunk.oldLineStart, diffChunk.oldLineEnd);
        this.diffViewEditor1.getEditor().setCursorBufferPosition([diffChunk.oldLineStart, 0], {
          autoscroll: true
        });
        this.diffViewEditor2.selectLines(diffChunk.newLineStart, diffChunk.newLineEnd);
        this.diffViewEditor2.getEditor().setCursorBufferPosition([diffChunk.newLineStart, 0], {
          autoscroll: true
        });
        return this.footerView.showSelectionCount(selectionCount + 1);
      }
    },
    _clearDiff: function() {
      var ref1;
      if ((ref1 = this.loadingView) != null) {
        ref1.hide();
      }
      if (this.diffViewEditor1 != null) {
        this.diffViewEditor1.destroy();
        this.diffViewEditor1 = null;
      }
      if (this.diffViewEditor2 != null) {
        this.diffViewEditor2.destroy();
        this.diffViewEditor2 = null;
      }
      if (this.syncScroll != null) {
        this.syncScroll.dispose();
        return this.syncScroll = null;
      }
    },
    _displayDiff: function(editors, computedDiff) {
      var leftColor, rightColor;
      this.diffViewEditor1 = new DiffViewEditor(editors.editor1);
      this.diffViewEditor2 = new DiffViewEditor(editors.editor2);
      leftColor = this._getConfig('leftEditorColor');
      rightColor = this._getConfig('rightEditorColor');
      if (leftColor === 'green') {
        this.diffViewEditor1.setLineHighlights(computedDiff.removedLines, 'added');
      } else {
        this.diffViewEditor1.setLineHighlights(computedDiff.removedLines, 'removed');
      }
      if (rightColor === 'green') {
        this.diffViewEditor2.setLineHighlights(computedDiff.addedLines, 'added');
      } else {
        this.diffViewEditor2.setLineHighlights(computedDiff.addedLines, 'removed');
      }
      this.diffViewEditor1.setLineOffsets(computedDiff.oldLineOffsets);
      return this.diffViewEditor2.setLineOffsets(computedDiff.newLineOffsets);
    },
    _evaluateDiffOrder: function(chunks) {
      var c, diffChunk, diffChunks, k, len, newLineNumber, oldLineNumber, prevChunk;
      oldLineNumber = 0;
      newLineNumber = 0;
      prevChunk = null;
      diffChunks = [];
      for (k = 0, len = chunks.length; k < len; k++) {
        c = chunks[k];
        if (c.added != null) {
          if ((prevChunk != null) && (prevChunk.removed != null)) {
            diffChunk = {
              newLineStart: newLineNumber,
              newLineEnd: newLineNumber + c.count,
              oldLineStart: oldLineNumber - prevChunk.count,
              oldLineEnd: oldLineNumber
            };
            diffChunks.push(diffChunk);
            prevChunk = null;
          } else {
            prevChunk = c;
          }
          newLineNumber += c.count;
        } else if (c.removed != null) {
          if ((prevChunk != null) && (prevChunk.added != null)) {
            diffChunk = {
              newLineStart: newLineNumber - prevChunk.count,
              newLineEnd: newLineNumber,
              oldLineStart: oldLineNumber,
              oldLineEnd: oldLineNumber + c.count
            };
            diffChunks.push(diffChunk);
            prevChunk = null;
          } else {
            prevChunk = c;
          }
          oldLineNumber += c.count;
        } else {
          if ((prevChunk != null) && (prevChunk.added != null)) {
            diffChunk = {
              newLineStart: newLineNumber - prevChunk.count,
              newLineEnd: newLineNumber,
              oldLineStart: oldLineNumber,
              oldLineEnd: oldLineNumber
            };
            diffChunks.push(diffChunk);
          } else if ((prevChunk != null) && (prevChunk.removed != null)) {
            diffChunk = {
              newLineStart: newLineNumber,
              newLineEnd: newLineNumber,
              oldLineStart: oldLineNumber - prevChunk.count,
              oldLineEnd: oldLineNumber
            };
            diffChunks.push(diffChunk);
          }
          prevChunk = null;
          oldLineNumber += c.count;
          newLineNumber += c.count;
        }
      }
      if ((prevChunk != null) && (prevChunk.added != null)) {
        diffChunk = {
          newLineStart: newLineNumber - prevChunk.count,
          newLineEnd: newLineNumber,
          oldLineStart: oldLineNumber,
          oldLineEnd: oldLineNumber
        };
        diffChunks.push(diffChunk);
      } else if ((prevChunk != null) && (prevChunk.removed != null)) {
        diffChunk = {
          newLineStart: newLineNumber,
          newLineEnd: newLineNumber,
          oldLineStart: oldLineNumber - prevChunk.count,
          oldLineEnd: oldLineNumber
        };
        diffChunks.push(diffChunk);
      }
      return diffChunks;
    },
    _highlightWordDiff: function(chunks) {
      var ComputeWordDiff, c, excessLines, i, isWhitespaceIgnored, j, k, l, leftColor, len, lineRange, ref1, results, rightColor, wordDiff;
      ComputeWordDiff = require('./compute-word-diff');
      leftColor = this._getConfig('leftEditorColor');
      rightColor = this._getConfig('rightEditorColor');
      isWhitespaceIgnored = this._getConfig('ignoreWhitespace');
      results = [];
      for (k = 0, len = chunks.length; k < len; k++) {
        c = chunks[k];
        if ((c.newLineStart != null) && (c.oldLineStart != null)) {
          lineRange = 0;
          excessLines = 0;
          if ((c.newLineEnd - c.newLineStart) < (c.oldLineEnd - c.oldLineStart)) {
            lineRange = c.newLineEnd - c.newLineStart;
            excessLines = (c.oldLineEnd - c.oldLineStart) - lineRange;
          } else {
            lineRange = c.oldLineEnd - c.oldLineStart;
            excessLines = (c.newLineEnd - c.newLineStart) - lineRange;
          }
          for (i = l = 0, ref1 = lineRange; l < ref1; i = l += 1) {
            wordDiff = ComputeWordDiff.computeWordDiff(this.diffViewEditor1.getEditor().lineTextForBufferRow(c.oldLineStart + i), this.diffViewEditor2.getEditor().lineTextForBufferRow(c.newLineStart + i));
            if (leftColor === 'green') {
              this.diffViewEditor1.setWordHighlights(c.oldLineStart + i, wordDiff.removedWords, 'added', isWhitespaceIgnored);
            } else {
              this.diffViewEditor1.setWordHighlights(c.oldLineStart + i, wordDiff.removedWords, 'removed', isWhitespaceIgnored);
            }
            if (rightColor === 'green') {
              this.diffViewEditor2.setWordHighlights(c.newLineStart + i, wordDiff.addedWords, 'added', isWhitespaceIgnored);
            } else {
              this.diffViewEditor2.setWordHighlights(c.newLineStart + i, wordDiff.addedWords, 'removed', isWhitespaceIgnored);
            }
          }
          results.push((function() {
            var m, ref2, results1;
            results1 = [];
            for (j = m = 0, ref2 = excessLines; m < ref2; j = m += 1) {
              if ((c.newLineEnd - c.newLineStart) < (c.oldLineEnd - c.oldLineStart)) {
                if (leftColor === 'green') {
                  results1.push(this.diffViewEditor1.setWordHighlights(c.oldLineStart + lineRange + j, [
                    {
                      changed: true,
                      value: this.diffViewEditor1.getEditor().lineTextForBufferRow(c.oldLineStart + lineRange + j)
                    }
                  ], 'added', isWhitespaceIgnored));
                } else {
                  results1.push(this.diffViewEditor1.setWordHighlights(c.oldLineStart + lineRange + j, [
                    {
                      changed: true,
                      value: this.diffViewEditor1.getEditor().lineTextForBufferRow(c.oldLineStart + lineRange + j)
                    }
                  ], 'removed', isWhitespaceIgnored));
                }
              } else if ((c.newLineEnd - c.newLineStart) > (c.oldLineEnd - c.oldLineStart)) {
                if (rightColor === 'green') {
                  results1.push(this.diffViewEditor2.setWordHighlights(c.newLineStart + lineRange + j, [
                    {
                      changed: true,
                      value: this.diffViewEditor2.getEditor().lineTextForBufferRow(c.newLineStart + lineRange + j)
                    }
                  ], 'added', isWhitespaceIgnored));
                } else {
                  results1.push(this.diffViewEditor2.setWordHighlights(c.newLineStart + lineRange + j, [
                    {
                      changed: true,
                      value: this.diffViewEditor2.getEditor().lineTextForBufferRow(c.newLineStart + lineRange + j)
                    }
                  ], 'removed', isWhitespaceIgnored));
                }
              } else {
                results1.push(void 0);
              }
            }
            return results1;
          }).call(this));
        } else if (c.newLineStart != null) {
          lineRange = c.newLineEnd - c.newLineStart;
          results.push((function() {
            var m, ref2, results1;
            results1 = [];
            for (i = m = 0, ref2 = lineRange; m < ref2; i = m += 1) {
              if (rightColor === 'green') {
                results1.push(this.diffViewEditor2.setWordHighlights(c.newLineStart + i, [
                  {
                    changed: true,
                    value: this.diffViewEditor2.getEditor().lineTextForBufferRow(c.newLineStart + i)
                  }
                ], 'added', isWhitespaceIgnored));
              } else {
                results1.push(this.diffViewEditor2.setWordHighlights(c.newLineStart + i, [
                  {
                    changed: true,
                    value: this.diffViewEditor2.getEditor().lineTextForBufferRow(c.newLineStart + i)
                  }
                ], 'removed', isWhitespaceIgnored));
              }
            }
            return results1;
          }).call(this));
        } else if (c.oldLineStart != null) {
          lineRange = c.oldLineEnd - c.oldLineStart;
          results.push((function() {
            var m, ref2, results1;
            results1 = [];
            for (i = m = 0, ref2 = lineRange; m < ref2; i = m += 1) {
              if (leftColor === 'green') {
                results1.push(this.diffViewEditor1.setWordHighlights(c.oldLineStart + i, [
                  {
                    changed: true,
                    value: this.diffViewEditor1.getEditor().lineTextForBufferRow(c.oldLineStart + i)
                  }
                ], 'added', isWhitespaceIgnored));
              } else {
                results1.push(this.diffViewEditor1.setWordHighlights(c.oldLineStart + i, [
                  {
                    changed: true,
                    value: this.diffViewEditor1.getEditor().lineTextForBufferRow(c.oldLineStart + i)
                  }
                ], 'removed', isWhitespaceIgnored));
              }
            }
            return results1;
          }).call(this));
        } else {
          results.push(void 0);
        }
      }
      return results;
    },
    _getConfig: function(config) {
      return atom.config.get("split-diff." + config);
    },
    _setConfig: function(config, value) {
      return atom.config.set("split-diff." + config, value);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FscGhhLy5hdG9tL3BhY2thZ2VzL3NwbGl0LWRpZmYvbGliL3NwbGl0LWRpZmYuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUF5QyxPQUFBLENBQVEsTUFBUixDQUF6QyxFQUFDLDZDQUFELEVBQXNCLHlCQUF0QixFQUFpQzs7RUFDakMsY0FBQSxHQUFpQixPQUFBLENBQVEsZUFBUjs7RUFDakIsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7RUFDZCxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVI7O0VBQ2IsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUNiLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVI7O0VBQ2YsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUEsR0FDZjtJQUFBLE1BQUEsRUFBUSxZQUFSO0lBQ0EsYUFBQSxFQUFlLElBRGY7SUFFQSxlQUFBLEVBQWlCLElBRmpCO0lBR0EsZUFBQSxFQUFpQixJQUhqQjtJQUlBLG1CQUFBLEVBQXFCLElBSnJCO0lBS0EsZ0JBQUEsRUFBa0IsSUFMbEI7SUFNQSxnQkFBQSxFQUFrQixDQU5sQjtJQU9BLGtCQUFBLEVBQW9CLElBUHBCO0lBUUEsU0FBQSxFQUFXLEtBUlg7SUFTQSxpQkFBQSxFQUFtQixLQVRuQjtJQVVBLGlCQUFBLEVBQW1CLEtBVm5CO0lBV0EsVUFBQSxFQUFZLEtBWFo7SUFZQSxPQUFBLEVBQVMsSUFaVDtJQWFBLFdBQUEsRUFBYSxJQWJiO0lBY0EsV0FBQSxFQUFhLHFDQWRiO0lBZ0JBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7TUFDUixJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLG1CQUFBLENBQUE7YUFFckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFr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QUhHO1NBQUEsTUFBQTsrQkFBQTs7QUEzQ1A7O0lBTGtCLENBNWdCcEI7SUFza0JBLFVBQUEsRUFBWSxTQUFDLE1BQUQ7YUFDVixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsYUFBQSxHQUFjLE1BQTlCO0lBRFUsQ0F0a0JaO0lBeWtCQSxVQUFBLEVBQVksU0FBQyxNQUFELEVBQVMsS0FBVDthQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixhQUFBLEdBQWMsTUFBOUIsRUFBd0MsS0FBeEM7SUFEVSxDQXprQlo7O0FBVEYiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlyZWN0b3J5LCBGaWxlfSA9IHJlcXVpcmUgJ2F0b20nXG5EaWZmVmlld0VkaXRvciA9IHJlcXVpcmUgJy4vYnVpbGQtbGluZXMnXG5Mb2FkaW5nVmlldyA9IHJlcXVpcmUgJy4vbG9hZGluZy12aWV3J1xuRm9vdGVyVmlldyA9IHJlcXVpcmUgJy4vZm9vdGVyLXZpZXcnXG5TeW5jU2Nyb2xsID0gcmVxdWlyZSAnLi9zeW5jLXNjcm9sbCdcbmNvbmZpZ1NjaGVtYSA9IHJlcXVpcmUgXCIuL2NvbmZpZy1zY2hlbWFcIlxucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbm1vZHVsZS5leHBvcnRzID0gU3BsaXREaWZmID1cbiAgY29uZmlnOiBjb25maWdTY2hlbWFcbiAgc3Vic2NyaXB0aW9uczogbnVsbFxuICBkaWZmVmlld0VkaXRvcjE6IG51bGxcbiAgZGlmZlZpZXdFZGl0b3IyOiBudWxsXG4gIGVkaXRvclN1YnNjcmlwdGlvbnM6IG51bGxcbiAgbGlua2VkRGlmZkNodW5rczogbnVsbFxuICBkaWZmQ2h1bmtQb2ludGVyOiAwXG4gIGlzRmlyc3RDaHVua1NlbGVjdDogdHJ1ZVxuICBpc0VuYWJsZWQ6IGZhbHNlXG4gIHdhc0VkaXRvcjFDcmVhdGVkOiBmYWxzZVxuICB3YXNFZGl0b3IyQ3JlYXRlZDogZmFsc2VcbiAgaGFzR2l0UmVwbzogZmFsc2VcbiAgcHJvY2VzczogbnVsbFxuICBsb2FkaW5nVmlldzogbnVsbFxuICBjb3B5SGVscE1zZzogJ1BsYWNlIHlvdXIgY3Vyc29yIGluIGEgY2h1bmsgZmlyc3QhJ1xuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICdzcGxpdC1kaWZmOmVuYWJsZSc6ID0+IEBkaWZmUGFuZXMoKVxuICAgICAgJ3NwbGl0LWRpZmY6bmV4dC1kaWZmJzogPT5cbiAgICAgICAgaWYgQGlzRW5hYmxlZFxuICAgICAgICAgIEBuZXh0RGlmZigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZGlmZlBhbmVzKClcbiAgICAgICdzcGxpdC1kaWZmOnByZXYtZGlmZic6ID0+XG4gICAgICAgIGlmIEBpc0VuYWJsZWRcbiAgICAgICAgICBAcHJldkRpZmYoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGRpZmZQYW5lcygpXG4gICAgICAnc3BsaXQtZGlmZjpjb3B5LXRvLXJpZ2h0JzogPT5cbiAgICAgICAgaWYgQGlzRW5hYmxlZFxuICAgICAgICAgIEBjb3B5Q2h1bmtUb1JpZ2h0KClcbiAgICAgICdzcGxpdC1kaWZmOmNvcHktdG8tbGVmdCc6ID0+XG4gICAgICAgIGlmIEBpc0VuYWJsZWRcbiAgICAgICAgICBAY29weUNodW5rVG9MZWZ0KClcbiAgICAgICdzcGxpdC1kaWZmOmRpc2FibGUnOiA9PiBAZGlzYWJsZSgpXG4gICAgICAnc3BsaXQtZGlmZjppZ25vcmUtd2hpdGVzcGFjZSc6ID0+IEB0b2dnbGVJZ25vcmVXaGl0ZXNwYWNlKClcbiAgICAgICdzcGxpdC1kaWZmOnRvZ2dsZSc6ID0+IEB0b2dnbGUoKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGRpc2FibGUoKVxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gICMgY2FsbGVkIGJ5IFwidG9nZ2xlXCIgY29tbWFuZFxuICAjIHRvZ2dsZXMgc3BsaXQgZGlmZlxuICB0b2dnbGU6IC0+XG4gICAgaWYgQGlzRW5hYmxlZFxuICAgICAgQGRpc2FibGUoKVxuICAgIGVsc2VcbiAgICAgIEBkaWZmUGFuZXMoKVxuXG4gICMgY2FsbGVkIGJ5IFwiRGlzYWJsZVwiIGNvbW1hbmRcbiAgIyByZW1vdmVzIGRpZmYgYW5kIHN5bmMgc2Nyb2xsLCBkaXNwb3NlcyBvZiBzdWJzY3JpcHRpb25zXG4gIGRpc2FibGU6ICgpIC0+XG4gICAgQGlzRW5hYmxlZCA9IGZhbHNlXG5cbiAgICAjIHJlbW92ZSBsaXN0ZW5lcnNcbiAgICBpZiBAZWRpdG9yU3Vic2NyaXB0aW9ucz9cbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgICAgQGVkaXRvclN1YnNjcmlwdGlvbnMgPSBudWxsXG5cbiAgICBpZiBAZGlmZlZpZXdFZGl0b3IxP1xuICAgICAgaWYgQHdhc0VkaXRvcjFDcmVhdGVkXG4gICAgICAgIEBkaWZmVmlld0VkaXRvcjEuY2xlYW5VcCgpXG5cbiAgICBpZiBAZGlmZlZpZXdFZGl0b3IyP1xuICAgICAgaWYgQHdhc0VkaXRvcjJDcmVhdGVkXG4gICAgICAgIEBkaWZmVmlld0VkaXRvcjIuY2xlYW5VcCgpXG5cbiAgICAjIHJlbW92ZSBib3R0b20gcGFuZWxcbiAgICBpZiBAZm9vdGVyVmlldz9cbiAgICAgIEBmb290ZXJWaWV3LmRlc3Ryb3koKVxuICAgICAgQGZvb3RlclZpZXcgPSBudWxsXG5cbiAgICBAX2NsZWFyRGlmZigpXG5cbiAgICAjIHJlc2V0IGFsbCB2YXJpYWJsZXNcbiAgICBAZGlmZkNodW5rUG9pbnRlciA9IDBcbiAgICBAaXNGaXJzdENodW5rU2VsZWN0ID0gdHJ1ZVxuICAgIEB3YXNFZGl0b3IxQ3JlYXRlZCA9IGZhbHNlXG4gICAgQHdhc0VkaXRvcjJDcmVhdGVkID0gZmFsc2VcbiAgICBAaGFzR2l0UmVwbyA9IGZhbHNlXG5cbiAgIyBjYWxsZWQgYnkgXCJ0b2dnbGUgaWdub3JlIHdoaXRlc3BhY2VcIiBjb21tYW5kXG4gICMgdG9nZ2xlcyBpZ25vcmluZyB3aGl0ZXNwYWNlIGFuZCByZWZyZXNoZXMgdGhlIGRpZmZcbiAgdG9nZ2xlSWdub3JlV2hpdGVzcGFjZTogLT5cbiAgICBpc1doaXRlc3BhY2VJZ25vcmVkID0gQF9nZXRDb25maWcoJ2lnbm9yZVdoaXRlc3BhY2UnKVxuICAgIEBfc2V0Q29uZmlnKCdpZ25vcmVXaGl0ZXNwYWNlJywgIWlzV2hpdGVzcGFjZUlnbm9yZWQpXG5cbiAgIyBjYWxsZWQgYnkgXCJNb3ZlIHRvIG5leHQgZGlmZlwiIGNvbW1hbmRcbiAgbmV4dERpZmY6IC0+XG4gICAgaWYgQGRpZmZWaWV3RWRpdG9yMSAmJiBAZGlmZlZpZXdFZGl0b3IyXG4gICAgICBpZiAhQGlzRmlyc3RDaHVua1NlbGVjdFxuICAgICAgICBAZGlmZkNodW5rUG9pbnRlcisrXG4gICAgICAgIGlmIEBkaWZmQ2h1bmtQb2ludGVyID49IEBsaW5rZWREaWZmQ2h1bmtzLmxlbmd0aFxuICAgICAgICAgIEBkaWZmQ2h1bmtQb2ludGVyID0gMFxuICAgICAgZWxzZVxuICAgICAgICBAaXNGaXJzdENodW5rU2VsZWN0ID0gZmFsc2VcblxuICAgICAgQF9zZWxlY3REaWZmcyhAbGlua2VkRGlmZkNodW5rc1tAZGlmZkNodW5rUG9pbnRlcl0sIEBkaWZmQ2h1bmtQb2ludGVyKVxuXG4gICMgY2FsbGVkIGJ5IFwiTW92ZSB0byBwcmV2aW91cyBkaWZmXCIgY29tbWFuZFxuICBwcmV2RGlmZjogLT5cbiAgICBpZiBAZGlmZlZpZXdFZGl0b3IxICYmIEBkaWZmVmlld0VkaXRvcjJcbiAgICAgIGlmICFAaXNGaXJzdENodW5rU2VsZWN0XG4gICAgICAgIEBkaWZmQ2h1bmtQb2ludGVyLS1cbiAgICAgICAgaWYgQGRpZmZDaHVua1BvaW50ZXIgPCAwXG4gICAgICAgICAgQGRpZmZDaHVua1BvaW50ZXIgPSBAbGlua2VkRGlmZkNodW5rcy5sZW5ndGggLSAxXG4gICAgICBlbHNlXG4gICAgICAgIEBpc0ZpcnN0Q2h1bmtTZWxlY3QgPSBmYWxzZVxuXG4gICAgICBAX3NlbGVjdERpZmZzKEBsaW5rZWREaWZmQ2h1bmtzW0BkaWZmQ2h1bmtQb2ludGVyXSwgQGRpZmZDaHVua1BvaW50ZXIpXG5cbiAgY29weUNodW5rVG9SaWdodDogLT5cbiAgICBpZiBAZGlmZlZpZXdFZGl0b3IxICYmIEBkaWZmVmlld0VkaXRvcjJcbiAgICAgIGxpbmVzVG9Nb3ZlID0gQGRpZmZWaWV3RWRpdG9yMS5nZXRDdXJzb3JEaWZmTGluZXMoKVxuXG4gICAgICBpZiBsaW5lc1RvTW92ZS5sZW5ndGggPT0gMFxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnU3BsaXQgRGlmZicsIHtkZXRhaWw6IEBjb3B5SGVscE1zZywgZGlzbWlzc2FibGU6IGZhbHNlLCBpY29uOiAnZGlmZid9KVxuXG4gICAgICBvZmZzZXQgPSAwICMga2VlcCB0cmFjayBvZiBsaW5lIG9mZnNldCAodXNlZCB3aGVuIHRoZXJlIGFyZSBtdWx0aXBsZSBjaHVua3MgYmVpbmcgbW92ZWQpXG4gICAgICBmb3IgbGluZVJhbmdlIGluIGxpbmVzVG9Nb3ZlXG4gICAgICAgIGZvciBkaWZmQ2h1bmsgaW4gQGxpbmtlZERpZmZDaHVua3NcbiAgICAgICAgICBpZiBsaW5lUmFuZ2Uuc3RhcnQucm93ID09IGRpZmZDaHVuay5vbGRMaW5lU3RhcnRcbiAgICAgICAgICAgIG1vdmVUZXh0ID0gQGRpZmZWaWV3RWRpdG9yMS5nZXRFZGl0b3IoKS5nZXRUZXh0SW5CdWZmZXJSYW5nZShbW2RpZmZDaHVuay5vbGRMaW5lU3RhcnQsIDBdLCBbZGlmZkNodW5rLm9sZExpbmVFbmQsIDBdXSlcbiAgICAgICAgICAgIGxhc3RCdWZmZXJSb3cgPSBAZGlmZlZpZXdFZGl0b3IyLmdldEVkaXRvcigpLmdldExhc3RCdWZmZXJSb3coKVxuICAgICAgICAgICAgIyBpbnNlcnQgbmV3IGxpbmUgaWYgdGhlIGNodW5rIHdlIHdhbnQgdG8gY29weSB3aWxsIGJlIGJlbG93IHRoZSBsYXN0IGxpbmUgb2YgdGhlIG90aGVyIGVkaXRvclxuICAgICAgICAgICAgaWYgKGRpZmZDaHVuay5uZXdMaW5lU3RhcnQgKyBvZmZzZXQpID4gbGFzdEJ1ZmZlclJvd1xuICAgICAgICAgICAgICBAZGlmZlZpZXdFZGl0b3IyLmdldEVkaXRvcigpLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtsYXN0QnVmZmVyUm93LCAwXSwge2F1dG9zY3JvbGw6IGZhbHNlfSlcbiAgICAgICAgICAgICAgQGRpZmZWaWV3RWRpdG9yMi5nZXRFZGl0b3IoKS5pbnNlcnROZXdsaW5lKClcbiAgICAgICAgICAgIEBkaWZmVmlld0VkaXRvcjIuZ2V0RWRpdG9yKCkuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW1tkaWZmQ2h1bmsubmV3TGluZVN0YXJ0ICsgb2Zmc2V0LCAwXSwgW2RpZmZDaHVuay5uZXdMaW5lRW5kICsgb2Zmc2V0LCAwXV0sIG1vdmVUZXh0KVxuICAgICAgICAgICAgIyBvZmZzZXQgd2lsbCBiZSB0aGUgYW1vdW50IG9mIGxpbmVzIHRvIGJlIGNvcGllZCBtaW51cyB0aGUgYW1vdW50IG9mIGxpbmVzIG92ZXJ3cml0dGVuXG4gICAgICAgICAgICBvZmZzZXQgKz0gKGRpZmZDaHVuay5vbGRMaW5lRW5kIC0gZGlmZkNodW5rLm9sZExpbmVTdGFydCkgLSAoZGlmZkNodW5rLm5ld0xpbmVFbmQgLSBkaWZmQ2h1bmsubmV3TGluZVN0YXJ0KVxuICAgICAgICAgICAgIyBtb3ZlIHRoZSBzZWxlY3Rpb24gcG9pbnRlciBiYWNrIHNvIHRoZSBuZXh0IGRpZmYgY2h1bmsgaXMgbm90IHNraXBwZWRcbiAgICAgICAgICAgIGlmIEBkaWZmVmlld0VkaXRvcjEuaGFzU2VsZWN0aW9uKCkgfHwgQGRpZmZWaWV3RWRpdG9yMi5oYXNTZWxlY3Rpb24oKVxuICAgICAgICAgICAgICBAZGlmZkNodW5rUG9pbnRlci0tXG5cbiAgY29weUNodW5rVG9MZWZ0OiAtPlxuICAgIGlmIEBkaWZmVmlld0VkaXRvcjEgJiYgQGRpZmZWaWV3RWRpdG9yMlxuICAgICAgbGluZXNUb01vdmUgPSBAZGlmZlZpZXdFZGl0b3IyLmdldEN1cnNvckRpZmZMaW5lcygpXG5cbiAgICAgIGlmIGxpbmVzVG9Nb3ZlLmxlbmd0aCA9PSAwXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdTcGxpdCBEaWZmJywge2RldGFpbDogQGNvcHlIZWxwTXNnLCBkaXNtaXNzYWJsZTogZmFsc2UsIGljb246ICdkaWZmJ30pXG5cbiAgICAgIG9mZnNldCA9IDAgIyBrZWVwIHRyYWNrIG9mIGxpbmUgb2Zmc2V0ICh1c2VkIHdoZW4gdGhlcmUgYXJlIG11bHRpcGxlIGNodW5rcyBiZWluZyBtb3ZlZClcbiAgICAgIGZvciBsaW5lUmFuZ2UgaW4gbGluZXNUb01vdmVcbiAgICAgICAgZm9yIGRpZmZDaHVuayBpbiBAbGlua2VkRGlmZkNodW5rc1xuICAgICAgICAgIGlmIGxpbmVSYW5nZS5zdGFydC5yb3cgPT0gZGlmZkNodW5rLm5ld0xpbmVTdGFydFxuICAgICAgICAgICAgbW92ZVRleHQgPSBAZGlmZlZpZXdFZGl0b3IyLmdldEVkaXRvcigpLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtbZGlmZkNodW5rLm5ld0xpbmVTdGFydCwgMF0sIFtkaWZmQ2h1bmsubmV3TGluZUVuZCwgMF1dKVxuICAgICAgICAgICAgbGFzdEJ1ZmZlclJvdyA9IEBkaWZmVmlld0VkaXRvcjEuZ2V0RWRpdG9yKCkuZ2V0TGFzdEJ1ZmZlclJvdygpXG4gICAgICAgICAgICAjIGluc2VydCBuZXcgbGluZSBpZiB0aGUgY2h1bmsgd2Ugd2FudCB0byBjb3B5IHdpbGwgYmUgYmVsb3cgdGhlIGxhc3QgbGluZSBvZiB0aGUgb3RoZXIgZWRpdG9yXG4gICAgICAgICAgICBpZiAoZGlmZkNodW5rLm9sZExpbmVTdGFydCArIG9mZnNldCkgPiBsYXN0QnVmZmVyUm93XG4gICAgICAgICAgICAgIEBkaWZmVmlld0VkaXRvcjEuZ2V0RWRpdG9yKCkuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2xhc3RCdWZmZXJSb3csIDBdLCB7YXV0b3Njcm9sbDogZmFsc2V9KVxuICAgICAgICAgICAgICBAZGlmZlZpZXdFZGl0b3IxLmdldEVkaXRvcigpLmluc2VydE5ld2xpbmUoKVxuICAgICAgICAgICAgQGRpZmZWaWV3RWRpdG9yMS5nZXRFZGl0b3IoKS5zZXRUZXh0SW5CdWZmZXJSYW5nZShbW2RpZmZDaHVuay5vbGRMaW5lU3RhcnQgKyBvZmZzZXQsIDBdLCBbZGlmZkNodW5rLm9sZExpbmVFbmQgKyBvZmZzZXQsIDBdXSwgbW92ZVRleHQpXG4gICAgICAgICAgICAjIG9mZnNldCB3aWxsIGJlIHRoZSBhbW91bnQgb2YgbGluZXMgdG8gYmUgY29waWVkIG1pbnVzIHRoZSBhbW91bnQgb2YgbGluZXMgb3ZlcndyaXR0ZW5cbiAgICAgICAgICAgIG9mZnNldCArPSAoZGlmZkNodW5rLm5ld0xpbmVFbmQgLSBkaWZmQ2h1bmsubmV3TGluZVN0YXJ0KSAtIChkaWZmQ2h1bmsub2xkTGluZUVuZCAtIGRpZmZDaHVuay5vbGRMaW5lU3RhcnQpXG4gICAgICAgICAgICAjIG1vdmUgdGhlIHNlbGVjdGlvbiBwb2ludGVyIGJhY2sgc28gdGhlIG5leHQgZGlmZiBjaHVuayBpcyBub3Qgc2tpcHBlZFxuICAgICAgICAgICAgaWYgQGRpZmZWaWV3RWRpdG9yMS5oYXNTZWxlY3Rpb24oKSB8fCBAZGlmZlZpZXdFZGl0b3IyLmhhc1NlbGVjdGlvbigpXG4gICAgICAgICAgICAgIEBkaWZmQ2h1bmtQb2ludGVyLS1cblxuICAjIGNhbGxlZCBieSB0aGUgY29tbWFuZHMgZW5hYmxlL3RvZ2dsZSB0byBkbyBpbml0aWFsIGRpZmZcbiAgIyBzZXRzIHVwIHN1YnNjcmlwdGlvbnMgZm9yIGF1dG8gZGlmZiBhbmQgZGlzYWJsaW5nIHdoZW4gYSBwYW5lIGlzIGRlc3Ryb3llZFxuICBkaWZmUGFuZXM6IC0+XG4gICAgIyBpbiBjYXNlIGVuYWJsZSB3YXMgY2FsbGVkIGFnYWluXG4gICAgQGRpc2FibGUoKVxuXG4gICAgQGVkaXRvclN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBlZGl0b3JzID0gQF9nZXRWaXNpYmxlRWRpdG9ycygpXG5cbiAgICAjIGFkZCBsaXN0ZW5lcnNcbiAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IxLm9uRGlkU3RvcENoYW5naW5nID0+XG4gICAgICBAdXBkYXRlRGlmZihlZGl0b3JzKVxuICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBlZGl0b3JzLmVkaXRvcjIub25EaWRTdG9wQ2hhbmdpbmcgPT5cbiAgICAgIEB1cGRhdGVEaWZmKGVkaXRvcnMpXG4gICAgQGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGVkaXRvcnMuZWRpdG9yMS5vbkRpZERlc3Ryb3kgPT5cbiAgICAgIEBkaXNhYmxlKClcbiAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IyLm9uRGlkRGVzdHJveSA9PlxuICAgICAgQGRpc2FibGUoKVxuICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnc3BsaXQtZGlmZicsICgpID0+XG4gICAgICBAdXBkYXRlRGlmZihlZGl0b3JzKVxuXG4gICAgaXNXaGl0ZXNwYWNlSWdub3JlZCA9IEBfZ2V0Q29uZmlnKCdpZ25vcmVXaGl0ZXNwYWNlJylcblxuICAgICMgYWRkIHRoZSBib3R0b20gVUkgcGFuZWxcbiAgICBpZiAhQGZvb3RlclZpZXc/XG4gICAgICBAZm9vdGVyVmlldyA9IG5ldyBGb290ZXJWaWV3KGlzV2hpdGVzcGFjZUlnbm9yZWQpXG4gICAgICBAZm9vdGVyVmlldy5jcmVhdGVQYW5lbCgpXG4gICAgQGZvb3RlclZpZXcuc2hvdygpXG5cbiAgICAjIHVwZGF0ZSBkaWZmIGlmIHRoZXJlIGlzIG5vIGdpdCByZXBvIChubyBvbmNoYW5nZSBmaXJlZClcbiAgICBpZiAhQGhhc0dpdFJlcG9cbiAgICAgIEB1cGRhdGVEaWZmKGVkaXRvcnMpXG5cbiAgICAjIGFkZCBhcHBsaWNhdGlvbiBtZW51IGl0ZW1zXG4gICAgQGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGF0b20ubWVudS5hZGQgW1xuICAgICAge1xuICAgICAgICAnbGFiZWwnOiAnUGFja2FnZXMnXG4gICAgICAgICdzdWJtZW51JzogW1xuICAgICAgICAgICdsYWJlbCc6ICdTcGxpdCBEaWZmJ1xuICAgICAgICAgICdzdWJtZW51JzogW1xuICAgICAgICAgICAgeyAnbGFiZWwnOiAnSWdub3JlIFdoaXRlc3BhY2UnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOmlnbm9yZS13aGl0ZXNwYWNlJyB9XG4gICAgICAgICAgICB7ICdsYWJlbCc6ICdNb3ZlIHRvIE5leHQgRGlmZicsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6bmV4dC1kaWZmJyB9XG4gICAgICAgICAgICB7ICdsYWJlbCc6ICdNb3ZlIHRvIFByZXZpb3VzIERpZmYnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOnByZXYtZGlmZicgfVxuICAgICAgICAgICAgeyAnbGFiZWwnOiAnQ29weSB0byBSaWdodCcsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6Y29weS10by1yaWdodCd9XG4gICAgICAgICAgICB7ICdsYWJlbCc6ICdDb3B5IHRvIExlZnQnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOmNvcHktdG8tbGVmdCd9XG4gICAgICAgICAgXVxuICAgICAgICBdXG4gICAgICB9XG4gICAgXVxuICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbnRleHRNZW51LmFkZCB7XG4gICAgICAnYXRvbS10ZXh0LWVkaXRvcic6IFt7XG4gICAgICAgICdsYWJlbCc6ICdTcGxpdCBEaWZmJyxcbiAgICAgICAgJ3N1Ym1lbnUnOiBbXG4gICAgICAgICAgeyAnbGFiZWwnOiAnSWdub3JlIFdoaXRlc3BhY2UnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOmlnbm9yZS13aGl0ZXNwYWNlJyB9XG4gICAgICAgICAgeyAnbGFiZWwnOiAnTW92ZSB0byBOZXh0IERpZmYnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOm5leHQtZGlmZicgfVxuICAgICAgICAgIHsgJ2xhYmVsJzogJ01vdmUgdG8gUHJldmlvdXMgRGlmZicsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6cHJldi1kaWZmJyB9XG4gICAgICAgICAgeyAnbGFiZWwnOiAnQ29weSB0byBSaWdodCcsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6Y29weS10by1yaWdodCd9XG4gICAgICAgICAgeyAnbGFiZWwnOiAnQ29weSB0byBMZWZ0JywgJ2NvbW1hbmQnOiAnc3BsaXQtZGlmZjpjb3B5LXRvLWxlZnQnfVxuICAgICAgICBdXG4gICAgICB9XVxuICAgIH1cblxuICAjIGNhbGxlZCBieSBib3RoIGRpZmZQYW5lcyBhbmQgdGhlIGVkaXRvciBzdWJzY3JpcHRpb24gdG8gdXBkYXRlIHRoZSBkaWZmXG4gIHVwZGF0ZURpZmY6IChlZGl0b3JzKSAtPlxuICAgIEBpc0VuYWJsZWQgPSB0cnVlXG5cbiAgICBpZiBAcHJvY2Vzcz9cbiAgICAgIEBwcm9jZXNzLmtpbGwoKVxuICAgICAgQHByb2Nlc3MgPSBudWxsXG5cbiAgICBpc1doaXRlc3BhY2VJZ25vcmVkID0gQF9nZXRDb25maWcoJ2lnbm9yZVdoaXRlc3BhY2UnKVxuXG4gICAgZWRpdG9yUGF0aHMgPSBAX2NyZWF0ZVRlbXBGaWxlcyhlZGl0b3JzKVxuXG4gICAgIyBjcmVhdGUgdGhlIGxvYWRpbmcgdmlldyBpZiBpdCBkb2Vzbid0IGV4aXN0IHlldFxuICAgIGlmICFAbG9hZGluZ1ZpZXc/XG4gICAgICBAbG9hZGluZ1ZpZXcgPSBuZXcgTG9hZGluZ1ZpZXcoKVxuICAgICAgQGxvYWRpbmdWaWV3LmNyZWF0ZU1vZGFsKClcbiAgICBAbG9hZGluZ1ZpZXcuc2hvdygpXG5cbiAgICAjIC0tLSBraWNrIG9mZiBiYWNrZ3JvdW5kIHByb2Nlc3MgdG8gY29tcHV0ZSBkaWZmIC0tLVxuICAgIHtCdWZmZXJlZE5vZGVQcm9jZXNzfSA9IHJlcXVpcmUgJ2F0b20nXG4gICAgY29tbWFuZCA9IHBhdGgucmVzb2x2ZSBfX2Rpcm5hbWUsIFwiLi9jb21wdXRlLWRpZmYuanNcIlxuICAgIGFyZ3MgPSBbZWRpdG9yUGF0aHMuZWRpdG9yMVBhdGgsIGVkaXRvclBhdGhzLmVkaXRvcjJQYXRoLCBpc1doaXRlc3BhY2VJZ25vcmVkXVxuICAgIGNvbXB1dGVkRGlmZiA9ICcnXG4gICAgdGhlT3V0cHV0ID0gJydcbiAgICBzdGRvdXQgPSAob3V0cHV0KSA9PlxuICAgICAgdGhlT3V0cHV0ID0gb3V0cHV0XG4gICAgICBjb21wdXRlZERpZmYgPSBKU09OLnBhcnNlKG91dHB1dClcbiAgICAgIEBwcm9jZXNzLmtpbGwoKVxuICAgICAgQHByb2Nlc3MgPSBudWxsXG4gICAgICBAbG9hZGluZ1ZpZXc/LmhpZGUoKVxuICAgICAgQF9yZXN1bWVVcGRhdGVEaWZmKGVkaXRvcnMsIGNvbXB1dGVkRGlmZilcbiAgICBzdGRlcnIgPSAoZXJyKSA9PlxuICAgICAgdGhlT3V0cHV0ID0gZXJyXG4gICAgZXhpdCA9IChjb2RlKSA9PlxuICAgICAgQGxvYWRpbmdWaWV3Py5oaWRlKClcblxuICAgICAgaWYgY29kZSAhPSAwXG4gICAgICAgIGNvbnNvbGUubG9nKCdCdWZmZXJlZE5vZGVQcm9jZXNzIGNvZGUgd2FzICcgKyBjb2RlKVxuICAgICAgICBjb25zb2xlLmxvZyh0aGVPdXRwdXQpXG4gICAgQHByb2Nlc3MgPSBuZXcgQnVmZmVyZWROb2RlUHJvY2Vzcyh7Y29tbWFuZCwgYXJncywgc3Rkb3V0LCBzdGRlcnIsIGV4aXR9KVxuICAgICMgLS0tIGtpY2sgb2ZmIGJhY2tncm91bmQgcHJvY2VzcyB0byBjb21wdXRlIGRpZmYgLS0tXG5cbiAgIyByZXN1bWVzIGFmdGVyIHRoZSBjb21wdXRlIGRpZmYgcHJvY2VzcyByZXR1cm5zXG4gIF9yZXN1bWVVcGRhdGVEaWZmOiAoZWRpdG9ycywgY29tcHV0ZWREaWZmKSAtPlxuICAgIEBsaW5rZWREaWZmQ2h1bmtzID0gQF9ldmFsdWF0ZURpZmZPcmRlcihjb21wdXRlZERpZmYuY2h1bmtzKVxuICAgIEBmb290ZXJWaWV3Py5zZXROdW1EaWZmZXJlbmNlcyhAbGlua2VkRGlmZkNodW5rcy5sZW5ndGgpXG5cbiAgICAjIG1ha2UgdGhlIGxhc3QgY2h1bmsgZXF1YWwgc2l6ZSBvbiBib3RoIHNjcmVlbnMgc28gdGhlIGVkaXRvcnMgcmV0YWluIHN5bmMgc2Nyb2xsICM1OFxuICAgIGlmIEBsaW5rZWREaWZmQ2h1bmtzLmxlbmd0aCA+IDBcbiAgICAgIGxhc3REaWZmQ2h1bmsgPSBAbGlua2VkRGlmZkNodW5rc1tAbGlua2VkRGlmZkNodW5rcy5sZW5ndGgtMV1cbiAgICAgIG9sZENodW5rUmFuZ2UgPSBsYXN0RGlmZkNodW5rLm9sZExpbmVFbmQgLSBsYXN0RGlmZkNodW5rLm9sZExpbmVTdGFydFxuICAgICAgbmV3Q2h1bmtSYW5nZSA9IGxhc3REaWZmQ2h1bmsubmV3TGluZUVuZCAtIGxhc3REaWZmQ2h1bmsubmV3TGluZVN0YXJ0XG4gICAgICBpZiBvbGRDaHVua1JhbmdlID4gbmV3Q2h1bmtSYW5nZVxuICAgICAgICAjIG1ha2UgdGhlIG9mZnNldCBhcyBsYXJnZSBhcyBuZWVkZWQgdG8gbWFrZSB0aGUgY2h1bmsgdGhlIHNhbWUgc2l6ZSBpbiBib3RoIGVkaXRvcnNcbiAgICAgICAgY29tcHV0ZWREaWZmLm5ld0xpbmVPZmZzZXRzW2xhc3REaWZmQ2h1bmsubmV3TGluZVN0YXJ0ICsgbmV3Q2h1bmtSYW5nZV0gPSBvbGRDaHVua1JhbmdlIC0gbmV3Q2h1bmtSYW5nZVxuICAgICAgZWxzZSBpZiBuZXdDaHVua1JhbmdlID4gb2xkQ2h1bmtSYW5nZVxuICAgICAgICAjIG1ha2UgdGhlIG9mZnNldCBhcyBsYXJnZSBhcyBuZWVkZWQgdG8gbWFrZSB0aGUgY2h1bmsgdGhlIHNhbWUgc2l6ZSBpbiBib3RoIGVkaXRvcnNcbiAgICAgICAgY29tcHV0ZWREaWZmLm9sZExpbmVPZmZzZXRzW2xhc3REaWZmQ2h1bmsub2xkTGluZVN0YXJ0ICsgb2xkQ2h1bmtSYW5nZV0gPSBuZXdDaHVua1JhbmdlIC0gb2xkQ2h1bmtSYW5nZVxuXG4gICAgQF9jbGVhckRpZmYoKVxuICAgIEBfZGlzcGxheURpZmYoZWRpdG9ycywgY29tcHV0ZWREaWZmKVxuXG4gICAgaXNXb3JkRGlmZkVuYWJsZWQgPSBAX2dldENvbmZpZygnZGlmZldvcmRzJylcbiAgICBpZiBpc1dvcmREaWZmRW5hYmxlZFxuICAgICAgQF9oaWdobGlnaHRXb3JkRGlmZihAbGlua2VkRGlmZkNodW5rcylcblxuICAgIHNjcm9sbFN5bmNUeXBlID0gQF9nZXRDb25maWcoJ3Njcm9sbFN5bmNUeXBlJylcbiAgICBpZiBzY3JvbGxTeW5jVHlwZSA9PSAnVmVydGljYWwgKyBIb3Jpem9udGFsJ1xuICAgICAgQHN5bmNTY3JvbGwgPSBuZXcgU3luY1Njcm9sbChlZGl0b3JzLmVkaXRvcjEsIGVkaXRvcnMuZWRpdG9yMiwgdHJ1ZSlcbiAgICAgIEBzeW5jU2Nyb2xsLnN5bmNQb3NpdGlvbnMoKVxuICAgIGVsc2UgaWYgc2Nyb2xsU3luY1R5cGUgPT0gJ1ZlcnRpY2FsJ1xuICAgICAgQHN5bmNTY3JvbGwgPSBuZXcgU3luY1Njcm9sbChlZGl0b3JzLmVkaXRvcjEsIGVkaXRvcnMuZWRpdG9yMiwgZmFsc2UpXG4gICAgICBAc3luY1Njcm9sbC5zeW5jUG9zaXRpb25zKClcblxuICAjIGdldHMgdHdvIHZpc2libGUgZWRpdG9yc1xuICAjIGF1dG8gb3BlbnMgbmV3IGVkaXRvcnMgc28gdGhlcmUgYXJlIHR3byB0byBkaWZmIHdpdGhcbiAgX2dldFZpc2libGVFZGl0b3JzOiAtPlxuICAgIGVkaXRvcjEgPSBudWxsXG4gICAgZWRpdG9yMiA9IG51bGxcblxuICAgIHBhbmVzID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVxuICAgIGZvciBwIGluIHBhbmVzXG4gICAgICBhY3RpdmVJdGVtID0gcC5nZXRBY3RpdmVJdGVtKClcbiAgICAgIGlmIGF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvcihhY3RpdmVJdGVtKVxuICAgICAgICBpZiBlZGl0b3IxID09IG51bGxcbiAgICAgICAgICBlZGl0b3IxID0gYWN0aXZlSXRlbVxuICAgICAgICBlbHNlIGlmIGVkaXRvcjIgPT0gbnVsbFxuICAgICAgICAgIGVkaXRvcjIgPSBhY3RpdmVJdGVtXG4gICAgICAgICAgYnJlYWtcblxuICAgICMgYXV0byBvcGVuIGVkaXRvciBwYW5lcyBzbyB3ZSBoYXZlIHR3byB0byBkaWZmIHdpdGhcbiAgICBpZiBlZGl0b3IxID09IG51bGxcbiAgICAgIGVkaXRvcjEgPSBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3IoKVxuICAgICAgQHdhc0VkaXRvcjFDcmVhdGVkID0gdHJ1ZVxuICAgICAgbGVmdFBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICAgIGxlZnRQYW5lLmFkZEl0ZW0oZWRpdG9yMSlcbiAgICBpZiBlZGl0b3IyID09IG51bGxcbiAgICAgIGVkaXRvcjIgPSBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3IoKVxuICAgICAgQHdhc0VkaXRvcjJDcmVhdGVkID0gdHJ1ZVxuICAgICAgZWRpdG9yMi5zZXRHcmFtbWFyKGVkaXRvcjEuZ2V0R3JhbW1hcigpKVxuICAgICAgcmlnaHRQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLnNwbGl0UmlnaHQoKVxuICAgICAgcmlnaHRQYW5lLmFkZEl0ZW0oZWRpdG9yMilcblxuICAgIEJ1ZmZlckV4dGVuZGVyID0gcmVxdWlyZSAnLi9idWZmZXItZXh0ZW5kZXInXG4gICAgYnVmZmVyMUxpbmVFbmRpbmcgPSAobmV3IEJ1ZmZlckV4dGVuZGVyKGVkaXRvcjEuZ2V0QnVmZmVyKCkpKS5nZXRMaW5lRW5kaW5nKClcblxuICAgIGlmIEB3YXNFZGl0b3IyQ3JlYXRlZFxuICAgICAgIyB3YW50IHRvIHNjcm9sbCBhIG5ld2x5IGNyZWF0ZWQgZWRpdG9yIHRvIHRoZSBmaXJzdCBlZGl0b3IncyBwb3NpdGlvblxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcjEpLmZvY3VzKClcbiAgICAgICMgc2V0IHRoZSBwcmVmZXJyZWQgbGluZSBlbmRpbmcgYmVmb3JlIGluc2VydGluZyB0ZXh0ICMzOVxuICAgICAgaWYgYnVmZmVyMUxpbmVFbmRpbmcgPT0gJ1xcbicgfHwgYnVmZmVyMUxpbmVFbmRpbmcgPT0gJ1xcclxcbidcbiAgICAgICAgQGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGVkaXRvcjIub25XaWxsSW5zZXJ0VGV4dCAoKSAtPlxuICAgICAgICAgIGVkaXRvcjIuZ2V0QnVmZmVyKCkuc2V0UHJlZmVycmVkTGluZUVuZGluZyhidWZmZXIxTGluZUVuZGluZylcblxuICAgIEBfc2V0dXBHaXRSZXBvKGVkaXRvcjEsIGVkaXRvcjIpXG5cbiAgICAjIHVuZm9sZCBhbGwgbGluZXMgc28gZGlmZnMgcHJvcGVybHkgYWxpZ25cbiAgICBlZGl0b3IxLnVuZm9sZEFsbCgpXG4gICAgZWRpdG9yMi51bmZvbGRBbGwoKVxuXG4gICAgc2hvdWxkTm90aWZ5ID0gIUBfZ2V0Q29uZmlnKCdtdXRlTm90aWZpY2F0aW9ucycpXG4gICAgc29mdFdyYXBNc2cgPSAnV2FybmluZzogU29mdCB3cmFwIGVuYWJsZWQhIChMaW5lIGRpZmZzIG1heSBub3QgYWxpZ24pJ1xuICAgIGlmIGVkaXRvcjEuaXNTb2Z0V3JhcHBlZCgpICYmIHNob3VsZE5vdGlmeVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ1NwbGl0IERpZmYnLCB7ZGV0YWlsOiBzb2Z0V3JhcE1zZywgZGlzbWlzc2FibGU6IGZhbHNlLCBpY29uOiAnZGlmZid9KVxuICAgIGVsc2UgaWYgZWRpdG9yMi5pc1NvZnRXcmFwcGVkKCkgJiYgc2hvdWxkTm90aWZ5XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnU3BsaXQgRGlmZicsIHtkZXRhaWw6IHNvZnRXcmFwTXNnLCBkaXNtaXNzYWJsZTogZmFsc2UsIGljb246ICdkaWZmJ30pXG5cbiAgICBidWZmZXIyTGluZUVuZGluZyA9IChuZXcgQnVmZmVyRXh0ZW5kZXIoZWRpdG9yMi5nZXRCdWZmZXIoKSkpLmdldExpbmVFbmRpbmcoKVxuICAgIGlmIGJ1ZmZlcjJMaW5lRW5kaW5nICE9ICcnICYmIChidWZmZXIxTGluZUVuZGluZyAhPSBidWZmZXIyTGluZUVuZGluZykgJiYgc2hvdWxkTm90aWZ5XG4gICAgICAjIHBvcCB3YXJuaW5nIGlmIHRoZSBsaW5lIGVuZGluZ3MgZGlmZmVyIGFuZCB3ZSBoYXZlbid0IGRvbmUgYW55dGhpbmcgYWJvdXQgaXRcbiAgICAgIGxpbmVFbmRpbmdNc2cgPSAnV2FybmluZzogTGluZSBlbmRpbmdzIGRpZmZlciEnXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnU3BsaXQgRGlmZicsIHtkZXRhaWw6IGxpbmVFbmRpbmdNc2csIGRpc21pc3NhYmxlOiBmYWxzZSwgaWNvbjogJ2RpZmYnfSlcblxuICAgIGVkaXRvcnMgPVxuICAgICAgZWRpdG9yMTogZWRpdG9yMVxuICAgICAgZWRpdG9yMjogZWRpdG9yMlxuXG4gICAgcmV0dXJuIGVkaXRvcnNcblxuICBfc2V0dXBHaXRSZXBvOiAoZWRpdG9yMSwgZWRpdG9yMikgLT5cbiAgICBlZGl0b3IxUGF0aCA9IGVkaXRvcjEuZ2V0UGF0aCgpXG4gICAgIyBvbmx5IHNob3cgZ2l0IGNoYW5nZXMgaWYgdGhlIHJpZ2h0IGVkaXRvciBpcyBlbXB0eVxuICAgIGlmIGVkaXRvcjFQYXRoPyAmJiAoZWRpdG9yMi5nZXRMaW5lQ291bnQoKSA9PSAxICYmIGVkaXRvcjIubGluZVRleHRGb3JCdWZmZXJSb3coMCkgPT0gJycpXG4gICAgICBmb3IgZGlyZWN0b3J5LCBpIGluIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpXG4gICAgICAgIGlmIGVkaXRvcjFQYXRoIGlzIGRpcmVjdG9yeS5nZXRQYXRoKCkgb3IgZGlyZWN0b3J5LmNvbnRhaW5zKGVkaXRvcjFQYXRoKVxuICAgICAgICAgIHByb2plY3RSZXBvID0gYXRvbS5wcm9qZWN0LmdldFJlcG9zaXRvcmllcygpW2ldXG4gICAgICAgICAgaWYgcHJvamVjdFJlcG8/ICYmIHByb2plY3RSZXBvLnJlcG8/XG4gICAgICAgICAgICByZWxhdGl2ZUVkaXRvcjFQYXRoID0gcHJvamVjdFJlcG8ucmVsYXRpdml6ZShlZGl0b3IxUGF0aClcbiAgICAgICAgICAgIGdpdEhlYWRUZXh0ID0gcHJvamVjdFJlcG8ucmVwby5nZXRIZWFkQmxvYihyZWxhdGl2ZUVkaXRvcjFQYXRoKVxuICAgICAgICAgICAgaWYgZ2l0SGVhZFRleHQ/XG4gICAgICAgICAgICAgIGVkaXRvcjIuc2VsZWN0QWxsKClcbiAgICAgICAgICAgICAgZWRpdG9yMi5pbnNlcnRUZXh0KGdpdEhlYWRUZXh0KVxuICAgICAgICAgICAgICBAaGFzR2l0UmVwbyA9IHRydWVcbiAgICAgICAgICAgICAgYnJlYWtcblxuICAjIGNyZWF0ZXMgdGVtcCBmaWxlcyBzbyB0aGUgY29tcHV0ZSBkaWZmIHByb2Nlc3MgY2FuIGdldCB0aGUgdGV4dCBlYXNpbHlcbiAgX2NyZWF0ZVRlbXBGaWxlczogKGVkaXRvcnMpIC0+XG4gICAgZWRpdG9yMVBhdGggPSAnJ1xuICAgIGVkaXRvcjJQYXRoID0gJydcbiAgICB0ZW1wRm9sZGVyUGF0aCA9IGF0b20uZ2V0Q29uZmlnRGlyUGF0aCgpICsgJy9zcGxpdC1kaWZmJ1xuXG4gICAgZWRpdG9yMVBhdGggPSB0ZW1wRm9sZGVyUGF0aCArICcvc3BsaXQtZGlmZiAxJ1xuICAgIGVkaXRvcjFUZW1wRmlsZSA9IG5ldyBGaWxlKGVkaXRvcjFQYXRoKVxuICAgIGVkaXRvcjFUZW1wRmlsZS53cml0ZVN5bmMoZWRpdG9ycy5lZGl0b3IxLmdldFRleHQoKSlcblxuICAgIGVkaXRvcjJQYXRoID0gdGVtcEZvbGRlclBhdGggKyAnL3NwbGl0LWRpZmYgMidcbiAgICBlZGl0b3IyVGVtcEZpbGUgPSBuZXcgRmlsZShlZGl0b3IyUGF0aClcbiAgICBlZGl0b3IyVGVtcEZpbGUud3JpdGVTeW5jKGVkaXRvcnMuZWRpdG9yMi5nZXRUZXh0KCkpXG5cbiAgICBlZGl0b3JQYXRocyA9XG4gICAgICBlZGl0b3IxUGF0aDogZWRpdG9yMVBhdGhcbiAgICAgIGVkaXRvcjJQYXRoOiBlZGl0b3IyUGF0aFxuXG4gICAgcmV0dXJuIGVkaXRvclBhdGhzXG5cbiAgX3NlbGVjdERpZmZzOiAoZGlmZkNodW5rLCBzZWxlY3Rpb25Db3VudCkgLT5cbiAgICBpZiBkaWZmQ2h1bms/XG4gICAgICAjIGRlc2VsZWN0IHByZXZpb3VzIG5leHQvcHJldiBoaWdobGlnaHRzXG4gICAgICBAZGlmZlZpZXdFZGl0b3IxLmRlc2VsZWN0QWxsTGluZXMoKVxuICAgICAgQGRpZmZWaWV3RWRpdG9yMi5kZXNlbGVjdEFsbExpbmVzKClcbiAgICAgICMgaGlnaGxpZ2h0IGFuZCBzY3JvbGwgZWRpdG9yIDFcbiAgICAgIEBkaWZmVmlld0VkaXRvcjEuc2VsZWN0TGluZXMoZGlmZkNodW5rLm9sZExpbmVTdGFydCwgZGlmZkNodW5rLm9sZExpbmVFbmQpXG4gICAgICBAZGlmZlZpZXdFZGl0b3IxLmdldEVkaXRvcigpLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtkaWZmQ2h1bmsub2xkTGluZVN0YXJ0LCAwXSwge2F1dG9zY3JvbGw6IHRydWV9KVxuICAgICAgIyBoaWdobGlnaHQgYW5kIHNjcm9sbCBlZGl0b3IgMlxuICAgICAgQGRpZmZWaWV3RWRpdG9yMi5zZWxlY3RMaW5lcyhkaWZmQ2h1bmsubmV3TGluZVN0YXJ0LCBkaWZmQ2h1bmsubmV3TGluZUVuZClcbiAgICAgIEBkaWZmVmlld0VkaXRvcjIuZ2V0RWRpdG9yKCkuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2RpZmZDaHVuay5uZXdMaW5lU3RhcnQsIDBdLCB7YXV0b3Njcm9sbDogdHJ1ZX0pXG4gICAgICAjIHVwZGF0ZSBzZWxlY3Rpb24gY291bnRlclxuICAgICAgQGZvb3RlclZpZXcuc2hvd1NlbGVjdGlvbkNvdW50KHNlbGVjdGlvbkNvdW50KzEpXG5cbiAgIyByZW1vdmVzIGRpZmYgYW5kIHN5bmMgc2Nyb2xsXG4gIF9jbGVhckRpZmY6IC0+XG4gICAgQGxvYWRpbmdWaWV3Py5oaWRlKClcblxuICAgIGlmIEBkaWZmVmlld0VkaXRvcjE/XG4gICAgICBAZGlmZlZpZXdFZGl0b3IxLmRlc3Ryb3koKVxuICAgICAgQGRpZmZWaWV3RWRpdG9yMSA9IG51bGxcblxuICAgIGlmIEBkaWZmVmlld0VkaXRvcjI/XG4gICAgICBAZGlmZlZpZXdFZGl0b3IyLmRlc3Ryb3koKVxuICAgICAgQGRpZmZWaWV3RWRpdG9yMiA9IG51bGxcblxuICAgIGlmIEBzeW5jU2Nyb2xsP1xuICAgICAgQHN5bmNTY3JvbGwuZGlzcG9zZSgpXG4gICAgICBAc3luY1Njcm9sbCA9IG51bGxcblxuICAjIGRpc3BsYXlzIHRoZSBkaWZmIHZpc3VhbGx5IGluIHRoZSBlZGl0b3JzXG4gIF9kaXNwbGF5RGlmZjogKGVkaXRvcnMsIGNvbXB1dGVkRGlmZikgLT5cbiAgICBAZGlmZlZpZXdFZGl0b3IxID0gbmV3IERpZmZWaWV3RWRpdG9yKGVkaXRvcnMuZWRpdG9yMSlcbiAgICBAZGlmZlZpZXdFZGl0b3IyID0gbmV3IERpZmZWaWV3RWRpdG9yKGVkaXRvcnMuZWRpdG9yMilcblxuICAgIGxlZnRDb2xvciA9IEBfZ2V0Q29uZmlnKCdsZWZ0RWRpdG9yQ29sb3InKVxuICAgIHJpZ2h0Q29sb3IgPSBAX2dldENvbmZpZygncmlnaHRFZGl0b3JDb2xvcicpXG4gICAgaWYgbGVmdENvbG9yID09ICdncmVlbidcbiAgICAgIEBkaWZmVmlld0VkaXRvcjEuc2V0TGluZUhpZ2hsaWdodHMoY29tcHV0ZWREaWZmLnJlbW92ZWRMaW5lcywgJ2FkZGVkJylcbiAgICBlbHNlXG4gICAgICBAZGlmZlZpZXdFZGl0b3IxLnNldExpbmVIaWdobGlnaHRzKGNvbXB1dGVkRGlmZi5yZW1vdmVkTGluZXMsICdyZW1vdmVkJylcbiAgICBpZiByaWdodENvbG9yID09ICdncmVlbidcbiAgICAgIEBkaWZmVmlld0VkaXRvcjIuc2V0TGluZUhpZ2hsaWdodHMoY29tcHV0ZWREaWZmLmFkZGVkTGluZXMsICdhZGRlZCcpXG4gICAgZWxzZVxuICAgICAgQGRpZmZWaWV3RWRpdG9yMi5zZXRMaW5lSGlnaGxpZ2h0cyhjb21wdXRlZERpZmYuYWRkZWRMaW5lcywgJ3JlbW92ZWQnKVxuXG4gICAgQGRpZmZWaWV3RWRpdG9yMS5zZXRMaW5lT2Zmc2V0cyhjb21wdXRlZERpZmYub2xkTGluZU9mZnNldHMpXG4gICAgQGRpZmZWaWV3RWRpdG9yMi5zZXRMaW5lT2Zmc2V0cyhjb21wdXRlZERpZmYubmV3TGluZU9mZnNldHMpXG5cbiAgIyBwdXRzIHRoZSBjaHVua3MgaW50byBvcmRlciBzbyBuZXh0RGlmZiBhbmQgcHJldkRpZmYgYXJlIGluIG9yZGVyXG4gIF9ldmFsdWF0ZURpZmZPcmRlcjogKGNodW5rcykgLT5cbiAgICBvbGRMaW5lTnVtYmVyID0gMFxuICAgIG5ld0xpbmVOdW1iZXIgPSAwXG4gICAgcHJldkNodW5rID0gbnVsbFxuICAgICMgbWFwcGluZyBvZiBjaHVua3MgYmV0d2VlbiB0aGUgdHdvIHBhbmVzXG4gICAgZGlmZkNodW5rcyA9IFtdXG5cbiAgICBmb3IgYyBpbiBjaHVua3NcbiAgICAgIGlmIGMuYWRkZWQ/XG4gICAgICAgIGlmIHByZXZDaHVuaz8gJiYgcHJldkNodW5rLnJlbW92ZWQ/XG4gICAgICAgICAgZGlmZkNodW5rID1cbiAgICAgICAgICAgIG5ld0xpbmVTdGFydDogbmV3TGluZU51bWJlclxuICAgICAgICAgICAgbmV3TGluZUVuZDogbmV3TGluZU51bWJlciArIGMuY291bnRcbiAgICAgICAgICAgIG9sZExpbmVTdGFydDogb2xkTGluZU51bWJlciAtIHByZXZDaHVuay5jb3VudFxuICAgICAgICAgICAgb2xkTGluZUVuZDogb2xkTGluZU51bWJlclxuICAgICAgICAgIGRpZmZDaHVua3MucHVzaChkaWZmQ2h1bmspXG4gICAgICAgICAgcHJldkNodW5rID0gbnVsbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgcHJldkNodW5rID0gY1xuXG4gICAgICAgIG5ld0xpbmVOdW1iZXIgKz0gYy5jb3VudFxuICAgICAgZWxzZSBpZiBjLnJlbW92ZWQ/XG4gICAgICAgIGlmIHByZXZDaHVuaz8gJiYgcHJldkNodW5rLmFkZGVkP1xuICAgICAgICAgIGRpZmZDaHVuayA9XG4gICAgICAgICAgICBuZXdMaW5lU3RhcnQ6IG5ld0xpbmVOdW1iZXIgLSBwcmV2Q2h1bmsuY291bnRcbiAgICAgICAgICAgIG5ld0xpbmVFbmQ6IG5ld0xpbmVOdW1iZXJcbiAgICAgICAgICAgIG9sZExpbmVTdGFydDogb2xkTGluZU51bWJlclxuICAgICAgICAgICAgb2xkTGluZUVuZDogb2xkTGluZU51bWJlciArIGMuY291bnRcbiAgICAgICAgICBkaWZmQ2h1bmtzLnB1c2goZGlmZkNodW5rKVxuICAgICAgICAgIHByZXZDaHVuayA9IG51bGxcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHByZXZDaHVuayA9IGNcblxuICAgICAgICBvbGRMaW5lTnVtYmVyICs9IGMuY291bnRcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgcHJldkNodW5rPyAmJiBwcmV2Q2h1bmsuYWRkZWQ/XG4gICAgICAgICAgZGlmZkNodW5rID1cbiAgICAgICAgICAgIG5ld0xpbmVTdGFydDogKG5ld0xpbmVOdW1iZXIgLSBwcmV2Q2h1bmsuY291bnQpXG4gICAgICAgICAgICBuZXdMaW5lRW5kOiBuZXdMaW5lTnVtYmVyXG4gICAgICAgICAgICBvbGRMaW5lU3RhcnQ6IG9sZExpbmVOdW1iZXJcbiAgICAgICAgICAgIG9sZExpbmVFbmQ6IG9sZExpbmVOdW1iZXJcbiAgICAgICAgICBkaWZmQ2h1bmtzLnB1c2goZGlmZkNodW5rKVxuICAgICAgICBlbHNlIGlmIHByZXZDaHVuaz8gJiYgcHJldkNodW5rLnJlbW92ZWQ/XG4gICAgICAgICAgZGlmZkNodW5rID1cbiAgICAgICAgICAgIG5ld0xpbmVTdGFydDogbmV3TGluZU51bWJlclxuICAgICAgICAgICAgbmV3TGluZUVuZDogbmV3TGluZU51bWJlclxuICAgICAgICAgICAgb2xkTGluZVN0YXJ0OiAob2xkTGluZU51bWJlciAtIHByZXZDaHVuay5jb3VudClcbiAgICAgICAgICAgIG9sZExpbmVFbmQ6IG9sZExpbmVOdW1iZXJcbiAgICAgICAgICBkaWZmQ2h1bmtzLnB1c2goZGlmZkNodW5rKVxuXG4gICAgICAgIHByZXZDaHVuayA9IG51bGxcbiAgICAgICAgb2xkTGluZU51bWJlciArPSBjLmNvdW50XG4gICAgICAgIG5ld0xpbmVOdW1iZXIgKz0gYy5jb3VudFxuXG4gICAgIyBhZGQgdGhlIHByZXZDaHVuayBpZiB0aGUgbG9vcCBmaW5pc2hlZFxuICAgIGlmIHByZXZDaHVuaz8gJiYgcHJldkNodW5rLmFkZGVkP1xuICAgICAgZGlmZkNodW5rID1cbiAgICAgICAgbmV3TGluZVN0YXJ0OiAobmV3TGluZU51bWJlciAtIHByZXZDaHVuay5jb3VudClcbiAgICAgICAgbmV3TGluZUVuZDogbmV3TGluZU51bWJlclxuICAgICAgICBvbGRMaW5lU3RhcnQ6IG9sZExpbmVOdW1iZXJcbiAgICAgICAgb2xkTGluZUVuZDogb2xkTGluZU51bWJlclxuICAgICAgZGlmZkNodW5rcy5wdXNoKGRpZmZDaHVuaylcbiAgICBlbHNlIGlmIHByZXZDaHVuaz8gJiYgcHJldkNodW5rLnJlbW92ZWQ/XG4gICAgICBkaWZmQ2h1bmsgPVxuICAgICAgICBuZXdMaW5lU3RhcnQ6IG5ld0xpbmVOdW1iZXJcbiAgICAgICAgbmV3TGluZUVuZDogbmV3TGluZU51bWJlclxuICAgICAgICBvbGRMaW5lU3RhcnQ6IChvbGRMaW5lTnVtYmVyIC0gcHJldkNodW5rLmNvdW50KVxuICAgICAgICBvbGRMaW5lRW5kOiBvbGRMaW5lTnVtYmVyXG4gICAgICBkaWZmQ2h1bmtzLnB1c2goZGlmZkNodW5rKVxuXG4gICAgcmV0dXJuIGRpZmZDaHVua3NcblxuICAjIGhpZ2hsaWdodHMgdGhlIHdvcmQgZGlmZmVyZW5jZXMgYmV0d2VlbiBsaW5lc1xuICBfaGlnaGxpZ2h0V29yZERpZmY6IChjaHVua3MpIC0+XG4gICAgQ29tcHV0ZVdvcmREaWZmID0gcmVxdWlyZSAnLi9jb21wdXRlLXdvcmQtZGlmZidcbiAgICBsZWZ0Q29sb3IgPSBAX2dldENvbmZpZygnbGVmdEVkaXRvckNvbG9yJylcbiAgICByaWdodENvbG9yID0gQF9nZXRDb25maWcoJ3JpZ2h0RWRpdG9yQ29sb3InKVxuICAgIGlzV2hpdGVzcGFjZUlnbm9yZWQgPSBAX2dldENvbmZpZygnaWdub3JlV2hpdGVzcGFjZScpXG4gICAgZm9yIGMgaW4gY2h1bmtzXG4gICAgICAjIG1ha2Ugc3VyZSB0aGlzIGNodW5rIG1hdGNoZXMgdG8gYW5vdGhlclxuICAgICAgaWYgYy5uZXdMaW5lU3RhcnQ/ICYmIGMub2xkTGluZVN0YXJ0P1xuICAgICAgICBsaW5lUmFuZ2UgPSAwXG4gICAgICAgIGV4Y2Vzc0xpbmVzID0gMFxuICAgICAgICBpZiAoYy5uZXdMaW5lRW5kIC0gYy5uZXdMaW5lU3RhcnQpIDwgKGMub2xkTGluZUVuZCAtIGMub2xkTGluZVN0YXJ0KVxuICAgICAgICAgIGxpbmVSYW5nZSA9IGMubmV3TGluZUVuZCAtIGMubmV3TGluZVN0YXJ0XG4gICAgICAgICAgZXhjZXNzTGluZXMgPSAoYy5vbGRMaW5lRW5kIC0gYy5vbGRMaW5lU3RhcnQpIC0gbGluZVJhbmdlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBsaW5lUmFuZ2UgPSBjLm9sZExpbmVFbmQgLSBjLm9sZExpbmVTdGFydFxuICAgICAgICAgIGV4Y2Vzc0xpbmVzID0gKGMubmV3TGluZUVuZCAtIGMubmV3TGluZVN0YXJ0KSAtIGxpbmVSYW5nZVxuICAgICAgICAjIGZpZ3VyZSBvdXQgZGlmZiBiZXR3ZWVuIGxpbmVzIGFuZCBoaWdobGlnaHRcbiAgICAgICAgZm9yIGkgaW4gWzAgLi4uIGxpbmVSYW5nZV0gYnkgMVxuICAgICAgICAgIHdvcmREaWZmID0gQ29tcHV0ZVdvcmREaWZmLmNvbXB1dGVXb3JkRGlmZihAZGlmZlZpZXdFZGl0b3IxLmdldEVkaXRvcigpLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGMub2xkTGluZVN0YXJ0ICsgaSksIEBkaWZmVmlld0VkaXRvcjIuZ2V0RWRpdG9yKCkubGluZVRleHRGb3JCdWZmZXJSb3coYy5uZXdMaW5lU3RhcnQgKyBpKSlcbiAgICAgICAgICBpZiBsZWZ0Q29sb3IgPT0gJ2dyZWVuJ1xuICAgICAgICAgICAgQGRpZmZWaWV3RWRpdG9yMS5zZXRXb3JkSGlnaGxpZ2h0cyhjLm9sZExpbmVTdGFydCArIGksIHdvcmREaWZmLnJlbW92ZWRXb3JkcywgJ2FkZGVkJywgaXNXaGl0ZXNwYWNlSWdub3JlZClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZGlmZlZpZXdFZGl0b3IxLnNldFdvcmRIaWdobGlnaHRzKGMub2xkTGluZVN0YXJ0ICsgaSwgd29yZERpZmYucmVtb3ZlZFdvcmRzLCAncmVtb3ZlZCcsIGlzV2hpdGVzcGFjZUlnbm9yZWQpXG4gICAgICAgICAgaWYgcmlnaHRDb2xvciA9PSAnZ3JlZW4nXG4gICAgICAgICAgICBAZGlmZlZpZXdFZGl0b3IyLnNldFdvcmRIaWdobGlnaHRzKGMubmV3TGluZVN0YXJ0ICsgaSwgd29yZERpZmYuYWRkZWRXb3JkcywgJ2FkZGVkJywgaXNXaGl0ZXNwYWNlSWdub3JlZClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZGlmZlZpZXdFZGl0b3IyLnNldFdvcmRIaWdobGlnaHRzKGMubmV3TGluZVN0YXJ0ICsgaSwgd29yZERpZmYuYWRkZWRXb3JkcywgJ3JlbW92ZWQnLCBpc1doaXRlc3BhY2VJZ25vcmVkKVxuICAgICAgICAjIGZ1bGx5IGhpZ2hsaWdodCBleHRyYSBsaW5lc1xuICAgICAgICBmb3IgaiBpbiBbMCAuLi4gZXhjZXNzTGluZXNdIGJ5IDFcbiAgICAgICAgICAjIGNoZWNrIHdoZXRoZXIgZXhjZXNzIGxpbmUgaXMgaW4gZWRpdG9yMSBvciBlZGl0b3IyXG4gICAgICAgICAgaWYgKGMubmV3TGluZUVuZCAtIGMubmV3TGluZVN0YXJ0KSA8IChjLm9sZExpbmVFbmQgLSBjLm9sZExpbmVTdGFydClcbiAgICAgICAgICAgIGlmIGxlZnRDb2xvciA9PSAnZ3JlZW4nXG4gICAgICAgICAgICAgIEBkaWZmVmlld0VkaXRvcjEuc2V0V29yZEhpZ2hsaWdodHMoYy5vbGRMaW5lU3RhcnQgKyBsaW5lUmFuZ2UgKyBqLCBbe2NoYW5nZWQ6IHRydWUsIHZhbHVlOiBAZGlmZlZpZXdFZGl0b3IxLmdldEVkaXRvcigpLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGMub2xkTGluZVN0YXJ0ICsgbGluZVJhbmdlICsgail9XSwgJ2FkZGVkJywgaXNXaGl0ZXNwYWNlSWdub3JlZClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgQGRpZmZWaWV3RWRpdG9yMS5zZXRXb3JkSGlnaGxpZ2h0cyhjLm9sZExpbmVTdGFydCArIGxpbmVSYW5nZSArIGosIFt7Y2hhbmdlZDogdHJ1ZSwgdmFsdWU6IEBkaWZmVmlld0VkaXRvcjEuZ2V0RWRpdG9yKCkubGluZVRleHRGb3JCdWZmZXJSb3coYy5vbGRMaW5lU3RhcnQgKyBsaW5lUmFuZ2UgKyBqKX1dLCAncmVtb3ZlZCcsIGlzV2hpdGVzcGFjZUlnbm9yZWQpXG4gICAgICAgICAgZWxzZSBpZiAoYy5uZXdMaW5lRW5kIC0gYy5uZXdMaW5lU3RhcnQpID4gKGMub2xkTGluZUVuZCAtIGMub2xkTGluZVN0YXJ0KVxuICAgICAgICAgICAgaWYgcmlnaHRDb2xvciA9PSAnZ3JlZW4nXG4gICAgICAgICAgICAgIEBkaWZmVmlld0VkaXRvcjIuc2V0V29yZEhpZ2hsaWdodHMoYy5uZXdMaW5lU3RhcnQgKyBsaW5lUmFuZ2UgKyBqLCBbe2NoYW5nZWQ6IHRydWUsIHZhbHVlOiBAZGlmZlZpZXdFZGl0b3IyLmdldEVkaXRvcigpLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGMubmV3TGluZVN0YXJ0ICsgbGluZVJhbmdlICsgail9XSwgJ2FkZGVkJywgaXNXaGl0ZXNwYWNlSWdub3JlZClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgQGRpZmZWaWV3RWRpdG9yMi5zZXRXb3JkSGlnaGxpZ2h0cyhjLm5ld0xpbmVTdGFydCArIGxpbmVSYW5nZSArIGosIFt7Y2hhbmdlZDogdHJ1ZSwgdmFsdWU6IEBkaWZmVmlld0VkaXRvcjIuZ2V0RWRpdG9yKCkubGluZVRleHRGb3JCdWZmZXJSb3coYy5uZXdMaW5lU3RhcnQgKyBsaW5lUmFuZ2UgKyBqKX1dLCAncmVtb3ZlZCcsIGlzV2hpdGVzcGFjZUlnbm9yZWQpXG4gICAgICBlbHNlIGlmIGMubmV3TGluZVN0YXJ0P1xuICAgICAgICAjIGZ1bGx5IGhpZ2hsaWdodCBjaHVua3MgdGhhdCBkb24ndCBtYXRjaCB1cCB0byBhbm90aGVyXG4gICAgICAgIGxpbmVSYW5nZSA9IGMubmV3TGluZUVuZCAtIGMubmV3TGluZVN0YXJ0XG4gICAgICAgIGZvciBpIGluIFswIC4uLiBsaW5lUmFuZ2VdIGJ5IDFcbiAgICAgICAgICBpZiByaWdodENvbG9yID09ICdncmVlbidcbiAgICAgICAgICAgIEBkaWZmVmlld0VkaXRvcjIuc2V0V29yZEhpZ2hsaWdodHMoYy5uZXdMaW5lU3RhcnQgKyBpLCBbe2NoYW5nZWQ6IHRydWUsIHZhbHVlOiBAZGlmZlZpZXdFZGl0b3IyLmdldEVkaXRvcigpLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGMubmV3TGluZVN0YXJ0ICsgaSl9XSwgJ2FkZGVkJywgaXNXaGl0ZXNwYWNlSWdub3JlZClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZGlmZlZpZXdFZGl0b3IyLnNldFdvcmRIaWdobGlnaHRzKGMubmV3TGluZVN0YXJ0ICsgaSwgW3tjaGFuZ2VkOiB0cnVlLCB2YWx1ZTogQGRpZmZWaWV3RWRpdG9yMi5nZXRFZGl0b3IoKS5saW5lVGV4dEZvckJ1ZmZlclJvdyhjLm5ld0xpbmVTdGFydCArIGkpfV0sICdyZW1vdmVkJywgaXNXaGl0ZXNwYWNlSWdub3JlZClcbiAgICAgIGVsc2UgaWYgYy5vbGRMaW5lU3RhcnQ/XG4gICAgICAgICMgZnVsbHkgaGlnaGxpZ2h0IGNodW5rcyB0aGF0IGRvbid0IG1hdGNoIHVwIHRvIGFub3RoZXJcbiAgICAgICAgbGluZVJhbmdlID0gYy5vbGRMaW5lRW5kIC0gYy5vbGRMaW5lU3RhcnRcbiAgICAgICAgZm9yIGkgaW4gWzAgLi4uIGxpbmVSYW5nZV0gYnkgMVxuICAgICAgICAgIGlmIGxlZnRDb2xvciA9PSAnZ3JlZW4nXG4gICAgICAgICAgICBAZGlmZlZpZXdFZGl0b3IxLnNldFdvcmRIaWdobGlnaHRzKGMub2xkTGluZVN0YXJ0ICsgaSwgW3tjaGFuZ2VkOiB0cnVlLCB2YWx1ZTogQGRpZmZWaWV3RWRpdG9yMS5nZXRFZGl0b3IoKS5saW5lVGV4dEZvckJ1ZmZlclJvdyhjLm9sZExpbmVTdGFydCArIGkpfV0sICdhZGRlZCcsIGlzV2hpdGVzcGFjZUlnbm9yZWQpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGRpZmZWaWV3RWRpdG9yMS5zZXRXb3JkSGlnaGxpZ2h0cyhjLm9sZExpbmVTdGFydCArIGksIFt7Y2hhbmdlZDogdHJ1ZSwgdmFsdWU6IEBkaWZmVmlld0VkaXRvcjEuZ2V0RWRpdG9yKCkubGluZVRleHRGb3JCdWZmZXJSb3coYy5vbGRMaW5lU3RhcnQgKyBpKX1dLCAncmVtb3ZlZCcsIGlzV2hpdGVzcGFjZUlnbm9yZWQpXG5cblxuICBfZ2V0Q29uZmlnOiAoY29uZmlnKSAtPlxuICAgIGF0b20uY29uZmlnLmdldChcInNwbGl0LWRpZmYuI3tjb25maWd9XCIpXG5cbiAgX3NldENvbmZpZzogKGNvbmZpZywgdmFsdWUpIC0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwic3BsaXQtZGlmZi4je2NvbmZpZ31cIiwgdmFsdWUpXG4iXX0=
