<script>
	import Door from './Door.svelte';
    import FireWorks from './FireWorks.svelte';

    export let doorInfo;
    let fw ;
    function toto(){
        fw.startFW()
        console.log(fw)
    }
</script>
  
<style>
main {
    display:flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    background-color: transparent;
}

h1 {
    font-size: 2rem;
    text-align: center;
}
</style>
  
<main>  
    <FireWorks bind:this={fw}/>
    <Door
        imagePath = {doorInfo.reward.imagePath}
        rewardLink = {doorInfo.reward.rewardLink}
        doorNumber = {doorInfo.day} 
        doorOpen = false
        canOpen = {doorInfo.canOpen}
        action = {toto}
        doorId = {doorInfo.doorId}
        size = {"big"}
    />
</main>
