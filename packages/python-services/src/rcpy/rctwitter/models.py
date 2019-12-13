from __future__ import unicode_literals

from django.db import models
from datetime import datetime

import util
from django.utils import timezone
from sha3 import keccak_256
from binascii import unhexlify

import twitter
import json

import rcpy.secrets as SECRETS
from rcindex.models import RCQuestion, RCAnswer

class Tweet(models.Model):
	
    # Our ID of the thing we're tweeting about. 
    event_id = models.CharField(primary_key=True, max_length=66)
    # Twitter's ID after we tweet. We may be missing it if we crash mid-tweet, and only know we suceeded with a later duplicate warning from twitter
    twitter_id = models.CharField(primary_key=False, unique=True, max_length=32, null=True)
    # When we recorded the tweet
    tweeted_ts = models.DateTimeField()
    # The question_id of the question we're tweeting about
    question_id = models.CharField(unique=False, editable=False, max_length=66)    
    # The block as of which we tweeted. If we see an update with a later block, we'll tweet again
    block_id = models.IntegerField(primary_key=False)

    @staticmethod
    def TweetStuff(dry_run, is_verbose):

        # Get anything new question hasn't been tweeted.
        # Or anything that has been tweeted, but has since been updated since we last tweeted
        sql = "select * from rcindex_rcquestion left outer join (select question_id, max(block_id) as max_block_id from rctwitter_tweet group by question_id) t1 on rcindex_rcquestion.question_id=t1.question_id where rcindex_rcquestion.db_refreshed_at is not null and rcindex_rcquestion.db_refreshed_at > '2019-12-12' and ((t1.question_id is null) or (t1.max_block_id < rcindex_rcquestion.block_id));"
        

        questions = RCQuestion.objects.raw(sql)
        for q in questions:
            try:
                Tweet.MakeTweet(q, dry_run, is_verbose)
            except twitter.TwitterError as te:
                print("caught twitter error")
                print(te.message)

    def generateID(self):
        k = keccak_256()
        k.update(unhexlify(self.question_id[2:]) + bytes(self.block_id))
        self.event_id = "0x" + k.hexdigest()

    @staticmethod
    def MakeTweet(q, dry_run, is_verbose):
        api = twitter.Api(
            consumer_key=SECRETS.TWITTER_CONSUMER_KEY,
            consumer_secret=SECRETS.TWITTER_CONSUMER_SECRET,
            access_token_key=SECRETS.TWITTER_ACCESS_TOKEN_KEY,
            access_token_secret=SECRETS.TWITTER_ACCESS_TOKEN_SECRET
        )
        message = q.summaryString(280)
        t = Tweet(
            tweeted_ts = timezone.now(),
            question_id = q.question_id,
            block_id = q.block_id,
        )

        if is_verbose:
            print(message)

        if not dry_run:
            try:
                status = api.PostUpdate(message)
                t.twitter_id = status.id_str
            except twitter.TwitterError as te:
                # Catch this just so we can inspect the code from twitter, if it's a duplicate we still want to save a record
                # There may be a duplicate if we already tweeted and we crashed without recording it, so record it now. 
                # Sadly Twitter doesn't tell us the ID of the duplicate, so just leave that blank.
                # For any other twitter error, re-raise to the caller, which should print it to the console (or cron email) and go on to the next one.
                try: 
                    status = te.message
                    err_code = te.message[0]['code']
                    assert(err_code == 187)
                except:
                    raise te

            t.generateID()
            t.save()
            if is_verbose:
                print(status)
                print(t.event_id)
