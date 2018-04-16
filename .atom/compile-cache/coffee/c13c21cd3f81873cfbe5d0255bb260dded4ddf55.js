(function() {
  var CompositeDisposable, DiffView, Directory, File, FooterView, LoadingView, SplitDiff, StyleCalculator, SyncScroll, configSchema, path, ref;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Directory = ref.Directory, File = ref.File;

  DiffView = require('./diff-view');

  LoadingView = require('./ui/loading-view');

  FooterView = require('./ui/footer-view');

  SyncScroll = require('./sync-scroll');

  StyleCalculator = require('./style-calculator');

  configSchema = require('./config-schema');

  path = require('path');

  module.exports = SplitDiff = {
    diffView: null,
    config: configSchema,
    subscriptions: null,
    editorSubscriptions: null,
    isEnabled: false,
    wasEditor1Created: false,
    wasEditor2Created: false,
    wasEditor1SoftWrapped: false,
    wasEditor2SoftWrapped: false,
    hasGitRepo: false,
    docksToReopen: {
      left: false,
      right: false,
      bottom: false
    },
    process: null,
    splitDiffResolves: [],
    options: {},
    activate: function(state) {
      var styleCalculator;
      this.contextForService = this;
      styleCalculator = new StyleCalculator(atom.styles, atom.config);
      styleCalculator.startWatching('split-diff-custom-styles', ['split-diff.colors.addedColor', 'split-diff.colors.removedColor'], function(config) {
        var addedColor, addedWordColor, removedColor, removedWordColor;
        addedColor = config.get('split-diff.colors.addedColor');
        addedColor.alpha = 0.4;
        addedWordColor = addedColor;
        addedWordColor.alpha = 0.5;
        removedColor = config.get('split-diff.colors.removedColor');
        removedColor.alpha = 0.4;
        removedWordColor = removedColor;
        removedWordColor.alpha = 0.5;
        return "\n .split-diff-added-custom {\n \tbackground-color: " + (addedColor.toRGBAString()) + ";\n }\n .split-diff-removed-custom {\n \tbackground-color: " + (removedColor.toRGBAString()) + ";\n }\n .split-diff-word-added-custom .region {\n \tbackground-color: " + (addedWordColor.toRGBAString()) + ";\n }\n .split-diff-word-removed-custom .region {\n \tbackground-color: " + (removedWordColor.toRGBAString()) + ";\n }\n";
      });
      this.subscriptions = new CompositeDisposable();
      return this.subscriptions.add(atom.commands.add('atom-workspace, .tree-view .selected, .tab.texteditor', {
        'split-diff:enable': (function(_this) {
          return function(e) {
            _this.diffPanes(e);
            return e.stopPropagation();
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
              return _this.copyToRight();
            }
          };
        })(this),
        'split-diff:copy-to-left': (function(_this) {
          return function() {
            if (_this.isEnabled) {
              return _this.copyToLeft();
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
      var hideDocks, ref1;
      this.isEnabled = false;
      if (this.editorSubscriptions != null) {
        this.editorSubscriptions.dispose();
        this.editorSubscriptions = null;
      }
      if (this.diffView != null) {
        if (this.wasEditor1Created) {
          this.diffView.cleanUpEditor(1);
        } else if (this.wasEditor1SoftWrapped) {
          this.diffView.restoreEditorSoftWrap(1);
        }
        if (this.wasEditor2Created) {
          this.diffView.cleanUpEditor(2);
        } else if (this.wasEditor2SoftWrapped) {
          this.diffView.restoreEditorSoftWrap(2);
        }
        this.diffView.destroy();
        this.diffView = null;
      }
      if (this.footerView != null) {
        this.footerView.destroy();
        this.footerView = null;
      }
      if (this.loadingView != null) {
        this.loadingView.destroy();
        this.loadingView = null;
      }
      if (this.syncScroll != null) {
        this.syncScroll.dispose();
        this.syncScroll = null;
      }
      hideDocks = (ref1 = this.options.hideDocks) != null ? ref1 : this._getConfig('hideDocks');
      if (hideDocks) {
        if (this.docksToReopen.left) {
          atom.workspace.getLeftDock().show();
        }
        if (this.docksToReopen.right) {
          atom.workspace.getRightDock().show();
        }
        if (this.docksToReopen.bottom) {
          atom.workspace.getBottomDock().show();
        }
      }
      this.docksToReopen = {
        left: false,
        right: false,
        bottom: false
      };
      this.wasEditor1Created = false;
      this.wasEditor2Created = false;
      this.wasEditor1SoftWrapped = false;
      this.wasEditor2SoftWrapped = false;
      return this.hasGitRepo = false;
    },
    toggleIgnoreWhitespace: function() {
      var ignoreWhitespace, ref1;
      if (!(this.options.ignoreWhitespace != null)) {
        ignoreWhitespace = this._getConfig('ignoreWhitespace');
        this._setConfig('ignoreWhitespace', !ignoreWhitespace);
        return (ref1 = this.footerView) != null ? ref1.setIgnoreWhitespace(!ignoreWhitespace) : void 0;
      }
    },
    nextDiff: function() {
      var isSyncScrollEnabled, ref1, ref2, scrollSyncType, selectedIndex;
      if (this.diffView != null) {
        isSyncScrollEnabled = false;
        scrollSyncType = (ref1 = this.options.scrollSyncType) != null ? ref1 : this._getConfig('scrollSyncType');
        if (scrollSyncType === 'Vertical + Horizontal' || scrollSyncType === 'Vertical') {
          isSyncScrollEnabled = true;
        }
        selectedIndex = this.diffView.nextDiff(isSyncScrollEnabled);
        return (ref2 = this.footerView) != null ? ref2.showSelectionCount(selectedIndex + 1) : void 0;
      }
    },
    prevDiff: function() {
      var isSyncScrollEnabled, ref1, ref2, scrollSyncType, selectedIndex;
      if (this.diffView != null) {
        isSyncScrollEnabled = false;
        scrollSyncType = (ref1 = this.options.scrollSyncType) != null ? ref1 : this._getConfig('scrollSyncType');
        if (scrollSyncType === 'Vertical + Horizontal' || scrollSyncType === 'Vertical') {
          isSyncScrollEnabled = true;
        }
        selectedIndex = this.diffView.prevDiff(isSyncScrollEnabled);
        return (ref2 = this.footerView) != null ? ref2.showSelectionCount(selectedIndex + 1) : void 0;
      }
    },
    copyToRight: function() {
      var ref1;
      if (this.diffView != null) {
        this.diffView.copyToRight();
        return (ref1 = this.footerView) != null ? ref1.hideSelectionCount() : void 0;
      }
    },
    copyToLeft: function() {
      var ref1;
      if (this.diffView != null) {
        this.diffView.copyToLeft();
        return (ref1 = this.footerView) != null ? ref1.hideSelectionCount() : void 0;
      }
    },
    diffPanes: function(event, editorsPromise, options) {
      var elemWithPath, params;
      if (options == null) {
        options = {};
      }
      this.options = options;
      if (!editorsPromise) {
        if ((event != null ? event.currentTarget.classList.contains('tab') : void 0) || (event != null ? event.currentTarget.classList.contains('file') : void 0)) {
          elemWithPath = event.currentTarget.querySelector('[data-path]');
          params = {};
          if (elemWithPath) {
            params.path = elemWithPath.dataset.path;
          } else if (event.currentTarget.item) {
            params.editor = event.currentTarget.item.copy();
          }
          this.disable();
          editorsPromise = this._getEditorsForDiffWithActive(params);
        } else {
          this.disable();
          editorsPromise = this._getEditorsForQuickDiff();
        }
      } else {
        this.disable();
      }
      return editorsPromise.then((function(editors) {
        var hideDocks, ignoreWhitespace, ref1, ref2;
        if (editors === null) {
          return;
        }
        this.editorSubscriptions = new CompositeDisposable();
        this._setupVisibleEditors(editors.editor1, editors.editor2);
        this.diffView = new DiffView(editors);
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
        this.editorSubscriptions.add(editors.editor1.onDidChangeCursorPosition((function(_this) {
          return function(event) {
            return _this.diffView.handleCursorChange(event.cursor, event.oldBufferPosition, event.newBufferPosition);
          };
        })(this)));
        this.editorSubscriptions.add(editors.editor2.onDidChangeCursorPosition((function(_this) {
          return function(event) {
            return _this.diffView.handleCursorChange(event.cursor, event.oldBufferPosition, event.newBufferPosition);
          };
        })(this)));
        this.editorSubscriptions.add(editors.editor1.onDidAddCursor((function(_this) {
          return function(cursor) {
            return _this.diffView.handleCursorChange(cursor, -1, cursor.getBufferPosition());
          };
        })(this)));
        this.editorSubscriptions.add(editors.editor2.onDidAddCursor((function(_this) {
          return function(cursor) {
            return _this.diffView.handleCursorChange(cursor, -1, cursor.getBufferPosition());
          };
        })(this)));
        if (this.footerView == null) {
          ignoreWhitespace = (ref1 = this.options.ignoreWhitespace) != null ? ref1 : this._getConfig('ignoreWhitespace');
          this.footerView = new FooterView(ignoreWhitespace, (this.options.ignoreWhitespace != null));
          this.footerView.createPanel();
        }
        this.footerView.show();
        hideDocks = (ref2 = this.options.hideDocks) != null ? ref2 : this._getConfig('hideDocks');
        if (hideDocks) {
          this.docksToReopen.left = atom.workspace.getLeftDock().isVisible();
          this.docksToReopen.right = atom.workspace.getRightDock().isVisible();
          this.docksToReopen.bottom = atom.workspace.getBottomDock().isVisible();
          atom.workspace.getLeftDock().hide();
          atom.workspace.getRightDock().hide();
          atom.workspace.getBottomDock().hide();
        }
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
      }).bind(this));
    },
    updateDiff: function(editors) {
      var BufferedNodeProcess, args, command, editorPaths, exit, ignoreWhitespace, ref1, stderr, stdout, theOutput;
      this.isEnabled = true;
      if (this.process != null) {
        this.process.kill();
        this.process = null;
      }
      ignoreWhitespace = (ref1 = this.options.ignoreWhitespace) != null ? ref1 : this._getConfig('ignoreWhitespace');
      editorPaths = this._createTempFiles(editors);
      if (this.loadingView == null) {
        this.loadingView = new LoadingView();
        this.loadingView.createModal();
      }
      this.loadingView.show();
      BufferedNodeProcess = require('atom').BufferedNodeProcess;
      command = path.resolve(__dirname, "./compute-diff.js");
      args = [editorPaths.editor1Path, editorPaths.editor2Path, ignoreWhitespace];
      theOutput = '';
      stdout = (function(_this) {
        return function(output) {
          var computedDiff, ref2;
          theOutput = output;
          computedDiff = JSON.parse(output);
          _this.process.kill();
          _this.process = null;
          if ((ref2 = _this.loadingView) != null) {
            ref2.hide();
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
          var ref2;
          if ((ref2 = _this.loadingView) != null) {
            ref2.hide();
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
      var addedColorSide, diffWords, ignoreWhitespace, overrideThemeColors, ref1, ref2, ref3, ref4, ref5, ref6, ref7, scrollSyncType;
      if (this.diffView == null) {
        return;
      }
      this.diffView.clearDiff();
      if (this.syncScroll != null) {
        this.syncScroll.dispose();
        this.syncScroll = null;
      }
      addedColorSide = (ref1 = this.options.addedColorSide) != null ? ref1 : this._getConfig('colors.addedColorSide');
      diffWords = (ref2 = this.options.diffWords) != null ? ref2 : this._getConfig('diffWords');
      ignoreWhitespace = (ref3 = this.options.ignoreWhitespace) != null ? ref3 : this._getConfig('ignoreWhitespace');
      overrideThemeColors = (ref4 = this.options.overrideThemeColors) != null ? ref4 : this._getConfig('colors.overrideThemeColors');
      this.diffView.displayDiff(computedDiff, addedColorSide, diffWords, ignoreWhitespace, overrideThemeColors);
      while ((ref5 = this.splitDiffResolves) != null ? ref5.length : void 0) {
        this.splitDiffResolves.pop()(this.diffView.getMarkerLayers());
      }
      if ((ref6 = this.footerView) != null) {
        ref6.setNumDifferences(this.diffView.getNumDifferences());
      }
      scrollSyncType = (ref7 = this.options.scrollSyncType) != null ? ref7 : this._getConfig('scrollSyncType');
      if (scrollSyncType === 'Vertical + Horizontal') {
        this.syncScroll = new SyncScroll(editors.editor1, editors.editor2, true);
        return this.syncScroll.syncPositions();
      } else if (scrollSyncType === 'Vertical') {
        this.syncScroll = new SyncScroll(editors.editor1, editors.editor2, false);
        return this.syncScroll.syncPositions();
      }
    },
    _getEditorsForQuickDiff: function() {
      var activeItem, editor1, editor2, j, len, p, panes, rightPaneIndex;
      editor1 = null;
      editor2 = null;
      panes = atom.workspace.getCenter().getPanes();
      for (j = 0, len = panes.length; j < len; j++) {
        p = panes[j];
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
        editor1 = atom.workspace.buildTextEditor({
          autoHeight: false
        });
        this.wasEditor1Created = true;
        panes[0].addItem(editor1);
        panes[0].activateItem(editor1);
      }
      if (editor2 === null) {
        editor2 = atom.workspace.buildTextEditor({
          autoHeight: false
        });
        this.wasEditor2Created = true;
        editor2.setGrammar(editor1.getGrammar());
        rightPaneIndex = panes.indexOf(atom.workspace.paneForItem(editor1)) + 1;
        if (panes[rightPaneIndex]) {
          panes[rightPaneIndex].addItem(editor2);
          panes[rightPaneIndex].activateItem(editor2);
        } else {
          atom.workspace.paneForItem(editor1).splitRight({
            items: [editor2]
          });
        }
      }
      return Promise.resolve({
        editor1: editor1,
        editor2: editor2
      });
    },
    _getEditorsForDiffWithActive: function(params) {
      var activeEditor, editor1, editor2, editor2Promise, editorWithoutPath, filePath, noActiveEditorMsg, panes, rightPane, rightPaneIndex;
      filePath = params.path;
      editorWithoutPath = params.editor;
      activeEditor = atom.workspace.getCenter().getActiveTextEditor();
      if (activeEditor != null) {
        editor1 = activeEditor;
        this.wasEditor2Created = true;
        panes = atom.workspace.getCenter().getPanes();
        rightPaneIndex = panes.indexOf(atom.workspace.paneForItem(editor1)) + 1;
        rightPane = panes[rightPaneIndex] || atom.workspace.paneForItem(editor1).splitRight();
        if (params.path) {
          filePath = params.path;
          if (editor1.getPath() === filePath) {
            filePath = null;
          }
          editor2Promise = atom.workspace.openURIInPane(filePath, rightPane);
          return editor2Promise.then(function(editor2) {
            return {
              editor1: editor1,
              editor2: editor2
            };
          });
        } else if (editorWithoutPath) {
          editor2 = editorWithoutPath.copy();
          rightPane.addItem(editor2);
          return Promise.resolve({
            editor1: editor1,
            editor2: editor2
          });
        }
      } else {
        noActiveEditorMsg = 'No active file found! (Try focusing a text editor)';
        atom.notifications.addWarning('Split Diff', {
          detail: noActiveEditorMsg,
          dismissable: false,
          icon: 'diff'
        });
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    },
    _setupVisibleEditors: function(editor1, editor2) {
      var BufferExtender, buffer1LineEnding, buffer2LineEnding, lineEndingMsg, muteNotifications, ref1, ref2, shouldNotify, softWrapMsg, turnOffSoftWrap;
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
      muteNotifications = (ref1 = this.options.muteNotifications) != null ? ref1 : this._getConfig('muteNotifications');
      turnOffSoftWrap = (ref2 = this.options.turnOffSoftWrap) != null ? ref2 : this._getConfig('turnOffSoftWrap');
      if (turnOffSoftWrap) {
        shouldNotify = false;
        if (editor1.isSoftWrapped()) {
          this.wasEditor1SoftWrapped = true;
          editor1.setSoftWrapped(false);
          shouldNotify = true;
        }
        if (editor2.isSoftWrapped()) {
          this.wasEditor2SoftWrapped = true;
          editor2.setSoftWrapped(false);
          shouldNotify = true;
        }
        if (shouldNotify && !muteNotifications) {
          softWrapMsg = 'Soft wrap automatically disabled so lines remain in sync.';
          atom.notifications.addWarning('Split Diff', {
            detail: softWrapMsg,
            dismissable: false,
            icon: 'diff'
          });
        }
      } else if (!muteNotifications && (editor1.isSoftWrapped() || editor2.isSoftWrapped())) {
        softWrapMsg = 'Warning: Soft wrap enabled! Lines may not align.\n(Try "Turn Off Soft Wrap" setting)';
        atom.notifications.addWarning('Split Diff', {
          detail: softWrapMsg,
          dismissable: false,
          icon: 'diff'
        });
      }
      buffer2LineEnding = (new BufferExtender(editor2.getBuffer())).getLineEnding();
      if (buffer2LineEnding !== '' && (buffer1LineEnding !== buffer2LineEnding) && editor1.getLineCount() !== 1 && editor2.getLineCount() !== 1 && !muteNotifications) {
        lineEndingMsg = 'Warning: Line endings differ!';
        return atom.notifications.addWarning('Split Diff', {
          detail: lineEndingMsg,
          dismissable: false,
          icon: 'diff'
        });
      }
    },
    _setupGitRepo: function(editor1, editor2) {
      var directory, editor1Path, gitHeadText, i, j, len, projectRepo, ref1, relativeEditor1Path, results;
      editor1Path = editor1.getPath();
      if ((editor1Path != null) && (editor2.getLineCount() === 1 && editor2.lineTextForBufferRow(0) === '')) {
        ref1 = atom.project.getDirectories();
        results = [];
        for (i = j = 0, len = ref1.length; j < len; i = ++j) {
          directory = ref1[i];
          if (editor1Path === directory.getPath() || directory.contains(editor1Path)) {
            projectRepo = atom.project.getRepositories()[i];
            if (projectRepo != null) {
              projectRepo = projectRepo.getRepo(editor1Path);
              relativeEditor1Path = projectRepo.relativize(editor1Path);
              gitHeadText = projectRepo.getHeadBlob(relativeEditor1Path);
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
    _getConfig: function(config) {
      return atom.config.get("split-diff." + config);
    },
    _setConfig: function(config, value) {
      return atom.config.set("split-diff." + config, value);
    },
    getMarkerLayers: function() {
      return new Promise((function(resolve, reject) {
        return this.splitDiffResolves.push(resolve);
      }).bind(this));
    },
    diffEditors: function(editor1, editor2, options) {
      return this.diffPanes(null, Promise.resolve({
        editor1: editor1,
        editor2: editor2
      }), options);
    },
    provideSplitDiff: function() {
      return {
        getMarkerLayers: this.getMarkerLayers.bind(this.contextForService),
        diffEditors: this.diffEditors.bind(this.contextForService),
        disable: this.disable.bind(this.contextForService)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL25vZWx3b3JkZW4vLmF0b20vcGFja2FnZXMvc3BsaXQtZGlmZi9saWIvc3BsaXQtZGlmZi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQXlDLE9BQUEsQ0FBUSxNQUFSLENBQXpDLEVBQUMsNkNBQUQsRUFBc0IseUJBQXRCLEVBQWlDOztFQUNqQyxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsV0FBQSxHQUFjLE9BQUEsQ0FBUSxtQkFBUjs7RUFDZCxVQUFBLEdBQWEsT0FBQSxDQUFRLGtCQUFSOztFQUNiLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUjs7RUFDYixlQUFBLEdBQWtCLE9BQUEsQ0FBUSxvQkFBUjs7RUFDbEIsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUjs7RUFDZixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQSxHQUNmO0lBQUEsUUFBQSxFQUFVLElBQVY7SUFDQSxNQUFBLEVBQVEsWUFEUjtJQUVBLGFBQUEsRUFBZSxJQUZmO0lBR0EsbUJBQUEsRUFBcUIsSUFIckI7SUFJQSxTQUFBLEVBQVcsS0FKWDtJQUtBLGlCQUFBLEVBQW1CLEtBTG5CO0lBTUEsaUJBQUEsRUFBbUIsS0FObkI7SUFPQSxxQkFBQSxFQUF1QixLQVB2QjtJQVFBLHFCQUFBLEVBQXVCLEtBUnZCO0lBU0EsVUFBQSxFQUFZLEtBVFo7SUFVQSxhQUFBLEVBQWU7TUFBQyxJQUFBLEVBQU0sS0FBUDtNQUFjLEtBQUEsRUFBTyxLQUFyQjtNQUE0QixNQUFBLEVBQVEsS0FBcEM7S0FWZjtJQVdBLE9BQUEsRUFBUyxJQVhUO0lBWUEsaUJBQUEsRUFBbUIsRUFabkI7SUFhQSxPQUFBLEVBQVMsRUFiVDtJQWVBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLGlCQUFELEdB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QixPQUFBLEVBQVMsT0FBNUI7T0FBaEIsQ0FBakIsRUFBd0UsT0FBeEU7SUFEVyxDQTFnQmI7SUE2Z0JBLGdCQUFBLEVBQWtCLFNBQUE7YUFDaEI7UUFBQSxlQUFBLEVBQWlCLElBQUMsQ0FBQSxlQUFlLENBQUMsSUFBakIsQ0FBc0IsSUFBQyxDQUFBLGlCQUF2QixDQUFqQjtRQUNBLFdBQUEsRUFBYSxJQUFDLENBQUEsV0FBVyxDQUFDLElBQWIsQ0FBa0IsSUFBQyxDQUFBLGlCQUFuQixDQURiO1FBRUEsT0FBQSxFQUFTLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQUMsQ0FBQSxpQkFBZixDQUZUOztJQURnQixDQTdnQmxCOztBQVZGIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpcmVjdG9yeSwgRmlsZX0gPSByZXF1aXJlICdhdG9tJ1xuRGlmZlZpZXcgPSByZXF1aXJlICcuL2RpZmYtdmlldydcbkxvYWRpbmdWaWV3ID0gcmVxdWlyZSAnLi91aS9sb2FkaW5nLXZpZXcnXG5Gb290ZXJWaWV3ID0gcmVxdWlyZSAnLi91aS9mb290ZXItdmlldydcblN5bmNTY3JvbGwgPSByZXF1aXJlICcuL3N5bmMtc2Nyb2xsJ1xuU3R5bGVDYWxjdWxhdG9yID0gcmVxdWlyZSAnLi9zdHlsZS1jYWxjdWxhdG9yJ1xuY29uZmlnU2NoZW1hID0gcmVxdWlyZSAnLi9jb25maWctc2NoZW1hJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbm1vZHVsZS5leHBvcnRzID0gU3BsaXREaWZmID1cbiAgZGlmZlZpZXc6IG51bGxcbiAgY29uZmlnOiBjb25maWdTY2hlbWFcbiAgc3Vic2NyaXB0aW9uczogbnVsbFxuICBlZGl0b3JTdWJzY3JpcHRpb25zOiBudWxsXG4gIGlzRW5hYmxlZDogZmFsc2VcbiAgd2FzRWRpdG9yMUNyZWF0ZWQ6IGZhbHNlXG4gIHdhc0VkaXRvcjJDcmVhdGVkOiBmYWxzZVxuICB3YXNFZGl0b3IxU29mdFdyYXBwZWQ6IGZhbHNlXG4gIHdhc0VkaXRvcjJTb2Z0V3JhcHBlZDogZmFsc2VcbiAgaGFzR2l0UmVwbzogZmFsc2VcbiAgZG9ja3NUb1Jlb3Blbjoge2xlZnQ6IGZhbHNlLCByaWdodDogZmFsc2UsIGJvdHRvbTogZmFsc2V9XG4gIHByb2Nlc3M6IG51bGxcbiAgc3BsaXREaWZmUmVzb2x2ZXM6IFtdXG4gIG9wdGlvbnM6IHt9XG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAY29udGV4dEZvclNlcnZpY2UgPSB0aGlzXG5cbiAgICBzdHlsZUNhbGN1bGF0b3IgPSBuZXcgU3R5bGVDYWxjdWxhdG9yKGF0b20uc3R5bGVzLCBhdG9tLmNvbmZpZylcbiAgICBzdHlsZUNhbGN1bGF0b3Iuc3RhcnRXYXRjaGluZyhcbiAgICAgICAgJ3NwbGl0LWRpZmYtY3VzdG9tLXN0eWxlcycsXG4gICAgICAgIFsnc3BsaXQtZGlmZi5jb2xvcnMuYWRkZWRDb2xvcicsICdzcGxpdC1kaWZmLmNvbG9ycy5yZW1vdmVkQ29sb3InXSxcbiAgICAgICAgKGNvbmZpZykgLT5cbiAgICAgICAgICBhZGRlZENvbG9yID0gY29uZmlnLmdldCgnc3BsaXQtZGlmZi5jb2xvcnMuYWRkZWRDb2xvcicpXG4gICAgICAgICAgYWRkZWRDb2xvci5hbHBoYSA9IDAuNFxuICAgICAgICAgIGFkZGVkV29yZENvbG9yID0gYWRkZWRDb2xvclxuICAgICAgICAgIGFkZGVkV29yZENvbG9yLmFscGhhID0gMC41XG4gICAgICAgICAgcmVtb3ZlZENvbG9yID0gY29uZmlnLmdldCgnc3BsaXQtZGlmZi5jb2xvcnMucmVtb3ZlZENvbG9yJylcbiAgICAgICAgICByZW1vdmVkQ29sb3IuYWxwaGEgPSAwLjRcbiAgICAgICAgICByZW1vdmVkV29yZENvbG9yID0gcmVtb3ZlZENvbG9yXG4gICAgICAgICAgcmVtb3ZlZFdvcmRDb2xvci5hbHBoYSA9IDAuNVxuICAgICAgICAgIFwiXFxuXG4gICAgICAgICAgLnNwbGl0LWRpZmYtYWRkZWQtY3VzdG9tIHtcXG5cbiAgICAgICAgICAgIFxcdGJhY2tncm91bmQtY29sb3I6ICN7YWRkZWRDb2xvci50b1JHQkFTdHJpbmcoKX07XFxuXG4gICAgICAgICAgfVxcblxuICAgICAgICAgIC5zcGxpdC1kaWZmLXJlbW92ZWQtY3VzdG9tIHtcXG5cbiAgICAgICAgICAgIFxcdGJhY2tncm91bmQtY29sb3I6ICN7cmVtb3ZlZENvbG9yLnRvUkdCQVN0cmluZygpfTtcXG5cbiAgICAgICAgICB9XFxuXG4gICAgICAgICAgLnNwbGl0LWRpZmYtd29yZC1hZGRlZC1jdXN0b20gLnJlZ2lvbiB7XFxuXG4gICAgICAgICAgICBcXHRiYWNrZ3JvdW5kLWNvbG9yOiAje2FkZGVkV29yZENvbG9yLnRvUkdCQVN0cmluZygpfTtcXG5cbiAgICAgICAgICB9XFxuXG4gICAgICAgICAgLnNwbGl0LWRpZmYtd29yZC1yZW1vdmVkLWN1c3RvbSAucmVnaW9uIHtcXG5cbiAgICAgICAgICAgIFxcdGJhY2tncm91bmQtY29sb3I6ICN7cmVtb3ZlZFdvcmRDb2xvci50b1JHQkFTdHJpbmcoKX07XFxuXG4gICAgICAgICAgfVxcblwiXG4gICAgKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZSwgLnRyZWUtdmlldyAuc2VsZWN0ZWQsIC50YWIudGV4dGVkaXRvcicsXG4gICAgICAnc3BsaXQtZGlmZjplbmFibGUnOiAoZSkgPT5cbiAgICAgICAgQGRpZmZQYW5lcyhlKVxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAnc3BsaXQtZGlmZjpuZXh0LWRpZmYnOiA9PlxuICAgICAgICBpZiBAaXNFbmFibGVkXG4gICAgICAgICAgQG5leHREaWZmKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBkaWZmUGFuZXMoKVxuICAgICAgJ3NwbGl0LWRpZmY6cHJldi1kaWZmJzogPT5cbiAgICAgICAgaWYgQGlzRW5hYmxlZFxuICAgICAgICAgIEBwcmV2RGlmZigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZGlmZlBhbmVzKClcbiAgICAgICdzcGxpdC1kaWZmOmNvcHktdG8tcmlnaHQnOiA9PlxuICAgICAgICBpZiBAaXNFbmFibGVkXG4gICAgICAgICAgQGNvcHlUb1JpZ2h0KClcbiAgICAgICdzcGxpdC1kaWZmOmNvcHktdG8tbGVmdCc6ID0+XG4gICAgICAgIGlmIEBpc0VuYWJsZWRcbiAgICAgICAgICBAY29weVRvTGVmdCgpXG4gICAgICAnc3BsaXQtZGlmZjpkaXNhYmxlJzogPT4gQGRpc2FibGUoKVxuICAgICAgJ3NwbGl0LWRpZmY6aWdub3JlLXdoaXRlc3BhY2UnOiA9PiBAdG9nZ2xlSWdub3JlV2hpdGVzcGFjZSgpXG4gICAgICAnc3BsaXQtZGlmZjp0b2dnbGUnOiA9PiBAdG9nZ2xlKClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBkaXNhYmxlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxuICAjIGNhbGxlZCBieSBcInRvZ2dsZVwiIGNvbW1hbmRcbiAgIyB0b2dnbGVzIHNwbGl0IGRpZmZcbiAgdG9nZ2xlOiAoKSAtPlxuICAgIGlmIEBpc0VuYWJsZWRcbiAgICAgIEBkaXNhYmxlKClcbiAgICBlbHNlXG4gICAgICBAZGlmZlBhbmVzKClcblxuICAjIGNhbGxlZCBieSBcIkRpc2FibGVcIiBjb21tYW5kXG4gICMgcmVtb3ZlcyBkaWZmIGFuZCBzeW5jIHNjcm9sbCwgZGlzcG9zZXMgb2Ygc3Vic2NyaXB0aW9uc1xuICBkaXNhYmxlOiAoKSAtPlxuICAgIEBpc0VuYWJsZWQgPSBmYWxzZVxuXG4gICAgIyByZW1vdmUgbGlzdGVuZXJzXG4gICAgaWYgQGVkaXRvclN1YnNjcmlwdGlvbnM/XG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zID0gbnVsbFxuXG4gICAgaWYgQGRpZmZWaWV3P1xuICAgICAgaWYgQHdhc0VkaXRvcjFDcmVhdGVkXG4gICAgICAgIEBkaWZmVmlldy5jbGVhblVwRWRpdG9yKDEpXG4gICAgICBlbHNlIGlmIEB3YXNFZGl0b3IxU29mdFdyYXBwZWRcbiAgICAgICAgQGRpZmZWaWV3LnJlc3RvcmVFZGl0b3JTb2Z0V3JhcCgxKVxuICAgICAgaWYgQHdhc0VkaXRvcjJDcmVhdGVkXG4gICAgICAgIEBkaWZmVmlldy5jbGVhblVwRWRpdG9yKDIpXG4gICAgICBlbHNlIGlmIEB3YXNFZGl0b3IyU29mdFdyYXBwZWRcbiAgICAgICAgQGRpZmZWaWV3LnJlc3RvcmVFZGl0b3JTb2Z0V3JhcCgyKVxuICAgICAgQGRpZmZWaWV3LmRlc3Ryb3koKVxuICAgICAgQGRpZmZWaWV3ID0gbnVsbFxuXG4gICAgIyByZW1vdmUgdmlld3NcbiAgICBpZiBAZm9vdGVyVmlldz9cbiAgICAgIEBmb290ZXJWaWV3LmRlc3Ryb3koKVxuICAgICAgQGZvb3RlclZpZXcgPSBudWxsXG4gICAgaWYgQGxvYWRpbmdWaWV3P1xuICAgICAgQGxvYWRpbmdWaWV3LmRlc3Ryb3koKVxuICAgICAgQGxvYWRpbmdWaWV3ID0gbnVsbFxuXG4gICAgaWYgQHN5bmNTY3JvbGw/XG4gICAgICBAc3luY1Njcm9sbC5kaXNwb3NlKClcbiAgICAgIEBzeW5jU2Nyb2xsID0gbnVsbFxuXG4gICAgIyBhdXRvIGhpZGUgdHJlZSB2aWV3IHdoaWxlIGRpZmZpbmcgIzgyXG4gICAgaGlkZURvY2tzID0gQG9wdGlvbnMuaGlkZURvY2tzID8gQF9nZXRDb25maWcoJ2hpZGVEb2NrcycpXG4gICAgaWYgaGlkZURvY2tzXG4gICAgICBpZiBAZG9ja3NUb1Jlb3Blbi5sZWZ0XG4gICAgICAgIGF0b20ud29ya3NwYWNlLmdldExlZnREb2NrKCkuc2hvdygpXG4gICAgICBpZiBAZG9ja3NUb1Jlb3Blbi5yaWdodFxuICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRSaWdodERvY2soKS5zaG93KClcbiAgICAgIGlmIEBkb2Nrc1RvUmVvcGVuLmJvdHRvbVxuICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRCb3R0b21Eb2NrKCkuc2hvdygpXG5cbiAgICAjIHJlc2V0IGFsbCB2YXJpYWJsZXNcbiAgICBAZG9ja3NUb1Jlb3BlbiA9IHtsZWZ0OiBmYWxzZSwgcmlnaHQ6IGZhbHNlLCBib3R0b206IGZhbHNlfVxuICAgIEB3YXNFZGl0b3IxQ3JlYXRlZCA9IGZhbHNlXG4gICAgQHdhc0VkaXRvcjJDcmVhdGVkID0gZmFsc2VcbiAgICBAd2FzRWRpdG9yMVNvZnRXcmFwcGVkID0gZmFsc2VcbiAgICBAd2FzRWRpdG9yMlNvZnRXcmFwcGVkID0gZmFsc2VcbiAgICBAaGFzR2l0UmVwbyA9IGZhbHNlXG5cbiAgIyBjYWxsZWQgYnkgXCJ0b2dnbGUgaWdub3JlIHdoaXRlc3BhY2VcIiBjb21tYW5kXG4gIHRvZ2dsZUlnbm9yZVdoaXRlc3BhY2U6IC0+XG4gICAgIyBpZiBpZ25vcmVXaGl0ZXNwYWNlIGlzIG5vdCBiZWluZyBvdmVycmlkZGVuXG4gICAgaWYgIShAb3B0aW9ucy5pZ25vcmVXaGl0ZXNwYWNlPylcbiAgICAgIGlnbm9yZVdoaXRlc3BhY2UgPSBAX2dldENvbmZpZygnaWdub3JlV2hpdGVzcGFjZScpXG4gICAgICBAX3NldENvbmZpZygnaWdub3JlV2hpdGVzcGFjZScsICFpZ25vcmVXaGl0ZXNwYWNlKVxuICAgICAgQGZvb3RlclZpZXc/LnNldElnbm9yZVdoaXRlc3BhY2UoIWlnbm9yZVdoaXRlc3BhY2UpXG5cbiAgIyBjYWxsZWQgYnkgXCJNb3ZlIHRvIG5leHQgZGlmZlwiIGNvbW1hbmRcbiAgbmV4dERpZmY6IC0+XG4gICAgaWYgQGRpZmZWaWV3P1xuICAgICAgaXNTeW5jU2Nyb2xsRW5hYmxlZCA9IGZhbHNlXG4gICAgICBzY3JvbGxTeW5jVHlwZSA9IEBvcHRpb25zLnNjcm9sbFN5bmNUeXBlID8gQF9nZXRDb25maWcoJ3Njcm9sbFN5bmNUeXBlJylcbiAgICAgIGlmIHNjcm9sbFN5bmNUeXBlID09ICdWZXJ0aWNhbCArIEhvcml6b250YWwnIHx8IHNjcm9sbFN5bmNUeXBlID09ICdWZXJ0aWNhbCdcbiAgICAgICAgaXNTeW5jU2Nyb2xsRW5hYmxlZCA9IHRydWVcbiAgICAgIHNlbGVjdGVkSW5kZXggPSBAZGlmZlZpZXcubmV4dERpZmYoaXNTeW5jU2Nyb2xsRW5hYmxlZClcbiAgICAgIEBmb290ZXJWaWV3Py5zaG93U2VsZWN0aW9uQ291bnQoIHNlbGVjdGVkSW5kZXggKyAxIClcblxuICAjIGNhbGxlZCBieSBcIk1vdmUgdG8gcHJldmlvdXMgZGlmZlwiIGNvbW1hbmRcbiAgcHJldkRpZmY6IC0+XG4gICAgaWYgQGRpZmZWaWV3P1xuICAgICAgaXNTeW5jU2Nyb2xsRW5hYmxlZCA9IGZhbHNlXG4gICAgICBzY3JvbGxTeW5jVHlwZSA9IEBvcHRpb25zLnNjcm9sbFN5bmNUeXBlID8gQF9nZXRDb25maWcoJ3Njcm9sbFN5bmNUeXBlJylcbiAgICAgIGlmIHNjcm9sbFN5bmNUeXBlID09ICdWZXJ0aWNhbCArIEhvcml6b250YWwnIHx8IHNjcm9sbFN5bmNUeXBlID09ICdWZXJ0aWNhbCdcbiAgICAgICAgaXNTeW5jU2Nyb2xsRW5hYmxlZCA9IHRydWVcbiAgICAgIHNlbGVjdGVkSW5kZXggPSBAZGlmZlZpZXcucHJldkRpZmYoaXNTeW5jU2Nyb2xsRW5hYmxlZClcbiAgICAgIEBmb290ZXJWaWV3Py5zaG93U2VsZWN0aW9uQ291bnQoIHNlbGVjdGVkSW5kZXggKyAxIClcblxuICAjIGNhbGxlZCBieSBcIkNvcHkgdG8gcmlnaHRcIiBjb21tYW5kXG4gIGNvcHlUb1JpZ2h0OiAtPlxuICAgIGlmIEBkaWZmVmlldz9cbiAgICAgIEBkaWZmVmlldy5jb3B5VG9SaWdodCgpXG4gICAgICBAZm9vdGVyVmlldz8uaGlkZVNlbGVjdGlvbkNvdW50KClcblxuICAjIGNhbGxlZCBieSBcIkNvcHkgdG8gbGVmdFwiIGNvbW1hbmRcbiAgY29weVRvTGVmdDogLT5cbiAgICBpZiBAZGlmZlZpZXc/XG4gICAgICBAZGlmZlZpZXcuY29weVRvTGVmdCgpXG4gICAgICBAZm9vdGVyVmlldz8uaGlkZVNlbGVjdGlvbkNvdW50KClcblxuICAjIGNhbGxlZCBieSB0aGUgY29tbWFuZHMgZW5hYmxlL3RvZ2dsZSB0byBkbyBpbml0aWFsIGRpZmZcbiAgIyBzZXRzIHVwIHN1YnNjcmlwdGlvbnMgZm9yIGF1dG8gZGlmZiBhbmQgZGlzYWJsaW5nIHdoZW4gYSBwYW5lIGlzIGRlc3Ryb3llZFxuICAjIGV2ZW50IGlzIGFuIG9wdGlvbmFsIGFyZ3VtZW50IG9mIGEgZmlsZSBwYXRoIHRvIGRpZmYgd2l0aCBjdXJyZW50XG4gICMgZWRpdG9yc1Byb21pc2UgaXMgYW4gb3B0aW9uYWwgYXJndW1lbnQgb2YgYSBwcm9taXNlIHRoYXQgcmV0dXJucyB3aXRoIDIgZWRpdG9yc1xuICAjIG9wdGlvbnMgaXMgYW4gb3B0aW9uYWwgYXJndW1lbnQgd2l0aCBvcHRpb25hbCBwcm9wZXJ0aWVzIHRoYXQgYXJlIHVzZWQgdG8gb3ZlcnJpZGUgdXNlcidzIHNldHRpbmdzXG4gIGRpZmZQYW5lczogKGV2ZW50LCBlZGl0b3JzUHJvbWlzZSwgb3B0aW9ucyA9IHt9KSAtPlxuICAgIEBvcHRpb25zID0gb3B0aW9uc1xuXG4gICAgaWYgIWVkaXRvcnNQcm9taXNlXG4gICAgICBpZiBldmVudD8uY3VycmVudFRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3RhYicpIHx8IGV2ZW50Py5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnZmlsZScpXG4gICAgICAgIGVsZW1XaXRoUGF0aCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQucXVlcnlTZWxlY3RvcignW2RhdGEtcGF0aF0nKVxuICAgICAgICBwYXJhbXMgPSB7fVxuXG4gICAgICAgIGlmIGVsZW1XaXRoUGF0aFxuICAgICAgICAgIHBhcmFtcy5wYXRoID0gZWxlbVdpdGhQYXRoLmRhdGFzZXQucGF0aFxuICAgICAgICBlbHNlIGlmIGV2ZW50LmN1cnJlbnRUYXJnZXQuaXRlbVxuICAgICAgICAgIHBhcmFtcy5lZGl0b3IgPSBldmVudC5jdXJyZW50VGFyZ2V0Lml0ZW0uY29weSgpICMgY29weSBoZXJlIHNvIHN0aWxsIGhhdmUgaXQgaWYgZGlzYWJsZSBjbG9zZXMgaXQgIzEyNFxuXG4gICAgICAgIEBkaXNhYmxlKCkgIyBtYWtlIHN1cmUgd2UncmUgaW4gYSBnb29kIHN0YXJ0aW5nIHN0YXRlXG4gICAgICAgIGVkaXRvcnNQcm9taXNlID0gQF9nZXRFZGl0b3JzRm9yRGlmZldpdGhBY3RpdmUocGFyYW1zKVxuICAgICAgZWxzZVxuICAgICAgICBAZGlzYWJsZSgpICMgbWFrZSBzdXJlIHdlJ3JlIGluIGEgZ29vZCBzdGFydGluZyBzdGF0ZVxuICAgICAgICBlZGl0b3JzUHJvbWlzZSA9IEBfZ2V0RWRpdG9yc0ZvclF1aWNrRGlmZigpXG4gICAgZWxzZVxuICAgICAgQGRpc2FibGUoKSAjIG1ha2Ugc3VyZSB3ZSdyZSBpbiBhIGdvb2Qgc3RhcnRpbmcgc3RhdGVcblxuICAgIGVkaXRvcnNQcm9taXNlLnRoZW4gKChlZGl0b3JzKSAtPlxuICAgICAgaWYgZWRpdG9ycyA9PSBudWxsXG4gICAgICAgIHJldHVyblxuICAgICAgQGVkaXRvclN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgICBAX3NldHVwVmlzaWJsZUVkaXRvcnMoZWRpdG9ycy5lZGl0b3IxLCBlZGl0b3JzLmVkaXRvcjIpXG4gICAgICBAZGlmZlZpZXcgPSBuZXcgRGlmZlZpZXcoZWRpdG9ycylcblxuICAgICAgIyBhZGQgbGlzdGVuZXJzXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IxLm9uRGlkU3RvcENoYW5naW5nID0+XG4gICAgICAgIEB1cGRhdGVEaWZmKGVkaXRvcnMpXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IyLm9uRGlkU3RvcENoYW5naW5nID0+XG4gICAgICAgIEB1cGRhdGVEaWZmKGVkaXRvcnMpXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IxLm9uRGlkRGVzdHJveSA9PlxuICAgICAgICBAZGlzYWJsZSgpXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IyLm9uRGlkRGVzdHJveSA9PlxuICAgICAgICBAZGlzYWJsZSgpXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ3NwbGl0LWRpZmYnLCAoKSA9PlxuICAgICAgICBAdXBkYXRlRGlmZihlZGl0b3JzKVxuICAgICAgQGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGVkaXRvcnMuZWRpdG9yMS5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uIChldmVudCkgPT5cbiAgICAgICAgQGRpZmZWaWV3LmhhbmRsZUN1cnNvckNoYW5nZShldmVudC5jdXJzb3IsIGV2ZW50Lm9sZEJ1ZmZlclBvc2l0aW9uLCBldmVudC5uZXdCdWZmZXJQb3NpdGlvbilcbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBlZGl0b3JzLmVkaXRvcjIub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbiAoZXZlbnQpID0+XG4gICAgICAgIEBkaWZmVmlldy5oYW5kbGVDdXJzb3JDaGFuZ2UoZXZlbnQuY3Vyc29yLCBldmVudC5vbGRCdWZmZXJQb3NpdGlvbiwgZXZlbnQubmV3QnVmZmVyUG9zaXRpb24pXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IxLm9uRGlkQWRkQ3Vyc29yIChjdXJzb3IpID0+XG4gICAgICAgIEBkaWZmVmlldy5oYW5kbGVDdXJzb3JDaGFuZ2UoY3Vyc29yLCAtMSwgY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IyLm9uRGlkQWRkQ3Vyc29yIChjdXJzb3IpID0+XG4gICAgICAgIEBkaWZmVmlldy5oYW5kbGVDdXJzb3JDaGFuZ2UoY3Vyc29yLCAtMSwgY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgICAgICMgYWRkIHRoZSBib3R0b20gVUkgcGFuZWxcbiAgICAgIGlmICFAZm9vdGVyVmlldz9cbiAgICAgICAgaWdub3JlV2hpdGVzcGFjZSA9IEBvcHRpb25zLmlnbm9yZVdoaXRlc3BhY2UgPyBAX2dldENvbmZpZygnaWdub3JlV2hpdGVzcGFjZScpXG4gICAgICAgIEBmb290ZXJWaWV3ID0gbmV3IEZvb3RlclZpZXcoaWdub3JlV2hpdGVzcGFjZSwgKEBvcHRpb25zLmlnbm9yZVdoaXRlc3BhY2U/KSlcbiAgICAgICAgQGZvb3RlclZpZXcuY3JlYXRlUGFuZWwoKVxuICAgICAgQGZvb3RlclZpZXcuc2hvdygpXG5cbiAgICAgICMgYXV0byBoaWRlIHRyZWUgdmlldyB3aGlsZSBkaWZmaW5nICM4MlxuICAgICAgaGlkZURvY2tzID0gQG9wdGlvbnMuaGlkZURvY2tzID8gQF9nZXRDb25maWcoJ2hpZGVEb2NrcycpXG4gICAgICBpZiBoaWRlRG9ja3NcbiAgICAgICAgQGRvY2tzVG9SZW9wZW4ubGVmdCA9IGF0b20ud29ya3NwYWNlLmdldExlZnREb2NrKCkuaXNWaXNpYmxlKClcbiAgICAgICAgQGRvY2tzVG9SZW9wZW4ucmlnaHQgPSBhdG9tLndvcmtzcGFjZS5nZXRSaWdodERvY2soKS5pc1Zpc2libGUoKVxuICAgICAgICBAZG9ja3NUb1Jlb3Blbi5ib3R0b20gPSBhdG9tLndvcmtzcGFjZS5nZXRCb3R0b21Eb2NrKCkuaXNWaXNpYmxlKClcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0TGVmdERvY2soKS5oaWRlKClcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0UmlnaHREb2NrKCkuaGlkZSgpXG4gICAgICAgIGF0b20ud29ya3NwYWNlLmdldEJvdHRvbURvY2soKS5oaWRlKClcblxuICAgICAgIyB1cGRhdGUgZGlmZiBpZiB0aGVyZSBpcyBubyBnaXQgcmVwbyAobm8gb25jaGFuZ2UgZmlyZWQpXG4gICAgICBpZiAhQGhhc0dpdFJlcG9cbiAgICAgICAgQHVwZGF0ZURpZmYoZWRpdG9ycylcblxuICAgICAgIyBhZGQgYXBwbGljYXRpb24gbWVudSBpdGVtc1xuICAgICAgQGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGF0b20ubWVudS5hZGQgW1xuICAgICAgICB7XG4gICAgICAgICAgJ2xhYmVsJzogJ1BhY2thZ2VzJ1xuICAgICAgICAgICdzdWJtZW51JzogW1xuICAgICAgICAgICAgJ2xhYmVsJzogJ1NwbGl0IERpZmYnXG4gICAgICAgICAgICAnc3VibWVudSc6IFtcbiAgICAgICAgICAgICAgeyAnbGFiZWwnOiAnSWdub3JlIFdoaXRlc3BhY2UnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOmlnbm9yZS13aGl0ZXNwYWNlJyB9XG4gICAgICAgICAgICAgIHsgJ2xhYmVsJzogJ01vdmUgdG8gTmV4dCBEaWZmJywgJ2NvbW1hbmQnOiAnc3BsaXQtZGlmZjpuZXh0LWRpZmYnIH1cbiAgICAgICAgICAgICAgeyAnbGFiZWwnOiAnTW92ZSB0byBQcmV2aW91cyBEaWZmJywgJ2NvbW1hbmQnOiAnc3BsaXQtZGlmZjpwcmV2LWRpZmYnIH1cbiAgICAgICAgICAgICAgeyAnbGFiZWwnOiAnQ29weSB0byBSaWdodCcsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6Y29weS10by1yaWdodCd9XG4gICAgICAgICAgICAgIHsgJ2xhYmVsJzogJ0NvcHkgdG8gTGVmdCcsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6Y29weS10by1sZWZ0J31cbiAgICAgICAgICAgIF1cbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbnRleHRNZW51LmFkZCB7XG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yJzogW3tcbiAgICAgICAgICAnbGFiZWwnOiAnU3BsaXQgRGlmZicsXG4gICAgICAgICAgJ3N1Ym1lbnUnOiBbXG4gICAgICAgICAgICB7ICdsYWJlbCc6ICdJZ25vcmUgV2hpdGVzcGFjZScsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6aWdub3JlLXdoaXRlc3BhY2UnIH1cbiAgICAgICAgICAgIHsgJ2xhYmVsJzogJ01vdmUgdG8gTmV4dCBEaWZmJywgJ2NvbW1hbmQnOiAnc3BsaXQtZGlmZjpuZXh0LWRpZmYnIH1cbiAgICAgICAgICAgIHsgJ2xhYmVsJzogJ01vdmUgdG8gUHJldmlvdXMgRGlmZicsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6cHJldi1kaWZmJyB9XG4gICAgICAgICAgICB7ICdsYWJlbCc6ICdDb3B5IHRvIFJpZ2h0JywgJ2NvbW1hbmQnOiAnc3BsaXQtZGlmZjpjb3B5LXRvLXJpZ2h0J31cbiAgICAgICAgICAgIHsgJ2xhYmVsJzogJ0NvcHkgdG8gTGVmdCcsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6Y29weS10by1sZWZ0J31cbiAgICAgICAgICBdXG4gICAgICAgIH1dXG4gICAgICB9XG4gICAgKS5iaW5kKHRoaXMpICMgbWFrZSBzdXJlIHRoZSBzY29wZSBpcyBjb3JyZWN0XG5cbiAgIyBjYWxsZWQgYnkgYm90aCBkaWZmUGFuZXMgYW5kIHRoZSBlZGl0b3Igc3Vic2NyaXB0aW9uIHRvIHVwZGF0ZSB0aGUgZGlmZlxuICB1cGRhdGVEaWZmOiAoZWRpdG9ycykgLT5cbiAgICBAaXNFbmFibGVkID0gdHJ1ZVxuXG4gICAgIyBpZiB0aGVyZSBpcyBhIGRpZmYgYmVpbmcgY29tcHV0ZWQgaW4gdGhlIGJhY2tncm91bmQsIGNhbmNlbCBpdFxuICAgIGlmIEBwcm9jZXNzP1xuICAgICAgQHByb2Nlc3Mua2lsbCgpXG4gICAgICBAcHJvY2VzcyA9IG51bGxcblxuICAgIGlnbm9yZVdoaXRlc3BhY2UgPSBAb3B0aW9ucy5pZ25vcmVXaGl0ZXNwYWNlID8gQF9nZXRDb25maWcoJ2lnbm9yZVdoaXRlc3BhY2UnKVxuICAgIGVkaXRvclBhdGhzID0gQF9jcmVhdGVUZW1wRmlsZXMoZWRpdG9ycylcblxuICAgICMgY3JlYXRlIHRoZSBsb2FkaW5nIHZpZXcgaWYgaXQgZG9lc24ndCBleGlzdCB5ZXRcbiAgICBpZiAhQGxvYWRpbmdWaWV3P1xuICAgICAgQGxvYWRpbmdWaWV3ID0gbmV3IExvYWRpbmdWaWV3KClcbiAgICAgIEBsb2FkaW5nVmlldy5jcmVhdGVNb2RhbCgpXG4gICAgQGxvYWRpbmdWaWV3LnNob3coKVxuXG4gICAgIyAtLS0ga2ljayBvZmYgYmFja2dyb3VuZCBwcm9jZXNzIHRvIGNvbXB1dGUgZGlmZiAtLS1cbiAgICB7QnVmZmVyZWROb2RlUHJvY2Vzc30gPSByZXF1aXJlICdhdG9tJ1xuICAgIGNvbW1hbmQgPSBwYXRoLnJlc29sdmUgX19kaXJuYW1lLCBcIi4vY29tcHV0ZS1kaWZmLmpzXCJcbiAgICBhcmdzID0gW2VkaXRvclBhdGhzLmVkaXRvcjFQYXRoLCBlZGl0b3JQYXRocy5lZGl0b3IyUGF0aCwgaWdub3JlV2hpdGVzcGFjZV1cbiAgICB0aGVPdXRwdXQgPSAnJ1xuICAgIHN0ZG91dCA9IChvdXRwdXQpID0+XG4gICAgICB0aGVPdXRwdXQgPSBvdXRwdXRcbiAgICAgIGNvbXB1dGVkRGlmZiA9IEpTT04ucGFyc2Uob3V0cHV0KVxuICAgICAgQHByb2Nlc3Mua2lsbCgpXG4gICAgICBAcHJvY2VzcyA9IG51bGxcbiAgICAgIEBsb2FkaW5nVmlldz8uaGlkZSgpXG4gICAgICBAX3Jlc3VtZVVwZGF0ZURpZmYoZWRpdG9ycywgY29tcHV0ZWREaWZmKVxuICAgIHN0ZGVyciA9IChlcnIpID0+XG4gICAgICB0aGVPdXRwdXQgPSBlcnJcbiAgICBleGl0ID0gKGNvZGUpID0+XG4gICAgICBAbG9hZGluZ1ZpZXc/LmhpZGUoKVxuXG4gICAgICBpZiBjb2RlICE9IDBcbiAgICAgICAgY29uc29sZS5sb2coJ0J1ZmZlcmVkTm9kZVByb2Nlc3MgY29kZSB3YXMgJyArIGNvZGUpXG4gICAgICAgIGNvbnNvbGUubG9nKHRoZU91dHB1dClcbiAgICBAcHJvY2VzcyA9IG5ldyBCdWZmZXJlZE5vZGVQcm9jZXNzKHtjb21tYW5kLCBhcmdzLCBzdGRvdXQsIHN0ZGVyciwgZXhpdH0pXG4gICAgIyAtLS0ga2ljayBvZmYgYmFja2dyb3VuZCBwcm9jZXNzIHRvIGNvbXB1dGUgZGlmZiAtLS1cblxuICAjIHJlc3VtZXMgYWZ0ZXIgdGhlIGNvbXB1dGUgZGlmZiBwcm9jZXNzIHJldHVybnNcbiAgX3Jlc3VtZVVwZGF0ZURpZmY6IChlZGl0b3JzLCBjb21wdXRlZERpZmYpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAZGlmZlZpZXc/XG5cbiAgICBAZGlmZlZpZXcuY2xlYXJEaWZmKClcbiAgICBpZiBAc3luY1Njcm9sbD9cbiAgICAgIEBzeW5jU2Nyb2xsLmRpc3Bvc2UoKVxuICAgICAgQHN5bmNTY3JvbGwgPSBudWxsXG5cbiAgICAjIGdyYWIgdGhlIHNldHRpbmdzIGZvciB0aGUgZGlmZlxuICAgIGFkZGVkQ29sb3JTaWRlID0gQG9wdGlvbnMuYWRkZWRDb2xvclNpZGUgPyBAX2dldENvbmZpZygnY29sb3JzLmFkZGVkQ29sb3JTaWRlJylcbiAgICBkaWZmV29yZHMgPSBAb3B0aW9ucy5kaWZmV29yZHMgPyBAX2dldENvbmZpZygnZGlmZldvcmRzJylcbiAgICBpZ25vcmVXaGl0ZXNwYWNlID0gQG9wdGlvbnMuaWdub3JlV2hpdGVzcGFjZSA/IEBfZ2V0Q29uZmlnKCdpZ25vcmVXaGl0ZXNwYWNlJylcbiAgICBvdmVycmlkZVRoZW1lQ29sb3JzID0gQG9wdGlvbnMub3ZlcnJpZGVUaGVtZUNvbG9ycyA/IEBfZ2V0Q29uZmlnKCdjb2xvcnMub3ZlcnJpZGVUaGVtZUNvbG9ycycpXG5cbiAgICBAZGlmZlZpZXcuZGlzcGxheURpZmYoY29tcHV0ZWREaWZmLCBhZGRlZENvbG9yU2lkZSwgZGlmZldvcmRzLCBpZ25vcmVXaGl0ZXNwYWNlLCBvdmVycmlkZVRoZW1lQ29sb3JzKVxuXG4gICAgIyBnaXZlIHRoZSBtYXJrZXIgbGF5ZXJzIHRvIHRob3NlIHJlZ2lzdGVyZWQgd2l0aCB0aGUgc2VydmljZVxuICAgIHdoaWxlIEBzcGxpdERpZmZSZXNvbHZlcz8ubGVuZ3RoXG4gICAgICBAc3BsaXREaWZmUmVzb2x2ZXMucG9wKCkoQGRpZmZWaWV3LmdldE1hcmtlckxheWVycygpKVxuXG4gICAgQGZvb3RlclZpZXc/LnNldE51bURpZmZlcmVuY2VzKEBkaWZmVmlldy5nZXROdW1EaWZmZXJlbmNlcygpKVxuXG4gICAgc2Nyb2xsU3luY1R5cGUgPSBAb3B0aW9ucy5zY3JvbGxTeW5jVHlwZSA/IEBfZ2V0Q29uZmlnKCdzY3JvbGxTeW5jVHlwZScpXG4gICAgaWYgc2Nyb2xsU3luY1R5cGUgPT0gJ1ZlcnRpY2FsICsgSG9yaXpvbnRhbCdcbiAgICAgIEBzeW5jU2Nyb2xsID0gbmV3IFN5bmNTY3JvbGwoZWRpdG9ycy5lZGl0b3IxLCBlZGl0b3JzLmVkaXRvcjIsIHRydWUpXG4gICAgICBAc3luY1Njcm9sbC5zeW5jUG9zaXRpb25zKClcbiAgICBlbHNlIGlmIHNjcm9sbFN5bmNUeXBlID09ICdWZXJ0aWNhbCdcbiAgICAgIEBzeW5jU2Nyb2xsID0gbmV3IFN5bmNTY3JvbGwoZWRpdG9ycy5lZGl0b3IxLCBlZGl0b3JzLmVkaXRvcjIsIGZhbHNlKVxuICAgICAgQHN5bmNTY3JvbGwuc3luY1Bvc2l0aW9ucygpXG5cbiAgIyBHZXRzIHRoZSBmaXJzdCB0d28gdmlzaWJsZSBlZGl0b3JzIGZvdW5kIG9yIGNyZWF0ZXMgdGhlbSBhcyBuZWVkZWQuXG4gICMgUmV0dXJucyBhIFByb21pc2Ugd2hpY2ggeWllbGRzIGEgdmFsdWUgb2Yge2VkaXRvcjE6IFRleHRFZGl0b3IsIGVkaXRvcjI6IFRleHRFZGl0b3J9XG4gIF9nZXRFZGl0b3JzRm9yUXVpY2tEaWZmOiAoKSAtPlxuICAgIGVkaXRvcjEgPSBudWxsXG4gICAgZWRpdG9yMiA9IG51bGxcblxuICAgICMgdHJ5IHRvIGZpbmQgdGhlIGZpcnN0IHR3byBlZGl0b3JzXG4gICAgcGFuZXMgPSBhdG9tLndvcmtzcGFjZS5nZXRDZW50ZXIoKS5nZXRQYW5lcygpXG4gICAgZm9yIHAgaW4gcGFuZXNcbiAgICAgIGFjdGl2ZUl0ZW0gPSBwLmdldEFjdGl2ZUl0ZW0oKVxuICAgICAgaWYgYXRvbS53b3Jrc3BhY2UuaXNUZXh0RWRpdG9yKGFjdGl2ZUl0ZW0pXG4gICAgICAgIGlmIGVkaXRvcjEgPT0gbnVsbFxuICAgICAgICAgIGVkaXRvcjEgPSBhY3RpdmVJdGVtXG4gICAgICAgIGVsc2UgaWYgZWRpdG9yMiA9PSBudWxsXG4gICAgICAgICAgZWRpdG9yMiA9IGFjdGl2ZUl0ZW1cbiAgICAgICAgICBicmVha1xuXG4gICAgIyBhdXRvIG9wZW4gZWRpdG9yIHBhbmVzIHNvIHdlIGhhdmUgdHdvIHRvIGRpZmYgd2l0aFxuICAgIGlmIGVkaXRvcjEgPT0gbnVsbFxuICAgICAgZWRpdG9yMSA9IGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcih7YXV0b0hlaWdodDogZmFsc2V9KVxuICAgICAgQHdhc0VkaXRvcjFDcmVhdGVkID0gdHJ1ZVxuICAgICAgIyBhZGQgZmlyc3QgZWRpdG9yIHRvIHRoZSBmaXJzdCBwYW5lXG4gICAgICBwYW5lc1swXS5hZGRJdGVtKGVkaXRvcjEpXG4gICAgICBwYW5lc1swXS5hY3RpdmF0ZUl0ZW0oZWRpdG9yMSlcbiAgICBpZiBlZGl0b3IyID09IG51bGxcbiAgICAgIGVkaXRvcjIgPSBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3Ioe2F1dG9IZWlnaHQ6IGZhbHNlfSlcbiAgICAgIEB3YXNFZGl0b3IyQ3JlYXRlZCA9IHRydWVcbiAgICAgIGVkaXRvcjIuc2V0R3JhbW1hcihlZGl0b3IxLmdldEdyYW1tYXIoKSlcbiAgICAgIHJpZ2h0UGFuZUluZGV4ID0gcGFuZXMuaW5kZXhPZihhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShlZGl0b3IxKSkgKyAxXG4gICAgICBpZiBwYW5lc1tyaWdodFBhbmVJbmRleF1cbiAgICAgICAgIyBhZGQgc2Vjb25kIGVkaXRvciB0byBleGlzdGluZyBwYW5lIHRvIHRoZSByaWdodCBvZiBmaXJzdCBlZGl0b3JcbiAgICAgICAgcGFuZXNbcmlnaHRQYW5lSW5kZXhdLmFkZEl0ZW0oZWRpdG9yMilcbiAgICAgICAgcGFuZXNbcmlnaHRQYW5lSW5kZXhdLmFjdGl2YXRlSXRlbShlZGl0b3IyKVxuICAgICAgZWxzZVxuICAgICAgICAjIG5vIGV4aXN0aW5nIHBhbmUgc28gc3BsaXQgcmlnaHRcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oZWRpdG9yMSkuc3BsaXRSaWdodCh7aXRlbXM6IFtlZGl0b3IyXX0pXG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtlZGl0b3IxOiBlZGl0b3IxLCBlZGl0b3IyOiBlZGl0b3IyfSlcblxuICAjIEdldHMgdGhlIGFjdGl2ZSBlZGl0b3IgYW5kIG9wZW5zIHRoZSBzcGVjaWZpZWQgZmlsZSB0byB0aGUgcmlnaHQgb2YgaXRcbiAgIyBSZXR1cm5zIGEgUHJvbWlzZSB3aGljaCB5aWVsZHMgYSB2YWx1ZSBvZiB7ZWRpdG9yMTogVGV4dEVkaXRvciwgZWRpdG9yMjogVGV4dEVkaXRvcn1cbiAgX2dldEVkaXRvcnNGb3JEaWZmV2l0aEFjdGl2ZTogKHBhcmFtcykgLT5cbiAgICBmaWxlUGF0aCA9IHBhcmFtcy5wYXRoXG4gICAgZWRpdG9yV2l0aG91dFBhdGggPSBwYXJhbXMuZWRpdG9yXG4gICAgYWN0aXZlRWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKCkuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG5cbiAgICBpZiBhY3RpdmVFZGl0b3I/XG4gICAgICBlZGl0b3IxID0gYWN0aXZlRWRpdG9yXG4gICAgICBAd2FzRWRpdG9yMkNyZWF0ZWQgPSB0cnVlXG4gICAgICBwYW5lcyA9IGF0b20ud29ya3NwYWNlLmdldENlbnRlcigpLmdldFBhbmVzKClcbiAgICAgICMgZ2V0IGluZGV4IG9mIHBhbmUgZm9sbG93aW5nIGFjdGl2ZSBlZGl0b3IgcGFuZVxuICAgICAgcmlnaHRQYW5lSW5kZXggPSBwYW5lcy5pbmRleE9mKGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKGVkaXRvcjEpKSArIDFcbiAgICAgICMgcGFuZSBpcyBjcmVhdGVkIGlmIHRoZXJlIGlzIG5vdCBvbmUgdG8gdGhlIHJpZ2h0IG9mIHRoZSBhY3RpdmUgZWRpdG9yXG4gICAgICByaWdodFBhbmUgPSBwYW5lc1tyaWdodFBhbmVJbmRleF0gfHwgYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oZWRpdG9yMSkuc3BsaXRSaWdodCgpXG5cbiAgICAgIGlmIHBhcmFtcy5wYXRoXG4gICAgICAgIGZpbGVQYXRoID0gcGFyYW1zLnBhdGhcbiAgICAgICAgaWYgZWRpdG9yMS5nZXRQYXRoKCkgPT0gZmlsZVBhdGhcbiAgICAgICAgICAjIGlmIGRpZmZpbmcgd2l0aCBpdHNlbGYsIHNldCBmaWxlUGF0aCB0byBudWxsIHNvIGFuIGVtcHR5IGVkaXRvciBpc1xuICAgICAgICAgICMgb3BlbmVkLCB3aGljaCB3aWxsIGNhdXNlIGEgZ2l0IGRpZmZcbiAgICAgICAgICBmaWxlUGF0aCA9IG51bGxcbiAgICAgICAgZWRpdG9yMlByb21pc2UgPSBhdG9tLndvcmtzcGFjZS5vcGVuVVJJSW5QYW5lKGZpbGVQYXRoLCByaWdodFBhbmUpXG5cbiAgICAgICAgcmV0dXJuIGVkaXRvcjJQcm9taXNlLnRoZW4gKGVkaXRvcjIpIC0+XG4gICAgICAgICAgcmV0dXJuIHtlZGl0b3IxOiBlZGl0b3IxLCBlZGl0b3IyOiBlZGl0b3IyfVxuICAgICAgZWxzZSBpZiBlZGl0b3JXaXRob3V0UGF0aFxuICAgICAgICBlZGl0b3IyID0gZWRpdG9yV2l0aG91dFBhdGguY29weSgpXG4gICAgICAgIHJpZ2h0UGFuZS5hZGRJdGVtKGVkaXRvcjIpXG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7ZWRpdG9yMTogZWRpdG9yMSwgZWRpdG9yMjogZWRpdG9yMn0pXG4gICAgZWxzZVxuICAgICAgbm9BY3RpdmVFZGl0b3JNc2cgPSAnTm8gYWN0aXZlIGZpbGUgZm91bmQhIChUcnkgZm9jdXNpbmcgYSB0ZXh0IGVkaXRvciknXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnU3BsaXQgRGlmZicsIHtkZXRhaWw6IG5vQWN0aXZlRWRpdG9yTXNnLCBkaXNtaXNzYWJsZTogZmFsc2UsIGljb246ICdkaWZmJ30pXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpXG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpXG5cbiAgX3NldHVwVmlzaWJsZUVkaXRvcnM6IChlZGl0b3IxLCBlZGl0b3IyKSAtPlxuICAgIEJ1ZmZlckV4dGVuZGVyID0gcmVxdWlyZSAnLi9idWZmZXItZXh0ZW5kZXInXG4gICAgYnVmZmVyMUxpbmVFbmRpbmcgPSAobmV3IEJ1ZmZlckV4dGVuZGVyKGVkaXRvcjEuZ2V0QnVmZmVyKCkpKS5nZXRMaW5lRW5kaW5nKClcblxuICAgIGlmIEB3YXNFZGl0b3IyQ3JlYXRlZFxuICAgICAgIyB3YW50IHRvIHNjcm9sbCBhIG5ld2x5IGNyZWF0ZWQgZWRpdG9yIHRvIHRoZSBmaXJzdCBlZGl0b3IncyBwb3NpdGlvblxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcjEpLmZvY3VzKClcbiAgICAgICMgc2V0IHRoZSBwcmVmZXJyZWQgbGluZSBlbmRpbmcgYmVmb3JlIGluc2VydGluZyB0ZXh0ICMzOVxuICAgICAgaWYgYnVmZmVyMUxpbmVFbmRpbmcgPT0gJ1xcbicgfHwgYnVmZmVyMUxpbmVFbmRpbmcgPT0gJ1xcclxcbidcbiAgICAgICAgQGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGVkaXRvcjIub25XaWxsSW5zZXJ0VGV4dCAoKSAtPlxuICAgICAgICAgIGVkaXRvcjIuZ2V0QnVmZmVyKCkuc2V0UHJlZmVycmVkTGluZUVuZGluZyhidWZmZXIxTGluZUVuZGluZylcblxuICAgIEBfc2V0dXBHaXRSZXBvKGVkaXRvcjEsIGVkaXRvcjIpXG5cbiAgICAjIHVuZm9sZCBhbGwgbGluZXMgc28gZGlmZnMgcHJvcGVybHkgYWxpZ25cbiAgICBlZGl0b3IxLnVuZm9sZEFsbCgpXG4gICAgZWRpdG9yMi51bmZvbGRBbGwoKVxuXG4gICAgbXV0ZU5vdGlmaWNhdGlvbnMgPSBAb3B0aW9ucy5tdXRlTm90aWZpY2F0aW9ucyA/IEBfZ2V0Q29uZmlnKCdtdXRlTm90aWZpY2F0aW9ucycpXG4gICAgdHVybk9mZlNvZnRXcmFwID0gQG9wdGlvbnMudHVybk9mZlNvZnRXcmFwID8gQF9nZXRDb25maWcoJ3R1cm5PZmZTb2Z0V3JhcCcpXG4gICAgaWYgdHVybk9mZlNvZnRXcmFwXG4gICAgICBzaG91bGROb3RpZnkgPSBmYWxzZVxuICAgICAgaWYgZWRpdG9yMS5pc1NvZnRXcmFwcGVkKClcbiAgICAgICAgQHdhc0VkaXRvcjFTb2Z0V3JhcHBlZCA9IHRydWVcbiAgICAgICAgZWRpdG9yMS5zZXRTb2Z0V3JhcHBlZChmYWxzZSlcbiAgICAgICAgc2hvdWxkTm90aWZ5ID0gdHJ1ZVxuICAgICAgaWYgZWRpdG9yMi5pc1NvZnRXcmFwcGVkKClcbiAgICAgICAgQHdhc0VkaXRvcjJTb2Z0V3JhcHBlZCA9IHRydWVcbiAgICAgICAgZWRpdG9yMi5zZXRTb2Z0V3JhcHBlZChmYWxzZSlcbiAgICAgICAgc2hvdWxkTm90aWZ5ID0gdHJ1ZVxuICAgICAgaWYgc2hvdWxkTm90aWZ5ICYmICFtdXRlTm90aWZpY2F0aW9uc1xuICAgICAgICBzb2Z0V3JhcE1zZyA9ICdTb2Z0IHdyYXAgYXV0b21hdGljYWxseSBkaXNhYmxlZCBzbyBsaW5lcyByZW1haW4gaW4gc3luYy4nXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdTcGxpdCBEaWZmJywge2RldGFpbDogc29mdFdyYXBNc2csIGRpc21pc3NhYmxlOiBmYWxzZSwgaWNvbjogJ2RpZmYnfSlcbiAgICBlbHNlIGlmICFtdXRlTm90aWZpY2F0aW9ucyAmJiAoZWRpdG9yMS5pc1NvZnRXcmFwcGVkKCkgfHwgZWRpdG9yMi5pc1NvZnRXcmFwcGVkKCkpXG4gICAgICBzb2Z0V3JhcE1zZyA9ICdXYXJuaW5nOiBTb2Z0IHdyYXAgZW5hYmxlZCEgTGluZXMgbWF5IG5vdCBhbGlnbi5cXG4oVHJ5IFwiVHVybiBPZmYgU29mdCBXcmFwXCIgc2V0dGluZyknXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnU3BsaXQgRGlmZicsIHtkZXRhaWw6IHNvZnRXcmFwTXNnLCBkaXNtaXNzYWJsZTogZmFsc2UsIGljb246ICdkaWZmJ30pXG5cbiAgICBidWZmZXIyTGluZUVuZGluZyA9IChuZXcgQnVmZmVyRXh0ZW5kZXIoZWRpdG9yMi5nZXRCdWZmZXIoKSkpLmdldExpbmVFbmRpbmcoKVxuICAgIGlmIGJ1ZmZlcjJMaW5lRW5kaW5nICE9ICcnICYmIChidWZmZXIxTGluZUVuZGluZyAhPSBidWZmZXIyTGluZUVuZGluZykgJiYgZWRpdG9yMS5nZXRMaW5lQ291bnQoKSAhPSAxICYmIGVkaXRvcjIuZ2V0TGluZUNvdW50KCkgIT0gMSAmJiAhbXV0ZU5vdGlmaWNhdGlvbnNcbiAgICAgICMgcG9wIHdhcm5pbmcgaWYgdGhlIGxpbmUgZW5kaW5ncyBkaWZmZXIgYW5kIHdlIGhhdmVuJ3QgZG9uZSBhbnl0aGluZyBhYm91dCBpdFxuICAgICAgbGluZUVuZGluZ01zZyA9ICdXYXJuaW5nOiBMaW5lIGVuZGluZ3MgZGlmZmVyISdcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdTcGxpdCBEaWZmJywge2RldGFpbDogbGluZUVuZGluZ01zZywgZGlzbWlzc2FibGU6IGZhbHNlLCBpY29uOiAnZGlmZid9KVxuXG4gIF9zZXR1cEdpdFJlcG86IChlZGl0b3IxLCBlZGl0b3IyKSAtPlxuICAgIGVkaXRvcjFQYXRoID0gZWRpdG9yMS5nZXRQYXRoKClcbiAgICAjIG9ubHkgc2hvdyBnaXQgY2hhbmdlcyBpZiB0aGUgcmlnaHQgZWRpdG9yIGlzIGVtcHR5XG4gICAgaWYgZWRpdG9yMVBhdGg/ICYmIChlZGl0b3IyLmdldExpbmVDb3VudCgpID09IDEgJiYgZWRpdG9yMi5saW5lVGV4dEZvckJ1ZmZlclJvdygwKSA9PSAnJylcbiAgICAgIGZvciBkaXJlY3RvcnksIGkgaW4gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClcbiAgICAgICAgaWYgZWRpdG9yMVBhdGggaXMgZGlyZWN0b3J5LmdldFBhdGgoKSBvciBkaXJlY3RvcnkuY29udGFpbnMoZWRpdG9yMVBhdGgpXG4gICAgICAgICAgcHJvamVjdFJlcG8gPSBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKClbaV1cbiAgICAgICAgICBpZiBwcm9qZWN0UmVwbz9cbiAgICAgICAgICAgIHByb2plY3RSZXBvID0gcHJvamVjdFJlcG8uZ2V0UmVwbyhlZGl0b3IxUGF0aCkgIyBmaXggcmVwbyBmb3Igc3VibW9kdWxlcyAjMTEyXG4gICAgICAgICAgICByZWxhdGl2ZUVkaXRvcjFQYXRoID0gcHJvamVjdFJlcG8ucmVsYXRpdml6ZShlZGl0b3IxUGF0aClcbiAgICAgICAgICAgIGdpdEhlYWRUZXh0ID0gcHJvamVjdFJlcG8uZ2V0SGVhZEJsb2IocmVsYXRpdmVFZGl0b3IxUGF0aClcbiAgICAgICAgICAgIGlmIGdpdEhlYWRUZXh0P1xuICAgICAgICAgICAgICBlZGl0b3IyLnNlbGVjdEFsbCgpXG4gICAgICAgICAgICAgIGVkaXRvcjIuaW5zZXJ0VGV4dChnaXRIZWFkVGV4dClcbiAgICAgICAgICAgICAgQGhhc0dpdFJlcG8gPSB0cnVlXG4gICAgICAgICAgICAgIGJyZWFrXG5cbiAgIyBjcmVhdGVzIHRlbXAgZmlsZXMgc28gdGhlIGNvbXB1dGUgZGlmZiBwcm9jZXNzIGNhbiBnZXQgdGhlIHRleHQgZWFzaWx5XG4gIF9jcmVhdGVUZW1wRmlsZXM6IChlZGl0b3JzKSAtPlxuICAgIGVkaXRvcjFQYXRoID0gJydcbiAgICBlZGl0b3IyUGF0aCA9ICcnXG4gICAgdGVtcEZvbGRlclBhdGggPSBhdG9tLmdldENvbmZpZ0RpclBhdGgoKSArICcvc3BsaXQtZGlmZidcblxuICAgIGVkaXRvcjFQYXRoID0gdGVtcEZvbGRlclBhdGggKyAnL3NwbGl0LWRpZmYgMSdcbiAgICBlZGl0b3IxVGVtcEZpbGUgPSBuZXcgRmlsZShlZGl0b3IxUGF0aClcbiAgICBlZGl0b3IxVGVtcEZpbGUud3JpdGVTeW5jKGVkaXRvcnMuZWRpdG9yMS5nZXRUZXh0KCkpXG5cbiAgICBlZGl0b3IyUGF0aCA9IHRlbXBGb2xkZXJQYXRoICsgJy9zcGxpdC1kaWZmIDInXG4gICAgZWRpdG9yMlRlbXBGaWxlID0gbmV3IEZpbGUoZWRpdG9yMlBhdGgpXG4gICAgZWRpdG9yMlRlbXBGaWxlLndyaXRlU3luYyhlZGl0b3JzLmVkaXRvcjIuZ2V0VGV4dCgpKVxuXG4gICAgZWRpdG9yUGF0aHMgPVxuICAgICAgZWRpdG9yMVBhdGg6IGVkaXRvcjFQYXRoXG4gICAgICBlZGl0b3IyUGF0aDogZWRpdG9yMlBhdGhcblxuICAgIHJldHVybiBlZGl0b3JQYXRoc1xuXG5cbiAgX2dldENvbmZpZzogKGNvbmZpZykgLT5cbiAgICBhdG9tLmNvbmZpZy5nZXQoXCJzcGxpdC1kaWZmLiN7Y29uZmlnfVwiKVxuXG4gIF9zZXRDb25maWc6IChjb25maWcsIHZhbHVlKSAtPlxuICAgIGF0b20uY29uZmlnLnNldChcInNwbGl0LWRpZmYuI3tjb25maWd9XCIsIHZhbHVlKVxuXG5cbiAgIyAtLS0gU0VSVklDRSBBUEkgLS0tXG4gIGdldE1hcmtlckxheWVyczogKCkgLT5cbiAgICBuZXcgUHJvbWlzZSAoKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgIEBzcGxpdERpZmZSZXNvbHZlcy5wdXNoKHJlc29sdmUpXG4gICAgKS5iaW5kKHRoaXMpXG5cbiAgZGlmZkVkaXRvcnM6IChlZGl0b3IxLCBlZGl0b3IyLCBvcHRpb25zKSAtPlxuICAgIEBkaWZmUGFuZXMobnVsbCwgUHJvbWlzZS5yZXNvbHZlKHtlZGl0b3IxOiBlZGl0b3IxLCBlZGl0b3IyOiBlZGl0b3IyfSksIG9wdGlvbnMpXG5cbiAgcHJvdmlkZVNwbGl0RGlmZjogLT5cbiAgICBnZXRNYXJrZXJMYXllcnM6IEBnZXRNYXJrZXJMYXllcnMuYmluZChAY29udGV4dEZvclNlcnZpY2UpXG4gICAgZGlmZkVkaXRvcnM6IEBkaWZmRWRpdG9ycy5iaW5kKEBjb250ZXh0Rm9yU2VydmljZSlcbiAgICBkaXNhYmxlOiBAZGlzYWJsZS5iaW5kKEBjb250ZXh0Rm9yU2VydmljZSlcbiJdfQ==
