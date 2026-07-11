# Indexer setup

## Log watcher nginx log file

The log watcher reads a dedicated nginx access log to detect which chains are being queried.

### Create the log file

nginx writes as `www-data`. The log-watcher reads as the indexer user (currently `rcdev`).

```bash
# Directory and file are owned by www-data so nginx can write to them.
# Indexer user gets read access via group membership.
sudo chown www-data:rcdev /srv/rcdev/reality-eth-design/packages/indexer/logs
sudo chmod 750 /srv/rcdev/reality-eth-design/packages/indexer/logs
sudo touch /srv/rcdev/reality-eth-design/packages/indexer/logs/graphql-access.log
sudo chown www-data:rcdev /srv/rcdev/reality-eth-design/packages/indexer/logs/graphql-access.log
sudo chmod 640 /srv/rcdev/reality-eth-design/packages/indexer/logs/graphql-access.log
```

Replace `rcdev` with the actual indexer user if deploying under a different account.

If a dedicated group is preferred over using the indexer user's primary group:

```bash
sudo groupadd reality-logs
sudo usermod -aG reality-logs <indexer-user>
# Then substitute reality-logs for rcdev in the chown commands above.
```

### nginx config

Add a second `access_log` line to the graphql location block in the site config:

```nginx
location ~ ^/graphql(?:/([\d,]+))?$ {
    rewrite ^/graphql(?:/[\d,]+)?$ /graphql break;
    proxy_pass http://127.0.0.1:42070;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    access_log /srv/rcdev/reality-eth-design/packages/indexer/logs/graphql-access.log;
}
```

The existing server-level `access_log` is unaffected; this is an additional log containing only GraphQL requests.

No logrotate changes are needed — the file is outside `/var/log/nginx/` so the nginx logrotate stanza ignores it.

### watcher-config.json

`log_path` should match the path above. `always_active_chains` lists chains that are never put into lazy mode regardless of traffic. Tune `active_duration_hours`, `min_requests_to_activate`, and `min_distinct_ips` to taste once you have a feel for real traffic patterns.

### Running

```bash
# Start the indexer (writes sync.pid)
node sync.js

# Start the log watcher (reads sync.pid to signal sync.js)
node log-watcher.js
```

Both processes should be run as the indexer user and managed by systemd (see `reality-eth-ponder.service` for a template).
