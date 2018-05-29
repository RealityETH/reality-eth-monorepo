const rc_question = require('../lib/realitycheck-question.js');
const rc_template = require('../lib/realitycheck-template.js');

const expect = require("chai").expect;

describe('Default template types', function() {
  const simple_types = [ "bool", "uint", "int", "datetime" ];
  const option_types = [ "single-select", "multiple-select" ];
  it('Returns templates with the requested simple types', function() {
    for (var i=0; i<simple_types.length; i++) {
        var t = simple_types[i];
        const q = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType(t), 'oink');
        expect(q.type).to.equal(t);
    }
  });
  /*
  it('Returns templates with the requested option types', function() {
    for (var i=0; i<simple_types.length; i++) {
        var t = types[i];
        console.log('fetching', i, t);
        const q = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType(t), 'oink');
        expect(q.type).to.equal(t);
    }
  });
  */

});

/*
describe('Min Number Formatter', function() {
  it('Returns 0 for everything except int (signed)', function() {
    expect(rc_question.minNumber().to.equal(true);
  });
});
*/
