<script>
	import Door from '../Door.svelte';
	import { onMount } from 'svelte';

    import doorStore from '../store.js';
    
    export let name = "";

	let calendarDays = [];

	let currentDate = Date.now();

	let nbDays = 1;

	let door_numbers = [...Array(25).keys()]
	let random_door_numbers = door_numbers
	.map((a) => ({sort: Math.random(), value: a}))
	.sort((a, b) => a.sort - b.sort)
	.map((a) => a.value)
	
	let offset = 0;
	let isProd = __myapp.env.isProd;

	if(!isProd){
		offset = 7;
	}

	export let calendarDate={};

	onMount(async () => {
	// await fetch(__myapp.env.API_URL+"/daySinceFirstDec")
	await fetch("https://advent-calendar-api-talan.cleverapps.io/daySinceFirstDec")
		.then(r => r.json())
		.then(data => {
			if(data.daySinceFirstDec){
				nbDays = parseInt(data.daySinceFirstDec) + offset;
				let id = 1 //j'ai honte je suis desole devant le reste du monde mais j'ai pas le temps... :D
				for(let i of random_door_numbers){
					const day = parseInt(i) + 1
					calendarDays.push({
						day:day, 
						canOpen:canOpen(day),
						reward:calendarDate[day-1]?calendarDate[day-1]:"",
						id:id
					})
					id++;
				}
				calendarDays = calendarDays
			}
		});
	})

	function canOpen(dayToCheck){
		return (dayToCheck - nbDays <=0)
	}

	function resetProgression(){
		doorStore.reset()
	}

</script>

<main>

	<!-- stats - count particles --> 

	<h1>🎄 <a class="title" href="/Changelog">Iterative</a> {name} By Talan! 🎄</h1>
	<p>❤️ Made with love by Talan Labs ❤️</p>

	<p>Envie d'apprendre un savoir inutile et de gagner des cadeaux ? </p>
	<p>Clique sur la case du jour et réponds à la question posée.</p>

	<p>A vous de jouer !</p>

	<div class = "box">
		{#each calendarDays as doorNumber}
		<Door 
			imagePath = {doorNumber.reward.imagePath}
			rewardText = {doorNumber.reward.rewardText}
			rewardLink = {doorNumber.reward.rewardLink}
			doorNumber = {doorNumber.day} 
			doorOpen = {doorNumber.day <= $doorStore}
			canOpen = {doorNumber.canOpen}
			doorId = {doorNumber.id}/>
		{/each}
	</div>

	<div>
	<p>A gagner : livres, cd, ballons de rugby, polos Stade Français, et plein d’autres surprises !  Avec en bonus un chèque cadeau pour celui qui répondra correctement à un maximum de questions.</p>
	
	<p>La réponse et les gagnants seront annoncés le lendemain sur Workplace.</p>
	</div>
<div>
	<br/>
	<p>Intéressé par le processus itératif derrière le developpement de ce calendrier?</p>
	<p>Vous pouvez consulter le <a class="link" href="/Changelog">changelog ici!</a></p>
<button on:click={resetProgression}>Reset Progression</button></div>
</main>


<style>
	.box{
		display:flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: space-around;
		background-color: transparent;
	}

	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;

		display:flex;
		justify-content: center;
		flex-direction: column;
	}

	h1 {
		color: #e71616;
		font-family: 'Nerko One', cursive;
		font-size: 4em;
		font-weight: 100;
		margin-bottom: 10px;
	}

	p {
		color: white;
	}

	a.link {
		color: darkseagreen;
	}
	a.title {
		color: inherit;
		font-size: inherit;
		font-weight: inherit;
	}
	a.title:visited {
		color: inherit;
	}
	a.title:hover {
		color: inherit;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>