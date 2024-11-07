'use strict'

$(document).ready(function () {
  $('#contact-form').on('submit', function (e) {
    e.preventDefault();

    const formData = $(this).serialize();

    $.post('/contact', formData)
      .done(function () {
        $('#alert-success').removeClass('d-none');
        $('#contact-form')[0].reset();
      })
      .fail(function () {
        alert("An error occurred, try again later!");
      });
  });
});
