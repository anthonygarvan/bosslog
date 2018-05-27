const React = require('react');
const Master = require('../components/Master');
const MainNav = require('../components/MainNav');

function Contact(props) {
  return <Master>
  <div>
  <div id="info" className="notification is-success" style={{display: "none"}}><i className="fa fa-info-circle sp-vcenter"></i>
    Thanks for getting in touch! I'll get back to you shortly.
    <button id="hide-info" className="delete"></button>
  </div>
  <MainNav page="contact" />
  <div className="sp-page-body">
    <section className="section">
      <div className="container"><div className="sp-contact-container">
        <div className="content">
        <h3 className="title is-3">Thanks for reaching out!</h3>
        <p>I welcome bug reports, feature requests, questions, comments, complaints, gossip, tirades, manifestos, rants, and much more.
        I'll do my best to get back to you within one business day.</p>
        </div>
          <form className="contact-form">
          <div className="field">
            <label className="label">Name*</label>
            <div className="control">
              <input className="input" type="text" placeholder="Your Name" name="name" required="true"/>
                </div>
                </div>
                <div className="field">
                <label className="label">Email*</label>
                <div className="control has-icons-left has-icons-right">
                  <input className="input" name="email" type="email" placeholder="your.email@example.com" required="true"/>
                  <span className="icon is-small is-left">
                    <i className="fa fa-envelope"></i>
                  </span>
              </div></div>

              <div className="field">
                <label className="label">Message*</label>
                <div className="control">
                  <textarea className="textarea" placeholder="What's going on?" name="message" required="true"></textarea>
                </div>
                </div>
              <button className="button is-primary is-pulled-right" type="submit"><i className="fa fa-paper-plane"></i>&nbsp;&nbsp;Send</button></form>
    </div></div></section></div></div>
    <script src="/js/contact.js"></script></Master>
}

module.exports = Contact;
