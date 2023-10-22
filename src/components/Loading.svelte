<script lang="ts">
	export let src: string;
</script>

<div class="relative w-fit h-fit">
	<img class=" object-cover" {src} alt="loading food" />
	<div
		class="scanner absolute w-full h-8 bg-gradient-to-b from-emerald-200/60 via-emerald-400 to-emerald-200/60"
	/>
</div>

<style>
	.scanner {
		/* Animation properties */
		animation-name: scan-animation;
		animation-duration: 2s; /* Adjust duration as per your preference */
		animation-iteration-count: infinite;
	}

	@keyframes scan-animation {
		0% {
			top: 0%;
		}
		50% {
			top: 95%;
		}
		100% {
			top: 0%;
		}
	}
</style>
