'use strict'

const dailyPosts = JSON.parse(document.getElementById("admin-charts").getAttribute("data-posts"))
const topPosts = JSON.parse(document.getElementById("admin-charts").getAttribute("data-top"))
const mostFollowedUsers = JSON.parse(document.getElementById("admin-charts").getAttribute("data-follows"))

const labels = dailyPosts.map(item => item.postDate);
const data = dailyPosts.map(item => item.count);
const postTitles = topPosts.map(post => post.title);
const likeCounts = topPosts.map(post => post.likes);

// top left chart
new Chart(document.getElementById('dailyPostsChart'), {
  type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'Daily posts',
      data: data,
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: true
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: 'Number of posts' }, beginAtZero: true }
    }
  }
});

// bottom left chart
new Chart(document.getElementById('topPostsChart'), {
  type: 'bar',
  data: {
    labels: postTitles,
    datasets: [{
      label: 'Likes per Post',
      data: likeCounts,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

// top right chart
new Chart(document.getElementById('topFollowedChart'), {
  type: 'bar',
  data: {
    labels: mostFollowedUsers.map(user => user.username),
    datasets: [{
      label: 'Number of Followers',
      data: mostFollowedUsers.map(user => user.followers_count),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  }
});