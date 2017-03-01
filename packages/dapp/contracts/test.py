import unittest
from unittest import TestCase, main
from rlp.utils import encode_hex, decode_hex
from ethereum import tester as t
from ethereum.tester import TransactionFailed
from ethereum import keys
import time
from sha3 import sha3_256

import os

WORKING_ONLY = os.environ.get('WORKING_ONLY', False)

class TestRealityCheck(TestCase):

    def setUp(self):

        self.s = t.state()

        realitycheck_code = open('RealityCheck.sol').read()

        arb_code_raw = open('Arbitrator.sol').read()

        self.rc_code = realitycheck_code
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

    @unittest.skipIf(WORKING_ONLY, "Not under construction")
    def test_fund_increase(self):

        question = self.rc0.questions(self.question_id)
        self.assertEqual(question[6], 1000)

        self.rc0.fundAnswerBounty(self.question_id, value=500)
        question = self.rc0.questions(self.question_id)
        self.assertEqual(question[6], 1500)

    @unittest.skipIf(WORKING_ONLY, "Not under construction")
    def test_no_response_finalization(self):
        # Finalize should fail if too soon (same time case)
        with self.assertRaises(TransactionFailed):
            self.rc0.finalize(self.question_id)

        self.s.block.timestamp = self.s.block.timestamp + 1
        # Finalize should fail if too soon (somewhat later case
        with self.assertRaises(TransactionFailed):
            self.rc0.finalize(self.question_id)

        question = self.rc0.questions(self.question_id)

        self.s.block.timestamp = self.s.block.timestamp + 11
        self.rc0.finalize(self.question_id)

        question = self.rc0.questions(self.question_id)

        self.assertTrue(self.rc0.isFinalized(self.question_id))
        self.assertEqual(self.rc0.getFinalAnswer(self.question_id), 2)

        # submitAnswer should fail once finalized
        with self.assertRaises(TransactionFailed):
            self.rc0.submitAnswer(self.question_id, 12345, "my evidence") 

        

        return

    @unittest.skipIf(WORKING_ONLY, "Not under construction")
    def test_simple_response_finalization(self):

        self.rc0.submitAnswer(self.question_id, 12345, "my evidence") 

        self.s.block.timestamp = self.s.block.timestamp + 11
        self.rc0.finalize(self.question_id)

        self.assertTrue(self.rc0.isFinalized(self.question_id))
        self.assertEqual(self.rc0.getFinalAnswer(self.question_id), 12345)

        # You can only finalize once
        with self.assertRaises(TransactionFailed):
            self.rc0.finalize(self.question_id)


    @unittest.skipIf(WORKING_ONLY, "Not under construction")
    def test_conflicting_response_finalization(self):

        self.rc0.submitAnswer(self.question_id, 12345, "my evidence") 

        self.rc0.submitAnswer(self.question_id, 54321, "my conflicting evidence", value=10) 

        self.s.block.timestamp = self.s.block.timestamp + 11
        self.rc0.finalize(self.question_id)

        self.assertTrue(self.rc0.isFinalized(self.question_id))
        self.assertEqual(self.rc0.getFinalAnswer(self.question_id), 54321)

    @unittest.skipIf(WORKING_ONLY, "Not under construction")
    def test_bonds(self):

        self.rc0.submitAnswer(self.question_id, 12345, "my evidence") 

        # "You must increase from zero"
        with self.assertRaises(TransactionFailed):
            self.rc0.submitAnswer(self.question_id, 10001, "my conflicting evidence", value=0, sender=t.k3) 

        a1 = self.rc0.submitAnswer(self.question_id, 10001, "my conflicting evidence", value=1, sender=t.k3) 

        a5 = self.rc0.submitAnswer(self.question_id, 10002, "my evidence", value=5, sender=t.k4) 

        # You have to at least double
        with self.assertRaises(TransactionFailed):
            self.rc0.submitAnswer(self.question_id, 10003, "my evidence", value=6) 

        # You definitely can't drop back to zero
        with self.assertRaises(TransactionFailed):
            self.rc0.submitAnswer(self.question_id, 10004, "my evidence", value=0) 

        a10 = self.rc0.submitAnswer(self.question_id, 10005, "my evidence", value=10, sender=t.k3) 
        a22 = self.rc0.submitAnswer(self.question_id, 10002, "my evidence", value=22, sender=t.k5) 

        self.assertEqual(a22, self.rc0.getAnswerID(self.question_id, keys.privtoaddr(t.k5), 22))

        #You can't claim the bond until the thing is finalized
        with self.assertRaises(TransactionFailed):
            self.rc0.claimBond(a22)

        self.s.block.timestamp = self.s.block.timestamp + 11
        self.rc0.finalize(self.question_id)
        self.assertEqual(self.rc0.getFinalAnswer(self.question_id), 10002)

        k5bal = 22

        self.rc0.claimBond(a22)
        self.assertEqual(self.rc0.balanceOf(keys.privtoaddr(t.k5)), k5bal, "Winner gets their bond back")

        self.rc0.claimBond(a22)
        self.assertEqual(self.rc0.balanceOf(keys.privtoaddr(t.k5)), k5bal, "Calling to claim the bond twice is legal but it doesn't make you any richer")

        self.rc0.claimBond(a1)
        k5bal = k5bal + 1
        self.assertEqual(self.rc0.balanceOf(keys.privtoaddr(t.k5)), k5bal, "Winner can claim somebody else's bond if they were wrong")

        self.rc0.claimBond(a5)
        k4bal = 5

        self.assertEqual(self.rc0.balanceOf(keys.privtoaddr(t.k4)), k4bal, "If you got the right answer you get your money back, even if it was not the final answer")

    
        # You cannot withdraw more than you have
        with self.assertRaises(TransactionFailed):
            self.rc0.withdraw(k5bal + 1, sender=t.k5)

        self.rc0.withdraw(k5bal - 2, sender=t.k5)
        self.assertEqual(self.rc0.balanceOf(keys.privtoaddr(t.k5)), 2)

        self.rc0.withdraw(2, sender=t.k5)
        self.assertEqual(self.rc0.balanceOf(keys.privtoaddr(t.k5)), 0)


    def test_bounty(self):
        return

        a10 = self.rc0.submitAnswer(self.question_id, 10005, "my evidence", value=10, sender=t.k3) 
        a22 = self.rc0.submitAnswer(self.question_id, 10002, "my evidence", value=22, sender=t.k5) 

        self.s.block.timestamp = self.s.block.timestamp + 11
        self.rc0.finalize(self.question_id)

        self.rc0.claimBounty(question_id);        




    def test_arbitration(self):

        pass 

if __name__ == '__main__':
    main()
