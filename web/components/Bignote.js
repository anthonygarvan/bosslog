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
    this.handleNotLoggingIn = this.handleNotLoggingIn.bind(this);
    this.syncData = this.syncData.bind(this);
    this.assembleEditorState = this.assembleEditorState.bind(this);
    this.debouncedSync = _.debounce(this.syncData, 5000);

    let editorState;
    if(window.localStorage.getItem("serverBigNote")) {
      this.serverBigNote = JSON.parse(window.localStorage.getItem("serverBigNote"));
      const bigNoteLocalChanges = JSON.parse(window.localStorage.getItem('bigNoteLocalChanges'));
      this.revision = parseInt(window.localStorage.getItem('revision'));
      const currentBigNote = Object.clone(this.serverBigNote);
      bigNoteLocalChanges.forEach(change => {
        diff.applyChange(currentBigNote, null, change);
      })
      editorState = this.assembleEditorState(currentBigNote);
    } else {
      editorState = EditorState.createEmpty()
      this.serverBigNote = {};
      this.revision = 0;
    }

    this.state = {
      editorState: editorState,
      plugins: [createMarkdownPlugin()],
      searchResults: [],
      mode: 'note',
      passwordValue: '',
      loggingIn: window.location.href.indexOf('loggingIn=true') >= 0,
      password: window.localStorage.getItem('bigNotePassword')
    };
  }

  componentWillMount() {
    $.getJSON('/auth/is-authenticated', result => {
      this.setState(result);
    })
  }

  assembleEditorState(bigNote) {
    const password = this.state && this.state.password || window.localStorage.getItem('bigNotePassword');
    bigNote.contentState.blocks = bigNote.contentState.blocks.map(block => {
      const bytes  = CryptoJS.AES.decrypt(block.text.toString(), password);
      block.text = bytes.toString(CryptoJS.enc.Utf8);
      return block
    });
    let contentState = convertFromRaw(bigNote.contentState);
    let editorState = EditorState.createWithContent(contentState);
    const selectionState = SelectionState.createEmpty();
    selectionState.merge(bigNote.selectionState);
    editorState = EditorState.forceSelection(editorState, selectionState);
    return editorState;
  }

  syncData() {
    let contentState = convertToRaw(this.state.editorState.getCurrentContent());
    contentState.blocks = contentState.blocks.map(block => {
        block.text = CryptoJS.AES.encrypt(block.text, this.state.password).toString();
        return block;
    });

    let currentBigNote = { contentState: contentState,
                      selectionState: JSON.parse(JSON.stringify(this.state.editorState.getSelection())) };

    const diffObj = diff.diff(this.serverBigNote, currentBigNote);
    this.revision += 1

    $.post('/sync', { revision: this.revision, diff: JSON.parse(JSON.stringify(diffObj)) }, (data) => {
      window.localStorage.setItem('bigNoteLocalChanges', '[]');

      if( data.success ) {
        this.serverBigNote = currentBigNote;
      } else {
        this.serverBigNote = data.bigNote;
        this.revision = data.revision;
        window.localStorage.setItem('revision', this.revision);
        this.setState({ editorState: this.assembleEditorState(this.serverBigNote) });
      }

      window.localStorage.setItem('serverBigNote', JSON.stringify(this.serverBigNote));
    }).fail(() => {
      window.localStorage.setItem('bigNoteLocalChanges', JSON.stringify(diffObj));
    });
  }

  handleNoteChange(editorState) {
    this.setState({ editorState });

    if(this.state.isAuthenticated && this.state.password) {
      this.debouncedSync();
    }
  }

  refreshSearch() {
    console.log('not implemented');
  }

  handleSearchChange(e) {
    this.setState({ searchString: e.target.value }, () => {
      this.refreshSearch();
    })
  }

  handleSearchResultClick(_id) {
    console.log('not implemented');
  }

  handleLoginSuccess(response) {
    this.setState({ user: response });
  }

  handleLoginFailure(response) {
    this.setState( { isSignedIn: false });
  }

  handleNotLoggingIn() {
    this.setState({ loggingIn: false }, () => {
      window.history.pushState(null, document.title, '/');
    })
  }

  handlePasswordSet() {
    this.setState({ password: this.state.passwordValue, loggingIn: false }, () => {
      window.localStorage.setItem('bigNotePassword', this.state.passwordValue);
      this.syncData();
      this.handleNotLoggingIn();
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
                <div className="modal-background" onClick={this.handleNotLoggingIn}></div>
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
                <button className="modal-close is-large" onClick={this.handleNotLoggingIn}></button>
              </div>
              <p>Copyright © 2018. Made with ♥ by <a href="https://www.twitter.com/anthonygarvan">@anthonygarvan</a>.</p>
              <p><a href="/privacy.txt">Privacy</a> | <a href="/terms.txt">Terms</a></p>
              <p>Questions, comments or problems? Feel free to tweet me or use my handy <a href="/contact">contact form</a>.</p>
              </div></div></footer></div>
  }
}

module.exports = Bignote
