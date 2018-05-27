const React = require('react');

function ContactEmail(props) {
return <html lang="en">
    <body>
    <p><strong>Message:</strong> {props.message}</p>

    <p style={ {backgroundColor: "lightgray", borderLeft: "2px solid darkgray", padding: "5px" } }>
      You can reply to this email to respond to your customer. You have received this email because you are subscribed to <a href="https://peek.link">peek.link</a>.
      To stop receiving these emails, you must cancel your subscription.
    </p>
    </body></html>
}

module.exports = ContactEmail
