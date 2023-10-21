<script lang='ts'>
    
</script>


<h2>Upload Image</h2>

<form action="/process" method="POST" enctype="multipart/form-data">
  <input type="file" name="imageFile" accept="image/*">
  <button type="submit">Upload</button>
</form>