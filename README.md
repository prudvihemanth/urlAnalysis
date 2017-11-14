# Analyse the SEO friendly webpages


Usage:
const urlAnalysis = require('urlanalysis');
const url = 'https://www.zomato.com/chennai';
const analysis = urlAnalysis.analysis;
analysis(url)
.then((data) => console.log(data))
.catch((error) => console.log(error));


We get Title, HtmlVersion, HyperlinksCount, Unaccessible Hyperlinks, Headings, LoginFormExists etc.

