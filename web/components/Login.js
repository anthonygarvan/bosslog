const React = require('react');
const ReactDOM = require('react-dom');
const $ = require('jquery');
const localforage = require('localforage');

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.handlePasswordSet = this.handlePasswordSet.bind(this);
    this.handleNotLoggingIn = this.handleNotLoggingIn.bind(this);
    this.handleWrongPassword = this.handleWrongPassword.bind(this);
    this.state = { passwordValue: '',
    retypedPasswordValue: '',
    loggingIn: window.location.href.indexOf('loggingIn=true') >= 0, }
  }

  handleNotLoggingIn() {
    this.setState({ loggingIn: false }, () => {
      window.history.pushState(null, document.title, '/');
    })
  }

  handlePasswordSet(e) {
    e.preventDefault();
    this.setState({ passwordIsSet: true }, () => {
      localforage.setItem('bigNotePassword', this.state.passwordValue);
      this.props.setPassword(this.state.passwordValue);
      $.getJSON('/auth/password-created')
      this.handleNotLoggingIn();
    });
  }

  handleWrongPassword() {
    this.setState({ passwordIsValid: false, loggingIn: true, wrongPassword: true });
  }

  render() {
    return <div>
    {(this.props.isAuthenticated && this.props.password) ? <p className="sp-user-card"><div>{this.props.photoUrl && <img src={this.props.photoUrl} />}</div><div>{this.props.userEmail}</div></p>
    : <p><button className="button is-primary" onClick={() => this.setState({ loggingIn: true })}>Sign in to Sync</button></p>}
    <div className={`modal ${this.state.loggingIn && 'is-active'}`}>
      <div className="modal-background" onClick={this.handleNotLoggingIn}></div>
      <div className="modal-content">
        <div className="box is-centered">{this.props.isAuthenticated ? <form onSubmit={this.handlePasswordSet}><p>Logged in as {this.props.userEmail}.</p>
        {(this.state.passwordIsSet || this.props.passwordIsSet) ? <p>Please enter your password.</p> : <p>Please select a password. This is how we keep your log private.</p>}
        <div className="field">
          <p className="control has-icons-left">
            <input className="sp-hidden" type="email" value={this.state.userEmail} readOnly />
            <input className={`input ${this.state.passwordIsValid ? 'is-success' : this.state.passwordValue && 'is-danger'}`} type="password" placeholder="Password" value={this.state.passwordValue}
              onChange={(e) => this.setState({ passwordValue: e.target.value, passwordIsValid: e.target.value.length >= 8 })}/>
            <span className="icon is-small is-left">
              <i className="fas fa-lock"></i>
            </span>
          </p>
          { this.state.wrongPassword && <p className="help is-danger">Looks like that's the wrong password.</p> }
          { this.state.passwordValue && (this.state.passwordValue.length < 8) && <p className="help is-danger">Password must be at least 8 characters.</p> }

          {!(this.state.passwordIsSet || this.props.passwordIsSet) &&
          <div>
          <p className="control has-icons-left">
            <input className={`input ${this.state.retypedPasswordValue === this.state.passwordValue ? 'is-success' : this.state.passwordValue && 'is-danger'}`} type="password" placeholder="Please retype your password" value={this.state.retypedPasswordValue}
              onChange={(e) => this.setState({ retypedPasswordValue: e.target.value })}/>
            <span className="icon is-small is-left">
              <i className="fas fa-lock"></i>
            </span>
          </p></div>}
        </div>

        {!(this.state.passwordIsSet || this.props.passwordIsSet) && <p><i className="fas fa-exclamation-triangle"></i>&nbsp;&nbsp;For your security, we do not store your password.
        If you lose your password you will not be able to access your note.</p>}
        <p>
          <button type="submit"
            className="button is-primary"
            disabled={!(this.state.passwordIsValid &&
              ((this.state.retypedPasswordValue === this.state.passwordValue) ||
              this.state.passwordIsSet ||
              this.props.passwordIsSet))}>Start Secure Sync</button>
        </p>
        </form>
           : <div>
          <p>Please sign in with your Google account.</p>
           <p><a href="/auth/authenticate" className="button is-primary">Log in with Google</a></p></div>}
      </div></div>
      <button className="modal-close is-large" onClick={this.handleNotLoggingIn}></button>
    </div></div>
  }
}

module.exports = Login
