from django.core.management.base import BaseCommand, CommandError
from rcindex.models import RCIndexer
from rctwitter.models import Tweet
import time

class Command(BaseCommand):
    help = 'Request any queued items from the given block + time or higher'

    def handle(self, *args, **options):
        while True:
            RCIndexer.LoadBlockRange(0, 0)
            Tweet.TweetStuff(False, False)
            time.sleep(10)
