<script>
  export let doorNumber = 12;
  export let canOpen = true;
  export let imagePath = "";
  export let rewardText = "";
  export let rewardLink = "";
  let doorOpen = false;

  function toggleDoor() {
    if(canOpen){
      doorOpen=!doorOpen
    }else{
      doorOpen=false;
    }
  }
</script>

<main>
    <div class="backDoor" style="--imagePath: url({imagePath})">
      {#if rewardLink}
        <a href={rewardLink}>
          <div class="backgroundPicture">
            <div class="backgroundText">
              <span class="bgSpan">
                {rewardText}
              </span>
            </div>
          </div>
        </a>
      {:else}
        <div class="backgroundPicture">
          <div class="backgroundText">
            <span class="bgSpan">
              {rewardText}
            </span>
          </div>
        </div>
      {/if}
      <div class="door" 
           class:doorOpen={doorOpen} 
           on:click={toggleDoor} >
        <span class="doorNumber">{doorNumber}</span>
      </div>
    </div>
</main>

<style>

:root {
  --door-width: 100px;
  --door-height: 150px;
  --margin: 25px;
  --margin-left:35px;
  --door-number-fontsize:30px;
}

.backDoor {
  background-color: #333;
  position:relative;
  width: var(--door-width);
  height: var(--door-height);
  margin: var(--margin);
  margin-left:var(--margin-left);
  transition: transform .2s; /* Animation */
}

.backgroundPicture {
  background-size: contain;
  background-repeat: no-repeat;
  background-image: var(--imagePath);
  width: var(--door-width);
  height: var(--door-height);
  background-position: center;
}

.backgroundText{
  width: var(--door-width);
  height: var(--door-height);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.bgSpan{
  color: white;
  text-align: center;
  overflow: hidden;
  display: inline-block;
  text-overflow: ellipsis; 
}

.door {
  background-color: brown;
  position:absolute;
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
}

.doorOpen {
  /*prespectiv creates the door open effect*/
  transform: perspective(1200px) translateZ(0px) translateX(0px) translateY(0px) rotateY(-105deg);
}

.doorNumber { 
  line-height: var(--door-height);
  vertical-align: middle;
  font-size: var(--door-number-fontsize);
}

</style>