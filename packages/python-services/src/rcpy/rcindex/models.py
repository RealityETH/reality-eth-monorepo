from __future__ import unicode_literals

from django.db import models
from django.db import IntegrityError
from django.core import serializers
from django.db import connection

from datetime import datetime

import os

import json
import base64

import util

import rlp
from sha3 import keccak_256 # keccak, change before upgrading pysha >= 3.10

from binascii import unhexlify

import util
from django.utils import timezone

class EthBlock(models.Model):
	
    block_id = models.IntegerField(primary_key=True)
    block_ts = models.IntegerField()

    @staticmethod
    def EnsureStored(block_id, block_ts, rr=None):

        # TODO: If called without block_ts, fetch with getBlock

        try:
            ethblock = EthBlock.objects.get(pk=block_ts)
            # ts may have changed in reorg
            if ethblock.block_ts != block_ts:
                ethblock.block_ts = block_ts   
                ethblock.save()
        except EthBlock.DoesNotExist:
            ethblock = EthBlock(
                block_id = block_id,
                block_ts = block_ts
            )
            ethblock.save()
        return ethblock


# NB This may be initialized before we fetch the user and question text
class RCTemplate(models.Model):

    template_id = models.IntegerField(unique=True, editable=False, primary_key=True)
    block = models.ForeignKey(EthBlock, on_delete=models.CASCADE) # ethereum calls this blockNumber not block_id
    user = models.CharField(unique=False, max_length=42, null=True)
    question_text = models.TextField(null=True)

    @staticmethod
    def EnsureStored(template_id, rr):
        try:
            return RCTemplate.objects.get(pk=template_id)
        except RCTemplate.DoesNotExist:
            block_id = rr.call().templates(template_id)
            # print("got block_id %d" % (block_id))
            RCTemplate.LoadBlockRange(block_id, block_id, rr)
            return RCTemplate.objects.get(pk=template_id)

    @staticmethod
    def LoadBlockRange(from_block_num, to_block_num, rr):
        request_filter = rr.eventFilter('LogNewTemplate',{'fromBlock':int(from_block_num),'toBlock':to_block_num});
        logs = request_filter.get_all_entries()

        for l in logs:
            ethblock = EthBlock.EnsureStored(l['blockNumber'], 0, rr)
            #print(l)
            rctemplate = RCTemplate(
                template_id = l['args']['template_id'],
                user = l['args']['user'],
                question_text = l['args']['question_text'],
                block = ethblock
            )
            rctemplate.save()
        
        return


class RCQuestion(models.Model):

    # Fields populated from the initial event
    question_id = models.CharField(unique=True, editable=False, max_length=66, primary_key=True)
    user = models.CharField(unique=False, editable=False, max_length=42)
    template = models.ForeignKey(RCTemplate, on_delete=models.CASCADE) # event field is template_id
    question = models.TextField(editable=False, null=True)
    content_hash = models.CharField(unique=False, editable=False, max_length=66)
    arbitrator = models.CharField(unique=False, editable=False, max_length=42)
    timeout = models.IntegerField()
    opening_ts = models.IntegerField()
    nonce = models.CharField(unique=False, editable=False, max_length=66)
    created = models.IntegerField()
    block = models.ForeignKey(EthBlock, on_delete=models.CASCADE) # event field is block_num

    # Fields populated with the call, may change
    finalize_ts = models.IntegerField(null=True)
    is_pending_arbitration = models.BooleanField(null=True),
    bounty = models.CharField(unique=False, editable=True, max_length=66, null=True)
    history_hash = models.CharField(unique=False, editable=True, max_length=66, null=True)
    best_answer = models.CharField(unique=False, editable=True, max_length=66, null=True)
    bond = models.CharField(unique=False, editable=True, max_length=66, null=True)

    # Fields managing our sync process
    db_created_at = models.DateTimeField(auto_now_add=True)
    db_updated_at = models.DateTimeField(auto_now=True)
    db_refreshed_at = models.DateTimeField(null=True)

    @staticmethod
    def LoadBlockRange(min_block, max_block, rr):	
        request_filter = rr.eventFilter('LogNewQuestion',{'fromBlock':int(min_block),'toBlock':max_block});
        #request_filter = rr.pastEvents("LogNewQuestion", {'fromBlock': min_block, 'toBlock': max_block})
        logs = request_filter.get_all_entries()
        ts = int((datetime.utcnow() - datetime(1970, 1, 1)).total_seconds())
        for l in logs:
            #print(l)

            # the LogNewQuestion event logs its block timestamp so no need to a getBlock() call
            ethblock = EthBlock.EnsureStored( l['blockNumber'], l['args']['created'], rr )

            rctemplate = RCTemplate.EnsureStored(l['args']['template_id'], rr)
            
            # print("question:")
            # print(l['args']['question'])

            rcqreq = RCQuestion(
				question_id = util.formatHex(l['args']['question_id']),
				user = l['args']['user'],
				template = rctemplate,
				question = l['args']['question'],
				content_hash = util.formatHex(l['args']['content_hash']),
				arbitrator = l['args']['arbitrator'],
				timeout = l['args']['timeout'],
				opening_ts = l['args']['opening_ts'],
				nonce = l['args']['nonce'],
				created = l['args']['created'],
				block = ethblock
			)
            try:
                q = RCQuestion.objects.get(pk=rcqreq.question_id)
                print("already imported request with ID %s" % (rcqreq.question_id))
            except RCQuestion.DoesNotExist:
                rcqreq.save()
                pass

        return

    @staticmethod
    def RefreshUpdated(rr):
        sql = "select * from rcindex_rcquestion left outer join rcindex_rcanswer on rcindex_rcquestion.question_id=rcindex_rcanswer.question_id where db_refreshed_at is null or db_refreshed_at < rcindex_rcanswer.db_created_at group by rcindex_rcquestion.question_id;"
        questions = RCQuestion.objects.raw(sql)
        for q in questions:
            q.refresh(rr)

    def refresh(self, rr):

        Qi_content_hash = 0
        Qi_arbitrator = 1
        Qi_opening_ts = 2
        Qi_timeout = 3
        Qi_finalize_ts = 4
        Qi_is_pending_arbitration = 5
        Qi_bounty = 6
        Qi_best_answer = 7
        Qi_history_hash = 8
        Qi_bond = 9

        q_data = rr.call().questions(self.question_id)
        self.finalize_ts = q_data[Qi_finalize_ts]
        self.is_pending_arbitration = q_data[Qi_is_pending_arbitration]
        self.bounty = util.formatHex(q_data[Qi_bounty])
        self.best_answer = util.formatHex(q_data[Qi_best_answer])
        self.history_hash = util.formatHex(q_data[Qi_history_hash])
        self.bond = util.formatHex(q_data[Qi_bond])
        self.db_refreshed_at = timezone.now()
        self.save() 

class RCAnswer(models.Model):

	# Will be synthesized from question ID + bond
    answer_id = models.CharField(unique=True, editable=False, max_length=66, primary_key=True, null=False)
    answer = models.CharField(unique=False, editable=False, max_length=66, null=True)
    answer_commitment = models.CharField(unique=True, editable=False, max_length=66, null=True)
    question = models.ForeignKey(RCQuestion, on_delete=models.CASCADE)
    history_hash = models.CharField(unique=False, editable=False, max_length=66)
    user = models.CharField(unique=False, max_length=42)
    bond = models.CharField(editable=False, max_length=66)
    ts = models.IntegerField(editable=False)
    is_commitment = models.BooleanField()
    nonce = models.CharField(unique=False, editable=True, max_length=66, null=True)
    db_created_at = models.DateTimeField(auto_now_add=True)

    def generateID(self): 
        k = keccak_256()
        # TODO: Make sure this matches whatever we do in JavaScript when we need an answer id
        k.update(unhexlify(self.question_id[2:]) + unhexlify(self.bond[2:]))
        self.answer_id = "0x" + k.hexdigest()
        # print("made following a %s, q %s, b %s" % (self.question_id, self.bond, self.answer_id)) 

    @staticmethod
    def LoadBlockRange(min_block, max_block, rr):	
        request_filter = rr.eventFilter('LogNewAnswer',{'fromBlock':int(min_block),'toBlock':max_block});
        logs = request_filter.get_all_entries()
        ts = int((datetime.utcnow() - datetime(1970, 1, 1)).total_seconds())
        for l in logs:
            # print(util.formatHex(l['args']['question_id']) + ':' + util.formatHex(l['args']['history_hash']))

            ethblock = EthBlock.EnsureStored( l['blockNumber'], l['args']['ts'], rr )
            qid = util.formatHex(l['args']['question_id'])

            # We don't know what the block number of the question is, so don't try to fetch it if we don't have it
            # TODO: Work out what the refetch logic should look like
            try:
                q = RCQuestion.objects.get(pk=qid)
            except RCQuestion.DoesNotExist:
                print("skipping question with ID %s" % (qid))
                continue

            rcareq = RCAnswer(
                answer = util.formatHex(l['args']['answer']),
                answer_commitment = None,
				question = q,
                history_hash = util.formatHex(l['args']['history_hash']),
				user = l['args']['user'],
                bond = util.formatHex(l['args']['bond']),
                ts = l['args']['ts'],
                is_commitment = 0,
                # nonce = util.formatHex(l['args']['nonce'])
			)

            rcareq.generateID()
            try:
                rcareq = RCAnswer.objects.get(pk=rcareq.answer_id)
            except RCAnswer.DoesNotExist:
                rcareq.save()

        return


class RCIndexer():

    @staticmethod
    def LoadBlockRange(min_block, max_block, rr=None):

        # For testing we may pass in an rr contract instance
        if rr is None:
            rr = util.rr_instance()

        if max_block == 0:
            max_block = 'latest'

        if min_block == 0:
            min_block = rr.web3.eth.blockNumber - 100

        RCTemplate.LoadBlockRange(min_block, max_block, rr)
        RCQuestion.LoadBlockRange(min_block, max_block, rr)
        RCAnswer.LoadBlockRange(min_block, max_block, rr)
        RCQuestion.RefreshUpdated(rr)


class RCRequestAlreadyInProgressException(Exception):
    pass
