FROM mockoon/cli:latest
ADD mockoon/api.json /data/api.json
ENTRYPOINT mockoon-cli start --disable-log-to-file --data /data/api.json --port 3000
