const request = require('request');
const cheerio = require('cheerio');
const async = require('async');


function getHtmlVersion(body) {
    const $ = cheerio.load(body);
    const docTypes = ['<!DOCTYPE html>', '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">', '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">', '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN" "http://www.w3.org/TR/html4/frameset.dtd">', '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">', '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">', '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">', '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">'];
    const versions = ['HTML 5', 'HTML 4.01 Strict', 'HTML 4.01 Transitional', 'HTML 4.01 Frameset', 'XHTML 1.0 Strict', 'XHTML 1.0 Transitional', 'XHTML 1.0 Frameset', 'XHTML 1.1'];
    const length = docTypes.length;
    let counter = 0;
    for (let i = 0; i < length; i++) {
        const regExp = new RegExp(docTypes[i], 'i');
        const result = body.match(regExp);
        if (result != null) {
            return versions[i];
        }
        else {
            counter++;
        }
    }
    if (counter === length) {
        return 'N/A';
    }
}

function getTitle(body) {
    const $ = cheerio.load(body)
    if ($("title").length > 0) {
        return $("title").text();
    }
    else {
        return 'N/A';
    }
}



function getHeadings(body) {
    const $ = cheerio.load(body);
    const headings = {};
    headings.h1 = $("h1").length;
    headings.h2 = $("h2").length;
    headings.h3 = $("h3").length;
    headings.h4 = $("h4").length;
    headings.h5 = $("h5").length;
    headings.h6 = $("h6").length;
    return headings;
}



function getlinks(url, body) {
    const $ = cheerio.load(body);
    const links = [];
    $("a").each( (i, link) => {
        const href = $(link).attr("href");
        if (href) {
            if (href[0] === '/' || href[0] === '#') {
                links.push(url + href);
            }
            else {
                if (href !== 'javascript:void(0);' && href !== '#') {
                    links.push(href);
                }
            }
        }
    });
    return links;
}


function loginFormExists(body) {
    const $ = cheerio.load(body);
    const textFieldslength = $('input[type="text"]').length;
    const emailFieldslength = $('input[type="email"]').length;
    const passwordFieldsLength = $('input[type="password"]').length;
    const keywords = ['log in', 'login', 'sign in', 'signin'];
    const length = keywords.length;
    let keywordPresence = false;
    let counter = 0;
    for (let i = 0; i < length; i++) {
        const regExp = new RegExp(keywords[i], 'i');
        const result = body.match(regExp);
        if (result != null) {
            counter++;
        }
    }
    if (counter >= 1) {
        keywordPresence = true;
    }

    if ((textFieldslength >= 1 || emailFieldslength >= 1) && passwordFieldsLength >= 1 && keywordPresence) {     // there can be three password fields, if the page contains both registration/login forms in same page.
        return 'YES';
    }
    else {
        return 'NO';
    }

}


function unaccessibleLinks(links) {
    let unaccessbleLinksCount = 0;
    if (links.length > 0) {
        async.each(links, (url, callback) => {
            request(url, (error, response, body) => {
                if (!response || error || response.statusCode === 404) {
                    unaccessbleLinksCount++;
                }
                callback();
            });
        }, (err) => {
            if (!err) {
                return unaccessbleLinksCount;
            }
        }
        );
    }
}


function urlAnalysis(url) {
    return new Promise((resolve, reject) => {
        const obj = {};
        request(url,(error, response, body) => {
            if (response && response.statusCode !== 404) {
                const links = getlinks(url, body);
                let unaccessbleLinksCount = 0;
                obj.title = getTitle(body);
                obj.htmlVersion = getHtmlVersion(body);
                obj.headings = getHeadings(body);
                obj.loginFormExists = loginFormExists(body);
                obj.errorMessage = 'N/A';
                if (links.length > 0) {
                    async.each(links, (url, callback) => {
                        request(url, (error, response, body) => {
                            if (!response || error || response.statusCode === 404) {
                                unaccessbleLinksCount++;
                            }
                            callback();
                        });
                    }, (err) => {
                        if (!err) {
                            obj.unaccessibleLinks = unaccessbleLinksCount;
                            resolve(obj);
                        }
                    }
                    );
                }
                else{
                    obj.unaccessibleLinks = 0;
                    resolve(obj);
                }

            }
            else if (!response || error || response.statusCode === 404) {                
                obj.title = 'N/A';
                obj.htmlVersion = 'N/A';
                obj.headings = 'N/A';
                obj.unaccessibleLinks = 'N/A';
                obj.loginFormExists = 'N/A';
                obj.errorMessage = "PAGE NOT FOUND"
                resolve(obj);
            }
            else{
                const error = 'something went wrong';
                reject(error);
            }

        });
    });
}


module.exports = urlAnalysis;
