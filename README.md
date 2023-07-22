# metadescriptiongenerator
Generate meta descriptions for web pages in bulk to boost SEO using OpenAI

This project uses OpenAI to generate meta descriptions for each row in a CSV file. The CSV contains page content exported from a CMS. The meta descriptions are specific and relevant to each page's content.

Generating meta descriptions this way is quick and improves SEO. Without meta descriptions, pages rank poorly. This tool boosted my site's SERP rankings within 2 weeks.

I don't support this tool or use it anymore as I'm more interested now in building applications using tools like [ChainForge](https://github.com/ianarawjo/ChainForge) and [Flowise](https://github.com/FlowiseAI/Flowise). You could probably quickly make a much better version of this tool using those. I've actively contributed to the testing of ChainForge as by-product of using it so much.

## Usage

- Clone the repo
- Install Node.js
- Set your [OPENAI_API_KEY](https://platform.openai.com/account/api-keys) by either:
  - Adding it as an environment variable
  - In generateMetaDescription.js, replacing `process.env.OPENAI_API_KEY` with it here: `const openaiKey = process.env.OPENAI_API_KEY;`
- Run: `node .\main.js -i "<input file>" -o "<output file>"`
  - e.g. `node .\main.js -i "C:\Users\USER\Downloads\Posts-Export.csv" -o "C:\Users\USER\Downloads\metadescriptions.csv"`

## Input file format

I created this program to process exports from [WP All Export](https://www.wpallimport.com/upgrade-to-wp-all-export-pro/)https://www.wpallimport.com/upgrade-to-wp-all-export-pro/.

The input file is expected to be a CSV file with the following fields:
- Id - The post ID
- Title - The post title
- Content - The full content of the post
- Categories - Any categories assigned to the post
- Tags - Any tags assigned to the post
- Permalink - The permalink/URL for the post

The output CSV file will contain the following fields:

- id - Post ID
- permalink - Post URL
- title - Post title
- metaDescription - The generated meta description for the post
