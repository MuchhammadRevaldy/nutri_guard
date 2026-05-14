import axios from 'axios';

export async function runChat(history, message) {
    try {
        const response = await axios.post('/coba-deploy/chat', {
            history: history,
            message: message
        });

        // Backend currently returns a single response (stream=false for stability)
        // We mock a stream object to stay compatible with the frontend loop
        const content = response.data.choices[0].message.content;

        // Return an async iterable (mock stream)
        return {
            [Symbol.asyncIterator]: async function* () {
                yield {
                    choices: [{ delta: { content: content } }]
                };
            }
        };

    } catch (error) {
        console.error("Backend Proxy Error:", error);
        if (error.response) {
            throw new Error(`Server Error: ${error.response.data.error || error.response.statusText}`);
        }
        throw new Error("Connection failed. Ensure your server is running.");
    }
}
