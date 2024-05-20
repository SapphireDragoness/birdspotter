'use strict'

async function showProfile(user) {
  try {
    await fetch(`${user}`)
  } catch (error) {
    console.error("Error:", error);
  }
}

async function showMyPosts(user) {
  try {
    await fetch(`${user}/myposts`);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function showLikedPosts(user) {
  try {
    await fetch(`${user}/likedposts`, {
      method: "GET"
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

async function showSavedposts(user) {
  try {
    await fetch(`${user}/savedposts`, {
      method: "GET"
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

async function showEdit(post) {
  try {
    await fetch(`${post}/edit`, {
      method: "GET"
    });
  } catch (error) {
    console.error("Error:", error);
  }
}
