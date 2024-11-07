'use strict'

$(document).ready(function () {
  $('.delete-post-btn').on('click', function () {
    const postId = $(this).data('post-id');

    $.ajax({
      url: `/admin/delete-post/${postId}`,
      type: 'DELETE',
      success: function (result) {
        $(`#post-card-${postId}`).remove();
      },
      error: function (err) {
        alert("Error deleting post.");
      }
    });
  });
});