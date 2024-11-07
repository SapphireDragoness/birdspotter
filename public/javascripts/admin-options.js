'use strict'

$(document).ready(function () {
  // function to ban user
  $('.btn-ban').click(function () {
    const username = $(this).data('username');
    $.post(`/admin/ban-user`, { username }, function (response) {
      alert(response.message);
      location.reload();
    });
  });

  // function to unban user
  $('.btn-unban').click(function () {
    const username = $(this).data('username');
    $.post(`/admin/unban-user`, { username }, function (response) {
      alert(response.message);
      location.reload();
    });
  });

  // function to make admin
  $('.btn-make-admin').click(function () {
    const username = $(this).data('username');
    $.post(`/admin/make-admin`, { username }, function (response) {
      alert(response.message);
      location.reload();
    });
  });

  // function to revoke admin role
  $('.btn-revoke-admin').click(function () {
    const username = $(this).data('username');
    $.post(`/admin/revoke-admin`, { username }, function (response) {
      alert(response.message);
      location.reload();
    });
  });

  // function to make moderator
  $('.btn-make-moderator').click(function () {
    const username = $(this).data('username');
    $.post(`/admin/make-moderator`, { username }, function (response) {
      alert(response.message);
      location.reload();
    });
  });

  // function to revoke admin role
  $('.btn-revoke-moderator').click(function () {
    const username = $(this).data('username');
    $.post(`/admin/revoke-moderator`, { username }, function (response) {
      alert(response.message);
      location.reload();
    });
  });

  // function to delete user
  $('.btn-delete').click(function () {
    const username = $(this).data('username');
    $.post(`/admin/delete-user`, { username }, function (response) {
      alert(response.message);
      location.reload();
    });
  });
});
