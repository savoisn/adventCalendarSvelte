<script>
	import 'bulma/css/bulma.css'
	import '@fortawesome/fontawesome-free/css/all.css'

	export let name='';
	import Door from './Door.svelte';
	import { onMount } from 'svelte';

	import doorStore from './store.js';

	console.log(__myapp.env);
	let calendarDays = [];
	//let startUpDateStr ="2020-11-25T00:00+01:00"
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
			imagePath:"images/1.png",
			rewardText:"",
			rewardLink:"https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UMDNWVldUV1JXTFY5TElNMERZNTBBMDFRMS4u"
		},
		1:{
			imagePath:"images/2.jpg",
			rewardText:"",
			rewardLink:"https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UQldYUVA2RkdISVVMQTNTVkdBVUNPWkJJUy4u"
		},
		2:{
			imagePath:"images/3.jpg",
			rewardText:"",
			rewardLink:"https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UMkZERjAyVDZRNTZKVDdHSUFVOTJSOFYzRi4u"
		},
		3:{
			imagePath:"images/4.png",
			rewardText:"",
			rewardLink:"https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UMFJJVzFQT1lJSkhNSTBRRTg0R1BUVlZZQy4u"
		}
	}

	onMount(async () => {
	// await fetch(__myapp.env.API_URL+"/daySinceFirstDec")
	await fetch("https://advent-calendar-api-talan.cleverapps.io/daySinceFirstDec")
		.then(r => r.json())
		.then(data => {
			if(data.daySinceFirstDec){
				nbDays = parseInt(data.daySinceFirstDec);
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
	<h1>Iterative {name} By Talan!</h1>
	<p>❤️Made with love by Talan Labs❤️</p>

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
			canOpen = {doorNumber.canOpen}/>
		{/each}
	</div>

	<div>
	<p>A gagner : livres, cd, ballons de rugby, polos Stade Français, et plein d’autres surprises !  Avec en bonus un chèque cadeau pour celui qui répondra correctement à un maximum de questions.</p>
	
	<p>La réponse et les gagnants seront annoncés le lendemain sur Workplace.</p>
	</div>
<div><button on:click={resetProgression}>reset progression</button></div>
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