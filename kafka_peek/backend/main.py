import os
import json
import uuid
from datetime import datetime, timezone
from flask import Flask, jsonify, request
from flask_cors import CORS
from kafka import KafkaProducer, KafkaConsumer

BROKER = os.environ.get("KAFKA_BROKER", "localhost:9092")
TOPIC = os.environ.get("KAFKA_TOPIC", "peek")

app = Flask(__name__)
CORS(app)


@app.get("/")
def index():
    return "topic_peek is alive"


@app.get("/health")
def health():
    return jsonify(status="ok")


@app.post("/produce")
def produce():
    data = request.get_json(silent=True)
    if not data:
        return jsonify(error="Invalid JSON"), 400

    sensor_id = data.get("sensor_id")
    value = data.get("value")

    if not sensor_id:
        return jsonify(error="sensor_id is required"), 400
    if value is None:
        return jsonify(error="value is required"), 400

    try:
        value = float(value)
    except (TypeError, ValueError):
        return jsonify(error="value must be a number"), 400

    envelope = {
        "id": str(uuid.uuid4()),
        "sensor_id": sensor_id,
        "value": value,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "message": data.get("message", "")
    }

    producer = KafkaProducer(
        bootstrap_servers=BROKER,
        value_serializer=lambda v: json.dumps(v).encode()
    )
    producer.send(TOPIC, key=sensor_id.encode(), value=envelope)
    producer.flush()
    producer.close()
    return jsonify(sent=envelope)


@app.get("/messages")
def messages():
    consumer = KafkaConsumer(
        TOPIC,
        bootstrap_servers=BROKER,
        auto_offset_reset="earliest",
        consumer_timeout_ms=2000,
        value_deserializer=lambda v: json.loads(v.decode())
    )
    records = []
    for m in consumer:
        records.append({
            "key": m.key.decode() if m.key else None,
            "value": m.value,
            "kafka_timestamp": m.timestamp
        })
    consumer.close()
    return jsonify(messages=records[-10:])


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("BACKEND_PORT", "8000")))