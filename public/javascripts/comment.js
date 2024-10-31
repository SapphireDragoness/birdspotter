$(document).ready(function() {
  $.get(`/posts/${postID}/comments`, function(comments) {
    comments.forEach(comment => {
      $('#comments-section').append(`
                <div class="comment">
                    <p><strong>${comment.username}</strong>: ${comment.comment}</p>
                </div>
            `);
    });
  });


  $('#add-comment-form').on('submit', function(e) {
    e.preventDefault();
    const commentContent = $(this).find('textarea[name="comment"]').val();

    $.post(`/posts/${postID}/comments`, { content: commentContent, username: username })
      .done(function(newComment) {
        $('#comments-section').append(`
                    <div class="post d-flex bd-highlight comment">
                        <p><strong>${newComment.user}</strong>: ${newComment.comment}</p>
                    </div>
                `);
        $('#add-comment-form')[0].reset();
      })
      .fail(function() {
        alert("Error posting comment.");
      });
  });
});
