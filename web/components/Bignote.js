const React = require('react');
const _ = require('lodash');
const diff = require('deep-diff');
const CryptoJS = require('crypto-js');
const $ = require('jquery');
const shortId = require('shortid');


class Bignote extends React.Component {
  constructor(props) {
    super(props);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleLoginSuccess = this.handleLoginSuccess.bind(this);
    this.handleLoginFailure = this.handleLoginFailure.bind(this);
    this.handlePasswordSet = this.handlePasswordSet.bind(this);
    this.handleNotLoggingIn = this.handleNotLoggingIn.bind(this);
    this.handleToNoteMode = this.handleToNoteMode.bind(this);
    this.handleToSearchMode = this.handleToSearchMode.bind(this);
    this.searchNote = this.searchNote.bind(this);
    this.syncData = this.syncData.bind(this);
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
    } else {
      this.bigNoteServerState = {};
      this.currentBigNote = { content: [] }
      this.revision = 0;
      window.localStorage.setItem('revision', this.revision);
    }

    this.state = {
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

  componentDidMount() {
    const content = document.querySelector('#sp-note-content');

    content.innerHTML = this.currentBigNote.content.join('\n');
    content.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        event.preventDefault()
      } else if (event.key === 'Enter' && document.queryCommandValue('formatBlock') === 'blockquote') {
        setTimeout(() => exec('formatBlock', '<div>'), 0)
      }
    });

    function formatMarkdown(regex, nodeContents, tag, matchIndex, nodeToReplace, sel) {
      if(regex.test(nodeContents)) {
        const match = nodeContents.match(regex);
        const id = shortId.generate();

        let newHtml;
        switch(tag) {
          case 'ul':
            newHtml = nodeContents.replace(regex, `<ul><li id="${id}">${match[matchIndex]}</li></ul>&nbsp;`);
            break;
          case 'checkbox':
            newHtml = nodeContents.replace(regex, `<span id="${id}"><input type="checkbox" />${match[matchIndex]}</span>&nbsp;`);
            break;
          case 'strong':
            newHtml = nodeContents.replace(regex, `<${tag} id="${id}">${match[matchIndex]}</${tag}>&nbsp;`);
            break;
          case 'em':
            newHtml = nodeContents.replace(regex, `<${tag} id="${id}">${match[matchIndex]}</${tag}>&nbsp;`);
            break;
          case 'h1':
            newHtml = nodeContents.replace(regex, `<${tag} id="${id}">${match[matchIndex]}</${tag}>`);
            break;
          case 'h2':
            newHtml = nodeContents.replace(regex, `<${tag} id="${id}">${match[matchIndex]}</${tag}>`);
            break;
        }

        if(match[matchIndex]) {
          nodeToReplace.replaceWith(newHtml);
          var range = document.createRange();
          const cursorNode = $(`#${id}`).get(0);
          range.setStart(cursorNode, 1);
          range.setEnd(cursorNode, 1);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }

    content.addEventListener('input', (e) => {
      if (e.target.firstChild && e.target.firstChild.nodeType === 3) {
        document.execCommand('formatBlock', false, '<div>');
      } else if (content.innerHTML === '<br>') {
        content.innerHTML = '';
      }

      const sel = window.getSelection();
      const anchorNode = sel.anchorNode;
      const block = $(anchorNode);

      const italics = new RegExp(/(\*|_)(.*?)\1/);
      const bold = new RegExp(/(\*\*|__)(.*?)\1/);
      const header1 = new RegExp('^(?:#[\\s|\u00A0])(.*)?');
      const header2 = new RegExp('^(?:##[\\s|\u00A0])(.*)?');
      const unorderedList = new RegExp('^(?:-[\\s|\u00A0])(.*)?');
      const checkbox = new RegExp('^(?:\\[\\s\\])(.*)?');
      formatMarkdown(italics, block.text(), 'em', 2, block, sel);
      formatMarkdown(bold, block.text(), 'strong', 2, block, sel);
      formatMarkdown(checkbox, block.text(), 'checkbox', 1, block, sel);
      formatMarkdown(header1, block.text(), 'h1', 1, block.parent(), sel);
      formatMarkdown(header2, block.text(), 'h2', 1, block.parent(), sel);
      formatMarkdown(unorderedList, block.text(), 'ul', 1, block.parent(), sel);

      this.debouncedSync();
    });

    content.addEventListener('paste', (e) => {
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
      });
  }

  syncData() {
    this.currentBigNote = { content: [] };
    const styleRegex = new RegExp('style="(.*)"');
    $('#sp-note-content').children().each((i, el) => {
        this.currentBigNote.content.push(el.outerHTML.replace(styleRegex, ''))
    });
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

          $('#sp-note-content').html(this.bigNoteServerState.content.join('\n'))
        }

        window.localStorage.setItem('revision', this.revision);
        window.localStorage.setItem('bigNoteServerState', JSON.stringify(this.bigNoteServerState));
      }).fail(() => {
        console.log('Failed to sync.');
      });
    }
  }

  forceRefresh() {
    console.log('not implemented');
  }

  searchNote() {
    const keywords = this.state.searchString.split(' ')
            .map(t => t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
    const searchRegex = new RegExp(keywords.join('|'), 'i');
    const whitespaceRegex = new RegExp('^[\\s\n]*$')
    let header = false;

    function showOrHideElement(el) {
      if(searchRegex.test(el.innerText) || searchRegex.test(header)) {
        $(el).show();
      } else {
        $(el).hide();
      }
    }

    $('#sp-note-content').children().each((i, el) => {
      if(el.tagName === 'H1' || el.tagName === 'H2') {
        header = el.innerText;
      }
      if(whitespaceRegex.test(el.innerText)) {
        header = false;
      }

      if(this.state.searchString.length === 0) {
        $(el).hide();
      } else if (el.tagName =='UL') {
        $(el).show();
        $(el).children().each((i, child) => {
          showOrHideElement(child);
        });
      } else {
        showOrHideElement(el);
      }
    });
  }

  handleSearchChange(e) {
    this.setState({ searchString: e.target.value }, () => {
      this.searchNote();
    });
  }

  handleToNoteMode() {
    this.setState({mode: 'note'}, () => {
      $('#sp-note-content').children().each((i, el) => {
          $(el).show();

          if(el.tagName === 'UL') {
            $(el).children().each((i, child) => $(child).show());
          }
      });
    });
  }

  handleToSearchMode() {
    this.setState({mode: 'search'}, () => {
      this.searchNote();
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

  render() {
    return <div><div className="sp-bignote-container">
          <div className="sp-note-header">
            <div className={`sp-search-header ${this.state.mode !== 'search' && 'sp-hidden'}`}>
            <a className={`sp-back ${this.state.mode === 'note' && 'sp-hidden'}`}
              onClick={ this.handleToNoteMode }><i className="fa fa-arrow-left fa-2x"></i></a>
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
              onClick={this.handleToSearchMode}>
              <i className="fa fa-search fa-2x"></i>
            </a>
          </div>
          <div className={`sp-note content ${this.state.mode === 'search' && 'sp-with-search-mode'}`}>
          <div id="sp-note-editor"></div>
          <div id="sp-note-content" contentEditable="true"></div>
          </div></div>
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
