'use strict'

document.getElementById('advancedSearchForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const user = document.getElementById('user').value;
  const bird = document.getElementById('bird').value;
  const location = document.getElementById('location').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  // concatenates all fields in a single query for 'easier' handling
  let queryString = [
    title ? `title:${title}` : null,
    user ? `user:${user}` : null,
    bird ? `bird:${bird}` : null,
    location ? `location:${location}` : null,
    startDate ? `startDate:${startDate}` : null,
    endDate ? `endDate:${endDate}` : null
  ].filter(Boolean).join('+');

  window.location.href = `/search/?q=${encodeURIComponent(queryString).replace(/%2B/g, '+')}`;
});
