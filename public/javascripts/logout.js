'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const logoutLink = document.getElementById('logoutLink');

  if (logoutLink) {
    logoutLink.addEventListener('click', e => {
      e.preventDefault();
      const form = document.createElement('form');
      form.action = '/logout';
      form.method = 'POST';
      document.body.appendChild(form);
      form.submit();
    });
  }
});