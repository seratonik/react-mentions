'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends3 = require('babel-runtime/helpers/extends');

var _extends4 = _interopRequireDefault(_extends3);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _OptionalRadium = require('./OptionalRadium');

var _OptionalRadium2 = _interopRequireDefault(_OptionalRadium);

var _keys = require('lodash/keys');

var _keys2 = _interopRequireDefault(_keys);

var _values = require('lodash/values');

var _values2 = _interopRequireDefault(_values);

var _omit = require('lodash/omit');

var _omit2 = _interopRequireDefault(_omit);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _substyle2 = require('substyle');

var _substyle3 = _interopRequireDefault(_substyle2);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _SuggestionsOverlay = require('./SuggestionsOverlay');

var _SuggestionsOverlay2 = _interopRequireDefault(_SuggestionsOverlay);

var _Highlighter = require('./Highlighter');

var _Highlighter2 = _interopRequireDefault(_Highlighter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _getTriggerRegex = function _getTriggerRegex(trigger) {
  if (trigger instanceof RegExp) {
    return trigger;
  } else {
    var escapedTriggerChar = _utils2.default.escapeRegex(trigger);

    // first capture group is the part to be replaced on completion
    // second capture group is for extracting the search query
    return new RegExp("(?:^|\\s)(" + escapedTriggerChar + "([^\\s" + escapedTriggerChar + "]*))$");
  }
};

var _getDataProvider = function _getDataProvider(data) {
  if (data instanceof Array) {
    // if data is an array, create a function to query that
    return function (query, callback) {
      var results = [];
      for (var i = 0, l = data.length; i < l; ++i) {
        var display = data[i].display || data[i].id;
        if (display.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
          results.push(data[i]);
        }
      }
      return results;
    };
  } else {
    // expect data to be a query function
    return data;
  }
};

var KEY = { TAB: 9, RETURN: 13, ESC: 27, UP: 38, DOWN: 40 };

var isComposing = false;

var MentionsInput = _react2.default.createClass({

  displayName: 'MentionsInput',

  propTypes: {

    /**
     * If set to `true` a regular text input element will be rendered
     * instead of a textarea
     */
    singleLine: _react.PropTypes.bool,

    markup: _react.PropTypes.string,
    value: _react.PropTypes.string,

    displayTransform: _react.PropTypes.func,
    onKeyDown: _react.PropTypes.func,
    onSelect: _react.PropTypes.func,
    onBlur: _react.PropTypes.func,
    onChange: _react.PropTypes.func,

    children: _react.PropTypes.oneOfType([_react.PropTypes.element, _react.PropTypes.arrayOf(_react.PropTypes.element)]).isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      markup: "@[__display__](__id__)",
      singleLine: false,
      displayTransform: function displayTransform(id, display, type) {
        return display;
      },
      onKeyDown: function onKeyDown() {
        return null;
      },
      onSelect: function onSelect() {
        return null;
      },
      onBlur: function onBlur() {
        return null;
      },
      style: {}
    };
  },

  getInitialState: function getInitialState() {
    return {
      focusIndex: 0,

      selectionStart: null,
      selectionEnd: null,

      suggestions: {},

      caretPosition: null,
      suggestionsPosition: null
    };
  },

  render: function render() {
    return _react2.default.createElement(
      'div',
      (0, _extends4.default)({ ref: 'container' }, substyle(this.props, getModifiers(this.props))),
      this.renderControl(),
      this.renderSuggestionsOverlay()
    );
  },

  getInputProps: function getInputProps(isTextarea) {
    var _props = this.props,
        readOnly = _props.readOnly,
        disabled = _props.disabled;

    // pass all props that we don't use through to the input control

    var props = (0, _omit2.default)(this.props, (0, _keys2.default)(MentionsInput.propTypes));

    return (0, _extends4.default)({}, props, substyle(this.props, getModifiers(this.props, "input")), {

      value: this.getPlainText()

    }, !readOnly && !disabled && {
      onChange: this.handleChange,
      onSelect: this.handleSelect,
      onKeyDown: this.handleKeyDown,
      onBlur: this.handleBlur,
      onCompositionStart: this.handleCompositionStart,
      onCompositionEnd: this.handleCompositionEnd
    });
  },

  renderControl: function renderControl() {
    var singleLine = this.props.singleLine;

    var inputProps = this.getInputProps(!singleLine);

    return _react2.default.createElement(
      'div',
      substyle(this.props, getModifiers(this.props, "control")),
      this.renderHighlighter(inputProps.style),
      singleLine ? this.renderInput(inputProps) : this.renderTextarea(inputProps)
    );
  },

  renderInput: function renderInput(props) {

    return _react2.default.createElement('input', (0, _extends4.default)({
      type: 'text',
      ref: 'input'
    }, props));
  },

  renderTextarea: function renderTextarea(props) {
    return _react2.default.createElement('textarea', (0, _extends4.default)({
      ref: 'input'
    }, props));
  },

  renderSuggestionsOverlay: function renderSuggestionsOverlay() {
    var _this = this;

    if (!_utils2.default.isNumber(this.state.selectionStart)) {
      // do not show suggestions when the input does not have the focus
      return null;
    }

    var _substyle = substyle(this.props, getModifiers(this.props, "suggestions")),
        className = _substyle.className,
        style = _substyle.style;

    return _react2.default.createElement(_SuggestionsOverlay2.default, {
      className: className,
      style: (0, _extends4.default)({}, style, this.state.suggestionsPosition),
      focusIndex: this.state.focusIndex,
      scrollFocusedIntoView: this.state.scrollFocusedIntoView,
      ref: 'suggestions',
      suggestions: this.state.suggestions,
      onSelect: this.addMention,
      onMouseDown: this.handleSuggestionsMouseDown,
      onMouseEnter: function onMouseEnter(focusIndex) {
        return _this.setState({
          focusIndex: focusIndex,
          scrollFocusedIntoView: false
        });
      },
      isLoading: this.isLoading() });
  },

  renderHighlighter: function renderHighlighter(inputStyle) {
    var _this2 = this;

    var _state = this.state,
        selectionStart = _state.selectionStart,
        selectionEnd = _state.selectionEnd;
    var _props2 = this.props,
        markup = _props2.markup,
        displayTransform = _props2.displayTransform,
        singleLine = _props2.singleLine,
        children = _props2.children,
        value = _props2.value;


    return _react2.default.createElement(
      _Highlighter2.default,
      (0, _extends4.default)({
        ref: 'highlighter'
      }, substyle(this.props, getModifiers(this.props, "highlighter")), {
        inputStyle: inputStyle,
        value: value,
        markup: markup,
        displayTransform: displayTransform,
        singleLine: singleLine,
        selection: {
          start: selectionStart,
          end: selectionEnd
        },
        onCaretPositionChange: function onCaretPositionChange(position) {
          return _this2.setState({ caretPosition: position });
        } }),
      children
    );
  },

  // Returns the text to set as the value of the textarea with all markups removed
  getPlainText: function getPlainText() {
    return _utils2.default.getPlainText(this.props.value || "", this.props.markup, this.props.displayTransform);
  },

  executeOnChange: function executeOnChange(event) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (this.props.onChange) {
      var _props3;

      return (_props3 = this.props).onChange.apply(_props3, [event].concat(args));
    }

    if (this.props.valueLink) {
      var _props$valueLink;

      return (_props$valueLink = this.props.valueLink).requestChange.apply(_props$valueLink, [event.target.value].concat(args));
    }
  },

  // Handle input element's change event
  handleChange: function handleChange(ev) {

    if (document.activeElement !== ev.target) {
      // fix an IE bug (blur from empty input element with placeholder attribute trigger "input" event)
      return;
    }

    var value = this.props.value || "";
    var newPlainTextValue = ev.target.value;

    // Derive the new value to set by applying the local change in the textarea's plain text
    var newValue = _utils2.default.applyChangeToValue(value, this.props.markup, newPlainTextValue, this.state.selectionStart, this.state.selectionEnd, ev.target.selectionEnd, this.props.displayTransform);

    // In case a mention is deleted, also adjust the new plain text value
    newPlainTextValue = _utils2.default.getPlainText(newValue, this.props.markup, this.props.displayTransform);

    // Save current selection after change to be able to restore caret position after rerendering
    var selectionStart = ev.target.selectionStart;
    var selectionEnd = ev.target.selectionEnd;
    var setSelectionAfterMentionChange = false;

    // Adjust selection range in case a mention will be deleted by the characters outside of the
    // selection range that are automatically deleted
    var startOfMention = _utils2.default.findStartOfMentionInPlainText(value, this.props.markup, selectionStart, this.props.displayTransform);

    if (startOfMention !== undefined && this.state.selectionEnd > startOfMention) {
      // only if a deletion has taken place
      selectionStart = startOfMention;
      selectionEnd = selectionStart;
      setSelectionAfterMentionChange = true;
    }

    this.setState({
      selectionStart: selectionStart,
      selectionEnd: selectionEnd,
      setSelectionAfterMentionChange: setSelectionAfterMentionChange,
      focusIndex: 0
    });

    var mentions = _utils2.default.getMentions(newValue, this.props.markup);

    // Propagate change
    // var handleChange = this.getOnChange(this.props) || emptyFunction;
    var eventMock = { target: { value: newValue } };
    // this.props.onChange.call(this, eventMock, newValue, newPlainTextValue, mentions);
    this.executeOnChange(eventMock, newValue, newPlainTextValue, mentions);
  },

  // Handle input element's select event
  handleSelect: function handleSelect(ev) {
    // do nothing while a IME composition session is active
    if (isComposing) return;

    // keep track of selection range / caret position
    this.setState({
      selectionStart: ev.target.selectionStart,
      selectionEnd: ev.target.selectionEnd
    });

    // refresh suggestions queries
    var el = this.refs.input;
    if (ev.target.selectionStart === ev.target.selectionEnd) {
      this.updateMentionsQueries(el.value, ev.target.selectionStart);
    } else {
      this.clearSuggestions();
    }

    // sync highlighters scroll position
    this.updateHighlighterScroll();

    this.props.onSelect(ev);
  },

  handleKeyDown: function handleKeyDown(ev) {
    // do not intercept key events if the suggestions overlay is not shown
    var suggestionsCount = _utils2.default.countSuggestions(this.state.suggestions);

    var suggestionsComp = this.refs.suggestions;
    if (suggestionsCount === 0 || !suggestionsComp) {
      this.props.onKeyDown(ev);

      return;
    }

    if ((0, _values2.default)(KEY).indexOf(ev.keyCode) >= 0) {
      ev.preventDefault();
    }

    switch (ev.keyCode) {
      case KEY.ESC:
        {
          this.clearSuggestions();
          return;
        }
      case KEY.DOWN:
        {
          this.shiftFocus(+1);
          return;
        }
      case KEY.UP:
        {
          this.shiftFocus(-1);
          return;
        }
      case KEY.RETURN:
        {
          this.selectFocused();
          return;
        }
      case KEY.TAB:
        {
          this.selectFocused();
          return;
        }
    }
  },

  shiftFocus: function shiftFocus(delta) {
    var suggestionsCount = _utils2.default.countSuggestions(this.state.suggestions);

    this.setState({
      focusIndex: (suggestionsCount + this.state.focusIndex + delta) % suggestionsCount,
      scrollFocusedIntoView: true
    });
  },

  selectFocused: function selectFocused() {
    var _state2 = this.state,
        suggestions = _state2.suggestions,
        focusIndex = _state2.focusIndex;

    var _utils$getSuggestion = _utils2.default.getSuggestion(suggestions, focusIndex),
        suggestion = _utils$getSuggestion.suggestion,
        descriptor = _utils$getSuggestion.descriptor;

    this.addMention(suggestion, descriptor);

    this.setState({
      focusIndex: 0
    });
  },

  handleBlur: function handleBlur(ev) {
    var _this3 = this;

    // only reset selection if the mousedown happened on an element
    // other than the suggestions overlay
    if (!this._suggestionsMouseDown) {
      this.setState({
        selectionStart: null,
        selectionEnd: null
      });
    };
    this._suggestionsMouseDown = false;

    window.setTimeout(function () {
      _this3.updateHighlighterScroll();
    }, 1);

    // do not intercept key events if the suggestions overlay is not shown
    var suggestionsShown = _utils2.default.countSuggestions(this.state.suggestions) > 0;
    this.props.onBlur(ev, suggestionsShown);
  },

  handleSuggestionsMouseDown: function handleSuggestionsMouseDown(ev) {
    this._suggestionsMouseDown = true;
  },

  updateSuggestionsPosition: function updateSuggestionsPosition() {
    var caretPosition = this.state.caretPosition;


    if (!caretPosition || !this.refs.suggestions) {
      return;
    }

    var container = this.refs.container;


    var suggestions = _reactDom2.default.findDOMNode(this.refs.suggestions);
    var highlighter = _reactDom2.default.findDOMNode(this.refs.highlighter);

    if (!suggestions) {
      return;
    }

    var left = caretPosition.left - highlighter.scrollLeft;
    var position = {};

    // guard for mentions suggestions list clipped by right edge of window
    if (left + suggestions.offsetWidth > container.offsetWidth) {
      position.right = 0;
    } else {
      position.left = left;
    }

    position.top = caretPosition.top - highlighter.scrollTop;

    if ((0, _isEqual2.default)(position, this.state.suggestionsPosition)) {
      return;
    }

    this.setState({
      suggestionsPosition: position
    });
  },

  updateHighlighterScroll: function updateHighlighterScroll() {
    if (!this.refs.input || !this.refs.highlighter) {
      // since the invocation of this function is deferred,
      // the whole component may have been unmounted in the meanwhile
      return;
    }
    var input = this.refs.input;
    var highlighter = _reactDom2.default.findDOMNode(this.refs.highlighter);
    highlighter.scrollLeft = input.scrollLeft;
  },

  handleCompositionStart: function handleCompositionStart() {
    isComposing = true;
  },

  handleCompositionEnd: function handleCompositionEnd() {
    isComposing = false;
  },

  componentDidMount: function componentDidMount() {
    this.updateSuggestionsPosition();
  },

  componentDidUpdate: function componentDidUpdate() {
    this.updateSuggestionsPosition();

    // maintain selection in case a mention is added/removed causing
    // the cursor to jump to the end
    if (this.state.setSelectionAfterMentionChange) {
      this.setState({ setSelectionAfterMentionChange: false });
      this.setSelection(this.state.selectionStart, this.state.selectionEnd);
    }
  },

  setSelection: function setSelection(selectionStart, selectionEnd) {
    if (selectionStart === null || selectionEnd === null) return;

    var el = this.refs.input;
    if (el.setSelectionRange) {
      el.setSelectionRange(selectionStart, selectionEnd);
    } else if (el.createTextRange) {
      var range = el.createTextRange();
      range.collapse(true);
      range.moveEnd('character', selectionEnd);
      range.moveStart('character', selectionStart);
      range.select();
    }
  },

  updateMentionsQueries: function updateMentionsQueries(plainTextValue, caretPosition) {
    // Invalidate previous queries. Async results for previous queries will be neglected.
    this._queryId++;
    this.setState({
      suggestions: {}
    });

    // If caret is inside of or directly behind of mention, do not query
    var value = this.props.value || "";
    if (_utils2.default.isInsideOfMention(value, this.props.markup, caretPosition, this.props.displayTransform) || _utils2.default.isInsideOfMention(value, this.props.markup, caretPosition - 1, this.props.displayTransform)) {
      return;
    }

    // Check if suggestions have to be shown:
    // Match the trigger patterns of all Mention children the new plain text substring up to the current caret position
    var substring = plainTextValue.substring(0, caretPosition);

    var that = this;
    _react2.default.Children.forEach(this.props.children, function (child) {
      if (!child) {
        return;
      }

      var regex = _getTriggerRegex(child.props.trigger);
      var match = substring.match(regex);
      if (match) {
        var querySequenceStart = substring.indexOf(match[1], match.index);
        that.queryData(match[2], child, querySequenceStart, querySequenceStart + match[1].length, plainTextValue);
      }
    });
  },

  clearSuggestions: function clearSuggestions() {
    // Invalidate previous queries. Async results for previous queries will be neglected.
    this._queryId++;
    this.setState({
      suggestions: {},
      focusIndex: 0
    });
  },

  queryData: function queryData(query, mentionDescriptor, querySequenceStart, querySequenceEnd, plainTextValue) {
    var provideData = _getDataProvider(mentionDescriptor.props.data);
    var snycResult = provideData(query, this.updateSuggestions.bind(null, this._queryId, mentionDescriptor, query, querySequenceStart, querySequenceEnd, plainTextValue));
    if (snycResult instanceof Array) {
      this.updateSuggestions(this._queryId, mentionDescriptor, query, querySequenceStart, querySequenceEnd, plainTextValue, snycResult);
    }
  },

  updateSuggestions: function updateSuggestions(queryId, mentionDescriptor, query, querySequenceStart, querySequenceEnd, plainTextValue, suggestions) {
    // neglect async results from previous queries
    if (queryId !== this._queryId) return;

    var update = {};
    update[mentionDescriptor.props.type] = {
      query: query,
      mentionDescriptor: mentionDescriptor,
      querySequenceStart: querySequenceStart,
      querySequenceEnd: querySequenceEnd,
      results: suggestions,
      plainTextValue: plainTextValue
    };

    this.setState({
      suggestions: _utils2.default.extend({}, this.state.suggestions, update)
    });
  },

  addMention: function addMention(suggestion, _ref) {
    var mentionDescriptor = _ref.mentionDescriptor,
        querySequenceStart = _ref.querySequenceStart,
        querySequenceEnd = _ref.querySequenceEnd,
        plainTextValue = _ref.plainTextValue;

    // Insert mention in the marked up value at the correct position
    var value = this.props.value || "";
    var start = _utils2.default.mapPlainTextIndex(value, this.props.markup, querySequenceStart, 'START', this.props.displayTransform);
    var end = start + querySequenceEnd - querySequenceStart;
    var insert = _utils2.default.makeMentionsMarkup(this.props.markup, suggestion.id, suggestion.display, mentionDescriptor.props.type);
    if (mentionDescriptor.props.appendSpaceOnAdd) {
      insert = insert + ' ';
    }
    var newValue = _utils2.default.spliceString(value, start, end, insert);

    // Refocus input and set caret position to end of mention
    this.refs.input.focus();

    var displayValue = this.props.displayTransform(suggestion.id, suggestion.display, mentionDescriptor.props.type);
    if (mentionDescriptor.props.appendSpaceOnAdd) {
      displayValue = displayValue + ' ';
    }
    var newCaretPosition = querySequenceStart + displayValue.length;
    this.setState({
      selectionStart: newCaretPosition,
      selectionEnd: newCaretPosition,
      setSelectionAfterMentionChange: true
    });

    // Propagate change
    var eventMock = { target: { value: newValue } };
    var mentions = _utils2.default.getMentions(newValue, this.props.markup);
    var newPlainTextValue = _utils2.default.spliceString(plainTextValue, querySequenceStart, querySequenceEnd, displayValue);

    this.executeOnChange(eventMock, newValue, newPlainTextValue, mentions);

    var onAdd = mentionDescriptor.props.onAdd;
    if (onAdd) {
      onAdd(suggestion.id, suggestion.display);
    }

    // Make sure the suggestions overlay is closed
    this.clearSuggestions();
  },

  isLoading: function isLoading() {
    var isLoading = false;
    _react2.default.Children.forEach(this.props.children, function (child) {
      isLoading = isLoading || child && child.props.isLoading;
    });
    return isLoading;
  },

  _queryId: 0

});

exports.default = (0, _OptionalRadium2.default)(MentionsInput);


var getModifiers = function getModifiers(props) {
  for (var _len2 = arguments.length, modifiers = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    modifiers[_key2 - 1] = arguments[_key2];
  }

  return (0, _extends4.default)({}, modifiers.reduce(function (result, modifier) {
    return (0, _extends4.default)({}, result, (0, _defineProperty3.default)({}, modifier, true));
  }, {}), {

    "&singleLine": props.singleLine,
    "&multiLine": !props.singleLine
  });
};

var isMobileSafari = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

var substyle = (0, _substyle3.default)({
  style: {
    position: "relative",
    overflowY: "visible",

    input: {
      display: "block",
      position: "absolute",

      top: 0,

      boxSizing: "border-box",

      backgroundColor: "transparent",

      width: "inherit"
    },

    '&multiLine': {
      input: (0, _extends4.default)({
        width: "100%",
        height: "100%",
        bottom: 0,
        overflow: "hidden",
        resize: "none"

      }, isMobileSafari ? {
        marginTop: 1,
        marginLeft: -3
      } : null)
    }
  }
});