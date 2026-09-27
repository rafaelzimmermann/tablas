#!/bin/bash
npx serve -l 3001 > server.log 2>&1 &
SERVER_PID=$!

# Wait for the server to be responsive
MAX_RETRIES=10
COUNT=0
while ! curl -s http://localhost:3001 > /dev/null; do
  sleep 1
  COUNT=$((COUNT+1))
  if [ $COUNT -ge $MAX_RETRIES ]; then
    echo "Server failed to start"
    kill $SERVER_PID
    exit 1
  fi
done

echo "Server started successfully"

npx playwright test --project=firefox

# Cleanup
kill $SERVER_PID
