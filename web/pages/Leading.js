const React = require('react');
const Master = require('../components/Master');
const Footer = require('../components/Footer');

function Leading(props) {
    return <Master>
    <div className="sp-bosslog-container">
    <div className="sp-note content">
    <h1>Lead a Team? Use This For Taking Notes</h1>
    <p><em>By Anthony Garvan</em></p>

    <p>
    First, a little bit about me. I lead a team of over 30 engineers, running a website that serves millions of people. I have two young children. I am not bored in life, and I am very careful about what I spend my time on.</p>

    <p>But, I'm also very particular about the tools I use to get my job done. When I went from leading a team of five to a team of over thirty, I found that the old tools I had used to keep track of my work started to fail me. Google doc? Difficult to search and slow. Trello board? Not a good place to stream information to, and too bulky to keep track of the high count of todos I started to have. My Inbox? Noisy and insufficient- work was coming at me through slack, meetings, and calls, as well as email. Traditional note apps like Google Keep and Evernote? Too difficult to search and scan, and inexcusably bloated and slow.</p>

    <p>Suddenly I was in a position where I would have 20-30 meetings in a week, each touching on a variety of topics, and I would need to summarize them or find all details on a topic at a moment's notice. I was a conduit of information ten different ways. There just wasn't a tool that could seamlessly support that workflow.</p>

    <p>But I knew what I wanted: something with the ease and speed of a text editor, with improved searching and continuous sync across devices. Something as private and simple as a piece of paper, that still had the permanence, portability, and speed we've come to expect in the digital age. I also knew what I didn't need: a screen cluttered with buttons I never use, another monthly subscription, or creepy ads.</p>

    <p>So I set out to building what was, for me, the perfect note app. While the kids slumbered, I was coding. I thought it would take two weeks- it took six months! I rewrote it three times to get the device support and performance I needed. I made a bold decision to encrypt the notes on the client, so that even I as the site owner could not see the note contents. I made it all open source, so that if people didn't trust me, or if I got hit by a bus, the show would go on. And I figured, if users should trust me, I should trust them too: I based the entire business model on the honor system, with users paying based on how useful the app is to them.</p>

    <p>I used it myself for many months, working out all the kinks and making sure it could support all the ways I wanted to use it. Then I took a leap, launching it on Product Hunt. In a few days I had over a hundred users, and it's only grown from there. Turns out a lot of people loved the focus on fundamentals like seachability, simplicity and privacy. If you're up for leveling up your note-taking game so that you don't drop important details, you should consider giving it a try too! <strong>It's called Bosslog, you can try it for yourself <a className="sp-cta" href="/?fromBlog=Leading">here</a>.</strong></p>

    <div className="sp-bio"><div className="columns"><div className="column is-one-fifth"><img className="sp-blog-profile is-pulled-right" src="/img/tony.jpg" /></div><div className="column"><strong>Anthony Garvan</strong>
     &nbsp;is a software developer and engineering manager based out of Chicago. His apps have been used by over 50,000 people.</div><div className="column is-one-fifth"></div></div></div></div></div><Footer /></Master>
}

module.exports = Leading
