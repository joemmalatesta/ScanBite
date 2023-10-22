<script lang="ts">
	export let ratingNumber: number;
	export let ratingCategory: string;

	let color: string = '';
	if (ratingNumber >= 75) {
		color = '#2dc937';
	} else if (ratingNumber >= 60) {
		color = '#db7b2b';
	} else if (ratingNumber >= 45) {
		color = '#e7b416';
	} else if (ratingNumber < 45) {
		color = '#cc3232';
	}
</script>

<div class="container">
	<div class="box" style="--i:{ratingNumber}%;--clr:{color};">
		<div class="circle">
			<h2>{ratingNumber}</h2>
		</div>
		<h3>{ratingCategory}</h3>
	</div>
</div>

<style>
	.container {
		position: relative;
		display: flex;
	}
	.container .box {
		margin-right: 30px;
		position: relative;
		padding: 40px 0;
		width: 240px;
		background: transparent;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	.container .box .circle {
		position: relative;
		width: 150px;
		height: 150px;
		background: conic-gradient(
			from 0deg,
			var(--clr) 0%,
			var(--clr) 0% var(--i),
			#333 var(--i),
			#333 100%
		);
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.container .box .circle::before {
		content: '';
		position: absolute;
		inset: 15px;
		background: #fff;
		border-radius: 50%;
	}
	.container .box h2 {
		position: relative;
		text-align: center;
		font-size: 2.5em;
		color: #000;
		font-weight: 600;
	}
	.container .box h3 {
		color: #000;
		text-transform: uppercase;
		margin-top: 20px;
		font-weight: 500;
		letter-spacing: 0.1em;
	}
</style>
