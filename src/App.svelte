<script>
	import 'bulma/css/bulma.css'
	import '@fortawesome/fontawesome-free/css/all.css'

	import { Router, Link, Route } from "svelte-routing";
	import NavLink from "./components/NavLink.svelte"

	import Calendar from './routes/calendar.svelte';
	import { component_subscribe } from 'svelte/internal';
	import ChangelogRoute from './routes/ChangelogRoute.svelte';
	import FireWorks from './components/FireWorks.svelte';

    import * as changelogs from '../changelog.json'
    import * as calendarData from '../calendar-talan-data.json'
	import Modal from './components/Modal.svelte';
	export let name='';

	export let url = "";

	console.log(__myapp.env.isProd);
	console.log(__myapp.env);

	let isProd = __myapp.env.isProd;
</script>

<div id="particles-js"></div> 
<Modal>
<Router url="{url}">
	{#if !isProd}
	<nav>
		<Link to="/">Home</Link>
		<Link to="/Changelog">Changelog</Link>
		<Link to="/Firework">Firework</Link>
	</nav>
	{/if}

	<div>
		<Route path="/"><Calendar name={name} calendarDate={calendarData.days}></Calendar></Route>
		<Route path="/Changelog" ><ChangelogRoute changelogs={changelogs.changes}/></Route>
		<Route path="/Firework" ><FireWorks/></Route>
	</div>

</Router>
</Modal>
<style>
	nav{
		padding-left: 20px;
	}
</style>
