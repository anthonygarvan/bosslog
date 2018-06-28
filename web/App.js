const React = require('react');
const ReactDOM = require('react-dom');
const Bignote = require('./components/Bignote');
require('./components/register-service-worker');

ReactDOM.render(
    <Bignote />,
  document.getElementById('root')
);
