from django.test import TestCase
from rcindex.models import RCQuestion
from rcindex.realitycheck_question import RealityCheckQuestion
from rcindex.realitycheck_template import RealityCheckTemplate

# Create your tests here.

class RealityCheckQuestionTest(TestCase):

    simple_types = [ "bool", "uint", "datetime" ]
    option_types = [ "single-select", "multiple-select" ]

    def test_simple_type_templates(self):
        for i in range(len(self.simple_types)):
            t = self.simple_types[i]
            qtext = RealityCheckQuestion.encodeText(t, 'oink', None, 'my-category')
            q = RealityCheckQuestion.populatedJSONForTemplate(RealityCheckTemplate.defaultTemplateForType(t), qtext)
            self.assertEqual(q['type'], t)

    def test_option_type_templates(self):
        outcomes = ["oink", "oink2"]
        for i in range(len(self.option_types)):
            t = self.option_types[i]
            qtext = RealityCheckQuestion.encodeText(t, 'oink', outcomes, 'my-category')
            q = RealityCheckQuestion.populatedJSONForTemplate(RealityCheckTemplate.defaultTemplateForType(t), qtext)
            self.assertEqual(q['type'], t)

    def test_answer_formatting(self):
        q = RealityCheckQuestion.populatedJSONForTemplate(RealityCheckTemplate.defaultTemplateForType('bool'), '')
        self.assertEqual(RealityCheckQuestion.answerToBytes32(1, q), '0x0000000000000000000000000000000000000000000000000000000000000001')
        self.assertEqual(RealityCheckQuestion.answerToBytes32(0, q), '0x0000000000000000000000000000000000000000000000000000000000000000')

    def test_option_hexification(self):
        outcomes = ['thing1', 'thing2', 'thing3']
        qtext = RealityCheckQuestion.encodeText('multiple-select', 'oink', outcomes, 'my-category')
        q = RealityCheckQuestion.populatedJSONForTemplate(RealityCheckTemplate.defaultTemplateForType('multiple-select'), qtext)
        self.assertEqual(q['type'], 'multiple-select')
        
        self.assertEqual(RealityCheckQuestion.answerToBytes32([False], q), '0x0000000000000000000000000000000000000000000000000000000000000000')
        self.assertEqual(RealityCheckQuestion.answerToBytes32([False, False], q), '0x0000000000000000000000000000000000000000000000000000000000000000')
        self.assertEqual(RealityCheckQuestion.answerToBytes32([True], q), '0x0000000000000000000000000000000000000000000000000000000000000001')
        self.assertEqual(RealityCheckQuestion.answerToBytes32([True, False], q), '0x0000000000000000000000000000000000000000000000000000000000000001')
        self.assertEqual(RealityCheckQuestion.answerToBytes32([False, True], q), '0x0000000000000000000000000000000000000000000000000000000000000002')
        self.assertEqual(RealityCheckQuestion.answerToBytes32([True, True], q), '0x0000000000000000000000000000000000000000000000000000000000000003')
        self.assertEqual(RealityCheckQuestion.answerToBytes32([True, False, True], q), '0x0000000000000000000000000000000000000000000000000000000000000005')

    def test_answer_strings(self):
        q = RealityCheckQuestion.populatedJSONForTemplate(RealityCheckTemplate.defaultTemplateForType('bool'), '')
        self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000001'), 'Yes')
        self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000000'), 'No')
        self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0000000000000000000000000000000000000000000000000000000000000001'), 'Yes')
        self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0000000000000000000000000000000000000000000000000000000000000000'), 'No')
        self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0000000000000000000000000000000000000000000000000000000000000003'), '')
        self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'), 'Invalid')

    def test_no_decimals(self):
        q = RealityCheckQuestion.populatedJSONForTemplate(RealityCheckTemplate.defaultTemplateForType('uint'), '')
        q['decimals'] = 0
        self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000000'), '0')
        self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000001'), '1')
        self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000002'), '2')

    def test_uints(self):
        q = RealityCheckQuestion.populatedJSONForTemplate(RealityCheckTemplate.defaultTemplateForType('uint'), '')
        self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000000'), '0')
        self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000DE0B6B3A7640000'), '1')
        self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x000000000000000000000000000000000000000000000000016345785D8A0000'), '0.1')
        self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x0000000000000000000000000000000000000000000000001BC16D674EC80000'), '2')

    #def test_ints(self):
    #    q = RealityCheckQuestion.populatedJSONForTemplate(RealityCheckTemplate.defaultTemplateForType('int'), '')
    #    q['decimals'] = 0
    #    self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000000'), '0')
    #    self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000001'), '1')
    #    self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'), '-1')

    #def test_int_decimals(self):
    #    q = RealityCheckQuestion.populatedJSONForTemplate(RealityCheckTemplate.defaultTemplateForType('int'), '')
    #    self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000000'), '0')
    #    self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000DE0B6B3A7640000'), '1')
    #    self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x000000000000000000000000000000000000000000000000016345785D8A0000'), '0.1')
    #    self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'), '-1e-18')

    def test_datetimes(self):
        q = RealityCheckQuestion.populatedJSONForTemplate(RealityCheckTemplate.defaultTemplateForType('datetime'), '')
        self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000000'), '1970/1/1')
        self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x000000000000000000000000000000000000000000000000000000005B0E02F7'), '2018/5/30')

    def test_single_selects(self):
        outcomes = ['thing1', 'thing2', 'thing3']
        qtext = RealityCheckQuestion.encodeText('single-select', 'oink', outcomes, 'my-category')
        q = RealityCheckQuestion.populatedJSONForTemplate(RealityCheckTemplate.defaultTemplateForType('single-select'), qtext)
        self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000000'), 'thing1')
        self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000001'), 'thing2')

    def test_multiple_selects(self):
        outcomes = ['thing1', 'thing2', 'thing3']
        qtext = RealityCheckQuestion.encodeText('multiple-select', 'oink', outcomes, 'my-category')
        q = RealityCheckQuestion.populatedJSONForTemplate(RealityCheckTemplate.defaultTemplateForType('multiple-select'), qtext)
        self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000000'), '')
        self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000005'), 'thing1 / thing3')
        self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000002'), 'thing2')
        self.assertEqual(RealityCheckQuestion.getAnswerString(q, '0x0000000000000000000000000000000000000000000000000000000000000003'), 'thing1 / thing2')
