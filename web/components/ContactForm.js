const React = require('react');
const $ = require('jquery');

class ContactForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    console.log(this.state);
    $.post('/contact', {name: this.state.name,
      email: this.state.email,
      message: this.state.message}, (data) => {
        if(data.success) {
          this.props.showBanner(`Thanks for getting in touch! I'll get back to you shortly.`)
          this.setState({ name: '', email: '', message: '' })
        }
      });
  }

  render() {
    return <form onSubmit={this.handleSubmit} className="contact-form">
    <div className="field">
      <label className="label">Name*</label>
      <div className="control">
        <input className="input" value={this.state.name} type="text" placeholder="Your Name" name="name" required="true" onChange={this.handleChange}/>
          </div>
          </div>
          <div className="field">
          <label className="label">Email*</label>
          <div className="control has-icons-left has-icons-right">
            <input className="input" value={this.state.email}  name="email" type="email" placeholder="your.email@example.com" required="true"  onChange={this.handleChange}/>
            <span className="icon is-small is-left">
              <i className="fa fa-envelope"></i>
            </span>
        </div></div>

        <div className="field">
          <label className="label">Message*</label>
          <div className="control">
            <textarea  value={this.state.message} className="textarea" placeholder="What's going on?" name="message" required="true"  onChange={this.handleChange}></textarea>
          </div>
          </div>
        <button className="button is-primary is-pulled-right" type="submit"><i className="fa fa-paper-plane"></i>&nbsp;&nbsp;Send</button></form>
    }
}

module.exports = ContactForm
