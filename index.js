const request = require('request');
const cheerio = require('cheerio');
const async = require('async');

const urlAnalysis = {};
urlAnalysis.getHtmlVersion = (body) => {
  const docTypes = ['<!DOCTYPE html>', '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">', '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">', '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN" "http://www.w3.org/TR/html4/frameset.dtd">', '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">', '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">', '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">', '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">'];
  const versions = ['HTML 5', 'HTML 4.01 Strict', 'HTML 4.01 Transitional', 'HTML 4.01 Frameset', 'XHTML 1.0 Strict', 'XHTML 1.0 Transitional', 'XHTML 1.0 Frameset', 'XHTML 1.1'];
  let counter = 0;
  for (let i = 0; i < docTypes.length; i += 1) {
    const regExp = new RegExp(docTypes[i], 'i');
    const result = body.match(regExp);
    if (result != null) {
      return versions[i];
    }

    counter += 1;
  }
  if (counter === docTypes.length) {
    return 'N/A';
  }
};

urlAnalysis.getTitle = (body) => {
  const $ = cheerio.load(body);
  if ($('title').length > 0) {
    return $('title').text();
  }
  return 'N/A';
};

urlAnalysis.getHeadings = (body) => {
  const $ = cheerio.load(body);
  const headings = {};
  headings.h1 = $('h1').length;
  headings.h2 = $('h2').length;
  headings.h3 = $('h3').length;
  headings.h4 = $('h4').length;
  headings.h5 = $('h5').length;
  headings.h6 = $('h6').length;
  return headings;
};

urlAnalysis.getlinks = (url, body) => {
  const $ = cheerio.load(body);
  const links = {};
  links.internal = 0;
  links.external = 0;
  links.unaccessable = [];
  $('a').each((i, link) => {
    const href = $(link).attr('href');
    if (href) {
      if (href[0] === '/' || href[0] === '#') {
        links.internal += 1;
        links.unaccessable.push(url + href);
      } else if (href !== 'javascript:void(0);' && href !== '#') {
        links.external += 1;
        links.unaccessable.push(href);
      }
    }
  });
  return links;
};

urlAnalysis.loginFormExists = (body) => {
  const $ = cheerio.load(body);
  const textFieldslength = $('input[type="text"]').length;
  const emailFieldslength = $('input[type="email"]').length;
  const passwordFieldsLength = $('input[type="password"]').length;
  const keywords = ['log in', 'login', 'sign in', 'signin'];
  let keywordPresence = false;
  let counter = 0;
  for (let i = 0; i < keywords.length; i += 1) {
    const regExp = new RegExp(keywords[i], 'i');
    const result = body.match(regExp);
    if (result != null) {
      counter += 1;
    }
  }
  if (counter >= 1) {
    keywordPresence = true;
  }

  if ((textFieldslength >= 1 || emailFieldslength >= 1) && passwordFieldsLength >= 1 && keywordPresence) {
    return 'YES';
  }

  return 'NO';
};


urlAnalysis.unaccessibleLinks = (links) => {
  let unaccessbleLinksCount = 0;
  if (links.length > 0) {
    async.each(links, (url, callback) => {
      request(url, (error, response) => {
        if (!response || error || response.statusCode === 404) {
          unaccessbleLinksCount += 1;
        }
        callback();
      });
    }, (err) => {
      if (!err) {
        return unaccessbleLinksCount;
      }
    });
  }
};


urlAnalysis.analysis = url => new Promise((resolve, reject) => {
  const obj = {};
  request(url, (error, response, body) => {
    if (response && response.statusCode !== 404) {
      const links = urlAnalysis.getlinks(url, body);
      let unaccessbleLinksCount = 0;
      obj.title = urlAnalysis.getTitle(body);
      obj.htmlVersion = urlAnalysis.getHtmlVersion(body);
      obj.headings = urlAnalysis.getHeadings(body);
      obj.loginFormExists = urlAnalysis.loginFormExists(body);
      obj.errorMessage = 'N/A';
      obj.errorStatusCode = 'N/A';
      obj.internallinks = links.internal;
      obj.externallinks = links.external;

      if (links.unaccessable.length > 0) {
        async.each(links.unaccessable, (weburl, callback) => {
          request(weburl, (err, resp) => {
            if (!resp || err || response.statusCode === 404) {
              unaccessbleLinksCount += 1;
            }
            callback();
          });
        }, (err) => {
          if (!err) {
            obj.unaccessibleLinks = unaccessbleLinksCount;
            resolve(obj);
          }
        });
      } else {
        obj.unaccessibleLinks = 0;
        resolve(obj);
      }
    } else if (!response || error || response.statusCode === 404) {
      obj.title = 'N/A';
      obj.htmlVersion = 'N/A';
      obj.headings = {
        h1: 'N/A', h2: 'N/A', h3: 'N/A', h4: 'N/A', h5: 'N/A', h6: 'N/A',
      };
      obj.unaccessibleLinks = 'N/A';
      obj.loginFormExists = 'N/A';
      obj.errorStatusCode = 404;
      obj.internallinks = 'N/A';
      obj.externallinks = 'N/A';
      obj.errorMessage = 'PAGE NOT FOUND';
      resolve(obj);
    } else {
      const err = 'something went wrong';
      reject(err);
    }
  });
});
module.exports = urlAnalysis;
