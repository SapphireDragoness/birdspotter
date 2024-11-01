'use strict'

$(document).ready(function () {
  // hide/show passwords
  $('#togglePassword').on('click', function () {
    const passwordField = $('#password');
    const type = passwordField.attr('type') === 'password' ? 'text' : 'password';
    passwordField.attr('type', type);
    $(this).toggleClass('fa-eye fa-eye-slash');
  });

  $('#toggleConfirmPassword').on('click', function () {
    const confirmPasswordField = $('#confirmPassword');
    const type = confirmPasswordField.attr('type') === 'password' ? 'text' : 'password';
    confirmPasswordField.attr('type', type);
    $(this).toggleClass('fa-eye fa-eye-slash');
  });

  // strength checker
  $('#password').on('input', function () {
    const password = $(this).val();
    let strength = "";
    let strengthClass = "";

    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      strength = "very strong";
      strengthClass = "very-strong";
    } else if (password.length >= 6 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      strength = "strong";
      strengthClass = "strong";
    } else if (password.length >= 6) {
      strength = "could be better";
      strengthClass = "medium";
    } else {
      strength = "weak";
      strengthClass = "weak";
    }
    $('#password-strength')
      .text(`Password strength: ${strength}`)
      .removeClass("weak medium strong very-strong")
      .addClass(strengthClass);
  });

  // password matching
  $('#confirmPassword').on('input', function () {
    const password = $('#password').val();
    const confirmPassword = $(this).val();
    if (password !== confirmPassword) {
      $('#password-match').text('Passwords don\'t match');
    } else {
      $('#password-match').text('');
    }
  });
});

