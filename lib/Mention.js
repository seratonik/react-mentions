"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _OptionalRadium = require("./OptionalRadium");

var _OptionalRadium2 = _interopRequireDefault(_OptionalRadium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Mention(_ref) {
  var display = _ref.display,
      className = _ref.className,
      style = _ref.style;

  return _react2.default.createElement(
    "strong",
    { className: className, style: (0, _extends3.default)({}, defaultStyle, style) },
    display
  );
}

Mention.propTypes = {
  /**
   * Called when a new mention is added in the input
   *
   * Example:
   *
   * ```js
   * function(id, display) {
   *   console.log("user " + display + " was mentioned!");
   * }
   * ```
   */
  onAdd: _propTypes2.default.func,
  onRemove: _propTypes2.default.func,

  renderSuggestion: _propTypes2.default.func,

  trigger: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.instanceOf(RegExp)]),

  isLoading: _propTypes2.default.bool,
  className: _propTypes2.default.string,
  style: _propTypes2.default.object
};

Mention.defaultProps = {
  trigger: "@",

  onAdd: function onAdd() {
    return null;
  },
  onRemove: function onRemove() {
    return null;
  },
  renderSuggestion: null,
  isLoading: false,
  appendSpaceOnAdd: false
};

var defaultStyle = {
  fontWeight: "inherit"
};

exports.default = (0, _OptionalRadium2.default)(Mention);