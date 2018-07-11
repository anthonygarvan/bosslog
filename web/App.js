const React = require('react');
const ReactDOM = require('react-dom');
const Bignote = require('./components/Bignote');
const $ = require('jquery');
const { decompress } = require('lz-string');
require('./components/register-service-worker');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleLoginSuccess = this.handleLoginSuccess.bind(this);
    this.handleLoginFailure = this.handleLoginFailure.bind(this);
    this.handlePasswordSet = this.handlePasswordSet.bind(this);
    this.handleNotLoggingIn = this.handleNotLoggingIn.bind(this);
    this.handleToNoteMode = this.handleToNoteMode.bind(this);
    this.handleToSearchMode = this.handleToSearchMode.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.toSyncStatus = this.toSyncStatus.bind(this);

    this.state = {
      searchString: '',
      mode: 'note',
      passwordValue: '',
      loggingIn: window.location.href.indexOf('loggingIn=true') >= 0,
      password: window.localStorage.getItem('bigNotePassword'),
      searchResults: []
    };
  }

  componentDidMount() {
    window.handleMentionOrHashtagClick = (e) => {
      this.handleToSearchMode();
      this.handleSearchChange(e);
    }

    $.getJSON('/auth/is-authenticated', result => {
      this.setState(result);
    })
  }

  handleSearchChange(e) {
    this.setState({ searchString: e.target.value, searching: true });
  }

  handleToNoteMode() {
    this.setState({mode: 'note'});
  }

  handleToSearchMode() {
    this.setState({mode: 'search'});
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

  handlePasswordSet(e) {
    e.preventDefault();
    this.setState({ password: this.state.passwordValue, loggingIn: false }, () => {
      window.localStorage.setItem('bigNotePassword', this.state.passwordValue);
      this.handleNotLoggingIn();
    });
  }

  handleLogout() {
    if(JSON.parse(decompress(window.localStorage.getItem("bigNoteLocalChanges"))).length) {
      alert("You have usaved changes. Please sync before logging out.")
    } else {
      window.localStorage.removeItem("bigNoteLocalChanges");
      window.localStorage.removeItem("bigNoteServerState");
      window.localStorage.removeItem("revision");
      window.localStorage.removeItem("bigNotePassword");
      window.location.href = '/auth/logout';
    }
  }

  toSyncStatus(syncStatus) {
    this.setState({ syncStatus })
  }

  render() {
    return <div><div className={`sp-bignote-container ${this.state.syncStatus}`}>
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
              <i className="fa fa-search fa-2x"></i>
            </a>
          </div>
          <div className={`sp-note content ${this.state.mode === 'search' && 'sp-with-search-mode'}`}>
          <Bignote password={this.state.password}
                  isAuthenticated={this.state.isAuthenticated}
                  mode={this.state.mode}
                  searchString={this.state.searchString}
                  toSyncStatus={this.toSyncStatus}
                  searchDone={() => this.setState({ searching: false })}
                  handleToNoteMode={ this.handleToNoteMode }/>
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
                  <div className="box is-centered">{this.state.isAuthenticated ? <form onSubmit={this.handlePasswordSet}><p>Logged in as {this.state.userEmail}.</p>
                  <p>Please enter your password. It must be at least 8 characters.</p>
                  <div className="field">
                    <p className="control has-icons-left">
                      <input className="sp-hidden" type="email" value={this.state.userEmail} readOnly />
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
                    <button type="submit"
                      className="button is-primary"
                      disabled={!this.state.passwordIsValid}>Start Secure Sync</button>
                  </p>
                  </form>
                     : <div>
                    <p>Please sign in with your Google account.</p>
                     <p><a href="/auth/authenticate" className="button is-primary">Log in with Google</a></p></div>}
                </div></div>
                <button className="modal-close is-large" onClick={this.handleNotLoggingIn}></button>
              </div>
              <p>Copyright © 2018. Made with ♥ by <a href="https://www.twitter.com/anthonygarvan">@anthonygarvan</a>.</p>
              <p><a href="/privacy.txt">Privacy</a> | <a href="/terms.txt">Terms</a> | <a href="#">Source</a>{ this.state.isAuthenticated &&   <span>| <a onClick={this.handleLogout}>Logout</a></span> }</p>
              <p>Questions, comments or problems? Feel free to tweet me or file an issue on <a href="#">github</a>.</p>
              <p className="sp-logo">
                <img src="/img/logo.png" alt="logo" />
                <div>Bignote</div>
              </p>
              </div></div></footer></div>
  }
}


ReactDOM.render(
    <App />,
  document.getElementById('root')
);
