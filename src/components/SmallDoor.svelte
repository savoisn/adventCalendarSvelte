<script>

import Door from "Door.svelte";

export let doorNumber = 12;
export let doorId = 1;
export let canOpen = true;
export let imagePath = "";
export let rewardText = "";
export let rewardLink = "";
export let doorOpen = false;
export let imageAlt = "";
</script>

<Door 
  {doorNumber}
  {doorId}
  {canOpen}
  {imagePath}
  {rewardText}
  {rewardLink}
  {doorOpen}
  {imageAlt}
  size={Door.sizes().small}
></Door>

<style>

</style>