const React = require('react');
const _ = require('lodash');
const diff = require('deep-diff');
const CryptoJS = require('crypto-js');
const $ = require('jquery');
const shortId = require('shortid');
const { compress, decompress } = require('lz-string');
const defaultContent = require('./DefaultContent.js')
const formatMarkdown = require('./FormatMarkdown');

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
    this.flipPages = this.flipPages.bind(this);
    this.initializeCursor = this.initializeCursor.bind(this);
    this.debouncedSync = _.debounce(this.syncData, 5000);
    this.debouncedSearch = _.debounce(this.searchNote, 300);
    this.debouncedFlipPages = _.debounce(this.flipPages, 300, { maxWait: 1000 });

    let editorState;
    this.bigNoteServerState = window.localStorage.getItem("bigNoteServerState") ? JSON.parse(decompress(window.localStorage.getItem("bigNoteServerState"))) : {};
    const bigNoteLocalChanges = window.localStorage.getItem("bigNoteLocalChanges") ? JSON.parse(decompress(window.localStorage.getItem("bigNoteLocalChanges"))) : defaultContent;
    this.revision = parseInt(window.localStorage.getItem('revision'));
    this.currentBigNote = _.cloneDeep(this.bigNoteServerState);
    bigNoteLocalChanges.forEach(change => {
      diff.applyChange(this.currentBigNote, null, change);
    });

    if(this.currentBigNote.content.length === 0) {
      const firstId = shortId.generate();
      this.currentBigNote.content = [`<div id="${firtId}" class="sp-block"><br></div>`];
      this.currentBigNote.selectedBlockId = firstId;
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

  flipPages() {
			const scrollTop = $(window).scrollTop();
			const docHeight = $(document).height();
			const winHeight = $(window).height();
			const scrollPercent = (scrollTop) / (docHeight - winHeight);

      if(scrollPercent < 0.10) {
        $('.sp-page:not(.sp-hidden)').first().prev().removeClass('sp-hidden');
      }

      if(scrollPercent > 0.90) {
        $('.sp-page:not(.sp-hidden)').last().next().removeClass('sp-hidden');
      }
  }

  initializeCursor() {
    // Set cursor position and hide / reveal pages
    const range = document.createRange();
    const cursor = $(`#${this.currentBigNote.selectedBlockId}`);
    const cursorNode = cursor.get(0);

    const currentPage = cursor.closest('.sp-page');
    currentPage.removeClass('sp-hidden');
    if(currentPage.next()) {
      currentPage.next().removeClass('sp-hidden');
    }

    if(currentPage.prev()) {
      currentPage.prev().removeClass('sp-hidden');
    }
    $('#sp-note-content').focus();

    $(window).scrollTop(Math.max(cursor.offset().top - $(window).height() / 2, 0));

    range.setStart(cursorNode, 1);
    range.setEnd(cursorNode, 1);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  componentDidMount() {
    const content = document.querySelector('#sp-note-content');
    const debouncedSync = this.debouncedSync;
    let html = ''
    _.chunk(this.currentBigNote.content, 500).forEach(pageContent => {
      html += `<div class="sp-page sp-hidden">${pageContent.join('\n')}</div>`
    });
    content.innerHTML = html;

    window.handleMentionOrHashtagClick = (e) => {
      this.handleToSearchMode();
      this.handleSearchChange(e);
    }

    this.initializeCursor();

    document.querySelectorAll('input[type="checkbox"]').forEach((el) => {
      el.addEventListener('change', (e) => {
        if(e.target.checked) {
          e.target.setAttribute('checked', 'checked');
        } else {
          e.target.removeAttribute('checked');
        }
        debouncedSync()
      });
    })

    $(window).scroll(() => {
      this.debouncedFlipPages();
    });

    content.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        event.preventDefault()
      } else if (event.key === 'Enter') {
        setTimeout(() => {
          const sel = window.getSelection();
          const anchorNode = $(sel.anchorNode).get(0);
          anchorNode.id = shortId.generate();
          if(anchorNode.tagName !== 'LI') {
            anchorNode.className = "sp-block";
          }

          if(anchorNode.parentElement.childElementCount > 1000) {
            const children = Array.from(anchorNode.parentElement.children);
            const newHtml = `<div class="sp-page">${children.slice(0, Math.floor(children.length / 2)).map(child => child.outerHTML).join('\n')}</div>
                             <div class="sp-page">${children.slice(Math.floor(children.length / 2), children.length).map(child => child.outerHTML).join('\n')}</div>`
            $(anchorNode.parentElement).replaceWith(newHtml);
            var range = document.createRange();
            const cursorNode = $(`#${anchorNode.id}`).get(0);
            range.setStart(cursorNode, 1);
            range.setEnd(cursorNode, 1);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }, 5)
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
          setTimeout(() => {
            if (!document.querySelector('#sp-note-content .sp-page')) {
              content.innerHTML = `<div class="sp-page"><div id=${shortId.generate()} class="sp-block"><br /></div></div>`;
            }
            const sel = window.getSelection();
            // sanitize rogue spans
            let block = $(sel.anchorNode).closest('.sp-block');

            block.find('span').each((i, span) => {
              if(!span.id) {
                $(span).replaceWith(span.innerHTML);
              }
            });

            block.find('[style]').each((i, el) => {
              el.removeAttribute('style');
            });
          }, 20);
      }
    });

    content.addEventListener('input', (e) => {
      formatMarkdown();
      this.debouncedSync();
    });

    content.addEventListener('paste', (e) => {
      e.preventDefault();
      e.stopPropagation();
      let paste = (e.clipboardData || window.clipboardData).getData('text');
      let lines = paste.split('\n');

      const selection = window.getSelection();
      if (!selection.rangeCount) return false;

      let newLines = document.createDocumentFragment();

      const firstLine = lines.shift();
      selection.getRangeAt(0).insertNode(document.createTextNode(firstLine));

      const pageElement = $(selection.anchorNode).closest('.sp-page').get(0);
      const insertIntoPageCount = Math.min(1000 - pageElement.childElementCount, lines.length);

      let insertedCount = 0;
      while(insertedCount < insertIntoPageCount) {
        var div = document.createElement('div');
        div.className ="sp-block";
        div.id = `${shortId.generate()}`;
        div.innerHTML = lines.shift() || '<br />';
        newLines.appendChild(div);
        insertedCount++;
      }

      $(newLines).insertAfter($(selection.anchorNode).closest('.sp-block'));

      if(lines.length) {
        newLines = document.createDocumentFragment();
        _.chunk(lines, 500).forEach((pageContent, i) => {
          var div = document.createElement('div');
          div.className = i ? "sp-page sp-hidden" : "sp-page";
          div.innerHTML = pageContent.map(line => `<div id=${shortId.generate()} class="sp-block">${line || '<br />'}</div>`).join('\n');
          newLines.appendChild(div);
        });
      }

      $(newLines).insertAfter($(selection.anchorNode).closest('.sp-page'));
      this.debouncedSync();
      });
  }

  syncData() {
    const selection = window.getSelection();
    this.currentBigNote.content = [];

    if(selection.rangeCount) {
      if(selection.anchorNode.id !== 'sp-note-content') {
        this.currentBigNote.selectedBlockId = $(selection.anchorNode).closest('.sp-block').get(0).id;
      } else {
        this.currentBigNote.selectedBlockId = $(selection.anchorNode).find('.sp-block').get(0).id;
      }
    }

    const hiddenRegex = new RegExp(/sp-hidden/g);
    $('.sp-block').each((i, el) => {
        this.currentBigNote.content.push(el.outerHTML.replace(hiddenRegex, ''))
    });
    const diffObj = diff.diff(this.bigNoteServerState, this.currentBigNote);

    if(diffObj && diffObj.length > 0) {
      window.localStorage.setItem('bigNoteLocalChanges', compress(JSON.stringify(diffObj)));
    }

    if(this.state.isAuthenticated && this.state.password && diffObj && diffObj.length > 0) {
      $.post('/sync', { revision: this.revision + 1,
        encryptedDiff: CryptoJS.AES.encrypt(JSON.stringify(diffObj), this.state.password).toString() }, (data) => {
        window.localStorage.setItem('bigNoteLocalChanges', compress('[]'));

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
        window.localStorage.setItem('bigNoteServerState', compress(JSON.stringify(this.bigNoteServerState)));
      }).fail(() => {
        console.log('Failed to sync.');
      });
    }
  }

  searchNote() {
    const keywords = this.state.searchString.split(' ')
            .map(t => t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')) // comment out regex expressions
    const searchRegex = new RegExp(keywords.join('|'), 'i');
    const whitespaceRegex = new RegExp('^[\\s\n]*$')
    let header = false;

    function showOrHideElement(el) {
      let mentionsAndHashtags = $(el).find('.sp-mention-hashtag').toArray().map(el => el.value).join(' ');
      if($(el).find('[type="checkbox"]').length) {
        mentionsAndHashtags += ' #todo';
      }
      if(searchRegex.test(el.innerText) || searchRegex.test(header) || searchRegex.test(mentionsAndHashtags)) {
        el.className = el.className.replace(/sp-hidden/g, '').trim();
      } else {
        if(el.className.indexOf('sp-hidden') === -1) {
            el.className += ' sp-hidden';
        }
      }
    }

    if( this.state.searchString.length === 0 ) {
      let html = document.querySelector('#sp-note-content').innerHTML;
      html = html.replace(/sp-block/g, 'sp-block sp-hidden');
      document.querySelector('#sp-note-content').innerHTML = html;
    } else {
      document.querySelectorAll('.sp-block').forEach(el => {
        if(el.tagName === 'H1' || el.tagName === 'H2') {
          header = el.innerText;
        }
        if(whitespaceRegex.test(el.innerText)) {
          header = false;
        }

        if (el.tagName =='UL') {
          el.className = el.className.replace(' sp-hidden', '');
          Array.from(el.children).forEach(child => {
            showOrHideElement(child);
          });
        } else {
          showOrHideElement(el);
        }
      });
    }

    this.setState({ searching: false })
  }

  handleSearchChange(e) {
    this.setState({ searchString: e.target.value, searching: true }, () => {
      this.debouncedSearch();
    });
  }

  handleToNoteMode() {
    this.setState({mode: 'note'}, () => {
      let html = document.querySelector('#sp-note-content').innerHTML;
      html = html.replace(/\ssp-hidden/g, '');
      document.querySelector('#sp-note-content').innerHTML = html;
      $('.sp-page').addClass('sp-hidden');
      this.initializeCursor();
    });
  }

  handleToSearchMode() {
    this.setState({mode: 'search'}, () => {
      this.searchNote();
      $('.sp-page').removeClass('sp-hidden');
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
              <div className={`sp-search-box control ${this.state.searching && "is-loading"}`}>
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
              <i className="fa fa-filter fa-2x"></i>
            </a>
          </div>
          <div className={`sp-note content ${this.state.mode === 'search' && 'sp-with-search-mode'}`}>
          <div id="sp-note-editor"></div>
          <div id="sp-note-content" contentEditable="true" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"></div>
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
              <p><a href="/privacy.txt">Privacy</a> | <a href="/terms.txt">Terms</a> | <a href="#">Source</a></p>
              <p>Questions, comments or problems? Feel free to tweet me file an issue on <a href="#">github</a>.</p>
              </div></div></footer></div>
  }
}

module.exports = Bignote
