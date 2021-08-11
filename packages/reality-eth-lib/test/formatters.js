const rc_question = require('../formatters/question.js');
const rc_template = require('../formatters/template.js');

const chai = require("chai")
const BigNumber = require('bignumber.js')
chai.use(require('chai-bignumber')());

const expect = chai.expect;

describe('Default template types', function() {
  const simple_types = [ "bool", "uint", "datetime" ];
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

describe('Language tagging', function() {
  it('Returns en_US as en_US', function() {
    var qtext = rc_question.encodeText('bool', 'oink', null, 'my-category', 'en_US');
    var q = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType('bool'), qtext);
    expect(rc_question.getLanguage(q)).to.equal('en_US');
  });
  it('Returns ja_JP as ja_JP', function() {
    var qtext = rc_question.encodeText('bool', 'oink', null, 'my-category', 'ja_JP');
    var q = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType('bool'), qtext);
    expect(rc_question.getLanguage(q)).to.equal('ja_JP');
  });
  it('Returns undefined as en_US', function() {
    var qtext = rc_question.encodeText('bool', 'oink', null, 'my-category', '');
    var q = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType('bool'), qtext);
    expect(rc_question.getLanguage(q)).to.equal('en_US');
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
/*
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
  */
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
describe('Invalid values', function() {
  it('Handles bools as expected', function() {
    var q = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType('bool'), '');
    var inv = rc_question.getInvalidValue(q); 
    expect(inv).to.equal('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
  });
});

describe('Broken questions', function() {
  it('Returns anything that cannot parse as a type called "broken-question"', function() {
    var broken = '{ "title": "You need to quote your "quotation marks" before parsing", "type": "bool" }';
    var q = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType('bool'), broken);
    expect(q.type).to.equal('broken-question');
  });
});

describe('Commitment ID tests', function() {
  // Using rinkeby question:
  // 0xa09ce5e7943f281a782a0dc021c4029f9088bec4-0x0ade9a55d4dfca644062792d8e66cec9fbd5579761d760a6e0ae9856e81086a4
  const answer_plaintext = '0x0000000000000000000000000000000000000000000000000000000000000001';
  const nonce = '0xd51bebd80f5957927ae583c751186503d6ca49cf78050553ba275af9a0f1e68a';
  const commitment_id = '0xbf854989de33a0a9f2cc70553aab7f15700d6f9b93063dcff6bea0fb9fc13991';
  const bond = '0x01d1a94a2000';
  const question_id ='0x0ade9a55d4dfca644062792d8e66cec9fbd5579761d760a6e0ae9856e81086a4';
  const answer_hash = '0xfca4ba5dfb962f23cd78c5f660d96ef55f3cb92908c308c794260153ec14b0a0';
  it('Returns the expected answer hash', function() {
    const ah = rc_question.answerHash(answer_plaintext, nonce);
    expect(answer_hash).to.equal(ah);
  });
  it('Returns the expected commitment ID when passed using a BigNumber for the bond', function() {
    const cid = rc_question.commitmentID(question_id, answer_hash, new BigNumber(bond)); 
    expect(commitment_id).to.equal(cid);
  });
  it('Returns the expected commitment ID when passed using a hex string for the bond', function() {
    const cid = rc_question.commitmentID(question_id, answer_hash, bond); 
    expect(commitment_id).to.equal(cid);
  });
});

