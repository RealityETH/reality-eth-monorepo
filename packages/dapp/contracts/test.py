from unittest import TestCase, main
from rlp.utils import encode_hex, decode_hex
from ethereum import tester as t
from ethereum.tester import TransactionFailed
from ethereum import keys
import time
from sha3 import sha3_256


class TestRealityCheck(TestCase):

    def setUp(self):

        self.s = t.state()

        token_code= open('Token.sol').read()
        standardtoken_code= open('StandardToken.sol').read()

        realitycheck_code = open('RealityCheck.sol').read()

        rc_code_raw = token_code + standardtoken_code + realitycheck_code
        rc_code_raw = rc_code_raw.replace('import', '// import')
        self.rc_code = rc_code_raw

        arb_code_raw = open('Arbitrator.sol').read()
        self.arb_code = arb_code_raw

        self.rc0 = self.s.abi_contract(self.rc_code, language='solidity', sender=t.k0)
        self.arb0 = self.s.abi_contract(self.arb_code, language='solidity', sender=t.k0)

        self.question_id = self.rc0.askQuestion(
            "my question",
            self.arb0.address,
            10,
            1488258341,
            2,
            value=1000
        )

        ts = self.s.block.timestamp

        question = self.rc0.questions(self.question_id)
        self.assertEqual(question[0], ts)
        self.assertEqual(decode_hex(question[1]), self.arb0.address)
        self.assertEqual(question[2], 10)
        self.assertEqual(question[3], "my question")
        self.assertEqual(question[4], 1488258341)
        self.assertEqual(question[5], 2)
        self.assertEqual(question[6], 1000)

    def test_fund_increase(self):

        question = self.rc0.questions(self.question_id)
        self.assertEqual(question[6], 1000)

        self.rc0.fundAnswerBounty(self.question_id, value=500)
        question = self.rc0.questions(self.question_id)
        self.assertEqual(question[6], 1500)

    def test_no_response_finalization(self):

        err = False
        try:
            self.rc0.finalize(self.question_id)
        except TransactionFailed:
            err = True
        self.assertTrue(err, 'Finalize should fail if too soon (same time case)')

        self.s.block.timestamp = self.s.block.timestamp + 1
        err = False
        try:
            self.rc0.finalize(self.question_id)
        except TransactionFailed:
            err = True
        self.assertTrue(err, 'Finalize should fail if too soon (somewhat later case)')

        question = self.rc0.questions(self.question_id)
        print question

        self.s.block.timestamp = self.s.block.timestamp + 11
        self.rc0.finalize(self.question_id)

        question = self.rc0.questions(self.question_id)

        self.assertTrue(self.rc0.isFinalized(self.question_id))
        self.assertEqual(self.rc0.getFinalAnswer(self.question_id), 2)

        err = False
        try:
            self.rc0.submitAnswer(self.question_id, 12345, "my evidence") 
        except TransactionFailed:
            err = True
        self.assertTrue(err, 'submitAnswer should fail once finalized')

        return

    def test_simple_response_finalization(self):

        self.rc0.submitAnswer(self.question_id, 12345, "my evidence") 

        self.s.block.timestamp = self.s.block.timestamp + 11
        self.rc0.finalize(self.question_id)

        self.assertTrue(self.rc0.isFinalized(self.question_id))
        self.assertEqual(self.rc0.getFinalAnswer(self.question_id), 12345)

        err = False
        try:
            self.rc0.finalize(self.question_id)
        except TransactionFailed:
            err = True
        self.assertTrue("You can only finalize once")

    def test_conflicting_response_finalization(self):

        self.rc0.submitAnswer(self.question_id, 12345, "my evidence") 

        self.rc0.submitAnswer(self.question_id, 54321, "my conflicting evidence", value=10) 

        self.s.block.timestamp = self.s.block.timestamp + 11
        self.rc0.finalize(self.question_id)

        self.assertTrue(self.rc0.isFinalized(self.question_id))
        self.assertEqual(self.rc0.getFinalAnswer(self.question_id), 54321)

    def test_bonds(self):

        self.rc0.submitAnswer(self.question_id, 12345, "my evidence") 

        err = False
        try:
            self.rc0.submitAnswer(self.question_id, 10001, "my conflicting evidence", value=0, sender=t.k3) 
        except TransactionFailed:
            err = True
        self.assertTrue(err, "You must increase from zero")

        a1 = self.rc0.submitAnswer(self.question_id, 10001, "my conflicting evidence", value=1, sender=t.k3) 

        a5 = self.rc0.submitAnswer(self.question_id, 10002, "my evidence", value=5, sender=t.k4) 

        err = False
        try:
            self.rc0.submitAnswer(self.question_id, 10003, "my evidence", value=6) 
        except TransactionFailed:
            err = True
        self.assertTrue(err, "You have to at least double")

        err = False
        try:
            self.rc0.submitAnswer(self.question_id, 10004, "my evidence", value=0) 
        except TransactionFailed:
            err = True
        self.assertTrue(err, "You definitely can't drop back to zero")

        a10 = self.rc0.submitAnswer(self.question_id, 10005, "my evidence", value=10, sender=t.k3) 
        a22 = self.rc0.submitAnswer(self.question_id, 10002, "my evidence", value=22, sender=t.k5) 

        self.assertEqual(a22, self.rc0.getAnswerID(self.question_id, keys.privtoaddr(t.k5), 22))

        err = False
        try:
            self.rc0.claimBond(a22)
        except TransactionFailed:
            err = True
        self.assertTrue("You can't claim the bond until the thing is finalized")

        self.s.block.timestamp = self.s.block.timestamp + 11
        self.rc0.finalize(self.question_id)
        self.assertEqual(self.rc0.getFinalAnswer(self.question_id), 10002)

        self.rc0.claimBond(a22)
        #self.assertEqual(self.rc0.balanceOf(keys.privtoaddr(t.k5)), 22, "Winner gets their bond back")
        self.assertEqual(self.rc0.balanceOf(keys.privtoaddr(t.k5)), 22)
        self.rc0.claimBond(a22)
        self.assertEqual(self.rc0.balanceOf(keys.privtoaddr(t.k5)), 22, "Calling to claim the bond twice is legal but it doesn't make you any richer")

        #self.assertEqual(self.rc0.getBalance(keys.privtoaddr(k5)), 22+10+1, "Winner should get sum of all wrong entries")


    def test_arbitration(self):

        pass 

if __name__ == '__main__':
    main()
