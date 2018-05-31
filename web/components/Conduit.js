const React = require('react');
const ContentEditable = require('react-contenteditable');
const zango = require('zangodb');
const uuid = require('uuid/v1')

class Conduit extends React.Component {
  constructor(props) {
    super(props);
    document.execCommand('defaultParagraphSeparator', false, 'div');
    const rootDb = new zango.Db('notes', {notes: ['position', 'note']})
    this.db = rootDb.collection('notes');
    console.log(this.db.find({}).sort({ position: -1 }));
    this.state = {mode: 'note', notes: [], startPosition: 0, endPosition: 1};
    this.db.find({}).sort({ position: 1 }).toArray((err, notes) => {
        this.setState({ notes });
    })
    this.handleNoteChange = this.handleNoteChange.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
  }

  handleNoteChange(e) {
    console.log(e.target.value);
    const notesRaw = e.target.value.split('</div>').filter(n => n).map(n => n.replace('<div>', ''));
    const notes = notesRaw.map((rawNote, i) => {
      return {note: rawNote, position: this.state.startPosition + (i / notesRaw.length)*(this.state.endPosition - this.state.startPosition)}
    });
    this.db.remove({ position:  {$gte: this.state.startPosition, $lte: this.state.endPosition}});
    this.db.insert(notes);
    this.setState({ notes });
  }

  handleSearchChange(e) {
    const searchTerms = e.target.value.split(' ').filter(t => t).map(t => t.toLowerCase());
    this.state.notes.filter(note => note.toLowerCase().indexOf())
  }

  render() {
    return this.state.mode === 'note' ?
          <div><div className="sp-note-header">
            <a onClick={() => this.setState({ mode: 'search' })}>
              <img src="/img/search.png" alt="search" />
            </a>
          </div>
          <ContentEditable
            className="sp-note"
            html={this.state.notes.map(n => `<div>${n.note}</div>`).join('')}
            onChange={this.handleNoteChange} /></div>
            :
            <div><div className="sp-search-header">
            <a onClick={() => this.setState({ mode: 'note' })}><img src="/img/back.png" alt="back" /></a>

            <div className="sp-search field has-addons has-addons-right">
              <div className="sp-search-box control">
                <input className="input" type="text"
                  placeholder="Search your note..."
                  onChange={this.handleSearchChange}/>
                <span className="icon is-right">
                  <a onClick={() => alert('clicked!')}></a>
                </span>
              </div>
              <p class="control">
                 <a class="button is-transparent">
                   <img src="/img/remove.png" alt="remove" />
                 </a>
               </p>
            </div>
            </div>
            <div className="sp-search-results">results</div>
            </div>
  }
}

module.exports = Conduit
