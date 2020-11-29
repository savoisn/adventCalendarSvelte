<script>
	import 'bulma/css/bulma.css'
	import '@fortawesome/fontawesome-free/css/all.css'

	import Door from './Door.svelte';
import { onMount } from 'svelte';
	let calendarDays = [];

	let startUpDate = Date.parse("2020-11-26T00:00+01:00");

	let currentDate = Date.now();

	let nbDays = 1;

	function defineNbDays(){
		let diff = currentDate - startUpDate
		nbDays = Math.floor(diff / (1000 * 3600 * 24));
	}

	let rewards = [
		"images/christmas-tree.png",
		"images/christmas-tree.png"
	]

	console.log(typeof(currentDate));
	onMount(async () => {
    await fetch(`http://worldclockapi.com/api/json/cet/now`)
		.then(r => r.json())
		.then(data => {
			if(data.currentDateTime){
				console.log(data.currentDateTime);
				currentDate = Date.parse(data.currentDateTime);
				defineNbDays()
				for(let i in [...Array(25).keys()] ){
					const day = parseInt(i) + 1
					calendarDays.push({
						day:day, 
						canOpen:canOpen(day),
						reward:rewards[day-1]
					})
				}
				calendarDays = calendarDays
			}
		});

	})

    function canOpen(dayToCheck){
		return (dayToCheck - nbDays <=0)
	}
    

</script>

<main>
	<h1>Advent Calendar By NSA!</h1>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
</main>

	<div class = "box">
		{#each calendarDays as doorNumber}
		<div class="column">
		<Door 
		imagePath = {doorNumber.reward}
		doorNumber = {doorNumber.day} 
		canOpen={doorNumber.canOpen}/>
		</div>
		{/each}
	</div>

<style>
	.box{
		display:flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: flex-start;
	}
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #0000ff;
		font-size: 3em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>