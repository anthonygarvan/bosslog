const $ = require('jquery');

$('#hide-info').click(e => $('#info').hide());

$(".contact-form").submit((e) => {
  e.preventDefault();
  $.post('/contact', {name: $('[name=name]').val(),
    email: $('[name=email]').val(),
    message: $('[name=message]').val()}, (data) => {
      if(data.success) {
        $('#info').show();
        window.scrollTo(0, 0);
        $('[name=name]').val('');
        $('[name=email]').val('');
        $('[name=message]').val('');
      }
    });
})
