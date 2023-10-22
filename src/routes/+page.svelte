<script lang="ts">
	import Loading from '../components/Loading.svelte';
	import RatingBar from '../components/RatingBar.svelte';
	import SectionHeader from '../components/SectionHeader.svelte';
	import type { ActionData } from './$types';

	let ingredients: any, uploadedImage: any, ratings: any;
	export let form: ActionData;
	$: if (form?.foodArray) {
		ingredients = form.foodArray;
	}
	$: if (form?.image) {
		uploadedImage = form.image;
	}
	$: if (form?.ratings) {
		ratings = form.ratings;
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
	let showFoods = false;
</script>

<div class="flex justify-center items-center mt-3">
	<SectionHeader title={'ScanBite'} />
</div>

<form method="POST" enctype="multipart/form-data" class="flex justify-center flex-col items-center">
	<div
		class="flex justify-center items-center relative h-96 md:w-96 w-72 cursor-pointer overflow-hidden"
	>
		<!-- different image states depending on selected, loading, or uploaded -->
		{#if uploadedImage}
			<img src={uploadedImage} alt="Uploaded food" class=" object-cover" />
		{:else if foodImage && loading}
			<!-- Add a scanning bar thing going over the image -->
			<Loading src={foodImage} />
		{:else if foodImage}
			<img class=" object-cover" src={foodImage} alt="selected food" />
		{:else}
			<div
				class="bg-neutral-300 rounded-lg ring-2 ring-neutral-400 ring-opacity-60 opacity-60 absolute inset-0 flex flex-col justify-center items-center"
			>
				<img class="w-12" src="plus.svg" alt="" />
				<p>Upload image</p>
			</div>
		{/if}
		<input
			class="opacity-0 inset-0 absolute {foodImage || uploadedImage
				? ' cursor-default'
				: ' cursor-pointer'}"
			name="imageFile"
			type="file"
			accept=".jpg, .png, .jpeg, .webp, .JPEG"
			on:change={(e) => onFileSelected(e)}
			bind:this={fileInput}
		/>
	</div>
	<button
		class="{uploadedImage
			? 'hidden'
			: ''} rounded-md p-2 w-60 mt-2 bg-emerald-400 ring-2 ring-emerald-500 hover:bg-emerald-500 transition-colors"
		type="submit"
		on:click={() => {
			loading = true;
		}}
		>Scan
	</button>
	<button
		type="button"
		class="{uploadedImage
			? ''
			: 'hidden'} rounded-md p-2 w-60 mt-2 bg-emerald-400 ring-2 ring-emerald-500 hover:bg-emerald-500 transition-colors"
		on:click={() => {
			foodImage = '';
			window.location.reload();
		}}>Scan Another</button
	>
</form>

<!-- Overall, protein, fiber, vitamin -->
{#if form?.ratings}
	<!-- Large screens -->
	<div class="flex flex-col lg:flex-row items-center justify-around">
		{#each ratings as rating}
			<!-- Put the ratings component here -->
			<div>
				<RatingBar ratingCategory={rating[0]} ratingNumber={rating[1]} />
			</div>
		{/each}
	</div>

	<!-- For phone screens, have them toggle the rating they see -->
{/if}

<!-- Option to see food breakdown MAYBE ADD THIS -->

<!-- <button class="p-2 bg-emerald-400" on:click={() => {
	showFoods = !showFoods
}}>see food breakdown</button>

{#if form?.foodArray && showFoods}
	<div class="flex flex-col">
		{#each ingredients as ingredient}
			<p>{ingredient}</p>
		{/each}
	</div>
{/if} -->
