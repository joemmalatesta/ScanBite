<script lang="ts">
	import type { ActionData } from './$types';

	let formOutput: any;
	export let form: ActionData;
	$: if (form?.foodArray) {
		formOutput = form.foodArray;
	}
</script>

<h2 class="text-5xl">Upload Image</h2>

<form method="POST" enctype="multipart/form-data">
	<input type="file" name="imageFile" accept="image/*" />
	<button type="submit">Upload</button>
</form>

{#if form?.foodArray}
	<div class="flex flex-col">
		{#each formOutput as food}
			<p>{food[0]} - {food[1]}</p>
		{/each}
	</div>
{/if}
