from django.core.management.base import BaseCommand, CommandError
from rctwitter.models import Tweet

class Command(BaseCommand):
    help = 'Tweet stuff'

    def add_arguments(self, parser):
        parser.add_argument('--dry_run', action='store_true')
        parser.add_argument('--verbose', action='store_true')

    def handle(self, *args, **options):
        Tweet.TweetStuff(options['dry_run'], options['verbose'])
