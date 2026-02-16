const axios = require("axios");

const MAX_INPUT_LENGTH = 5000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Extract JSON safely from LLM response
function extractJSON(content) {
  try {
    const jsonMatch = content.match(/\[.*\]/s);
    if (!jsonMatch) throw new Error("No valid JSON found");
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    throw new Error("Invalid JSON response from AI");
  }
}

// Main AI request with retry logic
async function callAI(messages, expectJSON = false) {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages,
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const content = response.data.choices[0].message.content;

      if (expectJSON) {
        return extractJSON(content);
      }

      return content;

    } catch (error) {
      attempt++;

      const status = error.response?.status;
      const errorCode = error.response?.data?.error?.code;

      console.log(`AI attempt ${attempt} failed`);

      // Rate limit handling
      if (errorCode === "rate_limit_exceeded") {
        console.log("Rate limit hit. Waiting before retry...");
        await sleep(RETRY_DELAY * attempt);
      } else {
        await sleep(1000);
      }

      if (attempt >= MAX_RETRIES) {
        throw new Error("AI service unavailable after retries");
      }
    }
  }
}

// Truncate large text
function prepareText(text) {
  if (text.length > MAX_INPUT_LENGTH) {
    return text.slice(0, MAX_INPUT_LENGTH);
  }
  return text;
}

module.exports = {
  callAI,
  prepareText,
};
