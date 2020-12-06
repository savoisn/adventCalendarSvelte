<script>
import FireWorks from "./FireWorks.svelte";


export let changelog = {
    "date" :"",
    "title": "",
    "text" : ""
}
</script>

<h3>{changelog.date} : {changelog.title}</h3>
{#each changelog.content as item}
    <p>{item}</p>
{/each}

<style>
h3 {
    font-size: larger;
    color:red;
}

p {

}

</style>