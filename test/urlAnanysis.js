const chai = require('chai');

const should = chai.should();
const controller = require('../index');


describe('#htmlVersion', () => {
  it('should give html5 version', () => {
    const input1 = '<!DOCTYPE html> <a class="ac-gn-link ac-gn-link-iphone" href="/iphone/" data-analytics-title="iphone"><a class="ac-gn-link ac-gn-link-support" href="https://support.apple.com" data-analytics-title="support">';
    controller.getHtmlVersion(input1).should.equal('HTML 5');
  });

  it('should give HTML 4.01 Strict', () => {
    const input2 = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"><html><p>hi</p></html>';
    controller.getHtmlVersion(input2).should.equal('HTML 4.01 Strict');
  });
});


describe('#getTitle', () => {
  it('should give html5 version', () => {
    const input1 = '<!DOCTYPE html> <title>Scout24</title><a class="ac-gn-link ac-gn-link-iphone" href="/iphone/" data-analytics-title="iphone"><a class="ac-gn-link ac-gn-link-support" href="https://support.apple.com" data-analytics-title="support">';
    controller.getTitle(input1).should.equal('Scout24');
  });

  it('should give HTML 4.01 Strict', () => {
    const input2 = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"><html><p>hi</p></html><title>Scout42</title>';
    controller.getTitle(input2).should.equal('Scout42');
  });
});

describe('#loginFornExists', () => {
  it('checks whether login form exists and should return no', () => {
    const body = '<input type="text" value="hero"/> <input type="text" value="hero2"/> <input type="text" value="hero3"/> <input type="text" value="hero2"/> signin';
    controller.loginFormExists(body).should.equal('NO');
  });
  it('checks whether login form exists and return yes', () => {
    const body = '<input type="password" value="hero"/> <input type="text" value="hero2"/> <input type="text" value="hero3"/> <input type="text" value="hero2"/> signin';
    controller.loginFormExists(body).should.equal('YES');
  });
});


describe('#getHeadings', () => {
  const body = '<h1>hi</h1><h1>hello</h1><h2>hello</h1><h5>hello</h1>';
  it('checks heading levels of h1 in given input', () => {
    controller.getHeadings(body).h1.should.equal(2);
  });
  it('checks heading levels of h2 in given input', () => {
    controller.getHeadings(body).h2.should.equal(1);
  });
});

