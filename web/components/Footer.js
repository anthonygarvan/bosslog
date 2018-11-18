const React = require('react');

function Footer(props) {
  return <footer className="footer sp-footer">
    <div className="container">
    <div className="content has-text-centered">
    <p>Copyright © 2018. Made with ♥ by <a href="https://www.twitter.com/anthonygarvan">@anthonygarvan</a>. Design by Ryan Thurlwell.</p>
    <p><a href="/privacy.txt" target="_blank">Privacy</a> | <a href="/terms.txt" target="_blank">Terms</a> | <a href="https://github.com/anthonygarvan/bosslog" target="_blank">Source</a></p>
    <p>Questions, comments or problems? Feel free to tweet me or file an issue on <a href="https://github.com/anthonygarvan/bosslog/issues">github</a>.</p>
    <div className="sp-logo">
      <img src="/img/logo.png" alt="logo" />
      <div>Bosslog</div>
    </div>
  </div></div></footer>
}

module.exports = Footer
