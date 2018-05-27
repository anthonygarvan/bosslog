const React = require('react');
const MainNav = require('../components/MainNav');

function ContactThankyou(props) {
  return <div><div className="sp-header">
    <MainNav/>
    <div className="level-right"></div></div>
    <div className="sp-page-body">
      <section className="section">
        <div className="container">
          <div className="sp-thankyou-container">
        <h1 className="title is-1">Thanks for getting in touch!</h1>
        <p>We will get back to you within one business day.</p>
        <div><a href="/" className="button is-primary is-large is-pulled-right">Go Make an Peek Link</a></div>
      </div></div></section>
    </div></div>
}

module.exports = ContactThankyou
