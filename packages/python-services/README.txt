Reality Check Services
Edmund Edgar, 2018-06-29

This repo is for back-end services that support Realitio.
We intend to run this to create social media bots, search indexers and various other useful things.
The data that feeds it is just pulled in from the blockchain, it has no privileged access to anything except its social media accounts etc, feel free to run your own.

We assume you're running a node on localhost, we tested with Geth but it probably works with Parity.

You'll need python3, then do 
pip install -r requirements.txt

The DB is managed by Django. Make a database then configure it by making an rcpy/secrets.py
Then create the tables with 

cd src/rcpy
python manage.py migrate

Once you've got a database you can load the questions and answers so far, specifying the blocks you're interested in:
python manage.py load_request_queue --min_block_height=2409777 --max_block_height=2509777

Once that's running you can run a cron to just watch the latest 100 blocks:
python manage.py load_request_queue --min_block_height=0 --max_block_height=0

To run the twitter bot you'll need a Twitter account with api keys etc, also managed in secrets.py.
python manage.py tweet

To run everything in the background, do
python manage.py daemon

