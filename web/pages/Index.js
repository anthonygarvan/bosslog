const React = require('react');
const Master = require('../components/Master');
const MainNav = require('../components/MainNav');

function Index(props) {
    return <Master>
    <div><div className="sp-background"><section className="hero sp-home-hero">
        <MainNav />
        <div className="hero-body">
            <div className="container">
                <div className="columns">
                    <div className="column"><h1 className="title is-1 sp-home-hero-text">
                    Customize the link preview of any site.</h1></div>
                </div>
                <div id="root">
                    <div className="columns">
                    <div className="column">
                    <form>
                      <div className="field has-addons">
                      <div className="control sp-hero-input is-large is-loading">
                        <input className="input is-large" type="text" placeholder="Paste a link you want to share..."/>
                      </div>
                      <div className="control">
                        <button type="submit" className="button is-primary is-large disabled">
                          <i className="fas fa-arrow-right"></i>&nbsp;&nbsp;Customize Link Preview
                        </button>
                      </div>
                      </div>
                    </form>
                    </div></div>
                </div>
                <div className="columns sp-pitch">
                  <div className="column">
                      <h5 className="title is-5">Give your followers on social media a proper glimpse of what's to come.</h5>
                      <div className="columns">
                          <div className="column">
                            <h4 className="title is-4">Responsible</h4>
                            <div>Frame web content the way you want it while still linking back to the original source.
                            Don't feed the trolls.</div>
                          </div>
                          <div className="column">
                            <h4 className="title is-4">Professional</h4>
                            <div>Quit it with the hokey screenshots and generic default previews.
                            Exercise fine-tuned control of your brand and message.</div>
                          </div>
                          <div className="column">
                            <h4 className="title is-4">Playful</h4>
                            <div>Hot take? Favorite meme? Peeklinks are a new way to connect with your followers. How will you use them?</div>
                          </div>
                      </div>
                </div>
                </div>
            </div>
        </div></section></div>
        <div className="sp-page-body">
      <section className="section">
        <div className="container">
          <div className="columns">
              <div className="column sp-long-pitch">
                  <h1>Introduce content your way.</h1>
                  <p>
                    Reaction posts on social media have to do double duty: framing the content of an
                    article, and also reacting to it. It's literally the worst thing in the world.
                    Ok, maybe there are much bigger problems, but it's annoying.
                  </p>
                  <p>
                    With a peeklink, you can frame web content just the way you'd like it—with
                    text, an image, or a highlighted screenshot—and leave the body
                    of your post for the reaction itself, while responsibly linking back to the
                    original source.
                  </p>
                  <p>
                    Peeklink is perfect for content creators as well—now you can easily control and modify
                    how your content appears on major platforms. You can even create muliple peeklinks for the same
                    content and see which one does best.
                  </p>
                  <p>Your followers will love it. It's free and there's no login—give it a try!</p>
              </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container sp-who">
          <div className="columns">
              <div className="column">
                <div>
                  <img src="/img/who_its_for.png" alt="who it's for" />
                  <h3 className="title is-3">Who It's For</h3>
                  <p>Social media enthusiasts and content publishers who want precise control over link previews,
                  or want to tee up the perfect reaction post.</p>
                </div>
              </div>

              <div className="column">
                <div>
                <img src="/img/who_its_not_for.png" alt="who it's not for" />
                <h3 className="title is-3">Who It's Not For</h3>
                <p>Nazis, propagandists, and fake news publishers. If you abuse this free service your links
                will be deactivated or redirected.</p>
              </div></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container sp-supported-by">
          <div className="columns">
            <div className="column">
              <h3 className="title is-3">Supported on Facebook, Twitter, Linkedin, and iMessage.</h3>
            </div>
          </div>
          <div className="columns sp-icons">
              <div className="column">
                  <i className="fab fa-facebook"></i>
              </div>
              <div className="column">
                  <i className="fab fa-twitter"></i>
              </div>
              <div className="column">
                  <i className="fab fa-linkedin"></i>
              </div>
              <div className="column">
                <i className="fas fa-comment"></i>
              </div>
          </div>
        </div>
      </section>
      </div>
      </div>
      <script async src="/js/app.js"></script></Master>
}

module.exports = Index
