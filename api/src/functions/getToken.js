const { app } = require('@azure/functions');
const tiktoken = require("js-tiktoken");
const getEncoding = tiktoken.getEncoding;

app.http('getToken', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {

        let system_token = 0;
        let user_token = 0;

        try{
            data = await request.json()
            system_prompt = data.system_prompt
            user_prompt = data.user_prompt

            const enc = getEncoding("cl100k_base");

            if(system_prompt){
                const system_prompt_enc = enc.encode(system_prompt)
                system_token = system_prompt_enc.length
            }

            if(user_prompt){
                const user_prompt_enc = enc.encode(user_prompt)
                user_token = user_prompt_enc.length
            }

            const reply = {
                system_token: system_token,
                user_token: user_token
            }
            return {
                body: JSON.stringify(reply)
            };

        }catch(e){
            context.log(e)
            return {
                status: 500,
                body: e.message
            };
        }
    }
});
