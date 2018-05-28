const React = require('react');
const Editor = require('react-draft-wysiwyg').Editor;


class Conduit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <Editor />
  }
}

module.exports = Conduit
