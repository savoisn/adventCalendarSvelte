<script>
	import 'bulma/css/bulma.css'
	import '@fortawesome/fontawesome-free/css/all.css'

	import { Router, Link, Route } from "svelte-routing";
	import NavLink from "./components/NavLink.svelte"

	import Calendar from './routes/calendar.svelte';
	import ChangeLog from './routes/changelog.svelte';
import { component_subscribe } from 'svelte/internal';
import Changelog from './routes/changelog.svelte';

	export let name='';

	export let url = "";
</script>

<div id="particles-js"></div> 

<Router url="{url}">
	<nav>
		<NavLink to="/">Home</NavLink>
		<NavLink to="/Changelog">Changelog</NavLink>
	</nav>
	<div>
		<Route path="/"><Calendar name={name}></Calendar></Route>
		<Route path="/Changelog" ><Changelog/></Route>
	</div>
</Router>

<style>
</style>
