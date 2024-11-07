'use strict'

var postID = document.getElementById("comment-script").getAttribute("data-postID");
var user = JSON.parse(document.getElementById("comment-script").getAttribute("data-user"));

$(document).ready(function () {
  $('#add-comment-form').on('submit', function (e) {
    e.preventDefault();
    const commentContent = $(this).find('textarea[name="comment"]').val();

    $.post(`/posts/${postID}/comments`, {content: commentContent})
      .done(function (newComment, user) {
        $('#comments-section').append(`
          <div class="card mb-3" data-comment-id="${newComment.id}">
            <div class="card-body d-flex align-items-start">
              <img src="${newComment.picture}" alt="User Picture" class="rounded-circle me-3" width="50" height="50"/>
            <div class="w-100">
              <h6 class="card-subtitle mb-2 text-muted"><strong>${newComment.user}</strong></h6>
              <p class="card-text">${newComment.comment}</p>
            </div>
            <button id="delete-comment" class="btn btn-lg btn-link" style="font-size: small">
                <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
        `);
        $('#add-comment-form')[0].reset();
      })
      .fail(function () {
        alert("Error posting comment.");
      });
  });

  $('#comments-section').on('click', '#delete-comment', function () {
    const commentCard = $(this).closest('.card');
    const commentId = commentCard.data('comment-id');

    $.ajax({
      url: `/posts/${postID}/comments/${commentId}`,
      type: 'DELETE',
      success: function () {
        commentCard.remove();
      },
      error: function () {
        alert("Error deleting comment.");
      }
    });
  });

});
