'use strict';

document.addEventListener('DOMContentLoaded', function() {
  const logoutLink = document.getElementById('logoutLink');

  if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      const form = document.createElement('form');
      form.action = '/logout';
      form.method = 'POST';
      document.body.appendChild(form);
      form.submit();
    });
  }
});