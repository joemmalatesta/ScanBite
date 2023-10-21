<script lang="ts">
	import type { ActionData } from "./$types";

	let formOutput: string;
	export let form: ActionData;
	$: console.log(form)
</script>

<h2 class="text-5xl">Upload Image</h2>

<form method="POST" enctype="multipart/form-data">
	<input type="file" name="imageFile" accept="image/*" />
	<button type="submit">Upload</button>
</form>

<!-- <div>
	{form?.output}
</div> -->
