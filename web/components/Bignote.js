const React = require('react');
const _ = require('lodash');
const diff = require('deep-diff');
const CryptoJS = require('crypto-js');
const $ = require('jquery');
const shortId = require('shortid');
const { compress, decompress } = require('lz-string');
const defaultContent = require('./DefaultContent.js')
const formatMarkdown = require('./FormatMarkdown');
const Mark = require('mark.js');

class Bignote extends React.Component {
  constructor(props) {
    super(props);
    this.searchNote = this.searchNote.bind(this);
    this.syncData = this.syncData.bind(this);
    this.flipPages = this.flipPages.bind(this);
    this.initializeCursor = this.initializeCursor.bind(this);
    this.debouncedSync = _.debounce(this.syncData, 3000, { maxWait: 30000 });
    this.debouncedSearch = _.debounce(this.searchNote, 600);
    this.debouncedFlipPages = _.debounce(this.flipPages, 300, { maxWait: 1000 });

    this.bigNoteServerState = window.localStorage.getItem("bigNoteServerState") ? JSON.parse(decompress(window.localStorage.getItem("bigNoteServerState"))) : {};
    const bigNoteLocalChanges = window.localStorage.getItem("bigNoteLocalChanges") ? JSON.parse(decompress(window.localStorage.getItem("bigNoteLocalChanges"))) : defaultContent;
    this.revision =window.localStorage.getItem('revision') ?  parseInt(window.localStorage.getItem('revision')) : 0;
    this.currentBigNote = _.cloneDeep(this.bigNoteServerState);
    bigNoteLocalChanges.forEach(change => {
      diff.applyChange(this.currentBigNote, null, change);
    });

    if(this.currentBigNote.content.length === 0) {
      const firstId = shortId.generate();
      this.currentBigNote.content = [`<div id="${firtId}" class="sp-block"><br></div>`];
      this.currentBigNote.selectedBlockId = firstId;
    }
  }

  flipPages() {
			const scrollTop = $(window).scrollTop();
			const docHeight = $(document).height();
			const winHeight = $(window).height();
			const scrollPercent = (scrollTop) / (docHeight - winHeight);

      const visiblePages = $('.sp-page:not(.sp-hidden)');
      if(scrollPercent < 0.10) {
        visiblePages.first().prev().removeClass('sp-hidden');
        if(visiblePages.length >= 3) {
          visiblePages.last().addClass('sp-hidden');
        }
      }

      if(scrollPercent > 0.90) {
        visiblePages.last().next().removeClass('sp-hidden');
        if(visiblePages.length >= 3) {
          visiblePages.first().addClass('sp-hidden');
        }
      }
  }

  initializeCursor() {
    // Set cursor position and hide / reveal pages
    const range = document.createRange();
    const cursor = $(`#sp-note-content #${this.currentBigNote.selectedBlockId}`);
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

  componentDidUpdate(prevProps) {
    if(prevProps.searchString !== this.props.searchString) {
      this.debouncedSearch();
    }

    if((prevProps.password !== this.props.password) || (prevProps.isAuthenticated !== this.props.isAuthenticated)) {
      this.syncData();
    }

    if(prevProps.mode !== this.props.mode) {
      if(this.props.mode === 'note') {
        $('#sp-search-results').hide();
        $('#sp-note-content').show();
        this.initializeCursor();
      }

      if(this.props.mode === 'search') {
        $('#sp-note-content').hide();
        $('#sp-search-results').show();
        this.searchNote();
      }
    }


  }

  componentDidMount() {
    const content = document.querySelector('#sp-note-content');
    const debouncedSync = this.debouncedSync;
    let html = '';
    _.chunk(this.currentBigNote.content, 100).forEach(pageContent => {
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

          if(anchorNode.parentElement.childElementCount > 200) {
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
      this.props.toSyncStatus('yellow');
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

      let pageElement;
      let firstLineElement;
      if(selection.anchorNode.id === 'sp-note-content') {
        firstLineElement = $(selection.anchorNode).find('.sp-block').first();
        firstLineElement.text(firstLine);
        pageElement = $(selection.anchorNode).find('.sp-page')[0];
      } else {
        firstLineElement = $(selection.anchorNode).closest('.sp-block');
        selection.getRangeAt(0).insertNode(document.createTextNode(firstLine));
        pageElement = $(selection.anchorNode).closest('.sp-page').get(0);
      }

      const insertIntoPageCount = Math.min(200 - pageElement.childElementCount, lines.length);

      let lastNodeId = firstLineElement.id;
      let insertedCount = 0;
      while(insertedCount < insertIntoPageCount) {
        var div = document.createElement('div');
        div.className ="sp-block";
        div.id = `${shortId.generate()}`;
        div.innerHTML = lines.shift() || '<br />';
        lastNodeId = div.id;
        newLines.appendChild(div);
        insertedCount++;
      }

      $(newLines).insertAfter(firstLineElement);

      if(lines.length) {
        newLines = document.createDocumentFragment();
        _.chunk(lines, 100).forEach((pageContent, i) => {
          var div = document.createElement('div');
          div.className = "sp-page sp-hidden";
          const pageContentHtml = []
          pageContent.forEach(line => {
            const id = shortId.generate();
            lastNodeId = id;
            pageContentHtml.push(`<div id=${id} class="sp-block">${line || '<br />'}</div>`)
          });

          div.innerHTML = pageContentHtml.join('\n');
          newLines.appendChild(div);
        });
      }

      $(newLines).insertAfter(pageElement);

      this.currentBigNote.selectedBlockId = lastNodeId;
      this.initializeCursor();
      this.debouncedSync();
    })
  }

  syncData() {
    const selection = window.getSelection();
    this.currentBigNote.content = [];

    if(selection.rangeCount && $(selection.anchorNode).closest('#sp-note-content')[0]) {
      if(selection.anchorNode.id !== 'sp-note-content') {
        this.currentBigNote.selectedBlockId = $(selection.anchorNode).closest('.sp-block').get(0).id;
      } else {
        this.currentBigNote.selectedBlockId = $(selection.anchorNode).find('.sp-block').get(0).id;
      }
    }

    const hiddenRegex = new RegExp(/sp-hidden/g);
    $('#sp-note-content>.sp-page>.sp-block').each((i, el) => {
        this.currentBigNote.content.push(el.outerHTML.replace(hiddenRegex, ''))
    });
    const diffObj = diff.diff(this.bigNoteServerState, this.currentBigNote) || [];

    if(diffObj && diffObj.length > 0) {
      window.localStorage.setItem('bigNoteLocalChanges', compress(JSON.stringify(diffObj)));
    }

    if(this.props.isAuthenticated && this.props.password) {
      $.post('/sync', { revision: this.revision + 1,
        encryptedDiff: CryptoJS.AES.encrypt(JSON.stringify(diffObj), this.props.password).toString() }, (data) => {
        window.localStorage.setItem('bigNoteLocalChanges', compress('[]'));
        if( data.success ) {
          this.bigNoteServerState = _.cloneDeep(this.currentBigNote);
          this.revision += 1
          window.localStorage.setItem('revision', this.revision);
        } else {
          const serverDiffs = data.revisions.map(revision => {
            return JSON.parse(CryptoJS.AES.decrypt(
                revision.encryptedDiff,
                this.props.password).toString(CryptoJS.enc.Utf8));
          })

          serverDiffs.forEach(changes => {
              changes.forEach(change => {
                diff.applyChange(this.bigNoteServerState, null, change);
              });
          });

          this.revision = parseInt(data.revisions[data.revisions.length - 1].revision);

          let html = '';
          _.chunk(this.bigNoteServerState.content, 100).forEach(pageContent => {
            html += `<div class="sp-page sp-hidden">${pageContent.join('\n')}</div>`
          });
          $('#sp-note-content').html(html);

          this.currentBigNote.selectedBlockId = this.bigNoteServerState.selectedBlockId;
          this.initializeCursor();
        }

        window.localStorage.setItem('revision', this.revision);
        window.localStorage.setItem('bigNoteServerState', compress(JSON.stringify(this.bigNoteServerState)));
        this.props.toSyncStatus('green');
      }).fail(() => {
        this.props.toSyncStatus('red' );
      });
    }
  }

  searchNote() {
    const exactMatchRegex = /^"(.+)"$/
    let searchRegex;
    if(exactMatchRegex.test(this.props.searchString)) {
      searchRegex = new RegExp(this.props.searchString
          .match(exactMatchRegex)[1].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'ig');
    } else {
      const keywords = this.props.searchString.split(' ')
              .map(t => t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')) // comment out regex expressions
      searchRegex = new RegExp(keywords.join('|'), 'ig');
    }
    const whitespaceRegex = new RegExp('^[\\s\\n]*$')
    let header = false;

    function includeElement(el) {
      let mentionsAndHashtags = $(el).find('.sp-mention-hashtag').toArray().map(el => el.value).join(' ');
      if($(el).find('[type="checkbox"]').length) {
        mentionsAndHashtags += ' #todo';
      }
      return (searchRegex.test(el.innerText) || searchRegex.test(header) || searchRegex.test(mentionsAndHashtags)) && el;
    }

    let searchResults = [];
    let lastElement;
    document.querySelectorAll('#sp-note-content>.sp-page>.sp-block').forEach(el => {
      if(el.tagName === 'H1' || el.tagName === 'H2') {
        header = el.innerText;
        header += ' ' + $(el).find('input[type=button]').toArray().map(el => el.value).join(' ');
      }
      if(whitespaceRegex.test(el.innerText)) {
        header = false;
      }

      if (el.tagName =='UL') {
        Array.from(el.children).forEach(child => {
          searchResults.push(includeElement(child));
        });
      } else {
        searchResults.push(includeElement(el));
      }
    });

    searchResults = searchResults.filter(el => el);
    if(searchResults.length === 0) {
      $('#sp-search-results').html('<em>No results.</em>');
      $(window).scrollTop(0);
    } else if(!this.props.searchString.trim()) {
      $('#sp-search-results').html('<h2>Anchors</h2>' + $('#sp-note-content h3').toArray().map(el => el.outerHTML).join('\n'));
      $(window).scrollTop(0);
      let that = this;
      $('#sp-search-results h3').click(function() {
        that.currentBigNote.selectedBlockId = this.id;
        that.props.handleToNoteMode();
      })
    } else {
      let html = searchResults.map(el => el.outerHTML).join('\n');
      $('#sp-search-results').html(html);

      new Mark(document.querySelector('#sp-search-results')).markRegExp(searchRegex);

      $('#sp-search-results .sp-block').click(e => {
        this.currentBigNote.selectedBlockId = $(e.target).closest('.sp-block')[0].id;
        this.props.handleToNoteMode();
      });

      $('#sp-search-results li').click(e => {
        this.currentBigNote.selectedBlockId = $(e.target).closest('.sp-block')[0].id;
        this.props.handleToNoteMode();
      });

      $(window).scrollTop(Math.max($(`#${searchResults.pop().id}`).offset().top - $(window).height() / 2, 0));

    }

    this.props.searchDone();
  }

  render() {
    return <div>
          <div id="sp-note-editor"></div>
          <div id="sp-search-results" style={{ display: 'none' }}></div></div>
  }
}

module.exports = Bignote
