require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

app.post('/api/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'No URL provided' });
    }

    const pageSpeedApiKey = process.env.PAGESPEED_API_KEY;
    const pageSpeedUrl = 
      `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${pageSpeedApiKey}&strategy=mobile`;
    
    const pageSpeedResponse = await fetch(pageSpeedUrl);
    const pageSpeedPayload = await pageSpeedResponse.json();

    const userPrompt = `
Could you please analyze the payload attached and identify the issues on this page and provide the solution for same. 
While identifying could you also categorize the issue and provide our nomenclature and call the issue using the same nomenclature moving forward.
Here is the payload:

${JSON.stringify(pageSpeedPayload, null, 2)}
`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: userPrompt }
      ],
    });
    const analysis = completion.data.choices[0].message.content;

    res.json({
      url,
      cwvData: pageSpeedPayload.lighthouseResult?.audits,
      chatGptAnalysis: analysis,
    });
  } catch (error) {
    console.error('Error in /api/analyze:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
