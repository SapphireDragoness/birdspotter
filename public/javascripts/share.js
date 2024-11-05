'use strict'

// gets hostname
const host = window.location.host;

// for profiles
function shareProfile(username) {
  const profileLink = `${host}/users/${username}/posts`;

  $('#instagramLink').attr('href', `https://www.instagram.com/share?url=${encodeURIComponent(profileLink)}`);
  $('#facebookLink').attr('href', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileLink)}`);
  $('#telegramLink').attr('href', `https://telegram.me/share/url?url=${encodeURIComponent(profileLink)}`);
  $('#whatsappLink').attr('href', `https://api.whatsapp.com/send?text=${encodeURIComponent(profileLink)}`);
}

// for posts
function sharePost(username) {
  //const postLink = `${host}/users/${username}/`;

  $('#instagramLink').attr('href', `https://www.instagram.com/share?url=${encodeURIComponent(postLink)}`);
  $('#facebookLink').attr('href', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postLink)}`);
  $('#telegramLink').attr('href', `https://telegram.me/share/url?url=${encodeURIComponent(postLink)}`);
  $('#whatsappLink').attr('href', `https://api.whatsapp.com/send?text=${encodeURIComponent(postLink)}`);
}
