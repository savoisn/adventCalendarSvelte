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
	export let name='';

	export let url = "";

	console.log(__myapp.env.isProd);
	console.log(__myapp.env);

	let isProd = __myapp.env.isProd;
</script>

<div id="particles-js"></div> 

<Router url="{url}">
	<div>
		<Route path="/"><Calendar name={name}></Calendar></Route>
		<Route path="/Changelog" ><ChangelogRoute changelogs={changelogs.changes}/></Route>
		<Route path="/Firework" ><FireWorks/></Route>
	</div>

	<nav>
		{#if !isProd}
		<Link to="/">Home</Link>
		<Link to="/Changelog">Changelog</Link>
			<Link to="/Firework" class="link">Firework</Link>
		{/if}
	</nav>
</Router>

<style>
	nav{
		padding-left: 20px;
	}
	.link > :global(a) {
		text-decoration: none;
		color : cyan;
	}
	:global(a){
		text-decoration: none;
		color : greenyellow;
	}
	a {
		text-decoration: none;
		color : greenyellow;
	}
</style>
