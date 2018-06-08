const React = require('react');
const _ = require('lodash');
const Editor = require('draft-js-plugins-editor').default;
const createMarkdownPlugin = require('draft-js-markdown-plugin').default;
const draft = require('draft-js');
const diff = require('deep-diff');
const EditorState = draft.EditorState;
const SelectionState = draft.SelectionState;
const convertToRaw = draft.convertToRaw;
const convertFromRaw = draft.convertFromRaw;

class Bignote extends React.Component {
  constructor(props) {
    super(props);
    this.handleNoteChange = this.handleNoteChange.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleSearchResultClick = this.handleSearchResultClick.bind(this);
    this.refreshSearch = this.refreshSearch.bind(this);
    this.syncData = this.syncData.bind(this);
    this.debouncedSync = _.debounce(this.syncData, 5000);

    let editorState;
    if(window.localStorage.getItem("bigNote")) {
      this.bigNote = JSON.parse(window.localStorage.getItem("bigNote"));
      const bigNote = JSON.parse(window.localStorage.getItem("bigNote"));
      if(window.localStorage.getItem("bigNoteDiff")) {
        const bigNoteDiff = JSON.parse(window.localStorage.getItem("bigNoteDiff"));
        bigNoteDiff.forEach(change => {
          diff.applyChange(bigNote, null, change);
        })
      }
      editorState = EditorState.createWithContent(convertFromRaw(bigNote.editorState));
      const selectionState = SelectionState.createEmpty();
      selectionState.merge(bigNote.selectionState);
      editorState = EditorState.forceSelection(editorState, selectionState);
    } else {
      editorState = EditorState.createEmpty()
      this.bigNote = {};
    }

    this.state = {
      editorState: editorState,
      plugins: [createMarkdownPlugin()],
      searchResults: [],
      mode: 'note'
    };
  }

  syncData() {
    const bigNote = { editorState: convertToRaw(this.state.editorState.getCurrentContent()),
                      selectionState: this.state.editorState.getSelection() };

    console.log(this.bigNote);
    console.log(bigNote);
    const diffObj = diff.diff(this.bigNote, bigNote);

    if(diffObj.length < 50) {
      window.localStorage.setItem('bigNoteDiff', JSON.stringify(diffObj) );
      if(!window.localStorage.getItem('bigNote')) {
        window.localStorage.setItem('bigNote', '{}');
      }
    } else {
      window.localStorage.removeItem('bigNoteDiff');
      window.localStorage.setItem('bigNote', JSON.stringify(bigNote));
      this.bigNote = bigNote;
    }
  }

  handleNoteChange(editorState) {
    this.setState({ editorState });
    this.debouncedSync();
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

  render() {
    return this.state.mode === 'note' ?
          <div><div className="sp-note-header">
            <a onClick={() => { this.refreshSearch(); this.setState({ mode: 'search' }) }}>
              <i className="fa fa-search fa-2x"></i>
            </a>
          </div>
          <div className="sp-note content">
          <Editor
              editorState={this.state.editorState}
              onChange={this.handleNoteChange}
              plugins={this.state.plugins}
            /></div></div>
            :
            <div><div className="sp-search-header">
            <a onClick={() => this.setState({ mode: 'note' })}><i className="fa fa-arrow-left fa-2x"></i></a>

            <div className="sp-search field">
              <div className="sp-search-box control">
                <input className="input is-medium" type="search"
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

module.exports = Bignote
