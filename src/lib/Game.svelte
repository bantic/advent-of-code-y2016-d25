<script lang="ts">
  import { compile, process } from "./assembler";
  import type { State } from "./assembler";

  let state: State = {
    pc: 0,
    registers: [0, 0, 0, 0],
    out: [],
  };

  // let solution: State = {
  //   pc: 0,
  //   registers: [198, 0, 0, 0],
  //   out: [],
  // };

  let instructions = [
    "cpy a d",
    "cpy 4 c",
    "cpy 633 b",
    "inc d",
    "dec b",
    "jnz b -2",
    "dec c",
    "jnz c -5",
    "cpy d a",
    "jnz 0 0",
    "cpy a b",
    "cpy 0 a",
    "cpy 2 c",
    "jnz b 2",
    "jnz 1 6",
    "dec b",
    "dec c",
    "jnz c -4",
    "inc a",
    "jnz 1 -7",
    "cpy 2 b",
    "jnz c 2",
    "jnz 1 4",
    "dec b",
    "dec c",
    "jnz 1 -4",
    "jnz 0 0",
    "out b",
    "jnz a -19",
    "jnz 1 -21",
  ];

  let compiled = instructions.map((i) => compile(i));

  function doStep() {
    state = process(state, compiled);
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
  let isAdvancingUntilPC = false;
  let isAdvancingUntilPCTarget = -1;

  function doAdvanceUntilPC() {
    if (isAdvancingUntilPC) {
      return;
    }
    isAdvancingUntilPC = true;

    let start = Date.now();

    // locks up the UI so that it can go "fast"
    while (true) {
      if (!isAdvancingUntilPC) {
        break;
      }
      let elapsed = Math.floor((Date.now() - start) / 1000);
      if (elapsed > 1 && elapsed % 2 == 0) {
        isAdvancingUntilPC = window.confirm(
          `Still seeking after ${elapsed} seconds. Continue?`
        );
        if (!isAdvancingUntilPC) {
          break;
        }
      }
      doStep();
      if (state.pc === isAdvancingUntilPCTarget) {
        break;
      }
    }

    isAdvancingUntilPC = false;
  }

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

    let start = Date.now();

    // locks up the UI so that it can go "fast"
    while (true) {
      if (!isAdvancingRegister) {
        return;
      }
      let elapsed = Math.floor((Date.now() - start) / 1000);
      if (elapsed > 1 && elapsed % 2 === 0) {
        isAdvancingRegister = window.confirm(
          `Still advancing without success after ${elapsed} seconds. Continue?`
        );
        if (!isAdvancingRegister) {
          return;
        }
      }
      if (state.registers[regIdx] === advanceRegisterValue) {
        isAdvancingRegister = false;
      } else {
        doStep();
      }
    }
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
    <div>
      Adv PC to <input type="number" bind:value={isAdvancingUntilPCTarget} />.
      <button on:click={doAdvanceUntilPC}>Go</button>
    </div>
  </div>
  <div class="registers">
    {#each "abcd".split("") as regName}
      <div class="register header">{regName}</div>
    {/each}
    {#each state.registers as reg}
      <div class="register value">
        <input type="number" bind:value={reg} />
      </div>
    {/each}
  </div>
  <div class="out">
    <strong>Out (length: {state.out.length}):</strong>
    {state.out.join(",")}
  </div>

  <div class="instructions">
    {#each instructions as inst, idx}
      <div class="details" class:active={state.pc === idx}>
        {#if state.pc == idx}→{/if}
      </div>
      <div class="idx" class:active={state.pc === idx}>{idx}</div>
      <div class="inst" class:active={state.pc === idx}>
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
