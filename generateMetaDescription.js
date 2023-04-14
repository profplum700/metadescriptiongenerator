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
      let prompt;
      if (attempts === 0) {
        prompt = `Write an SEO meta description for a post with the title: ${title}, content: ${strippedContent}, categories: ${categories}, tags: ${tags}.
    It should be as close to but not more than 160 characters and a minimum of 120 characters. It should be between 1 and 2 sentences with 13 words per sentence max.`;
      } else {
        const moreOrLessMessage = getLengthMessage(metaDescription.length);
        if (moreOrLessMessage === "less than 120") {
          prompt = `This SEO meta description for the article with title "${title}" is ${moreOrLessMessage} characters, whereas it should be close to but not more 
      than 160 characters and a minimum of 120 characters:\n\n
      ${metaDescription}\n\n
      Original content: ${strippedContent}\n\n
      Extend the existing meta description using the original content to make it the target length. Provide the new meta description only.`;
        } else {
          prompt = `This SEO meta description for the article with title "${title}" is ${moreOrLessMessage} characters, whereas it should be close to but not more 
      than 160 characters and a minimum of 120 characters:\n\n
      ${metaDescription}\n\n
      Original content: ${strippedContent}\n\n
      Shorten the existing meta description to make it the target length. Provide the new meta description only.`;
        }
      }

      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: `You are an expert SEO specialist. Your task is to generate an engaging SEO meta description for a blog post to drive traffic. 
          It should be as close to 160 characters as possible and no less than 120 characters. Reply with the meta description only.` },
          { role: "user", content: prompt },
        ],
        max_tokens: 40,
        n: 1,
        stop: null,
        temperature: 0.3,
      });

      metaDescription = response.data.choices[0].message.content
        .replace(/\"{2,}/g, '"')
        .trim();

      if (metaDescription.length >= 120 && metaDescription.length <= 160) {
        return metaDescription;
      }

      console.log(
        `Meta description for "${title}" is over 160 characters. Retry #${
          attempts + 1
        }...`
      );
      attempts++;
    } catch (err) {
      console.error(
        `Error generating meta description for "${title}":`,
        err.response.data
      );
      throw err;
    }
  }

  // If the meta description is still too few/many chars after the retries
  return `TARGET LENGTH NOT MET: ${metaDescription}`;
}

function stripOutHtml(content) {
  return content.replace(/(<([^>]+)>)/gi, "").replace(/\n/g, " ");
}

function getLengthMessage(length) {
  if (length < 120) {
    return "less than 120";
  } else if (length > 160) {
    return "more than 160";
  }
}

exports.generateMetaDescription = generateMetaDescription;
