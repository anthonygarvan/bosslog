const React = require('react');

function Master(props) {
  return <html>
          <head>
          <title>Bosslog | The Note App for Managers.</title>

          <meta property="og:title" content="Bosslog | The Note App for Managers." />
          <meta property="og:description" content="Keep it together, people." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://bosslog.app" />
          <meta property="og:image" content="https://bosslog.app/img/social.jpg" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="600" />


          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image" content="https://bosslog.app/img/social.jpg" />
          <meta name="twitter:title" content="Bosslog | The Note App for Managers." />
          <meta name="twitter:description" content="Keep it together, people." />

          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="icon" href="/img/favicon.png" />
          <link rel="manifest" href="./manifest.json" />
          <script dangerouslySetInnerHTML={{__html: `
              var template = document.createElement('template');
              template.innerHTML = '<link rel="stylesheet" href="/css/master.css" />';
              document.head.append(template.content.firstChild)`}}>
          </script>
          <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css" integrity="sha384-DNOHZ68U8hZfKXOrtjWvjxusGo9WQnrNx2sqG0tfsghAvtVlRW3tvkXWZh58N9jp" crossOrigin="anonymous" />
          <script async src="https://www.googletagmanager.com/gtag/js?id=UA-38185442-8"></script>
          <script  dangerouslySetInnerHTML={ {__html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'UA-38185442-8');` } }>
          </script>
          <script src="https://www.paypalobjects.com/api/checkout.js"></script>

          <script data-obct type="text/javascript" dangerouslySetInnerHTML={ {__html: `
            /** DO NOT MODIFY THIS CODE**/
            !function(_window, _document) {
              var OB_ADV_ID='00833138012809000a4e91d6e1d5ee631d';
              if (_window.obApi) {var toArray = function(object) {return Object.prototype.toString.call(object) === '[object Array]' ? object : [object];};_window.obApi.marketerId = toArray(_window.obApi.marketerId).concat(toArray(OB_ADV_ID));return;}
              var api = _window.obApi = function() {api.dispatch ? api.dispatch.apply(api, arguments) : api.queue.push(arguments);};api.version = '1.1';api.loaded = true;api.marketerId = OB_ADV_ID;api.queue = [];var tag = _document.createElement('script');tag.async = true;tag.src = '//amplify.outbrain.com/cp/obtp.js';tag.type = 'text/javascript';var script = _document.getElementsByTagName('script')[0];script.parentNode.insertBefore(tag, script);}(window, document);
            obApi('track', 'PAGE_VIEW');`}}></script>

          </head>
          <body>
              {props.children}
          </body></html>
}

module.exports = Master
