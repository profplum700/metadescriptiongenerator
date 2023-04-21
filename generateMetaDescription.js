require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const openaiKey = process.env.OPENAI_API_KEY;

const configuration = new Configuration({
  apiKey: openaiKey,
});
const openai = new OpenAIApi(configuration);

async function generateMetaDescription(title, content, categories, tags) {
  const strippedContent = stripOutHtml(content);
  const maxAttempts = 4;

  let metaDescription = "";
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const correctionPrompt = attempts === 0 ? "" : buildCorrectionPrompt(metaDescription);
      const messages = messagesBuilder(title, strippedContent, categories, tags, correctionPrompt);
      metaDescription = await getMetaDescription(messages);

      if (metaDescription.length >= 107 && metaDescription.length <= 142) {
        return metaDescription;
      }

      console.log(`Output for "${title}" is not the required number of characters. Retry #${attempts + 1}...`);
      attempts++;
    } catch (err) {
      console.error(`Error generating meta description for "${title}":`, err.response.data);
      throw err;
    }
  }

  return `TARGET LENGTH NOT MET: ${metaDescription}`;
}

function buildCorrectionPrompt(metaDescription) {
  const moreOrLessMessage = getLengthMessage(metaDescription.length);
  const action = moreOrLessMessage === "less than 120" ? "Extend" : "Shorten";

  return `Unfortunately, SEO meta description you generated is ${moreOrLessMessage} characters:\n\n
  ${metaDescription}\n\n
  Adapt and ${action} the existing meta description using the original content to make it the target length. Provide the new meta description only.`;
}

function messagesBuilder(title, strippedContent, categories, tags, correctionPrompt) {
  const messages = [
    {
      role: "system",
      content: `You are an expert SEO specialist. Your task is to generate an engaging SEO meta description for a blog post to drive traffic. It should be between 107 and 
      142 characters. It should be between 1 and 2 sentences with up to 13 words per sentence. Follow the best practices for writing SEO meta descriptions including: 
      identifying and using a focus keyphrase from the title, content and categories and tags, using 
      the active voice, making sure it matches the content of the page, matching the sentiment of the content and making it unique. DO NOT include a 
      call to action. Reply with the meta description only.`,
    },
    { role: "user", content: `Write an SEO meta description for a post with the title: ${title}, content: ${strippedContent}, categories: ${categories}, tags: ${tags}.` },
  ];

  if (correctionPrompt !== "") {
    messages.push({ role: "user", name: "correction", content: correctionPrompt });
  }

  return messages;
}

async function getMetaDescription(messages) {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
    max_tokens: 40,
    n: 1,
    stop: null,
    temperature: 0.5,
  });

  return response.data.choices[0].message.content.replace(/\"{2,}/g, '"').trim();
}

function stripOutHtml(content) {
  return content.replace(/(<([^>]+)>)/gi, "").replace(/\n/g, " ").replace(/^\"|\"$/g, '').trim();
}

function getLengthMessage(length) {
  return length < 120 ? "less than 120" : length > 160 ? "more than 160" : "";
}

exports.generateMetaDescription = generateMetaDescription;
