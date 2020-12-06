<script>
import Changelog from "./Changelog.svelte";

    export let changelogs = [{
        "date" :"2020",
        "title": "titre1",
        "content" : "contenu du premier changelog"
    },
    {
        "date" :"2020",
        "title": "titre2",
        "content" : "contenu du 2eme changelog"
    }
];

</script>

<main class="main">
{#each changelogs as changelog}

    <Changelog changelog={changelog} />
    <br/>

{/each}

</main>

<style>
.main {
    background-color: white;
    margin : 20px 20px;
    padding : 20px 20px;
    border-radius: 8px;
}

</style>