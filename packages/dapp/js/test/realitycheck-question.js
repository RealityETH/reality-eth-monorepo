const rc_question = require('../lib/realitycheck-question.js');
const rc_template = require('../lib/realitycheck-template.js');

const chai = require("chai")
chai.use(require('chai-bignumber')());

const expect = chai.expect;

describe('Default template types', function() {
  const simple_types = [ "bool", "uint", "int", "datetime" ];
  const option_types = [ "single-select", "multiple-select" ];
  it('Returns templates with the requested simple types', function() {
    for (var i=0; i<simple_types.length; i++) {
        var t = simple_types[i];
        var qtext = rc_question.encodeText(t, 'oink', null, 'my-category');
        var q = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType(t), qtext);
        expect(q.type).to.equal(t);
    }
  });
  it('Returns templates with the requested option types', function() {
    const outcomes = ["oink", "oink2"];
    for (var i=0; i<option_types.length; i++) {
        var t = option_types[i];
        var qtext = rc_question.encodeText(t, 'oink', outcomes, 'my-category');
        var q = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType(t), qtext);
        expect(q.type).to.equal(t);
    }
  });

});

describe('Answer formatting', function() {
  it('Turns bools into hex', function() {
    var q = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType('bool'), '');
    expect(rc_question.answerToBytes32(1, q)).to.equal('0x0000000000000000000000000000000000000000000000000000000000000001');
    expect(rc_question.answerToBytes32(0, q)).to.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
  });
  it('Turns options into hex', function() {
    var outcomes = ['thing1', 'thing2', 'thing3'];
    var qtext = rc_question.encodeText('multiple-select', 'oink', outcomes, 'my-category');
    var q = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType('multiple-select'), qtext);
    //console.log(q);
    expect(q.type).to.equal('multiple-select');
    
    expect(rc_question.answerToBytes32([false], q)).to.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
    expect(rc_question.answerToBytes32([false, false], q)).to.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
    expect(rc_question.answerToBytes32([true], q)).to.equal('0x0000000000000000000000000000000000000000000000000000000000000001');
    expect(rc_question.answerToBytes32([true, false], q)).to.equal('0x0000000000000000000000000000000000000000000000000000000000000001');
    expect(rc_question.answerToBytes32([false, true], q)).to.equal('0x0000000000000000000000000000000000000000000000000000000000000002');
    expect(rc_question.answerToBytes32([true, true], q)).to.equal('0x0000000000000000000000000000000000000000000000000000000000000003');
    expect(rc_question.answerToBytes32([true, false, true], q)).to.equal('0x0000000000000000000000000000000000000000000000000000000000000005');
  });
});

describe('Answer strings', function() {
  it('Handles bools as expected', function() {
    var q = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType('bool'), '');
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000001')).to.equal('Yes');
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000000')).to.equal('No');
    expect(rc_question.getAnswerString(q, '0000000000000000000000000000000000000000000000000000000000000001')).to.equal('Yes');
    expect(rc_question.getAnswerString(q, '0000000000000000000000000000000000000000000000000000000000000000')).to.equal('No');
    expect(rc_question.getAnswerString(q, '0000000000000000000000000000000000000000000000000000000000000003')).to.equal('');
    expect(rc_question.getAnswerString(q, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')).to.equal('Invalid');
  });
  it('Handles uints as expected using 1 decimals', function() {
    var q = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType('uint'), '');
    q.decimals = 0;
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000000')).to.equal('0');
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000001')).to.equal('1');
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000002')).to.equal('2');
  });

  it('Handles uints as expected using 18 decimals', function() {
    var q = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType('uint'), '');
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000000')).to.equal('0');
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000DE0B6B3A7640000')).to.equal('1');
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000016345785D8A0000')).to.equal('0.1');
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000001BC16D674EC80000')).to.equal('2');
  });
  it('Handles ints as expected using 1 decimal', function() {
    var q = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType('int'), '');
    q.decimals = 0;
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000000')).to.equal('0');
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000001')).to.equal('1');
    expect(rc_question.getAnswerString(q, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')).to.equal('-1');
    
  });
  it('Handles ints as expected using 18 decimals', function() {
    var q = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType('int'), '');
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000000')).to.equal('0');
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000DE0B6B3A7640000')).to.equal('1');
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000016345785D8A0000')).to.equal('0.1');
    //expect(rc_question.getAnswerString(q, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')).to.equal('-0.000000000000000001'); // TODO: Change this to toFixed()
    expect(rc_question.getAnswerString(q, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')).to.equal('-1e-18');
  });
  it('Handles datetimes as expected', function() {
    var q = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType('datetime'), '');
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000000')).to.equal('1970/1/1');
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000005B0E02F7')).to.equal('2018/5/30'); // TODO: Change this to include time if it's not 00:00
  });
  it('Handles single selects as expected', function() {
    var outcomes = ['thing1', 'thing2', 'thing3'];
    var qtext = rc_question.encodeText('single-select', 'oink', outcomes, 'my-category');
    var q = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType('single-select'), qtext);
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000000')).to.equal('thing1');
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000001')).to.equal('thing2');
  });
  it('Handles multiple selects as expected', function() {
    var outcomes = ['thing1', 'thing2', 'thing3'];
    var qtext = rc_question.encodeText('multiple-select', 'oink', outcomes, 'my-category');
    var q = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType('multiple-select'), qtext);
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000000')).to.equal('');
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000005')).to.equal('thing1 / thing3');
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000002')).to.equal('thing2');
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000003')).to.equal('thing1 / thing2');
  });

});
/*
describe('Min Number Formatter', function() {
  it('Returns 0 for everything except int (signed)', function() {
    expect(rc_question.minNumber().to.equal(true);
  });
});
*/
