const React = require('react');
const MainNav = require('../components/MainNav');
const Master = require('../components/Master');

function About(props) {
  return <Master><div>
  <MainNav page="about" />
  <div className="sp-page-body">
    <section className="section">
      <div className="container">
        <div className="sp-about-container">
        <h1 className="title is-1">About <span style={{fontFamily: 'Pacifico' }}>peeklink</span></h1>
        <p>Peeklink is a made by me, Anthony Garvan. I'm a developer and entrepreneur in Chicago.
        I had the idea for peeklink while finding it frustrating to cite a specific passage in
        an article for a twitter post, and I thought <em>this is ridiculous, it's 2018 and we're not savages.</em>
        &nbsp;So I started building peeklink in the wee hours of the night while the babies slumbered.</p>
        <p>Some people wonder: how does peeklink make money? Easy, it doesn't! But operating costs are minimal.
        If it catches on, I might roll out a pro plan (if you have fancy requirements, please <a href="/contact">reach out</a>).</p>
        <p>
        I work out of the Polsky Exchange in Hyde Park, if you're nearby feel free to say hi!
        You can also follow me on the twitter at <a href="https://www.twitter.com/anthonygarvan">@anthonygarvan</a>.
        </p>
        <div className="sp-about-img-container">
          <img src="/img/me.jpg" alt="tony" />
        </div>
        </div>
      </div>
    </section></div></div></Master>
}

module.exports = About
