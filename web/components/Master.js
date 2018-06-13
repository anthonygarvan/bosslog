const React = require('react');

function Master(props) {
  return <html>
          <head>
          <title>Bignote | Just one big note.</title>

          <meta property="og:title" content="Bignote | Just one big note." />
          <meta property="og:description" content="Write things down. Later, find what you wrote." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://bignote.app" />
          <meta property="og:image" content="https://bignote.app/img/social.jpg" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="600" />


          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image" content="https://bignote.app/img/social.jpg" />
          <meta name="twitter:title" content="Bignote | Just one big note." />
          <meta name="twitter:description" content="Write things down. Later, find what you wrote." />

          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="icon" href="/img/favicon.png" />
          <link href="https://fonts.googleapis.com/css?family=Roboto+Slab" rel="stylesheet" />

          <script dangerouslySetInnerHTML={{__html: `
              var template = document.createElement('template');
              template.innerHTML = '<link rel="stylesheet" href="/css/master.css" />';
              document.head.append(template.content.firstChild)`}}>
          </script>
          <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css" integrity="sha384-DNOHZ68U8hZfKXOrtjWvjxusGo9WQnrNx2sqG0tfsghAvtVlRW3tvkXWZh58N9jp" crossOrigin="anonymous" />
          <script async src="https://www.googletagmanager.com/gtag/js?id=UA-38185442-7"></script>
          <script  dangerouslySetInnerHTML={ {__html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'UA-38185442-8');` } }>
          </script>
          </head>
          <body>
              {props.children}
          </body></html>
}

module.exports = Master
