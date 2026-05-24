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
    error = False
    for _ in range(6):
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
        except Exception as internal_server_error:
            error = True
            print(f"Error logging event to SQS: {str(internal_server_error)}")
            break

        time.sleep(10)
    return {
        "body": json.dumps("Batch of radar events successfully queued.") \
            if error else json.dumps("Error when trying to dump an event batch")
    }
