"use strict";
const defaultInitialVars = {
    isWatchingSourceFile: false
};
let vscode = undefined;
if (typeof acquireVsCodeApi !== 'undefined') {
    vscode = acquireVsCodeApi();
}
if (typeof initialConfig === 'undefined') {
    var initialConfig = undefined;
    var initialVars = Object.assign({}, defaultInitialVars);
}
const csv = window.Papa;
let hot;
const defaultCsvContentIfEmpty = `,\n,`;
let headerRowWithIndex = null;
let hiddenPhysicalRowIndices = [];
let columnIsQuoted;
let defaultCsvReadOptions = {
    header: false,
    comments: '#',
    delimiter: '',
    newline: '',
    quoteChar: '"',
    escapeChar: '"',
    skipEmptyLines: true,
    dynamicTyping: false,
    _hasHeader: false,
};
let defaultCsvWriteOptions = {
    header: false,
    comments: '#',
    delimiter: '',
    newline: '',
    quoteChar: '"',
    escapeChar: '"',
    quoteAllFields: false,
    retainQuoteInformation: true,
};
let newLineFromInput = '\n';
let lastHandsonMoveWas = null;
let highlightCsvComments = true;
let newColumnQuoteInformationIsQuoted = false;
let enableWrapping = true;
let disableBorders = false;
let fixedRowsTop = 0;
let fixedColumnsLeft = 0;
let isFirstHasHeaderChangedEvent = true;
let initialColumnWidth = 0;
const csvEditorWrapper = _getById('csv-editor-wrapper');
const csvEditorDiv = _getById('csv-editor');
const helModalDiv = _getById('help-modal');
const askReadAgainModalDiv = _getById('ask-read-again-modal');
const askReloadFileModalDiv = _getById('ask-reload-file-modal');
const sourceFileChangedDiv = _getById('source-file-changed-modal');
const btnApplyChangesToFileAndSave = _getById(`btn-apply-changes-to-file-and-save`);
const readDelimiterTooltip = _getById('read-delimiter-tooltip');
const readDelimiterTooltipText = "Empty to auto detect";
const receivedCsvProgBar = _getById('received-csv-prog-bar');
const receivedCsvProgBarWrapper = _getById('received-csv-prog-bar-wrapper');
const statusInfo = _getById('status-info');
const fixedRowsTopInfoSpan = _getById('fixed-rows-top-info');
const fixedRowsTopIcon = _getById('fixed-rows-icon');
const fixedRowsTopText = _getById('fixed-rows-text');
const fixedColumnsTopInfoSpan = _getById('fixed-columns-top-info');
const fixedColumnsTopIcon = _getById('fixed-columns-icon');
const fixedColumnsTopText = _getById('fixed-columns-text');
const showCommentsBtn = _getById('show-comments-btn');
const hideCommentsBtn = _getById('hide-comments-btn');
const newlineSameSsInputOption = _getById('newline-same-as-input-option');
const newlineSameSsInputOptionText = `Same as input`;
updateNewLineSelect();
const warningTooltipTextWhenCommentRowNotFirstCellIsUsed = `Please use only the first cell in comment row (others are not exported)`;
const unsavedChangesIndicator = _getById('unsaved-changes-indicator');
const reloadFileSpan = _getById('reload-file');
const sourceFileUnwatchedIndicator = _getById('source-file-unwatched-indicator');
const hasHeaderReadOptionInput = _getById('has-header');
const findWidgetInstance = new FindWidget();
setCsvReadOptionsInitial(defaultCsvReadOptions);
setCsvWriteOptionsInitial(defaultCsvWriteOptions);
if (typeof initialContent === 'undefined') {
    var initialContent = '';
}
if (initialContent === undefined) {
    initialContent = '';
}
if (!vscode) {
    console.log("initialConfig: ", initialConfig);
    console.log("initialContent: " + initialContent);
}
setupAndApplyInitialConfigPart1(initialConfig, initialVars);
let _data = parseCsv(initialContent, defaultCsvReadOptions);
if (_data && !vscode) {
    let _exampleData = [];
    let initialRows = 5;
    let initialCols = 5;
    _exampleData = [...Array(initialRows).keys()].map(p => [...Array(initialCols).keys()].map(k => ''));
    _data = {
        columnIsQuoted: _exampleData[0].map(p => false),
        data: _exampleData
    };
    displayData(_data, defaultCsvReadOptions);
}
if (vscode) {
    receivedCsvProgBarWrapper.style.display = "block";
    window.addEventListener('message', (e) => {
        handleVsCodeMessage(e);
    });
    _postReadyMessage();
}
if (vscode) {
    Mousetrap.bindGlobal(['meta+s', 'ctrl+s'], (e) => {
        e.preventDefault();
        postApplyContent(true);
    });
}
//# sourceMappingURL=main.js.map