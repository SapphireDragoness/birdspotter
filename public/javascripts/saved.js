'use strict'

var postID = document.getElementById("saved-script").getAttribute("data-postID");
var username = document.getElementById("saved-script").getAttribute("data-username");

$(document).ready(function() {
  $('#save-button').on('click', function() {
    const saved = $(this).data('saved');
    const url = saved ? `/posts/${postID}/unsave` : `/posts/${postID}/save`;

    $.post(url, { username: username })
      .done(() => {
        $(this).data('saved', !saved);
        const newLabel = saved ? '<i class="fa-regular fa-bookmark"></i>' : '<i class="fa-solid fa-bookmark"></i>';
        $(this).html(newLabel);
      })
  });
});
