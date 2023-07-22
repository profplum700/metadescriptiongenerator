# metadescriptiongenerator
Generate meta descriptions for web pages in bulk to boost SEO using OpenAI

This project uses OpenAI to generate meta descriptions for each row in a CSV file. The CSV contains page content exported from a CMS. The meta descriptions are specific and relevant to each page's content.

Generating meta descriptions this way is quick and improves SEO. Without meta descriptions, pages rank poorly. This tool boosted my site's SERP rankings within 2 weeks.

The tool will make 5 attempts to generate a meta description between 107 and 142 characters long (which is the [optimal length](https://yoast.com/meta-descriptions/#:~:text=Keep%20it%20up%20to%20155%20characters,-The%20right%20length&text=You%20should%20take%20enough%20space,like%20in%20the%20example%20below.)). If it fails to, it still produces output but marks rows with "TARGET LENGTH NOT MET".

I don't support this tool or use it anymore as I'm more interested now in building applications using tools like [ChainForge](https://github.com/ianarawjo/ChainForge) and [Flowise](https://github.com/FlowiseAI/Flowise). You could probably quickly make a much better version of this tool using those. I've actively contributed to the testing of ChainForge as by-product of using it so much.

## Usage

- Clone the repo
- Install Node.js
- You can set your [OPENAI_API_KEY](https://platform.openai.com/account/api-keys) by:
  - Adding it as an environment variable
  - Creating a .env file in the root of the project and setting it there e.g. `OPENAI_API_KEY=<your key>`
  - In generateMetaDescription.js, replacing `process.env.OPENAI_API_KEY` with it here: `const openaiKey = process.env.OPENAI_API_KEY;`
- Run: `node .\main.js -i "<input file>" -o "<output file>"`
  - e.g. `node .\main.js -i "C:\Users\USER\Downloads\Posts-Export.csv" -o "C:\Users\USER\Downloads\metadescriptions.csv"`

## Input file format

I created this program to process exports from [WP All Export](https://www.wpallimport.com/upgrade-to-wp-all-export-pro/). It should however work with any CSV file with the following fields:

- Id - The post ID
- Title - The post title
- Content - The full content of the post
- Categories - Any categories assigned to the post
- Tags - Any tags assigned to the post
- Permalink - The permalink/URL for the post

![image](https://github.com/profplum700/metadescriptiongenerator/assets/13546520/bf4c92b3-e5aa-4dfa-a780-7124025c12ee)

## Output

The output CSV file will contain the following fields:

- id - Post ID
- permalink - Post URL
- title - Post title
- metaDescription - The generated meta description for the post
