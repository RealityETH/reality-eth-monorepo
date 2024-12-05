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
  it('Handles datetimes of default precision as expected', function() {
    var q = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType('datetime'), '');
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000000')).to.equal('1970-01-01');
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000005B0DE980')).to.equal('2018-05-30');
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000005B0DE981')).to.equal('[Invalid datetime]: 2018-05-30 00:00:01');
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000005B0E02F7')).to.equal('[Invalid datetime]: 2018-05-30 01:48:39');
  });
  it('Handles datetimes of specified precision as expected', function() {
    var q = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType('datetime'), '');
    q['precision'] = 'd';
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000000')).to.equal('1970-01-01');
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000005B0DE980')).to.equal('2018-05-30');
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000005B0DE981')).to.equal('[Invalid datetime]: 2018-05-30 00:00:01');
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000005B0E02F7')).to.equal('[Invalid datetime]: 2018-05-30 01:48:39'); 

    q['precision'] = 'H';
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000005B0E02F7')).to.equal('[Invalid datetime]: 2018-05-30 01:48:39'); 
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000005B0DE980')).to.equal('2018-05-30 00hr');

    q['precision'] = 'i';
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000005B0E02F7')).to.equal('[Invalid datetime]: 2018-05-30 01:48:39'); 
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000005B0DE980')).to.equal('2018-05-30 00:00');

    q['precision'] = 's';
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000005B0E02F7')).to.equal('2018-05-30 01:48:39'); 
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000005B0DE980')).to.equal('2018-05-30 00:00:00');

    q['precision'] = 'i';
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000006163683C')).to.equal('2021-10-10 22:25'); 

    q['precision'] = 'H';
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000006163683C')).to.equal('[Invalid datetime]: 2021-10-10 22:25'); 
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000061636260')).to.equal('2021-10-10 22hr'); 
    // q['precision'] = 'H';

    q['precision'] = 'd';
    expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000061636260')).to.equal('[Invalid datetime]: 2021-10-10 22hr'); 

    q['precision'] = 's';
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000005FEE6600')).to.equal('2021-01-01 00:00:00'); 
    q['precision'] = 'i';
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000005FEE6600')).to.equal('2021-01-01 00:00'); 
    q['precision'] = 'H';
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000005FEE6600')).to.equal('2021-01-01 00hr'); 
    q['precision'] = 'd';
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000005FEE6600')).to.equal('2021-01-01'); 
    q['precision'] = 'm';
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000005FEE6600')).to.equal('2021-01'); 
    q['precision'] = 'Y';
    expect(rc_question.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000005FEE6600')).to.equal('2021'); 

    // 1609426800 2021 5FEE6600

    //1633904700 6163683C 
    //1633903200 61636260
    //1609426800 5FEDE770


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
  it('Sets an error if there are too many outcomes', function() {
    var outcomes = [];
    for(var i=0; i<129; i++) {
        outcomes.push('thing'+i);
    }
    var qtext = rc_question.encodeText('multiple-select', 'oink', outcomes, 'my-category');
    var q1 = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType('multiple-select'), qtext);
    expect(q1.errors.too_many_outcomes).to.equal(true);
    expect(q1.title).to.equal('oink');
    var q2 = rc_question.populatedJSONForTemplate(rc_template.defaultTemplateForType('multiple-select'), qtext, true);
    expect(q2.errors.too_many_outcomes).to.equal(true);
    expect(q2.title).to.equal('[Too many outcomes] oink');
    //expect(rc_question.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000003')).to.equal('thing1 / thing2');
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
    expect(q.errors.json_parse_failed).to.equal(true);
  });
  it('Sets the invalid_precision error if the precision is set but to something other than Y m d H i s', function() {
    var broken = '{ "title": "This datetime will not work", "type": "datetime", "precision": "X" }';
    var q1 = rc_question.populatedJSONForTemplate(broken, '');
    expect(q1.errors.invalid_precision).to.equal(true);
    expect(q1.title).to.equal('This datetime will not work');
    var q2 = rc_question.populatedJSONForTemplate(broken, '', true);
    expect(q2.errors.invalid_precision).to.equal(true);
    expect(q2.title).to.equal('[Invalid date format] This datetime will not work');
  });
});

describe('Markdown questions', function() {
  it('Sets title, title_html and title_text appropriatly', function() {
    const qMarkdown = "{\"title\": \"# my title oh yes\", \"type\": \"bool\", \"category\": \"art\", \"lang\": \"en_US\", \"format\": \"text/markdown\"}";
    const q = rc_question.parseQuestionJSON(qMarkdown, true);
    expect(q.errors).to.equal(undefined);
    expect(q.format).to.equal('text/markdown');
    expect(q.title_text).to.equal('my title oh yes');
    expect(q.title).to.equal('# my title oh yes');
    expect(q.title_html).to.equal('<h1>my title oh yes</h1>'+"\n");
  });
  it('Set title_text appropriatly for italic and bold headings', function() {
    const qMarkdown = "{\"title\": \"# _Italic Heading 1_\\n## __Bold Heading 2__\", \"type\": \"bool\", \"category\": \"art\", \"lang\": \"en_US\", \"format\": \"text/markdown\"}";
    const q = rc_question.parseQuestionJSON(qMarkdown, true);
    expect(q.errors).to.equal(undefined);
    expect(q.format).to.equal('text/markdown');
    expect(q.title_text).to.equal('Italic Heading 1\n\n\nBold Heading 2');
    expect(q.title).to.equal('# _Italic Heading 1_\n## __Bold Heading 2__');
    expect(q.title_html).to.equal(`<h1><em>Italic Heading 1</em></h1>\n<h2><strong>Bold Heading 2</strong></h2>`+"\n");
  });
  it('Set title_text appropriatly for italic and bold quotes', function() {
    const qMarkdown = "{\"title\": \">_Italic_ __Bold__\", \"type\": \"bool\", \"category\": \"art\", \"lang\": \"en_US\", \"format\": \"text/markdown\"}";
    const q = rc_question.parseQuestionJSON(qMarkdown, true);
    expect(q.errors).to.equal(undefined);
    expect(q.format).to.equal('text/markdown');
    expect(q.title_text).to.equal('> Italic Bold');
    expect(q.title).to.equal('>_Italic_ __Bold__');
    expect(q.title_html).to.equal('<blockquote>\n<p><em>Italic</em> <strong>Bold</strong></p>\n</blockquote>'+"\n");
  });
    it('Set title_text appropriatly for lists', function() {
    const qMarkdown = "{\"title\": \"* __Item One__\\n* __Item Two__\\n* __Item Three__\\n1. Item One\\n2. Item Two\\n3. Item Three\", \"type\": \"bool\", \"category\": \"art\", \"lang\": \"en_US\", \"format\": \"text/markdown\"}";
    const q = rc_question.parseQuestionJSON(qMarkdown, true);
    expect(q.errors).to.equal(undefined);
    expect(q.format).to.equal('text/markdown');
    expect(q.title_text).to.equal(' * Item One\n * Item Two\n * Item Three\n\n 1. Item One\n 2. Item Two\n 3. Item Three');
    expect(q.title).to.equal('* __Item One__\n* __Item Two__\n* __Item Three__\n1. Item One\n2. Item Two\n3. Item Three');
    expect(q.title_html).to.equal(
`<ul>
<li><strong>Item One</strong></li>
<li><strong>Item Two</strong></li>
<li><strong>Item Three</strong></li>
</ul>
<ol>
<li>Item One</li>
<li>Item Two</li>
<li>Item Three</li>
</ol>` + "\n");
  });
  it('Set title_text appropriatly for code blocks', function() {
    const qMarkdown = "{\"title\": \"`Inline code` with backticks\\n\\n```# code block\\nprint '3 backticks or'\\nprint 'indent 4 spaces'```\", \"type\": \"bool\", \"category\": \"art\", \"lang\": \"en_US\", \"format\": \"text/markdown\"}";
    const q = rc_question.parseQuestionJSON(qMarkdown, true);
    expect(q.errors).to.equal(undefined);
    expect(q.format).to.equal('text/markdown');
    expect(q.title_text).to.equal(`Inline code with backticks\n\n# code block print '3 backticks or' print 'indent 4 spaces'`);
    expect(q.title).to.equal("`Inline code` with backticks\n\n```# code block\nprint '3 backticks or'\nprint 'indent 4 spaces'```");
    expect(q.title_html).to.equal(
`<p><code>Inline code</code> with backticks</p>
<p><code># code block print &#39;3 backticks or&#39; print &#39;indent 4 spaces&#39;</code></p>`+ "\n");
  });
});

describe('Unsafe markdown questions', function() {
  it('Sets an error if a question includes unsafe html in markdown', function() {
    const qUnsafeMarkdown = "{\"title\": \"# Title <p>abc<iframe\/\/src=jAva&Tab;script:alert(3)>def<\/p>\", \"type\": \"bool\", \"category\": \"art\", \"lang\": \"en_US\", \"format\": \"text/markdown\"}";
    const q = rc_question.parseQuestionJSON(qUnsafeMarkdown, true);
    expect(q.errors.unsafe_markdown).to.equal(true);
  });
  it('Sets no error if a question includes valid markdown without html', function() {
    const qSafeMarkdown = "{\"title\": \"# Title\", \"type\": \"bool\", \"category\": \"art\", \"lang\": \"en_US\", \"format\": \"text/markdown\"}";
    const q = rc_question.parseQuestionJSON(qSafeMarkdown, true);
    expect(q.errors).to.equal(undefined);
    expect(q.format).to.equal('text/markdown');
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

describe('Question ID tests', function() {
  const template_id = 0;
  const qtext = 'Test question␟arts␟en_US';
  const arbitrator = '0xa63db03f2706a6dffcce58b8b567872104d7b48f';
  const timeout_val = 900;
  const opening_ts = 0;
  const account = '0xF74B5F5775a7d55f4F9Ec3EB9bDFF93dDfd3432e';
  const nonce = 0;

  const content_hash = '0x3266c7acb47bcf1f648a6669f6e100fd178c6ad6ce342b93857317181ee1a0f5';

  const question_id = '0xe42c3f74f45fed2c02f2a67e8956847b6ce0a0a63ef1c8237161c74483dd588b';

  it('Returns the expected content hash', function() { 
    const ch = rc_question.contentHash(template_id, opening_ts, qtext);
    expect(ch).to.equal(content_hash);
  });

  it('Returns the expected question ID for a simple v2 question', function() {
    const qid = rc_question.questionID(template_id, qtext, arbitrator, timeout_val, opening_ts, account, 0);
    expect(qid).to.equal(question_id);
  });

  it('Throws an error if v3 is specified but the min_bond or contract arguments are missing', function() {
    expect(() => rc_question.questionID(template_id, qtext, arbitrator, timeout_val, opening_ts, account, 0, null, null, '3.0')).to.throw('min_bond not supplied or invalid. Required in v3. Pass "0x0" for a zero bond');
  });

  it('Throws an error if min_bond or contract arguments specified but the version argument is missing', function() {
    expect(() => rc_question.questionID(template_id, qtext, arbitrator, timeout_val, opening_ts, account, 0, "0x0", "0xabcd")).to.throw('Version not defined');
  });

  it('Throws an error if an unknown version is specified', function() {
    expect(() => rc_question.questionID(template_id, qtext, arbitrator, timeout_val, opening_ts, account, 0, "0x0", "0x0abcd", 'oink')).to.throw('Version not recognized');
  });

  it('Returns a different ID if the version is different', function() {
    const v2qid = rc_question.questionID(template_id, qtext, arbitrator, timeout_val, opening_ts, account, 0, "0x0", "0x0", '2.0')
    const v3qid = rc_question.questionID(template_id, qtext, arbitrator, timeout_val, opening_ts, account, 0, "0x0", "0x0", '3.0')
    expect(v2qid).not.to.equal(v3qid);
  });

  it('Returns the id for v3 that the v3 contract did', function() {
     // https://rc-dev-5.socialminds.jp/monorepo/packages/dapp/#!/contract/0xDf33060F476F8cff7511F806C72719394da1Ad64/question/0xdf33060f476f8cff7511f806c72719394da1ad64-0xb1d1cad2a10db4d4b3693f4fb859cb2e7f772702acb1b5daa54080910c0734c9
    const v3qid = rc_question.questionID(0, 'Does the existing ui work with v3␟arts␟en_US', '0xdf33060f476f8cff7511f806c72719394da1ad64', 180, 0, '0xF74B5F5775a7d55f4F9Ec3EB9bDFF93dDfd3432e', 0, "0x0", "0xdf33060f476f8cff7511f806c72719394da1ad64", '3.0')
    expect(v3qid).to.equal('0xb1d1cad2a10db4d4b3693f4fb859cb2e7f772702acb1b5daa54080910c0734c9');
  });

});

describe('Short question ID tests', function() {
   // First 7 characters of main ID (without prefixing contract address), "...", last 7 characters
   const full_qid = '0xe78996a233895be74a66f451f1019ca9734205cc-0x2703ce72afee88da2cb1e7b405c6d5354af732d9893538f684083698763ef35a';
   const normal_qid = '0x2703ce72afee88da2cb1e7b405c6d5354af732d9893538f684083698763ef35a';
   const full_to_short = rc_question.shortDisplayQuestionID(full_qid);
   const normal_to_short = rc_question.shortDisplayQuestionID(normal_qid);
   expect(full_to_short).to.equal('2703ce7...63ef35a');
   expect(normal_to_short).to.equal('2703ce7...63ef35a');
});

describe('Custom template handling', function() {
  const example_template = '{"title": "%s", "dogs": "%s", "cats": "%s"}';
  const example_template_arr = '{"title": "%s", "dogs": "%s", "cats": [%s], "ants": [%s]}';
  const multi_template = '{"title": "%s", "dogs": "The dogs item contains thing 1 %s and thing 2 %s.", "cats": "%s"}';
  const example_template_meta = '{"title": "%s", "dogs": "%s", "cats": "%s", "__META": {"tags": {"1": "dogthing1"}, "labels": {"dogs": "Doggies", "cats": "Felines"}}}';
  const multi_template_meta = '{"title": "%s", "dogs": "The dogs item contains thing 1 %s and thing 2 %s.", "cats": "%s", "__META": {"tags": {"1": "dogthing1"}, "labels": {"dogs": "Doggies", "dogs_0": "First Doggy", "dogs_1": "Second Doggy", "cats": "Felines"}}}';
  it('Returns a template config for an otherwise unknown template', function() {
    var q = rc_question.guessTemplateConfig(example_template);
    const t = q['fields']['title']['label'];
    expect(t).to.equal('title');
    const dt = q['fields']['dogs']['label'];
    expect(dt).to.equal('dogs');
    const parts = q['fields']['dogs']['parts'];
    expect(parts.length).to.equal(1);
    expect(parts[0].part).to.equal('parameter');
    expect(parts[0].part_index).to.equal(0);
    expect(parts[0].label).to.equal('dogs_0');

    var qm = rc_question.guessTemplateConfig(example_template_meta);
    const tm = qm['fields']['title']['label'];
    expect(tm).to.equal('title');
    const dtm = qm['fields']['dogs']['label'];
    expect(dtm).to.equal('Doggies');
    const partsm = qm['fields']['dogs']['parts'];
    expect(partsm.length).to.equal(1);
    expect(partsm[0].part).to.equal('parameter');
    expect(partsm[0].part_index).to.equal(0);
    const tag1 = qm['tags']['1'];
    expect(tag1).to.equal('dogthing1');

    var qa = rc_question.guessTemplateConfig(example_template_arr);
    const ta = qa['fields']['title']['label'];
    expect(ta).to.equal('title');
    const dta = qa['fields']['dogs']['label'];
    expect(dta).to.equal('dogs');
    const partsa = qa['fields']['dogs']['parts'];
    expect(partsa.length).to.equal(1);
    expect(partsa[0].part).to.equal('parameter');
    expect(partsa[0].part_index).to.equal(0);
    expect(partsa[0].label).to.equal('dogs_0');

    const bparts2 = qa['fields']['cats']['parts'];
    expect(bparts2.length).to.equal(1);
    expect(bparts2[0].part).to.equal('array_parameter');
    expect(bparts2[0].part_index).to.equal(0);
    expect(bparts2[0].label).to.equal('cats_0');

    const bparts3 = qa['fields']['ants']['parts'];
    expect(bparts3.length).to.equal(1);
    expect(bparts3[0].part).to.equal('array_parameter');
    expect(bparts3[0].part_index).to.equal(0);
    expect(bparts3[0].label).to.equal('ants_0');

  });

  it('Returns a config for placeholders inside strings in json fields', function() {
    var q = rc_question.guessTemplateConfig(multi_template);
    const t = q['fields']['title']['label'];
    expect(t).to.equal('title');
    const parts = q['fields']['dogs']['parts'];
    expect(parts.length).to.equal(5);
    expect(parts[0].part).to.equal('text');
    expect(parts[0].value).to.equal('The dogs item contains thing 1 ');
    expect(parts[1].part).to.equal('parameter');
    expect(parts[1].part_index).to.equal(0);
    expect(parts[1].label).to.equal("dogs_0");
    expect(parts[2].part).to.equal('text');
    expect(parts[2].value).to.equal(' and thing 2 ');
    expect(parts[3].part).to.equal('parameter');
    expect(parts[3].part_index).to.equal(1);
    expect(parts[3].label).to.equal("dogs_1");
    expect(parts[4].part).to.equal('text');
    expect(parts[4].value).to.equal('.');

    var qm = rc_question.guessTemplateConfig(multi_template_meta);
    const tm = q['fields']['title']['label'];
    expect(tm).to.equal('title');
    const partsm = qm['fields']['dogs']['parts'];
    expect(partsm.length).to.equal(5);
    expect(partsm[0].part).to.equal('text');
    expect(partsm[0].value).to.equal('The dogs item contains thing 1 ');
    expect(partsm[1].part).to.equal('parameter');
    expect(partsm[1].part_index).to.equal(0);
    expect(partsm[1].label).to.equal("First Doggy");
    expect(partsm[2].part).to.equal('text');
    expect(partsm[2].value).to.equal(' and thing 2 ');
    expect(partsm[3].part).to.equal('parameter');
    expect(partsm[3].part_index).to.equal(1);
    expect(partsm[3].label).to.equal("Second Doggy");
    expect(partsm[4].part).to.equal('text');
    expect(partsm[4].value).to.equal('.');
  });
});

