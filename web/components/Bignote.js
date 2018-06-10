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
const CryptoJS = require('crypto-js');
const $ = require('jquery');

class Bignote extends React.Component {
  constructor(props) {
    super(props);
    this.handleNoteChange = this.handleNoteChange.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleSearchResultClick = this.handleSearchResultClick.bind(this);
    this.refreshSearch = this.refreshSearch.bind(this);
    this.handleLoginSuccess = this.handleLoginSuccess.bind(this);
    this.handleLoginFailure = this.handleLoginFailure.bind(this);
    this.handlePasswordSet = this.handlePasswordSet.bind(this);
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
      mode: 'note',
      passwordValue: '',
      password: window.localStorage.getItem('bigNotePassword')
    };
  }

  componentWillMount() {
    $.getJSON('/auth/is-authenticated', result => {
      this.setState(result);
    })
  }

  syncData() {
    let contentState = convertToRaw(this.state.editorState.getCurrentContent());

    contentState = contentState.map(block => {
        block.text = CryptoJS.AES.encrypt(block.text, this.state.password);
        return block;
    });

    const bigNote = { editorState: contentState,
                      selectionState: this.state.editorState.getSelection() };

    console.log(this.bigNote);
    console.log(bigNote);
    const diffObj = diff.diff(this.bigNote, bigNote);

    $.post(`/sync`)
  }

  handleNoteChange(editorState) {
    this.setState({ editorState });

    if(this.state.isSignedIn && this.state.password) {
      this.debouncedSync();
    }
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

  handleLoginSuccess(response) {
    console.log(response)
    this.setState({ user: response });
  }

  handleLoginFailure(response) {
    console.log(response);
    this.setState( { isSignedIn: false });
  }

  handlePasswordSet() {
    this.setState({ password: this.state.passwordValue, loggingIn: false }, () => {
      window.localStorage.setItem('bigNotePassword', this.state.passwordValue);
    });
  }

  render() {
    return <div><div className="sp-bignote-container">{ this.state.mode === 'note' ?
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
            </div> }</div>
            <footer className="footer sp-footer">
              <div className="container">
              <div className="content has-text-centered">
              { (this.state.isAuthenticated && this.state.password) ? <p>Logged in & syncing as {this.state.userEmail}.</p>
              : <p>Want to sync your data? You'll need to <a onClick={() => this.setState({ loggingIn: true })}>sign in</a>.</p> }
              <div className={`modal ${this.state.loggingIn && 'is-active'}`}>
                <div className="modal-background" onClick={() => this.setState( { loggingIn: false })}></div>
                <div className="modal-content">
                  <div className="box is-centered">{this.state.isAuthenticated ? <div><p>Logged in as {this.state.userEmail}.</p>
                  <p>Please enter your password. It must be at least 8 characters.</p>
                  <div className="field">
                    <p className="control has-icons-left">
                      <input className={`input ${this.state.passwordIsValid ? 'is-success' : this.state.passwordValue && 'is-danger'}`} type="password" placeholder="Password" value={this.state.passwordValue}
                        onChange={(e) => this.setState({ passwordValue: e.target.value, passwordIsValid: e.target.value.length >= 8 })}/>
                      <span className="icon is-small is-left">
                        <i className="fas fa-lock"></i>
                      </span>
                    </p>
                  </div>

                  <p><i className="fas fa-exclamation-triangle"></i>&nbsp;&nbsp;For your security, we do not store your password.
                  If you lose your password you will not be able to access your note.</p>
                  <p>
                    <a className="button is-primary" disabled={!this.state.passwordIsValid} onClick={this.handlePasswordSet}>Start Secure Sync</a>
                  </p>
                  </div>
                     : <div>
                    <p>Please sign in with your Google account.</p>
                     <p><a href="/auth/authenticate" className="button is-primary">Log in with Google</a></p></div>}
                </div></div>
                <button className="modal-close is-large" onClick={() => this.setState({ loggingIn: false })}></button>
              </div>
              <p>Copyright © 2018. Made with ♥ by <a href="https://www.twitter.com/anthonygarvan">@anthonygarvan</a>.</p>
              <p><a href="/privacy.txt">Privacy</a> | <a href="/terms.txt">Terms</a></p>
              <p>Questions, comments or problems? Feel free to tweet me or use my handy <a href="/contact">contact form</a>.</p>
              </div></div></footer></div>
  }
}

module.exports = Bignote
