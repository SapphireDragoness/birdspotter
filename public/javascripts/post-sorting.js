'use strict'

const posts  = JSON.parse(document.getElementById("post-sorting").getAttribute("data-posts"));

function renderPosts(postsArray) {
  $('#posts-container').empty();
  // couldn't get the code to render ejs...
  postsArray.forEach(post => {
    const postHtml = `
<div class="col-12 col-md-3 mx-auto mb-3">
    <div class="card" id="post-card">
    <a href="/posts/${post.id}">
        <img id="card-image" class="card-img-top img-fluid" src="../${post.photoPath}" alt="post image">
        <div class="card-body">
            <h5 class="card-title text-center">${post.title}</h5>
            <div class="row flex-grow-0">
                <small class="card-text text-muted align-content-md-start"><i class="far fa-user"></i>${post.op}</small>
                <small class="card-text text-muted"><i class="fa-solid fa-dove"></i>${post.bird}</small>
                <small class="card-text text-muted"><i class="fa-solid fa-location-dot"></i>${post.location}</small>
            </div>
        </div>
    </a>
</div>
</div>
    `;
    $('#posts-container').append(postHtml);
  });
}

$(document).ready(function() {
  $('#sortByDateAsc').on('click', function () {
    const sortedPosts = [...posts].sort((a, b) => new Date(a.date) - new Date(b.date));
    renderPosts(sortedPosts);
  });

  $('#sortByDateDesc').on('click', function () {
    const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    renderPosts(sortedPosts);
  });

  $('#sortByTitleAsc').on('click', function () {
    const sortedPosts = [...posts].sort((a, b) => a.title.localeCompare(b.title));
    renderPosts(sortedPosts);
  });

  $('#sortByTitleDesc').on('click', function () {
    const sortedPosts = [...posts].sort((a, b) => b.title.localeCompare(a.title));
    renderPosts(sortedPosts);
  });

  $('#filterByTitle').on('click', function () {
    const titleToFilter = $('#userFilter').val().toLowerCase();
    const filteredPosts = posts.filter(post => post.title.toLowerCase().includes(titleToFilter));
    renderPosts(filteredPosts);
  });

  $('#filterByUser').on('click', function () {
    const titleToFilter = $('#titleFilter').val().toLowerCase();
    const filteredPosts = posts.filter(post => post.title.toLowerCase().includes(titleToFilter));
    renderPosts(filteredPosts);
  });

  $('#filterByBird').on('click', function () {
    const titleToFilter = $('#birdFilter').val().toLowerCase();
    const filteredPosts = posts.filter(post => post.title.toLowerCase().includes(titleToFilter));
    renderPosts(filteredPosts);
  });

  $('#filterByLocation').on('click', function () {
    const titleToFilter = $('#locationFilter').val().toLowerCase();
    const filteredPosts = posts.filter(post => post.title.toLowerCase().includes(titleToFilter));
    renderPosts(filteredPosts);
  });

})

