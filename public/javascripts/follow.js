'use strict'

var follower = document.getElementById("follow-script").getAttribute("data-follower");
var followedUser = document.getElementById("follow-script").getAttribute("data-followed");

$(document).ready(function() {
  $('#follow-button').on('click', function() {
    const followed = $(this).data('followed');
    const url = followed ? `/users/${followedUser}/unfollow` : `/users/${followedUser}/follow`;

    $.post(url, { follower: follower })
      .done(() => {
        $(this).data('followed', !followed);
        const newLabel = followed ? '<i class="fa-solid fa-plus me-2"></i>Follow' : '<i class="fa-solid fa-minus me-2"></i>Unfollow';
        $(this).html(newLabel);
      })
  });
});