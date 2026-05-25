import boto3
import json
import os
import random
import time

simple_queue_service = boto3.client('sqs')
cluj_napoca_position = {
    "latitude": 46.77320,
    "longitude": 23.62222
}


def handler(event, context):
    generated_event = {
        "stream_id": f"car_{random.randint(0, 1_000_000)}",
        "timestamp": int(time.time() * 1000),
        "latitude": round(cluj_napoca_position["latitude"] + (random.random() - 0.5) * 0.1, 4),
        "longitude": round(cluj_napoca_position["longitude"] + (random.random() - 0.5) * 0.1, 4),
        "speed_kmh": round(random.triangular(1, 70, 25))  # kmph
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