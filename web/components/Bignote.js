const React = require('react');
const _ = require('lodash');
const Editor = require('draft-js-plugins-editor').default;
const createMarkdownPlugin = require('draft-js-markdown-plugin').default;
const createLinkifyPlugin = require('draft-js-linkify-plugin').default;
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
    this.handleLoginSuccess = this.handleLoginSuccess.bind(this);
    this.handleLoginFailure = this.handleLoginFailure.bind(this);
    this.handlePasswordSet = this.handlePasswordSet.bind(this);
    this.handleNotLoggingIn = this.handleNotLoggingIn.bind(this);
    this.syncData = this.syncData.bind(this);
    this.assembleEditorState = this.assembleEditorState.bind(this);
    this.getVisibility = this.getVisibility.bind(this);
    this.forceRefresh = this.forceRefresh.bind(this);
    this.debouncedSync = _.debounce(this.syncData, 5000);

    let editorState;
    if(window.localStorage.getItem("bigNoteLocalChanges")) {
      this.bigNoteServerState = window.localStorage.getItem("bigNoteServerState") ? JSON.parse(window.localStorage.getItem("bigNoteServerState")) : {};
      const bigNoteLocalChanges = JSON.parse(window.localStorage.getItem('bigNoteLocalChanges'));
      this.revision = parseInt(window.localStorage.getItem('revision'));
      this.currentBigNote = _.cloneDeep(this.bigNoteServerState);
      bigNoteLocalChanges.forEach(change => {
        diff.applyChange(this.currentBigNote, null, change);
      })
      editorState = this.assembleEditorState(this.currentBigNote);
    } else {
      editorState = EditorState.createEmpty()
      this.currentBigNote = { contentState:  convertToRaw(editorState.getCurrentContent()),
                        selectionState: JSON.parse(JSON.stringify(editorState.getSelection())) };
      this.bigNoteServerState = {};
      this.revision = 0;
      window.localStorage.setItem('revision', this.revision);
    }

    this.blockMetaData = {}
    this.currentBigNote.contentState.blocks.forEach((block, i) => {
      this.blockMetaData[block.key] = {text: block.text, index: i}
    });

    const linkifyPlugin = createLinkifyPlugin({
      component: (props) => {
        const newProps = _.clone(props);
        delete newProps.contentState;
        return (
        <a {...newProps} onClick={() => {
          window.open(newProps.href, "_blank");
        }}
        />);
      }
    });

    this.state = {
      editorState: editorState,
      plugins: [createMarkdownPlugin(), linkifyPlugin],
      searchString: '',
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
    let contentState = convertFromRaw(bigNote.contentState);
    let editorState = EditorState.createWithContent(contentState);
    const selectionState = SelectionState.createEmpty();
    selectionState.merge(bigNote.selectionState);
    editorState = EditorState.forceSelection(editorState, selectionState);
    return editorState;
  }

  syncData() {
    const diffObj = diff.diff(this.bigNoteServerState, this.currentBigNote);

    if(diffObj && diffObj.length > 0) {
      window.localStorage.setItem('bigNoteLocalChanges', JSON.stringify(diffObj));
    }

    if(this.state.isAuthenticated && this.state.password && diffObj && diffObj.length > 0) {
      $.post('/sync', { revision: this.revision + 1,
        encryptedDiff: CryptoJS.AES.encrypt(JSON.stringify(diffObj), this.state.password).toString() }, (data) => {
        window.localStorage.setItem('bigNoteLocalChanges', '[]');

        if( data.success ) {
          this.bigNoteServerState = this.currentBigNote;
          this.revision += 1
          window.localStorage.setItem('revision', this.revision);
        } else {
          const serverDiffs = data.revisions.map(revision => {
            return JSON.parse(CryptoJS.AES.decrypt(
                revision.encryptedDiff,
                this.state.password).toString(CryptoJS.enc.Utf8));
          })

          serverDiffs.forEach(changes => {
              changes.forEach(change => {
                diff.applyChange(this.bigNoteServerState, null, change);
              });
          });

          this.revision = parseInt(data.revisions[data.revisions.length - 1].revision);
          this.setState({ editorState: this.assembleEditorState(this.bigNoteServerState) });
        }

        window.localStorage.setItem('revision', this.revision);
        window.localStorage.setItem('bigNoteServerState', JSON.stringify(this.bigNoteServerState));
      }).fail(() => {
        console.log('Failed to sync.');
      });
    }
  }

  getVisibility(contentBlock) {
    const regex = RegExp(this.state.searchString.replace(' ', '|'), 'i');
    if(this.state.mode === 'note' ||
        !this.currentBigNote.blockMetaData[contentBlock.key] ||
        (this.currentBigNote.blockMetaData[contentBlock.key].search && regex.test(this.currentBigNote.blockMetaData[contentBlock.key].search)) ||
        (this.currentBigNote.blockMetaData[contentBlock.key].header && regex.test(this.currentBigNote.blockMetaData[contentBlock.key].header)) ||
        regex.test(contentBlock.text)) {
      return '';
    } else {
      return 'sp-hidden';
    }
  }

  handleNoteChange(editorState) {
    let contentState = convertToRaw(this.state.editorState.getCurrentContent());
    this.currentBigNote = { contentState: contentState,
                      selectionState: JSON.parse(JSON.stringify(this.state.editorState.getSelection())),
                      blockMetaData: this.currentBigNote.blockMetaData || {} };

    let header = false;
    this.currentBigNote.contentState.blocks.forEach((block, i) => {
      if(!this.currentBigNote.blockMetaData[block.key]) {
        this.currentBigNote.blockMetaData[block.key] = {index: i, createdOn: new Date()};

        if(this.state.mode == 'search' && this.state.searchString) {
          this.currentBigNote.blockMetaData[block.key].search = this.state.searchString;
        }
      }

      if(block.type.indexOf('header') === 0) {
        header = block.text;
      }

      if(block.text === '') {
        header = false;
      }

      if(header) {
        this.currentBigNote.blockMetaData[block.key].header = header;
      }
    });
    this.setState({ editorState });
    this.debouncedSync();
  }

  forceRefresh() {
    const editorState = EditorState.createWithContent(this.state.editorState.getCurrentContent());
    EditorState.set(editorState, { selection: this.state.editorState.getSelection() });
    this.handleNoteChange(editorState);
  }

  handleSearchChange(e) {
    this.setState({ searchString: e.target.value }, () => {
      this.forceRefresh();
    });
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

  componentDidUpdate() {
    console.log('updated');
  }

  render() {
    return <div><div className="sp-bignote-container">
          <div className="sp-note-header">
            <div className={`sp-search-header ${this.state.mode !== 'search' && 'sp-hidden'}`}>
            <a className={`sp-back ${this.state.mode === 'note' && 'sp-hidden'}`}
              onClick={() => this.setState({ mode: 'note' }, () => {this.forceRefresh();}) }><i className="fa fa-arrow-left fa-2x"></i></a>
            <div className="sp-search field">
              <div className="sp-search-box control">
              <form autoComplete="off">
                <input autoComplete="false" name="hidden" type="text" className="sp-hidden" />
                <input className="input is-medium" type="search"
                  placeholder="Search your note..."
                  onChange={this.handleSearchChange}
                  value={this.state.searchString}/>
              </form>
              </div>
            </div>
            </div>
            <a className={`sp-search-icon ${this.state.mode === 'search' && 'sp-hidden'}`}
              onClick={() => { this.setState({ mode: 'search' }, () => {this.forceRefresh();}) }}>
              <i className="fa fa-search fa-2x"></i>
            </a>
          </div>
          <div className={`sp-note content ${this.state.mode === 'search' && 'sp-with-search-mode'}`}>
          <Editor
              editorState={this.state.editorState}
              onChange={this.handleNoteChange}
              plugins={this.state.plugins}
              blockStyleFn={this.getVisibility}
            /></div></div>
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
