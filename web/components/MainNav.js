const React = require('react');

class MainNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {menuActive: false};
  }

  render() {
    return <div className="sp-header">
        <nav className="navbar is-transparent">
        <div className="navbar-brand">
          <a className="navbar-item" href="/"><h1 className="title sp-title"><img src="/img/logo.png" alt="logo" />&nbsp;
         <span style={{ fontFamily: 'Pacifico' }}><span style={{ fontWeight: 100 }}>bignote</span>notes</span></h1></a>
          <div className="navbar-burger burger">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div className="navbar-menu">
          <div className="navbar-start">
          <a className={this.props.page === 'why' ? "navbar-item sp-nav-target" : "navbar-item"} href="/why">
            Why Bignote
          </a>
            <a className={this.props.page === 'about' ? "navbar-item sp-nav-target" : "navbar-item"} href="/about">
              About
            </a>
            <a className={this.props.page === 'contact' ? "navbar-item sp-nav-target" : "navbar-item"} href="/contact">
              Contact
            </a>
        </div>
        </div>
        </nav>
        <script dangerouslySetInnerHTML={{__html: `
            var menuIsActive = false;
            document.querySelector('.burger').addEventListener('click', function(e) {
              menuIsActive = !menuIsActive;
              if(menuIsActive) {
                document.querySelector('.navbar-menu').className = "navbar-menu is-active";
              } else {
                document.querySelector('.navbar-menu').className = "navbar-menu";
              }
            })
          `}}></script></div>
  }
}

module.exports = MainNav;
