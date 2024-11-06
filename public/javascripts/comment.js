'use strict'

var postID = document.getElementById("comment-script").getAttribute("data-postID");
var user = document.getElementById("comment-script").getAttribute("data-user");

$(document).ready(function () {
  $.get(`/posts/${postID}/comments`, function (comments) {
    comments.forEach(comment => {
      $('#comments-section').append(`
                <div class="card mb-4">
  <div class="card-body">
    <p>${comment.comment}</p>

    <div class="d-flex justify-content-between">
      <div class="d-flex flex-row align-items-center">
        <img src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(4).webp" alt="avatar" width="25"
             height="25"/>
        <p class="small mb-0 ms-2"><strong>${comment.username}</strong></p>
      </div>
      <div class="d-flex flex-row align-items-center">
        <p class="small text-muted mb-0">Upvote?</p>
        <i class="fas fa-heart mx-2" style="margin-top: -0.16rem;"></i>
        <p class="small text-muted mb-0">3</p>
      </div>
    </div>
  </div>
</div>
            `);
    });
  });


  $('#add-comment-form').on('submit', function (e) {
    e.preventDefault();
    const commentContent = $(this).find('textarea[name="comment"]').val();

    $.post(`/posts/${postID}/comments`, {content: commentContent})
      .done(function (newComment) {
        $('#comments-section').append(`
                <div class="card mb-4">
  <div class="card-body">
    <p>${newComment.comment}</p>

    <div class="d-flex justify-content-between">
      <div class="d-flex flex-row align-items-center">
        <img src="" alt="avatar" width="25"
             height="25"/>
        <p class="small mb-0 ms-2"><strong>${newComment.user}</strong></p>
      </div>
      <div class="d-flex flex-row align-items-center">
        <p class="small text-muted mb-0">Upvote?</p>
        <i class="fas fa-heart mx-2" style="margin-top: -0.16rem;"></i>
        <p class="small text-muted mb-0">3</p>
      </div>
    </div>
  </div>
</div>    
        `);
        $('#add-comment-form')[0].reset();
      })
      .fail(function () {
        alert("Error posting comment.");
      });
  });
});
