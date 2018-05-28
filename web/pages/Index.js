const React = require('react');
const Master = require('../components/Master');
const MainNav = require('../components/MainNav');

function Index(props) {
    return <Master>
    <div><div className="sp-background"><section className="hero sp-home-hero">
        <MainNav />
        <div className="hero-body">
            <div className="container">
            <div id="root"></div>
        </div></div></section></div>
      </div>
      <script async src="/js/app.js"></script></Master>
}

module.exports = Index
