<script lang="ts">
  let registers = [0, 0, 0, 0];
  let pc = 10;

  let instructions = [
    "cpy a d",
    "cpy 4 c",
    "cpy 633 b",
    "inc d",
    "dec b",
    "jnz b -2",
    "cpy a d",
    "cpy 4 c",
    "cpy 633 b",
    "inc d",
    "dec b",
    "jnz b -2",
    "cpy a d",
    "cpy 4 c",
    "cpy 633 b",
    "inc d",
    "dec b",
    "jnz b -2",
  ];

  function doStep() {
    pc = (pc + 1) % instructions.length;
    if (pc === 1) {
      registers = [1, 0, 0, 0];
    }
  }

  function doMultiStep() {
    for (let i = 0; i < stepCount; i++) {
      doStep();
    }
  }

  let stepsPerSecond = 2;
  let isPlaying = false;

  function doPlay() {
    if (isPlaying) {
      return;
    }
    isPlaying = true;

    let start = Date.now();
    let innerDoPlay = () => {
      if (!isPlaying) {
        return;
      }
      let elapsed = Date.now() - start;
      if (elapsed < 1000 / stepsPerSecond) {
        // wait til next tick
      } else {
        doStep();
        start = Date.now();
      }
      requestAnimationFrame(innerDoPlay);
    };
    doStep();
    innerDoPlay();
  }

  let stepCount = 1;

  function doStop() {
    isPlaying = false;
  }

  let advanceRegisterName = "a";
  let advanceRegisterValue = 1;

  let isAdvancingRegister = false;

  function doAdvanceRegister() {
    if (isAdvancingRegister) {
      return;
    }
    isAdvancingRegister = true;
    let regIdx = "abcd".indexOf(advanceRegisterName);
    if (regIdx === -1) {
      alert("Bad register");
      return;
    }
    let innerDoAdvanceRegister = () => {
      if (!isAdvancingRegister) {
        return;
      }
      if (registers[regIdx] === advanceRegisterValue) {
        isAdvancingRegister = false;
      } else {
        doStep();
        requestAnimationFrame(innerDoAdvanceRegister);
      }
    };
    innerDoAdvanceRegister();
  }

  function doStopAdvanceRegister() {
    isAdvancingRegister = false;
  }
</script>

<div class="game">
  <div class="controls">
    <div>
      Go <input type="number" bind:value={stepCount} />
      <button on:click={doMultiStep}
        >Step{#if stepCount !== 1}s{/if}</button
      >
    </div>
    <button on:click={doPlay}>Play</button>
    <button on:click={doStop}>Stop</button>
    <div>
      Steps Per Second <input bind:value={stepsPerSecond} />
    </div>
    <div>
      Adv register <input bind:value={advanceRegisterName} /> to value
      <input type="number" bind:value={advanceRegisterValue} />.
      <button
        class:active={isAdvancingRegister}
        disabled={isAdvancingRegister}
        on:click={doAdvanceRegister}>Go</button
      >
      <button
        class:active={isAdvancingRegister}
        disabled={!isAdvancingRegister}
        on:click={doStopAdvanceRegister}>Stop</button
      >
    </div>
  </div>
  <div class="registers">
    {#each "abcd".split("") as regName}
      <div class="register header">{regName}</div>
    {/each}
    {#each registers as reg}
      <div class="register value">
        {reg}
      </div>
    {/each}
  </div>

  <div class="instructions">
    {#each instructions as inst, idx}
      <div class="details" class:active={pc === idx}>
        {#if pc == idx}→{/if}
      </div>
      <div class="idx" class:active={pc === idx}>{idx}</div>
      <div class="inst" class:active={pc === idx}>
        {inst}
      </div>
    {/each}
  </div>
</div>

<style lang="postcss">
  .registers {
    display: grid;
    grid-template-rows: repeat(2, 1fr);
    grid-template-columns: repeat(4, 1fr);
  }

  .register {
    border: 1px solid #bababa;
    color: #4c4545;
  }

  .register.header {
    background-color: #e9e9e9;
  }

  .register.value {
    font-weight: bold;
  }

  .instructions {
    display: grid;
    grid-template-columns: 3ch 3ch auto;
    justify-content: center;

    & .details {
      background: #f5f5f5;

      &.active {
        background: #e9e9e9;
      }
    }
    & .idx {
      text-align: right;
      padding-right: 0.5em;
      border-right: 1px solid gray;
      background: #f5f5f5;
      &.active {
        font-weight: bold;
        background: #e9e9e9;
      }
    }
    & .inst {
      text-align: left;
      padding-left: 0.5em;

      &.active {
        background: #e9e9e9;
      }
    }
  }

  button.active {
    font-weight: bold;
  }
</style>
