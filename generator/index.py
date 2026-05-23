import json
import os
import random
import time
import boto3

simple_queue_service = boto3.client('sqs')

def handler(event, context):
    generated_event = {
        "stream_id": f"car_{random.randint(1, 100)}",
        "timestamp": int(time.time() * 1000),
        "latitude": round(59.3293 + (random.random() - 0.5) * 0.1, 4),
        "longitude": round(18.0686 + (random.random() - 0.5) * 0.1, 4),
        "speed_kmh": random.randint(30, 90)
    }

    try:
        simple_queue_service.send_message(
            QueueUrl=os.environ['QUEUE_URL'],
            MessageBody=json.dumps(generated_event)
        )
        return {
            "statusCode": 200,
            "body": json.dumps("Radar event successfully queued.")
        }
    except Exception as internal_server_error:
        print(f"Error logging event to SQS: {str(internal_server_error)}")
        return {"statusCode": 500, "body": str(internal_server_error)}