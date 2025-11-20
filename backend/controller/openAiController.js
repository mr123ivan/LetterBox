// backend/controller/openAiController.js
const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.GROQ_BASE_URL,
});



const rewriteLetter = async (req, res) => {
  const { letterContent, tone } = req.body;

  if (!letterContent) {
    return res.status(400).json({ message: 'letterContent is required.' });
  }

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You rewrite letters keeping the original meaning but improving clarity and emotion.',
        },
        {
          role: 'user',
          content: `Rewrite the following letter in a ${tone || 'sincere and warm'} tone. Keep it in the same language.\n\n${letterContent}`,
        },
      ],
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    return res.status(200).json({ rewritten: text });
  } catch (err) {
    console.error('AI rewriteLetter error:', err);
    return res
      .status(500)
      .json({ message: 'Failed to rewrite letter. Please try again.' });
  }
};


const chatLetter = async (req, res) => {
  const userId = req.user?.userId; // from protect middleware (optional use)
  const { message, tone, length } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'message is required.' });
  }

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are an assistant that writes personalized letters based on what the user wants. ' +
            'Always respond with a complete letter only, no explanations, no markdown.',
        },
        {
          role: 'user',
          content: `
        User request: ${message}

        Tone: ${tone || 'sincere and warm'}
        Length: ${length || 'medium (2–4 paragraphs)'}

        Write a complete letter that matches this request.`,
                },
            ],
            temperature: 0.8,
            });

            const text = completion.choices[0]?.message?.content?.trim();
            return res.status(200).json({ letter: text });
        } catch (err) {
            console.error('AI chatLetter error:', err);
            return res
            .status(500)
            .json({ message: 'Failed to generate letter. Please try again.' });
        }
};

module.exports = {
  rewriteLetter,
  chatLetter,
};