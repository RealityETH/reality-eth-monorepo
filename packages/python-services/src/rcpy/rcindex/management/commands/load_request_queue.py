from django.core.management.base import BaseCommand, CommandError
from rcindex.models import RCIndexer
from sha3 import sha3_256 # NB This will need to be keccak for > pysha3 1.0
from datetime import datetime
import requests
import json
from rlp.utils import encode_hex, decode_hex
import base64

class Command(BaseCommand):
    help = 'Request any queued items from the given block + time or higher'

    def add_arguments(self, parser):
        parser.add_argument('--min_block_height', type=int, required=True)
        parser.add_argument('--max_block_height', type=int, required=True)

    def handle(self, *args, **options):
        RCIndexer.LoadBlockRange(options['min_block_height'], options['max_block_height'])
