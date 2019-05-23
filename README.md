# Npm Module to analyse the SEO friendly webpages

Tech Stack:

Node.js
Request
Cheerio

Mocha
Chai
Istanbul


Usage:

const urlAnalysis = require('urlanalysis');


const url = 'https://www.zomato.com/chennai';


const analysis = urlAnalysis.analysis;


analysis(url)
.then((data) => console.log(data))

.catch((error) => console.log(error));


We get Title, HtmlVersion, HyperlinksCount, Unaccessible Hyperlinks, Headings, LoginFormExists etc in Response Body.

