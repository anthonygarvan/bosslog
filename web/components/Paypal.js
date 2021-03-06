const React = require('react');
const ReactDOM = require('react-dom');
const $ = require('jquery');

function Paypal(props) {
  let PayPalButton = paypal.Button.driver('react', { React, ReactDOM });

  const client={sandbox: 'AYmXwS_TdNIsBmlfxTT02VhFaoVMVm-4GWOg-xK5y0onyHBFKBWbhLwWQJy0ADjYdNz6ZpBnWAVZTGeN',
     production: 'AYAIAJp_kIihRTEtdttWYzkVd0UrLtC5a-Xhc2JAKrnGF6mrAGBBR1htLigOHBi7P3HGLdblD-CaodKO'};
  const env="production";
  const payment = () =>
      paypal.rest.payment.create(env, client, {
          transactions: [
          {
            amount: {
              total: props.amount,
              currency:'USD'
            },
            item_list: {
              items: [
                {
                  name: "Bosslog | The note app for managers (1 year)",
                  quantity: "1",
                  price: props.amount,
                  sku: "1",
                  currency: "USD"
                }]}}
        ]},
        {input_fields: { no_shipping: 1 } });

  return <PayPalButton client={client}
     env={env}
     locale="en_US"
     payment={payment}
     commit={true}
     style={{size: 'responsive',
             color: 'blue',
             shape: 'pill'}}
     onAuthorize={(data, actions) => {
       return actions.payment.execute()
         .then(function () {
           $.getJSON('/auth/payment-complete', () => {
             window.alert('Thank you so much!!');
             props.closePrompt();
           });
         });
      }}/>}

module.exports = Paypal
