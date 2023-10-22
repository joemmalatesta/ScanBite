<script lang="ts">
	import Loading from '../components/Loading.svelte';
	import type { ActionData } from './$types';

	let foodArray: any, uploadedImage: any;
	export let form: ActionData;
	$: if (form?.foodArray) {
		foodArray = form.foodArray;
	}
	$: if (form?.image) {
		uploadedImage = form.image;
	}

	// Get image of food after it is selected, but before it sent to the server and uploaded
	let foodImage: any, fileInput: any;
	const onFileSelected = (e: any) => {
		if (e && e.target && e.target.files) {
			loading = false;
			let image = e.target.files[0];
			let reader = new FileReader();
			reader.readAsDataURL(image);

			reader.onload = (event) => {
				const target = event?.target;
				if (target instanceof FileReader) {
					foodImage = target.result;
				}
			};
		}
	};

	let loading = false;
</script>

<h2 class="text-5xl">Upload Image</h2>

<form method="POST" enctype="multipart/form-data">
	<!-- different image states depending on selected, loading, or uploaded -->
	<div class="">
		{#if uploadedImage}
			<img src={uploadedImage} alt="Uploaded food" />
		{:else if foodImage && loading}
			<!-- Add a scanning bar thing going over the image -->
			<Loading src={foodImage} />
		{:else if foodImage}
			<img src={foodImage} alt="selected food" />
		{/if}
	</div>

	<input
		class={foodImage || uploadedImage ? 'hidden' : ''}
		name="imageFile"
		type="file"
		accept=".jpg, .png, .jpeg, .webp, .JPEG"
		on:change={(e) => onFileSelected(e)}
		bind:this={fileInput}
	/>
	<button
		class={uploadedImage ? 'hidden' : ''}
		type="submit"
		on:click={() => {
			loading = true;
		}}>Upload</button
	>
</form>

{#if form?.foodArray}
	<div class="flex flex-col">
		{#each foodArray as food}
			<p>{food[0]} - {food[1]}</p>
		{/each}
	</div>
{/if}
