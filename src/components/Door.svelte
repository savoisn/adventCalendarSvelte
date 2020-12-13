<script>
  export let doorNumber = 12;
  export let doorId = 1;
  export let canOpen = function(){};
  export let isAlreadyOpened = function(){};
  export let imagePath = "";
  export let rewardLink = "";
  export let doorOpen = false;
  export let imageAlt = "";
  export let action = function(){};


  export let size = "small";

  export function sizes(){
    return door_sizes.keys();
  }

  import doorStore from '.../../../store.js'

  function toggleDoor() {
    let doorInfo = {
      reward:{
        imagePath: imagePath,
        rewardLink: rewardLink
      },
      day: doorNumber,
      canOpen: canOpen,
      doorId: doorId
    }

    if(canOpen(doorNumber) === true){
      if(doorOpen === true){
        doorOpen = false
      } else {
        doorOpen = true
      }
      if(action && doorOpen && !isAlreadyOpened(doorNumber)){
        action({...doorInfo});
      }

      doorStore.addDoor(doorNumber)
    }else{
      doorOpen=false;
    }
  } 
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

  let door_sizes = {
    "small" : {
      ratio:1
    },
    "medium" : {
      ratio:2
    },
    "big" : {
      ratio:3
    }
  }

  let ratio = door_sizes[size].ratio;

</script>

<main
  class:mainBorderOdd={doorId%2==0}
  class:mainBorderEven={doorId%2!=0} 
  style='
    --ratio: {ratio};
    '>

  <div class="backDoor" >
    {#if rewardLink !== ""}
      <a href={rewardLink} target="_blank">
        <img src="{imagePath}" alt="{imageAlt}" class="bgImg"/>
      </a>
    {:else}
      <img src="{imagePath}" alt="{imageAlt}" class="bgImg"/>
    {/if}
    <div class="door" 
          class:doorOpen={doorOpen===true}  
          class:door-odd={doorId%2==0}
          class:door-even={doorId%2!=0}
          on:click={toggleDoor} >
      <span class="doorNumber">{getRandomEmoji()}<br/>{doorNumber}</span>
    </div>
  </div>
</main>

<style>
main {
  --door-width: calc(var(--ratio) * 100px);
  --door-height: calc(var(--ratio) * 150px);
  --margin: calc(var(--ratio) * 25px);
  --door-number-fontsize:calc(var(--ratio) * 45px);
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
  justify-content: center;
  align-items: center;
}

.bgImg{
  position:absolute;
  top:0px;
  left:0px;
  width:100%;
  height:100%;
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