<script>
	import 'bulma/css/bulma.css'
	import '@fortawesome/fontawesome-free/css/all.css'

	export let name='';
	import Door from './Door.svelte';
	import { onMount } from 'svelte';

	import doorStore from './store.js';

	let calendarDays = [];
	let startUpDateStr ="2020-11-30T00:00+01:00"
	let startUpDate = Date.parse(startUpDateStr);

	let currentDate = Date.now();

	let nbDays = 1;

	function defineNbDays(){
		let diff = currentDate - startUpDate
		nbDays = Math.floor(diff / (1000 * 3600 * 24));
	}

	let rewards = {
		0:{
			imagePath:"images/christmas-tree.png",
			rewardText:"L'orthographe un Art en Péril",
			rewardLink:"https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UMDNWVldUV1JXTFY5TElNMERZNTBBMDFRMS4u"
		},
		1:{
			imagePath:"images/christmas-tree.png",
			rewardText:"une petite phrase un peu longue pour etre jolie",
			rewardLink:"http://yahoo.com/"
		}
	}

	onMount(async () => {
	await fetch(`http://worldclockapi.com/api/json/cet/now`)
		.then(r => r.json())
		.then(data => {
			if(data.currentDateTime){
				currentDate = Date.parse(data.currentDateTime);
				defineNbDays()
				for(let i in [...Array(25).keys()] ){
					const day = parseInt(i) + 1
					calendarDays.push({
						day:day, 
						canOpen:canOpen(day),
						reward:rewards[day-1]?rewards[day-1]:""
					})
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
	<h1>Agile {name} By Talan!</h1>
	<p>Made with love by TalanLabs</p>
    <p>Chaque jour une case peut etre ouverte</p>
    <p>Et une demarche iterative pour montrer notre savoir faire</p>

	<div class = "box">
		{#each calendarDays as doorNumber}
		<Door 
			imagePath = {doorNumber.reward.imagePath}
			rewardText = {doorNumber.reward.rewardText}
			rewardLink = {doorNumber.reward.rewardLink}
			doorNumber = {doorNumber.day} 
			doorOpen = {doorNumber.day <= $doorStore}
			canOpen = {doorNumber.canOpen}/>
		{/each}
	</div>

	<div><button on:click={resetProgression}>reset progression</button></div>
	<div></div>
</main>


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