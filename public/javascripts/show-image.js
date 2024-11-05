document.getElementById('imageInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  const preview = document.getElementById('imagePreview');

  if (file) {
    const reader = new FileReader();

    reader.onload = function(e) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };

    reader.readAsDataURL(file);
  }
});
