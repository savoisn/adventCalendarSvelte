<script>
    import Changelogs from "../components/Changelogs.svelte";

    export let changelogs;
    
</script>

<main>
    <h1>Changelog of the Advent Calendar</h1>

    <Changelogs changelogs={changelogs} />


    <p><a href="/">Back to Calendar Pages</a></p>
</main>

<style>
    h1 {
        color:white;
        font-size: larger;
        font-weight: bold;
        padding: 20px 10px 0px 20px;
    }

    a {
        color:darkseagreen;
        padding: 20px 10px 0px 20px;
    }

</style>