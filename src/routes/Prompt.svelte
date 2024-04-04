<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let index = 0;
    export let systemPrompt = '';
    export let userPrompt = '';

    export let loading = false;
    export let executed = false;

    export let tokenMessage = '';

    export async function executeGPT(){
        dispatch("result", JSON.stringify(index));
    }
</script>

<div class="prompt_box">
<div class="prompt_field_box">
    <textarea class="prompt_field" class:executed={executed || loading} bind:value={systemPrompt} placeholder="Enter system prompt here..."></textarea>
    {#if !executed}
        <textarea class="prompt_field user_prompt_filed" bind:value={userPrompt} placeholder="Enter user prompt here..."></textarea>
    {:else}
        <textarea class="prompt_field user_prompt_filed executed" bind:value={userPrompt} placeholder="Enter user prompt here..." readonly></textarea>
    {/if}
    <div class="token_message">
        {tokenMessage}
    </div>
</div>
{#if loading}
<div class="button_field">
    <div class=loading></div>
</div>
{:else if executed}
<div class="button_field">
    <button class="triangle_done" disabled aria-label="Execute GPT"></button>
</div>
{:else}
<div class="button_field">
    <button class="triangle" on:click={()=>executeGPT()} aria-label="Execute GPT"></button>
</div>
{/if}
</div>

<style>

.prompt_box {
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 450px;
    margin:0px;
}

.prompt_field_box {
    width: 380px;
    display: flex;
    flex-direction: column;
    justify-content: top;
}

.prompt_field {
    height: 150px;
    margin: 10px;
    padding: 10px;
    font-size: 0.9em;
    border-radius: 5px;
    border: 1px solid #999;
    font-family: 'Noto Sans JP', sans-serif;
}

.user_prompt_filed {
    height: calc( 100vh - 350px);
}

.button_field {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.triangle {
    background-color: transparent;
    outline:none;
    appearance: none;
    border:none;
    width: 0;
    height: 0;
    border-top: 30px solid transparent;
    border-bottom: 30px solid transparent;
    border-left: 50px solid #666;
    cursor: pointer;
    margin-left:10px;
    margin-bottom: 30px;
}

.triangle_done {
    background-color: transparent;
    outline:none;
    appearance: none;
    border:none;
    width: 0;
    height: 0;
    border-top: 30px solid transparent;
    border-bottom: 30px solid transparent;
    border-left: 50px solid #ddd;
    margin-left:10px;
    margin-bottom: 30px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading {
    border: 10px solid #f3f3f3; /* Light grey */
    border-top: 10px solid #99c; /* Blue */
    border-radius: 50%;
    width: 35px;
    height: 35px;
    animation: spin 2s linear infinite;
    margin-left:5px;
    margin-bottom: 30px;
}

.executed {
    background-color: #eee;
    resize: none;
}

.token_message{
    width:100%;
    font-size: 0.8em;
    text-align: right;
    margin-left: -10px;
}
</style>