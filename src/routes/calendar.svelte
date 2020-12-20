<script>
	import Door from '../components/Door.svelte';
	import { onMount } from 'svelte';
    import doorStore from '../store.js';
	import { getContext } from 'svelte';
	import Popup from '../components/PopUp.svelte';
	const { open } = getContext('simple-modal');

    export let name = "";

	let calendarDays = [];

	let nbDays = 1;

	let door_numbers = [...Array(24).keys()]
	let random_door_numbers = door_numbers
	.map((a) => ({sort: Math.random(), value: a}))
	.sort((a, b) => a.sort - b.sort)
	.map((a) => a.value)
	// random_door_numbers = door_numbers
	
	let offset = 0;
	let isProd = __myapp.env.isProd;

	if(!isProd){
		offset = 7;
	}

	let displayError;

	export let calendarDate={};

	onMount(async () => {
	await fetch(__myapp.env.API_URL+"/daySinceFirstDec")
		.then(r => r.json())
		.then(data => {
			if(data.daySinceFirstDec){
				nbDays = parseInt(data.daySinceFirstDec) + offset;
				let id = 1 //j'ai honte je suis desole devant le reste du monde mais j'ai pas le temps... :D
				for(let i of random_door_numbers){
					const day = parseInt(i) + 1
					calendarDays.push({
						day:day, 
						reward:calendarDate[day-1]?calendarDate[day-1]:"",
						id:id
					})
					id++;
				}
				calendarDays = calendarDays
			}
		})
		.catch(error => {
			displayError = "ERROR QUERYING DATE API"
			console.log("API fetch error");
			console.log(error);
		});
	})

	function canOpen(dayToCheck){
		let dayInStore = (dayToCheck-1) <= $doorStore
		let dayToOpenLessThanToday = (dayToCheck - nbDays <=0)
		console.log("canOpen",dayToCheck, dayInStore, dayToOpenLessThanToday)
		return (dayInStore && dayToOpenLessThanToday)
	}

	function isAlreadyOpened(dayToCheck){
		console.log("isAlreadyOpened", dayToCheck)
		console.log($doorStore)
		const dayInStore = dayToCheck <= $doorStore
		return dayInStore
	}


	function resetProgression(){
		doorStore.reset()
	}

	function showPopUpDoor(){
		let doorConfig = {
			reward : {
				imagePath : "",
				rewardLink : ""
			},
			canOpen : canOpen,
			day : 1,
			id : 102
		}
		showPopup(doorConfig)
	}

	const showPopup = (doorInfo) => {
		open(Popup, { doorInfo: doorInfo });
	};

</script>

<main>

	{#if !isProd}
		<button on:click={showPopUpDoor}>Show a popup!</button>
	{/if}

	<h1>🎄 <a class="title" href="/Changelog">Iterative</a> {name} By Talan! 🎄</h1>
	<p>❤️ Made with love by Talan Labs ❤️</p>

	<p>Envie d'apprendre un savoir inutile et de gagner des cadeaux ? </p>
	<p>Clique sur la case du jour et réponds à la question posée.</p>

	<p>A vous de jouer !</p>

	{#if displayError}
		<h1>ERROR : </h1>
		<h2>{displayError}</h2>
	{/if}

	<div class = "box">
		{#each calendarDays as doorNumber}
		<Door 
			imagePath = {doorNumber.reward.imagePath}
			rewardLink = {doorNumber.reward.rewardLink}
			doorNumber = {doorNumber.day} 
			doorOpen = {doorNumber.day <= $doorStore}
			canOpen = {canOpen}
			isAlreadyOpened = {isAlreadyOpened}
			doorId = {doorNumber.id}
			size = {"small"}
			action = {showPopup}
		/>
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
	h2 {
		color: #e71616;
		font-family: 'Nerko One', cursive;
		font-size: 3em;
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