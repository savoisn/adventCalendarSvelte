import App from './App.svelte';

if (localStorage.getItem("door") === null){
	localStorage.setItem("door", 0);
}

const app = new App({
	target: document.body,
	props: {
		name: 'Advent Calendar'
	}
});

export default app;