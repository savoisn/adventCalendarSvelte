<script>
  export let doorNumber = 12;
  export let doorId = 1;
  export let canOpen = true;
  export let imagePath = "";
  export let rewardText = "";
  export let rewardLink = "";
  export let doorOpen = false;
  export let imageAlt = "";

  function toggleDoor() {
    if(canOpen){
      doorOpen=!doorOpen
      doorStore.addDoor(doorNumber)
    }else{
      doorOpen=false;
    }
  } 
  import doorStore from './store.js'
  console.log(imagePath);
  let emojis = [
    "🎅",
    "🤶",
    "🧑‍🎄",
    "🍭",
    "🦌",
    "⛄️",
    "☃️",
    "❄️",
    "🌟",
    "🛷",
  ]

  function getRandomEmoji(){
    return emojis[Math.floor(Math.random() * emojis.length)];
  }
</script>

<main
  class:mainBorderOdd={doorId%2==0}
  class:mainBorderEven={doorId%2!=0} >
  <div class="backDoor" style='--imagePath: url("{imagePath}")'>
    {#if rewardLink !== ""}
      <a href={rewardLink} target="_blank">
        <img src="{imagePath}" alt="{imageAlt}" class="bgImg"/>
      </a>
    {:else}
      <div class="backgroundPicture">
      </div>
    {/if}
    <div class="door" 
          class:doorOpen={doorOpen}  
          class:door-odd={doorId%2==0}
          class:door-even={doorId%2!=0}
          on:click={toggleDoor} >
      <span class="doorNumber">{getRandomEmoji()}<br/>{doorNumber}</span>
    </div>
  </div>
</main>

<style>

:root {
  --door-width: 100px;
  --door-height: 150px;
  --margin: 25px;
  --margin-left:35px;
  --door-number-fontsize:45px;
}
main {

  border-radius: 9px;
  margin:var(--margin);
}
.mainBorderOdd{
  border:5px solid #89b289;
}
.mainBorderEven{
  border:5px solid #700a0a;
}
.backDoor {
  /* border-radius: 20px; */
  background-color: #333;
  position:relative;
  width: var(--door-width);
  height: var(--door-height);
  transition: transform .2s; /* Animation */
  text-decoration: none;
  display:flex;

}

.bgImg{
  width:100%;
  height:100%;
  align-items: center;
}

.backgroundPicture {
  background-size: contain;
  background-repeat: no-repeat;
  width: var(--door-width);
  height: var(--door-height);
  background-position: center;
}

.backgroundText{
  width: var(--door-width);
  height: var(--door-height);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  overflow: hidden;
}

.bgSpan{
  color: blue;
  font-weight: bold;
  text-decoration: none;
  text-align: center;
  overflow: hidden;
  display: inline-block;
  text-overflow: ellipsis; 
}

.door {
  position:absolute;
  cursor: pointer;
  top:0px;
  left:0px;
  width:var(--door-width);
  height:var(--door-height);
  color: white;
  text-align: center;
  vertical-align: middle;
  transform-origin: left;
  /*Speed of the Door animation*/
  transition: all 0.5s ease-in-out;
  display:flex;
  justify-content: center;
  align-items: center;


}

.door-even {
  background-color: brown;
}

.door-odd {
  background-color: darkgreen;
}

.doorOpen {
  /*prespectiv creates the door open effect*/
  transform: perspective(1200px) translateZ(0px) translateX(0px) translateY(0px) rotateY(-105deg);
}

.doorNumber { 
  font-size: var(--door-number-fontsize);
	font-family: 'Nerko One', cursive;
}

</style>