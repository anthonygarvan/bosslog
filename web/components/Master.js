const React = require('react');
const Footer = require('./Footer');
const pacifico = require('./pacifico');
const raleway = require('./raleway');

function Master(props) {
  return <html>
          <head>
          <title>Conduit | Notes for Manager</title>

          <meta property="og:title" content="Conduit | Notes for Managers" />
          <meta property="og:description" content="The perfect notepad to keep your act together." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://conduitnotes.io" />
          <meta property="og:image" content="https://conduitnotes.io/img/social.jpg" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="600" />


          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image" content="https://conduitnotes.io/img/social.jpg" />
          <meta name="twitter:title" content="Conduit | Notes for Managers" />
          <meta name="twitter:description" content="The perfect notepad to keep your act together." />

          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="icon" href="/img/favicon.png" />
          <link href="https://fonts.googleapis.com/css?family=Roboto+Slab" rel="stylesheet" />

          <script dangerouslySetInnerHTML={{__html: `
              var template = document.createElement('template');
              template.innerHTML = '<link rel="stylesheet" href="/css/master.css" />';
              document.head.append(template.content.firstChild)`}}>
          </script>
          <script defer src="https://use.fontawesome.com/releases/v5.0.6/js/all.js"></script>
          <script dangerouslySetInnerHTML={ {__html: `!function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '247102719069720');
          fbq('track', 'PageView');` } }></script>

          <noscript dangerouslySetInnerHTML={ { __html: `<img height="1" width="1" style={ {display:"none" } } alt="nodice"
            src="https://www.facebook.com/tr?id=247102719069720&ev=PageView&noscript=1" />` } }></noscript>

          <script async src="https://www.googletagmanager.com/gtag/js?id=UA-38185442-7"></script>
          <script  dangerouslySetInnerHTML={ {__html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'UA-38185442-7');` } }>
          </script>
          </head>
          <body>
              {props.children}
          <Footer />
          </body></html>
}

module.exports = Master
