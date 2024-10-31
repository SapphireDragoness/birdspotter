$(document).ready(function() {
  $('#like-button').on('click', function() {
    const liked = $(this).data('liked');
    const url = liked ? `/posts/${postID}/unlike` : `/posts/${postID}/like`;

    $.post(url, { username: username })
      .done(() => {
        $(this).data('liked', !liked);
        const newLabel = liked ? '<i class="fa-regular fa-heart"></i>' : '<i class="fa-solid fa-heart"></i>';
        $(this).html(newLabel);

        const currentCount = parseInt($('#like-count').text());
        $('#like-count').text(liked ? currentCount - 1 : currentCount + 1);
      })
      .fail(() => {
        alert("Error updating likes (at like.js)");
      });
  });
});
