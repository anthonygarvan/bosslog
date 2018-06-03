const React = require('react');
const ContentEditable = require('react-contenteditable');
const zango = require('zangodb');
const uuid = require('uuid/v1');
const select = require('select');

class Conduit extends React.Component {
  constructor(props) {
    super(props);
    document.execCommand('defaultParagraphSeparator', false, 'div');
    const rootDb = new zango.Db('notes', {notes: ['position', 'note']})
    this.db = rootDb.collection('notes');
    this.state = {mode: 'note', notes: [], searchString: '', searchResults: [], startPosition: 0, endPosition: 1};
    this.db.find({}).sort({ position: 1 }).toArray((err, notes) => {
        this.setState({ notes });
    })
    this.handleNoteChange = this.handleNoteChange.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleSearchResultClick = this.handleSearchResultClick.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
    this.refreshSearch = this.refreshSearch.bind(this);
  }

  handleNoteChange(e) {
    const notesRaw = e.target.value.split('</div>').filter(n => n).map(n => n.replace('<div>', ''));
    const notes = notesRaw.map((rawNote, i) => {
      return {_id: uuid(), note: rawNote, position: this.state.startPosition + (i / notesRaw.length)*(this.state.endPosition - this.state.startPosition)}
    });
    this.setState({ notes })
    this.db.remove({ position:  {$gte: this.state.startPosition, $lte: this.state.endPosition}});
    this.db.insert(notes);
  }

  refreshSearch() {
      if(this.state.searchString) {
        this.db.find({ note: { $regex: RegExp(this.state.searchString.replace(' ', '|'), 'i') }}).sort({ position: 1 }).toArray((err, searchResults) => {
          this.setState({ searchResults });
        });
      } else {
        this.setState({ searchResults: [] })
      }
  }

  handleSearchChange(e) {
    this.setState({ searchString: e.target.value }, () => {
      this.refreshSearch();
    })
  }

  handlePaste(e) {
    e.preventDefault();
    e.stopPropagation();
    let paste = (e.clipboardData || window.clipboardData).getData('text');
    let lines = paste.split('\n');


    const selection = window.getSelection();
    if (!selection.rangeCount) return false;

    const newLines = document.createDocumentFragment();

    lines.forEach((line, i) => {
      if(i === 0) {
        selection.getRangeAt(0).insertNode(document.createTextNode(line));
      } else {
        var div = document.createElement('div');
        div.textContent = line;
        newLines.appendChild(div);
      }
    });

    if(lines.length > 1) {
      selection.anchorNode.parentNode.insertBefore(newLines, selection.anchorNode.nextSibling);
    }
  }

  handleSearchResultClick(_id) {
    return (e) => {
      let resultAt;
      this.db.find({ position:  {$gte: this.state.startPosition, $lte: this.state.endPosition}})
        .sort({ position: 1 }).toArray((err, notes) => {
          notes.forEach((note, i) => {
            if(note._id === _id) {
              resultAt = i;
            }
          });
          this.setState({mode: 'note', resultAt });
        })
    }
  }

  componentDidUpdate() {
    if(this.state.mode === 'note' && this.state.resultAt >= 0) {
      const resultElem = document.querySelectorAll('.sp-note div')[this.state.resultAt];
      resultElem.scrollIntoView();
      select(resultElem);

      this.setState({ resultAt: -1 });
    }
  }

  render() {
    return this.state.mode === 'note' ?
          <div><div className="sp-note-header">
            <a onClick={() => { this.refreshSearch(); this.setState({ mode: 'search' }) }}>
              <i className="fa fa-search"></i>
            </a>
          </div>
          <ContentEditable
            className="sp-note"
            html={this.state.notes.map(n => `<div>${n.note}</div>`).join('')}
            onChange={this.handleNoteChange}
            onPaste={this.handlePaste}/></div>
            :
            <div><div className="sp-search-header">
            <a onClick={() => this.setState({ mode: 'note' })}><i className="fa fa-arrow-left"></i></a>

            <div className="sp-search field">
              <div className="sp-search-box control">
                <input className="input" type="search"
                  placeholder="Search your note..."
                  onChange={this.handleSearchChange}
                  value={this.state.searchString}/>
              </div>
            </div>
            </div>
            <div className="sp-search-results">
            {this.state.searchResults.length ?
                this.state.searchResults.map(n => <a key={n._id} onClick={this.handleSearchResultClick(n._id)}><div>{n.note}</div></a>)
                : <div><em>No results.</em></div>}</div>
            </div>
  }
}

module.exports = Conduit
