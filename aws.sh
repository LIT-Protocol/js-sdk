echo "Getting latest log stream..."
aws logs describe-log-streams \
  --log-group-name "artilleryio-log-group/artilleryio-cluster" \
  --profile lit-protocol \
  --region us-east-1 \
  --order-by LastEventTime \
  --descending \
  --max-items 1

echo "To get logs for a specific stream, run:"
echo "aws logs get-log-events --log-group-name \"artilleryio-log-group/artilleryio-cluster\" --log-stream-name \"STREAM_NAME_HERE\" --profile lit-protocol --region us-east-1"