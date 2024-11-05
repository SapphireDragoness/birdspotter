function renderPosts(postsArray) {
  $('#postsContainer').empty(); // Pulisce il contenitore dei post
  postsArray.forEach(post => {
    // Inserisci il codice per il rendering dei post usando jQuery o includendo il template
    const postHtml = `<div class="col-12 col-md-3 mx-auto mb-3">
                        ${ejs.render('<%- include("post-card.ejs", { post: post }) %>', { post })}
                      </div>`;
    $('#postsContainer').append(postHtml);
  });
}

$('#sortByDateAsc').on('click', function() {
  const sortedPosts = [...posts].sort((a, b) => new Date(a.date) - new Date(b.date));
  renderPosts(sortedPosts);
});

$('#sortByDateDesc').on('click', function() {
  const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  renderPosts(sortedPosts);
});

$('#sortByTitleAsc').on('click', function() {
  const sortedPosts = [...posts].sort((a, b) => a.title.localeCompare(b.title));
  renderPosts(sortedPosts);
});

$('#sortByTitleDesc').on('click', function() {
  const sortedPosts = [...posts].sort((a, b) => b.title.localeCompare(a.title));
  renderPosts(sortedPosts);
});
