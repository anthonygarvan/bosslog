const $ = require('jquery');
const shortId = require('shortid');
const normalizeUrl = require('normalize-url');
const _ = require('lodash');

function formatItalics() {
  const sel = window.getSelection();
  const anchorNode = sel.anchorNode;
  const block = $(anchorNode);
  const nodeContents = block.text();

  const regex = new RegExp(/(_)(.*?)\1/);

  if(regex.test(nodeContents)) {
    const match = nodeContents.match(regex);
    const id = shortId.generate();

    const matchContent = match[2] || '&nbsp;';
    const newHtml = nodeContents.replace(regex, `<em id="${id}">${matchContent}</em>&nbsp;`);


    block.replaceWith(newHtml);

    var range = document.createRange();
    const cursorNode = $(`#${id}`).get(0).nextSibling;
    range.setStart(cursorNode, 1);
    range.setEnd(cursorNode, 1);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function formatBold() {
  const sel = window.getSelection();
  const anchorNode = sel.anchorNode;
  const block = $(anchorNode);
  const nodeContents = block.text();

  const regex = new RegExp(/(\*\*)(.*?)\1/);

  if(regex.test(nodeContents)) {
    const match = nodeContents.match(regex);
    const id = shortId.generate();

    const matchContent = match[2] || '&nbsp;';
    const newHtml = nodeContents.replace(regex, `<strong id="${id}">${matchContent}</strong>&nbsp;`);


    block.replaceWith(newHtml);

    var range = document.createRange();
    const cursorNode = $(`#${id}`).get(0).nextSibling;
    range.setStart(cursorNode, 1);
    range.setEnd(cursorNode, 1);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function formatCode() {
  const sel = window.getSelection();
  const anchorNode = sel.anchorNode;
  const block = $(anchorNode);
  const nodeContents = block.text();

  const regex = new RegExp(/`(.*?)`/);

  if(regex.test(nodeContents)) {
    const match = nodeContents.match(regex);
    const id = shortId.generate();

    const matchContent = match[1] || '&nbsp;';
    const newHtml = nodeContents.replace(regex, `<code id="${id}">${matchContent}</code>&nbsp;`);


    block.replaceWith(newHtml);

    var range = document.createRange();
    const cursorNode = $(`#${id}`).get(0).nextSibling;
    range.setStart(cursorNode, 1);
    range.setEnd(cursorNode, 1);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function formatCheckbox(debouncedSync) {
  const sel = window.getSelection();
  const anchorNode = sel.anchorNode;
  const block = $(anchorNode);
  const nodeContents = block.text();

  const regex = new RegExp('^(?:\\[\\s\\])(.*)?');

  if(regex.test(nodeContents)) {
    const match = nodeContents.match(regex);
    const id = shortId.generate();

    const matchContent = match[1] || '';
    const newHtml = nodeContents.replace(regex, `<span id="${id}"><div class="pretty p-icon p-smooth p-curve p-thick">
                                                  <input type="checkbox" />
                                                  <div class="state p-success">
                                                      <i class="icon fas fa-check"></i>
                                                      <label></label>
                                                  </div>
                                              </div>${matchContent}</span>&#8288;`);

    block.replaceWith(newHtml);

    var range = document.createRange();
    const cursorNode = $(`#${id}`).get(0).nextSibling;
    range.setStart(cursorNode, 1);
    range.setEnd(cursorNode, 1);
    sel.removeAllRanges();
    sel.addRange(range);

    document.querySelector(`#${id} input`).addEventListener('change', (e) => {
      if(e.target.checked) {
        e.target.setAttribute('checked', 'checked');
      } else {
        e.target.removeAttribute('checked');
      }
      debouncedSync()
    });
  }
}

function formatHeader1() {
  const sel = window.getSelection();
  const anchorNode = sel.anchorNode;
  const block = $(anchorNode);
  const nodeContents = block.text();

  const regex = new RegExp('^(?:#[\\s|\u00A0])(.*)?');

  if(regex.test(nodeContents)) {
    const match = nodeContents.match(regex);
    const id = shortId.generate();

    const matchContent = match[1] || '&#8288;';
    const newHtml = nodeContents.replace(regex, `<h1 id="${id}" class="sp-block">${matchContent}</h1>`);

    block.parent().replaceWith(newHtml);

    var range = document.createRange();
    const cursorNode = $(`#${id}`).get(0);
    range.setStart(cursorNode, 1);
    range.setEnd(cursorNode, 1);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function formatHeader2() {
  const sel = window.getSelection();
  const anchorNode = sel.anchorNode;
  const block = $(anchorNode);
  const nodeContents = block.text();

  const regex = new RegExp('^(?:##[\\s|\u00A0])(.*)?');

  if(regex.test(nodeContents)) {
    const match = nodeContents.match(regex);
    const id = shortId.generate();

    const matchContent = match[1] || '&#8288;';
    const newHtml = nodeContents.replace(regex, `<h2 id="${id}" class="sp-block">${matchContent}</h2>`);

    block.parent().replaceWith(newHtml);

    var range = document.createRange();
    const cursorNode = $(`#${id}`).get(0);
    range.setStart(cursorNode, 1);
    range.setEnd(cursorNode, 1);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function formatAnchor() {
  const sel = window.getSelection();
  const anchorNode = sel.anchorNode;
  const block = $(anchorNode);
  const nodeContents = block.text();

  const regex = new RegExp(/^(?:\/\/\s)(.*)?/);

  if(regex.test(nodeContents)) {
    const match = nodeContents.match(regex);
    const id = shortId.generate();

    const matchContent = match[1] || '&#8288;';
    const newHtml = nodeContents.replace(regex, `<h3 id="${id}" class="sp-block">${matchContent}</h3>`);

    block.parent().replaceWith(newHtml);

    var range = document.createRange();
    const cursorNode = $(`#${id}`).get(0);
    range.setStart(cursorNode, 1);
    range.setEnd(cursorNode, 1);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}


function formatUnorderedList() {
  const sel = window.getSelection();
  const anchorNode = sel.anchorNode;
  const block = $(anchorNode);
  const nodeContents = block.text();

  const regex = new RegExp('^(?:-[\\s|\u00A0])(.*)?');

  if(regex.test(nodeContents)) {
    const match = nodeContents.match(regex);
    const id = shortId.generate();

    const matchContent = match[1] || '&#8288;';
    const newHtml = nodeContents.replace(regex, `<ul id=${shortId.generate()} class="sp-block"><li id="${id}">${matchContent}</li></ul>`);

    block.parent().replaceWith(newHtml);

    var range = document.createRange();
    const cursorNode = $(`#${id}`).get(0);
    range.setStart(cursorNode, 1);
    range.setEnd(cursorNode, 1);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function formatLink() {
  const sel = window.getSelection();
  const anchorNode = sel.anchorNode;
  const block = $(anchorNode);
  const nodeContents = block.text().slice(0, sel.anchorOffset);

  const regex = /(?:(?:(?:[a-z]+:)?\/\/)|www\.)(?:\S+(?::\S*)?@)?(?:localhost|(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])(?:\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])){3}|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[\/?#][^\s"]*)?(\s)/i

  if(regex.test(nodeContents)) {
    const match = nodeContents.match(regex);
    const id = shortId.generate();

    const matchContent = match[0];
    const newHtml = nodeContents.replace(regex, `<input id="${id}" type="button" class="sp-link-button" value="${matchContent.trim()}" onclick="window.open('${normalizeUrl(matchContent)}', '_blank')" />&nbsp;`);
    block.replaceWith(newHtml);

    var range = document.createRange();
    const cursorNode = $(`#${id}`).get(0).nextSibling;
    range.setStart(cursorNode, 1);
    range.setEnd(cursorNode, 1);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function formatMentionOrHashtag() {
  const sel = window.getSelection();
  const anchorNode = sel.anchorNode;
  const block = $(anchorNode);
  const nodeContents = block.text();

  const regex = /([@#][^\s#]+)/;

  if(regex.test(nodeContents.slice(0, sel.anchorOffset))) {
    const match = nodeContents.match(regex);
    const id = shortId.generate();

    const matchContent = match[0];
    const mentions = _.uniq($.map($('.sp-mention-hashtag').toArray().sort(), el => `<option value=${el.value} />`)).join('\n')
    const newHtml = nodeContents.replace(regex, `<input id="${id}" class="sp-mention-input"
        list="mentions-${id}" value="${matchContent}" onkeydown="return handleMentionKeydown(event)"/>
                                            <datalist id="mentions-${id}">
                                              ${mentions}
                                            </datalist>`)

    block.replaceWith(newHtml);

    const mentionInput = $(`#${id}`)
    mentionInput.focus();
    const value = mentionInput[0].value;
    mentionInput[0].value = '';
    mentionInput[0].value = value;

    mentionInput.keydown(e => {
      if(!mentionInput[0].value && (e.key === 'Backspace' || e.key === 'Delete')) {
        e.preventDefault();
        var range = document.createRange();

        if($(`#${id}`).get(0).previousSibling) {
          const cursorNode = $(`#${id}`).get(0).previousSibling;
          range.setStart(cursorNode, cursorNode.textContent.length - 1);
          range.setEnd(cursorNode, cursorNode.textContent.length - 1);
        } else {
          const cursorNode = $(`#${id}`).parent()[0];
          range.setStart(cursorNode, 0);
          range.setEnd(cursorNode, 0);
        }

        sel.removeAllRanges();
        sel.addRange(range);

        mentionInput.remove();
      }
    });
  }
}

function formatMarkdown(debouncedSync) {
  const sel = window.getSelection();
  const anchorNode = sel.anchorNode;
  const block = $(anchorNode);

  if(block.parent().get(0).tagName !== 'CODE') {
    formatItalics();
    formatBold();
    formatCode();
    formatCheckbox(debouncedSync);
    formatHeader1();
    formatHeader2();
    formatAnchor();
    formatUnorderedList();
    formatLink();
    formatMentionOrHashtag();
  }
}

$(window).ready(() => {
  window.handleMentionKeydown = (e) => {
    if(e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      $(`#${e.target.getAttribute('list')}`).remove();
      const id = shortId.generate();
      $(e.target).replaceWith(`<input id="${id}"class="sp-link-button sp-mention-hashtag"
              type="button" value="${e.target.value.trim()}" onclick="return handleMentionOrHashtagClick(event)"/>&nbsp;`)
      var range = document.createRange();
      let cursorNode = document.querySelector(`#${id}`).nextSibling;
      range.setStart(cursorNode, 1);
      range.setEnd(cursorNode, 1);
      const sel = window.getSelection()
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
})

module.exports = formatMarkdown;
