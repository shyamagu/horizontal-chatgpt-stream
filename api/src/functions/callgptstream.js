const { app } = require('@azure/functions');
app.setup({ enableHttpStream: true });
const Readable = require('stream');

const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

const chatgpt_streamer = (response) => {
    return {
        [Symbol.asyncIterator]: async function* () {
            for await (const chunk of response) {
                const content = chunk?.choices[0]?.delta?.content;
                if (content) yield content;
            }
        }
    };
};

app.http('callgptstream', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {

        try {

            data = await request.json()
            //context.log(data)
    
            const client = new OpenAIClient(data.endpoint, new AzureKeyCredential(data.api_key));

            /** 
            タイムアウト用            {
            additionalPolicies: [
                {
                  policy: {
                    name: "customTimeoutPolicy",
                    sendRequest(request, next) {
                      request.timeout = 230 * 1000;
                      return next(request);
                    },
                  },
                  position: "perCall",
                }
              ]
            }
            */

            const messages = [
                {role: "system", content: data.system_prompt},
                {role: "user", content: data.user_prompt}
            ]

            const params = {
                temperature:0,
            }
    
            const event = await client.streamChatCompletions(data.model_name, messages, params);

            //const stream = Readable.from(chatgpt_streamer2(event));
            return { 
                body: chatgpt_streamer(event),
                headers: {
                    "Content-Type": "text/event-stream"
                }
            };
        } catch (error) {
            // Handle the error here
            context.log(error);
            return {
                status: 500,
                body: error.message
            };
        } finally {
            // Perform any cleanup or finalization tasks here
        }

    }
});
