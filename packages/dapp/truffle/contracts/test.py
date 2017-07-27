import unittest
from unittest import TestCase, main
from rlp.utils import encode_hex, decode_hex
from ethereum.tools import tester as t
from ethereum.tools.tester import TransactionFailed
from ethereum.tools import keys
import time
from sha3 import sha3_256
from hashlib import sha256

import os

# Command-line flag to skip tests we're not working on
WORKING_ONLY = os.environ.get('WORKING_ONLY', False)

QINDEX_ID = 0
QINDEX_ARBITRATOR = 1
QINDEX_STEP_DELAY = 2
QINDEX_QUESTION_TEXT = 3
QINDEX_BOUNTY = 4
QINDEX_ARBITRATION_BOUNTY = 5
QINDEX_IS_ARBITRATION_PAID_FOR = 6
QINDEX_IS_FINALIZED = 7
QINDEX_BEST_ANSWER_ID = 8

def ipfs_hex(txt):
    return sha256(txt).hexdigest()

def to_question_for_contract(txt):
    # to_question_for_contract(("my question")),
    return txt

def from_question_for_contract(txt):
    return txt

def to_answer_for_contract(txt):
    # to_answer_for_contract(("my answer")),
    return decode_hex(hex(txt)[2:].zfill(64))

def from_answer_for_contract(txt):
    return int(encode_hex(txt), 16)

class TestRealityCheck(TestCase):

    def setUp(self):

        self.c = t.Chain()

        realitycheck_code = open('RealityCheck.sol').read()
        arb_code_raw = open('Arbitrator.sol').read()
        client_code_raw = open('CallbackClient.sol').read()
        exploding_client_code_raw = open('ExplodingCallbackClient.sol').read()

        self.rc_code = realitycheck_code
        self.arb_code = arb_code_raw
        self.client_code = client_code_raw
        self.exploding_client_code = exploding_client_code_raw

        self.arb0 = self.c.contract(self.arb_code, language='solidity', sender=t.k0)
        self.c.mine()
        self.rc0 = self.c.contract(self.rc_code, language='solidity', sender=t.k0)

        self.c.mine()
        self.s = self.c.head_state

        self.question_id = self.rc0.askQuestion(
            to_question_for_contract(("my question")),
            self.arb0.address,
            10,
            value=1000
        )

        ts = self.s.timestamp
        self.s = self.c.head_state

        question = self.rc0.questions(self.question_id)
        self.assertEqual(int(question[QINDEX_ID]), int(ts))
        self.assertEqual(decode_hex(question[QINDEX_ARBITRATOR][2:]), self.arb0.address)

        self.assertEqual(question[QINDEX_STEP_DELAY], 10)
        self.assertEqual(question[QINDEX_QUESTION_TEXT], to_question_for_contract(("my question")))
        self.assertEqual(question[QINDEX_BOUNTY], 1000)

    @unittest.skipIf(WORKING_ONLY, "Not under construction")
    def test_question_id(self):
        expected_question_id = self.rc0.getQuestionID(
            to_question_for_contract(("my question")),
            self.arb0.address,
            10,
        )
        self.assertEqual(self.question_id, expected_question_id)

    def test_question_id_generation(self):
        regen_question_id = self.rc0.getQuestionID(
            to_question_for_contract(("my question")),
            self.arb0.address,
            10
        )
        self.assertEqual(regen_question_id, self.question_id)

    @unittest.skipIf(WORKING_ONLY, "Not under construction")
    def test_fund_increase(self):

        question = self.rc0.questions(self.question_id)
        self.assertEqual(question[QINDEX_BOUNTY], 1000)

        self.rc0.fundAnswerBounty(self.question_id, value=500)
        question = self.rc0.questions(self.question_id)
        self.assertEqual(question[QINDEX_BOUNTY], 1500)

    @unittest.skipIf(WORKING_ONLY, "Not under construction")
    def test_no_response_finalization(self):
        # Finalize should fail if too soon (same time case)
        with self.assertRaises(TransactionFailed):
            self.rc0.finalize(self.question_id, startgas=200000)

        self.s.timestamp = self.s.timestamp + 11
        # Finalize should fail if there is no answer
        with self.assertRaises(TransactionFailed):
            self.rc0.finalize(self.question_id, startgas=200000)

        return

    @unittest.skipIf(WORKING_ONLY, "Not under construction")
    def test_simple_response_finalization(self):

        self.rc0.submitAnswer(self.question_id, to_answer_for_contract(12345), to_question_for_contract(("my evidence")), value=1) 

        self.s.timestamp = self.s.timestamp + 11
        self.rc0.finalize(self.question_id)

        self.assertTrue(self.rc0.isFinalized(self.question_id))
        self.assertEqual(from_answer_for_contract(self.rc0.getFinalAnswer(self.question_id)), 12345)

        # You can only finalize once
        with self.assertRaises(TransactionFailed):
            self.rc0.finalize(self.question_id)

    @unittest.skipIf(WORKING_ONLY, "Not under construction")
    def test_earliest_finalization_ts(self):

        self.rc0.submitAnswer(self.question_id, to_answer_for_contract(12345), to_question_for_contract(("my evidence")), value=1) 
        ts1 = self.rc0.getEarliestFinalizationTS(self.question_id)

        self.s.timestamp = self.s.timestamp + 8
        self.rc0.submitAnswer(self.question_id, to_answer_for_contract(54321), to_question_for_contract(("my conflicting evidence")), value=10) 
        ts2 = self.rc0.getEarliestFinalizationTS(self.question_id)

        self.assertTrue(ts2 > ts1, "Submitting an answer advances the finalization timestamp") 

    @unittest.skipIf(WORKING_ONLY, "Not under construction")
    def test_conflicting_response_finalization(self):

        self.rc0.submitAnswer(self.question_id, to_answer_for_contract(12345), to_question_for_contract(("my evidence")), value=1) 

        self.rc0.submitAnswer(self.question_id, to_answer_for_contract(54321), to_question_for_contract(("my conflicting evidence")), value=10) 

        self.s.timestamp = self.s.timestamp + 11
        self.rc0.finalize(self.question_id)

        self.assertTrue(self.rc0.isFinalized(self.question_id))
        self.assertEqual(from_answer_for_contract(self.rc0.getFinalAnswer(self.question_id)), 54321)

    @unittest.skipIf(WORKING_ONLY, "Not under construction")
    def test_bonds(self):

        self.rc0.submitAnswer(self.question_id, to_answer_for_contract(12345), to_question_for_contract(("my evidence")), value=1) 

        # "You must increase from zero"
        with self.assertRaises(TransactionFailed):
            self.rc0.submitAnswer(self.question_id, to_answer_for_contract(10001), to_question_for_contract(("my conflicting evidence")), value=1, sender=t.k3, startgas=200000) 

        a1 = self.rc0.submitAnswer(self.question_id, to_answer_for_contract(10001), to_question_for_contract(("my conflicting evidence")), value=2, sender=t.k3, startgas=200000) 

        a5 = self.rc0.submitAnswer(self.question_id, to_answer_for_contract(10002), to_question_for_contract(("my evidence")), value=5, sender=t.k4, startgas=200000) 

        # You have to at least double
        with self.assertRaises(TransactionFailed):
            self.rc0.submitAnswer(self.question_id, to_answer_for_contract(10003), to_question_for_contract(("my evidence")), value=6, startgas=200000) 

        # You definitely can't drop back to zero
        with self.assertRaises(TransactionFailed):
            self.rc0.submitAnswer(self.question_id, to_answer_for_contract(10004), to_question_for_contract(("my evidence")), value=0, startgas=200000) 

        a10 = self.rc0.submitAnswer(self.question_id, to_answer_for_contract(10005), to_question_for_contract(("my evidence")), value=10, sender=t.k3, startgas=200000) 
        a22 = self.rc0.submitAnswer(self.question_id, to_answer_for_contract(10002), to_question_for_contract(("my evidence")), value=22, sender=t.k5, startgas=200000) 

        self.c.mine()
        self.s = self.c.head_state

        self.assertEqual(a22, self.rc0.getAnswerID(self.question_id, keys.privtoaddr(t.k5), 22))

        #You can't claim the bond until the thing is finalized
        with self.assertRaises(TransactionFailed):
            self.rc0.claimBond(a22, startgas=200000)

        self.s.timestamp = self.s.timestamp + 11
        self.rc0.finalize(self.question_id, startgas=200000)
        self.assertEqual(from_answer_for_contract(self.rc0.getFinalAnswer(self.question_id)), 10002)

        k5bal = 22

        self.rc0.claimBond(a22, startgas=200000)
        self.assertEqual(self.rc0.balanceOf(keys.privtoaddr(t.k5)), k5bal, "Winner gets their bond back")

        self.rc0.claimBond(a22, startgas=200000)
        self.assertEqual(self.rc0.balanceOf(keys.privtoaddr(t.k5)), k5bal, "Calling to claim the bond twice is legal but it doesn't make you any richer")

        self.rc0.claimBond(a1, startgas=200000)
        k5bal = k5bal + 2
        self.assertEqual(self.rc0.balanceOf(keys.privtoaddr(t.k5)), k5bal, "Winner can claim somebody else's bond if they were wrong")

        self.rc0.claimBond(a5, startgas=200000)
        k4bal = 5

        self.assertEqual(self.rc0.balanceOf(keys.privtoaddr(t.k4)), k4bal, "If you got the right answer you get your money back, even if it was not the final answer")

    
        # You cannot withdraw more than you have
        with self.assertRaises(TransactionFailed):
            self.rc0.withdraw(k5bal + 1, sender=t.k5, startgas=200000)

        self.rc0.withdraw(k5bal - 2, sender=t.k5)
        self.assertEqual(self.rc0.balanceOf(keys.privtoaddr(t.k5)), 2)

        self.rc0.withdraw(2, sender=t.k5)
        self.assertEqual(self.rc0.balanceOf(keys.privtoaddr(t.k5)), 0)

    @unittest.skipIf(WORKING_ONLY, "Not under construction")
    def test_bond_bulk_withdrawal(self):

        self.rc0.submitAnswer(self.question_id, to_answer_for_contract(12345), to_question_for_contract(("my evidence")), value=1) 

        a1 = self.rc0.submitAnswer(self.question_id, to_answer_for_contract(10001), to_question_for_contract(("my conflicting evidence")), value=2, sender=t.k3, startgas=200000) 
        a5 = self.rc0.submitAnswer(self.question_id, to_answer_for_contract(10002), to_question_for_contract(("my evidence")), value=5, sender=t.k4, startgas=200000) 

        a10 = self.rc0.submitAnswer(self.question_id, to_answer_for_contract(10005), to_question_for_contract(("my evidence")), value=10, sender=t.k3, startgas=200000) 
        a22 = self.rc0.submitAnswer(self.question_id, to_answer_for_contract(10002), to_question_for_contract(("my evidence")), value=22, sender=t.k5, startgas=200000) 

        self.c.mine()
        self.s = self.c.head_state

        self.assertEqual(a22, self.rc0.getAnswerID(self.question_id, keys.privtoaddr(t.k5), 22))

        self.s.timestamp = self.s.timestamp + 11
        self.rc0.finalize(self.question_id, startgas=200000)
        self.assertEqual(from_answer_for_contract(self.rc0.getFinalAnswer(self.question_id)), 10002)

        starting_bal = self.s.get_balance(keys.privtoaddr(t.k5))

        # Mine to reset the gas used to 0
        self.c.mine()
        self.s = self.c.head_state
        
        self.rc0.claimMultipleAndWithdrawBalance([self.question_id], [a22, a1], sender=t.k5, startgas=200000)
        gas_used = self.s.gas_used # Find out how much we used as this will affect the balance

        ending_bal = self.s.get_balance(keys.privtoaddr(t.k5))
        self.assertEqual(starting_bal+1000+2+22-gas_used, ending_bal)


    @unittest.skipIf(WORKING_ONLY, "Not under construction")
    def test_bounty(self):

        a10 = self.rc0.submitAnswer(self.question_id, to_answer_for_contract(10005), to_question_for_contract(("my evidence")), value=10, sender=t.k3) 
        a22 = self.rc0.submitAnswer(self.question_id, to_answer_for_contract(10002), to_question_for_contract(("my evidence")), value=22, sender=t.k5) 

        self.s.timestamp = self.s.timestamp + 11
        self.rc0.finalize(self.question_id)

        self.assertEqual( self.rc0.balanceOf(keys.privtoaddr(t.k5)), 0)
        self.rc0.claimBounty(self.question_id);        
        self.assertEqual( self.rc0.balanceOf(keys.privtoaddr(t.k5)), 1000)
        self.rc0.claimBounty(self.question_id);        
        self.assertEqual( self.rc0.balanceOf(keys.privtoaddr(t.k5)), 1000, "Claiming a bounty twice is legal, but you only get paid once")

    @unittest.skipIf(WORKING_ONLY, "Not under construction")
    def test_arbitration_with_supplied_answer(self):

        a10 = self.rc0.submitAnswer(self.question_id, to_answer_for_contract(10005), to_question_for_contract(("my evidence")), value=10, sender=t.k3, startgas=200000) 
        a22 = self.rc0.submitAnswer(self.question_id, to_answer_for_contract(10002), to_question_for_contract(("my evidence")), value=22, sender=t.k5, startgas=200000) 

        # This was the default of our arbitrator contract
        arb_fee = 100

        self.assertEqual(self.arb0.getFee(), arb_fee)
        self.assertFalse(self.rc0.requestArbitration(self.question_id, value=int(arb_fee * 0.8) ), "Cumulatively insufficient, so return false")
        self.assertFalse(self.rc0.isArbitrationPaidFor(self.question_id))

        self.assertTrue(self.rc0.requestArbitration(self.question_id, value=int(arb_fee * 0.3), startgas=200000 ), "Cumulatively sufficient, so return true")
        self.assertTrue(self.rc0.isArbitrationPaidFor(self.question_id))

        # Once arbitration is requested, we can no longer make a normal finalize request
        with self.assertRaises(TransactionFailed):
            self.rc0.finalize(self.question_id, startgas=200000)

        # Finalize with the wrong user
        with self.assertRaises(TransactionFailed):
            self.rc0.finalizeByArbitrator(a10, startgas=200000)
        
        self.assertFalse(self.rc0.isFinalized(self.question_id))
        self.arb0.finalizeByArbitrator(self.rc0.address, a10, startgas=200000)

        self.assertTrue(self.rc0.isFinalized(self.question_id))
        self.assertEqual(from_answer_for_contract(self.rc0.getFinalAnswer(self.question_id)), 10005)
        # int(arb_fee * 1.1)

        self.assertEqual(self.rc0.balanceOf(self.arb0.address), int(arb_fee * 1.1) )

        return

    @unittest.skipIf(WORKING_ONLY, "Not under construction")
    def test_arbitration_with_existing_answer(self):

        a10 = self.rc0.submitAnswer(self.question_id, to_answer_for_contract(10005), to_question_for_contract(("my evidence")), value=10, sender=t.k3, startgas=200000) 
        a22 = self.rc0.submitAnswer(self.question_id, to_answer_for_contract(10002), to_question_for_contract(("my evidence")), value=22, sender=t.k5, startgas=200000) 

        # This was the default of our arbitrator contract
        arb_fee = 100

        self.assertEqual(self.arb0.getFee(), arb_fee)
        self.assertFalse(self.rc0.requestArbitration(self.question_id, value=int(arb_fee * 0.8), startgas=200000 ), "Cumulatively insufficient, so return false")
        self.assertFalse(self.rc0.isArbitrationPaidFor(self.question_id))

        self.assertTrue(self.rc0.requestArbitration(self.question_id, value=int(arb_fee * 0.3), startgas=200000 ), "Cumulatively sufficient, so return true")
        self.assertTrue(self.rc0.isArbitrationPaidFor(self.question_id))

        self.assertEqual(self.rc0.balanceOf(self.arb0.address), 0)

        # Once arbitration is requested, we can no longer make a normal finalize request
        with self.assertRaises(TransactionFailed):
            self.rc0.finalize(self.question_id, startgas=200000)

        # Finalize with the wrong user
        with self.assertRaises(TransactionFailed):
            self.rc0.finalizeByArbitrator(a10, startgas=200000)
        
        self.assertFalse(self.rc0.isFinalized(self.question_id))
        self.arb0.finalizeByArbitrator(self.rc0.address, a10)

        self.assertTrue(self.rc0.isFinalized(self.question_id))
        self.assertEqual(self.rc0.getFinalAnswer(self.question_id), to_answer_for_contract(10005))

        self.assertEqual(self.rc0.balanceOf(self.arb0.address), int(arb_fee * 1.1) )
        #self.assertEqual(self.rc0.balanceOf(self.arb0.address), 1000, "Arbitrator gets the reward")

        return

    #@unittest.skipIf(WORKING_ONLY, "Not under construction")
    def test_callbacks(self):
     
        self.cb = self.c.contract(self.client_code, language='solidity', sender=t.k0)

        a10 = self.rc0.submitAnswer(self.question_id, to_answer_for_contract(10005), to_question_for_contract(("my evidence")), value=10, sender=t.k3, startgas=200000) 
        self.s.timestamp = self.s.timestamp + 11
        self.rc0.finalize(self.question_id, startgas=200000)
        self.assertTrue(self.rc0.isFinalized(self.question_id))

        self.rc0.fundCallbackRequest(self.question_id, self.cb.address, 3000000, value=100, startgas=200000)

        self.assertEqual(self.rc0.callback_requests(self.question_id, self.cb.address, 3000000), 100)

        # Fail an unregistered amount of gas
        with self.assertRaises(TransactionFailed):
            self.rc0.sendCallback(self.question_id, self.cb.address, 3000001, startgas=200000)

        self.assertNotEqual(self.cb.answers(self.question_id), to_answer_for_contract(10005))
        self.rc0.sendCallback(self.question_id, self.cb.address, 3000000)
        self.assertEqual(self.cb.answers(self.question_id), to_answer_for_contract(10005))
        
    @unittest.skipIf(WORKING_ONLY, "Not under construction")
    def test_exploding_callbacks(self):
     
        self.exploding_cb = self.c.contract(self.exploding_client_code, language='solidity', sender=t.k0)

        a10 = self.rc0.submitAnswer(self.question_id, to_answer_for_contract(10005), to_question_for_contract(("my evidence")), value=10, sender=t.k3) 
        self.s.timestamp = self.s.timestamp + 11
        self.rc0.finalize(self.question_id)
        self.assertTrue(self.rc0.isFinalized(self.question_id))

        self.rc0.fundCallbackRequest(self.question_id, self.exploding_cb.address, 3000000, value=100)
        self.assertEqual(self.rc0.callback_requests(self.question_id, self.exploding_cb.address, 3000000), 100)

        # Fail an unregistered amount of gas
        with self.assertRaises(TransactionFailed):
            self.rc0.sendCallback(self.question_id, self.exploding_cb.address, 3000001, startgas=200000)

        # should complete with no error, even though the client threw an error
        self.rc0.sendCallback(self.question_id, self.exploding_cb.address, 3000000) 
    
        


if __name__ == '__main__':
    main()
