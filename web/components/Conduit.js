const React = require('react');
const ContentEditable = require('react-contenteditable');

console.log(ContentEditable);

class Conduit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {notes: [{note: "Notes here"}, {note: "and here"}, {note:"and here"}]};
    this.handleNoteChange = this.handleNoteChange.bind(this);
  }

  handleNoteChange(e) {
    const notes = e.target.value.split('<div>').filter(n => n).map(n => ({note: n.replace('</div>', '')}));
    this.setState({ notes: notes});
  }

  render() {
    return <div>
          <div className="sp-header level">
            <a>
              <i className="fas fa-search"></i>
            </a>
          </div>
          <ContentEditable
            className="sp-note"
            html={this.state.notes.map(n => `<div>${n.note}</div>`).join('')}
            onChange={this.handleNoteChange} /></div>
  }
}

module.exports = Conduit
