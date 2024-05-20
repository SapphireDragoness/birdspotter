'use strict'

async function addLike(username, post) {
  try {
    await fetch(`${post}/like`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username })
    });
    let likesElement = document.querySelector(`#post_${post} .likes`);
    console.log(likesElement)
    likesElement.textContent = newLikes.toString();
  } catch (error) {
    console.error("Error:", error);
  }
}

async function removeLike(post) {
  try {
    await fetch(`${post}/unlike`, {
      method: "POST"
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

