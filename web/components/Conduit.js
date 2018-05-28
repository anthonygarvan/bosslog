const React = require('react');
const ContentEditable = require('react-contenteditable');

console.log(ContentEditable);

class Conduit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {topic: "Topic", note: "Notes here"};
    this.handleNoteChange = this.handleNoteChange.bind(this);
  }

  handleNoteChange(e) {
    this.setState({ note: e.target.value });
  }

  render() {
    return <div>
    <ContentEditable className="sp-note" html={this.state.note} onChange={this.handleNoteChange} /></div>
  }
}

module.exports = Conduit
