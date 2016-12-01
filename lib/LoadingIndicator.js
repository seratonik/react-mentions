'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _OptionalRadium = require('./OptionalRadium');

var _OptionalRadium2 = _interopRequireDefault(_OptionalRadium);

var _substyle = require('substyle');

var _substyle2 = _interopRequireDefault(_substyle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Spinner(props) {
  return _react2.default.createElement(
    'div',
    (0, _substyle2.default)(props),
    _react2.default.createElement('div', (0, _substyle2.default)(props, ["element", "element1"])),
    _react2.default.createElement('div', (0, _substyle2.default)(props, ["element", "element2"])),
    _react2.default.createElement('div', (0, _substyle2.default)(props, ["element", "element3"])),
    _react2.default.createElement('div', (0, _substyle2.default)(props, ["element", "element4"])),
    _react2.default.createElement('div', (0, _substyle2.default)(props, ["element", "element5"]))
  );
};

function LoadingIndicator(props) {
  return _react2.default.createElement(
    'div',
    (0, _substyle2.default)(props),
    _react2.default.createElement(Spinner, (0, _substyle2.default)(props, "spinner"))
  );
};

exports.default = (0, _OptionalRadium2.default)(LoadingIndicator);