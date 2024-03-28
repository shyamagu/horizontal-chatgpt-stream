<script>
    import { scale,fly } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import { onMount,afterUpdate } from 'svelte';
    
    import Config from './Config.svelte'
    import Prompt from './Prompt.svelte'

    let config = {endpoint:"", modelName:"", apiKey:""}
    let isConfigSetting = false;

    let count = 1;
    let system_prompts = [""];
    let user_prompts = [""];
    let loadings = [false]
    let executeds = [false]
    let token_messages = [""]

    /**
     * @param {{detail: string;}} event
     */
    function handleConfig(event) {
    config = JSON.parse(event.detail);
    isConfigSetting = true;
    }

    /**
     * @param {{detail: string;}} event
     */
    function handleRequest(event) {
        const index = Number(event.detail)
        
        loadings[index] = true;

        const system_prompt = system_prompts[index];
        const user_prompt = user_prompts[index];

        count++
        system_prompts.push("");
        user_prompts.push("");
        loadings.push(false);
        executeds.push(false);

        callGPTStream(system_prompt, user_prompt);
    }

    /**
     * @param {string} system_prompt
     * @param {string} user_prompt
     */
    async function callGPTStream(system_prompt, user_prompt){

        //system_prompt = "あなたはAIアシスタントなんやで。ご機嫌な回答頼むわ。よろしゅうな。"
        //user_prompt = "おおきに、もうかってまっか？"

        const sendMessage = {
            "system_prompt": system_prompt,
            "user_prompt": user_prompt,
            "api_key": config.apiKey,
            "endpoint": config.endpoint,
            "model_name": config.modelName,
        }

        try {
            const response = await fetch("/api/callgptstream", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(sendMessage)
            });

            scrolltoSide();

            if(response.status >= 400 && response.status != 500){
                let message = "Network response was not ok. CODE:"+response.status;
                throw new Error(message);
            }

            if(response.body){

                const decoder = new TextDecoder();
                const reader = response.body.getReader();

                while(true){
                const {done, value} = await reader.read();
                if(done){
                    await getToken(system_prompt, user_prompt);
                    break;
                }
                const text = decoder.decode(value);
                await delayAndNewContent(text);
                }
            }

        } catch (error) {
            console.log(error)
            user_prompts[count-1] = String(error);
        } finally {
            loadings[count-2] = false;
            executeds[count-2] = true;
        }
    }


    /**s
     * @param {string} content 
     */
    async function delayAndNewContent(content) {

    const contentArr = Array.from(content);
    // 1文字ずつ表示(Function(node)+Svelteの場合のみ1文字単位でループしないとうまくフラッシュされない)
    for(const one of contentArr){
        await new Promise(resolve => setTimeout(() => {
            user_prompts[count-1] += one;
            resolve(null);
        }, 33));
    }

    }

    /**
     * @param {string} system_prompt
     * @param {string} user_prompt
     */
     async function getToken(system_prompt, user_prompt){
        const sendMessage = {
            "system_prompt": system_prompt,
            "user_prompt": user_prompt,
        }

        try{


        const response = await fetch("/api/getToken", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(sendMessage)
            });

        if(response.status >= 400 && response.status != 500){
            let message = "Network response was not ok. CODE:"+response.status;
            throw new Error(message);
        }

        const data = await response.json();
        const system_token = data.system_token
        const user_token = data.user_token

        const token_message = `(${system_token})+(${user_token})`
        token_messages[count-2] = token_message

        }catch(error){
            console.log(error)
            token_messages[count-2] = "(Error)"
        }

     }

    function openConfig() {
        isConfigSetting = false;
    }

    function downloadJson() {
      const data = {
        systems: system_prompts,
        users: user_prompts,
        loadings: loadings,
        executeds: executeds,
        token_messages: token_messages
      };
      const a = document.createElement("a");
  
      a.download = "horizontalchatgpt_" + Date.now() + ".json";
  
      a.href = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        })
      );
  
      a.click();
      a.remove();
    }

    /**
     * @param {Blob} file
     */
    function readFile(file) {
      const reader = new FileReader();
      reader.onload = () => {
        if(typeof reader.result !== "string") return;
        const data = JSON.parse(reader.result);
        system_prompts = data.systems;
        user_prompts = data.users;
        loadings = data.loadings;
        executeds = data.executeds;
        token_messages = data.token_messages;

        count = system_prompts.length;
  
      };
      reader.readAsText(file);
    }

    function openDialog() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = () => {
        if (input.files) {
          const file = input.files[0];
          readFile(file);
        }
      };
      input.click();
    }

    const scrolltoSide = () => {
      const promptField = document.querySelector(".panel");
      if (promptField) {

        const width = promptField.scrollWidth;

        //smoothにスクロールさせる
        promptField.scrollTo({
          left: width,
          behavior: "smooth",
        });
      }
    };

</script>

{#if !isConfigSetting}
    <div transition:scale={{ delay: 100, duration: 100, easing: quintOut }}>
        <Config 
        on:result={handleConfig}
        bind:endpoint={config.endpoint}
        bind:modelName={config.modelName}
        bind:apiKey={config.apiKey}
        />
    </div>
{:else}
<div class="panel">
    <div class="header">
        <button class="header_button" on:click={openConfig} transition:fly="{{ y: -50, delay:150, duration: 200 }}">Config</button>
        <button class="header_button" on:click={downloadJson} transition:fly="{{ y: -50, delay:200, duration: 200 }}">Export</button>
        <button class="header_button" on:click={openDialog} transition:fly="{{ y: -50, delay:250, duration: 200 }}">Import</button>
    </div>

    <div class="prompt_flow">
        {#each Array.from({length: count}, (_, index) => index) as index}
        <div>
            <Prompt
            on:result={handleRequest}
            bind:index={index}
            bind:systemPrompt={system_prompts[index]} 
            bind:userPrompt={user_prompts[index]} 
            bind:loading={loadings[index]} 
            bind:executed={executeds[index]}
            bind:tokenMessage={token_messages[index]}/>
        </div>
        {/each}
    </div>
</div>
{/if}
<style>

.panel {
    overflow-y: hidden;
    overflow-x: scroll;
    margin :0px;
    margin-left: 10px;
    height :calc(100vh - 20px);
    min-width: calc(100% -10px);
}

.header {
    display: flex;
    flex-direction: row;
    margin:0px;
    height:60px;
}

.prompt_flow {
    display: flex;
    height: 100%;
    flex-direction: row;
    margin:0px;
}

.header_button {
    width:100px;
    height:40px;
    margin: 10px;
    padding: 10px;
    background-color: #ddf;
    border: 1px solid #ddf;
    border-radius: 5px;
    cursor: pointer;
}

</style>
