<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
  
    export let endpoint = "";
  
    export let modelName = "";
  
    export let apiKey = "";
  
    let config = {
      endpoint: endpoint,
      modelName: modelName,
      apiKey: apiKey,
    };
  
    export async function setConfig() {
      dispatch("result", JSON.stringify(config));
    }
  </script>
  
  <div class="main">
    <div class="config_field">
      <h1 class="title">AOAI Settings</h1>
      <form>
      <label for="Endpoint" class="item_name">Endpoint</label>
      <input
        type="text"
        class="input_field"
        id="Endpoint"
        name="Endpoint"
        bind:value={config.endpoint}
        placeholder="Enter your endpoint here"
      />
      <label for="Modelname" class="item_name">Model Name</label>
      <input
        type="text"
        class="input_field"
        id="Modelname"
        name="Modelname"
        bind:value={config.modelName}
        placeholder="Enter your model name here"
      />
      <label for="APIkey" class="item_name">API Key</label>
      <input
        type="password"
        class="input_field"
        id="APIkey"
        name="APIkey"
        bind:value={config.apiKey}
        placeholder="Enter your API key here"
      />
      </form>
      <div class="button_field">
        <button class="submit_button" on:click={setConfig}>Done</button>
      </div>
    </div>
  </div>
  
  <style>
    .main {
      display: flex;
      align-items: center;
      justify-content: center;
  
      width: 100%;
      height: calc(100vh - 20px)
    }
  
    .config_field {
      width: 500px;
      height: 500px;
      border: 1px solid #ccc;
      color: #000;
      background-color: #bbd;
      padding: 5px 5px 5px 5px;
      border-radius: 20px;
      box-shadow: 5px 10px 10px 0px #ccc;
    }
  
    .title {
      text-align: center;
    }
  
    .item_name {
      font-size: 1.4em;
      font-weight: bold;
      margin-left:50px;
    }
  
    .input_field{
      font-size: 1.2em;
      width:400px;
      height:35px;
      margin-left:50px;
      font-family: 'Noto Sans JP', sans-serif;
      border: none;
      border-radius: 10px;
      margin-bottom: 25px;
      margin-top:10px;
      padding-left:10px;
    }
  
    .input_field::placeholder {
      font-size: 0.9em;
      color: #aaa;
    }
  
    .input_field:focus {
      outline: none;
      
    }
  
    .button_field {
      margin-top:15px;
      width:100%;
      text-align: right;
    }
  
    .submit_button {
      font-size: 1.5em;
      padding: 10 20px;
      margin-right:35px;
      width: 150px;
      height: 50px;
      background-color: #66c;
      color: #fff;
      font-family: "Noto Sans JP", sans-serif;
      border: none;
      border-radius: 20px;
      font-weight: bold;
      cursor: pointer;
    }
  
    .submit_button:hover {
      background-color: #88e;
    }
  
    .submit_button:active {
      background-color: #44a;
    }
  </style>