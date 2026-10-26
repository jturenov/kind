# topic_peek

Small Flask app that sends messages to a Kafka topic and shows the latest ones.

## API Endpoints

### `GET /`
Health check endpoint.

**Response:** `"topic_peek is alive"`

### `GET /health`
Health status endpoint.

**Response:**
```json
{"status": "ok"}
```

### `POST /produce`
Produce a message to the Kafka topic.

**Request body (JSON):**
```json
{
  "message": "your custom message"
}
```

The `message` field is optional and defaults to `"hello"` if not provided.

**Response:**
```json
{"sent": "your custom message"}
```

**Examples:**
```bash
# Send a custom message
curl -X POST http://localhost:8000/produce \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Kafka!"}'

# Send with default message
curl -X POST http://localhost:8000/produce
```

### `GET /messages`
Retrieve the last 10 messages from the Kafka topic.

**Response:**
```json
{"messages": ["message1", "message2", "..."]}
```

**Example:**
```bash
curl http://localhost:8000/messages
```

## Build custom app

- `main.py`: Flask app with `/health`, `POST /produce` and `GET /messages`
- `requirements.txt`: flask, kafka-python
- `Dockerfile`: Python 3.12 slim image running the app on port 8000

## Building and running with podman compose

- `compose.yaml`: two services, `kafka` (single-node broker) and `app`
- Build and start: `make up`
- Send and read a message: `make test`
- Logs: `make logs`
- Stop: `make down`

Notes: the app reaches the broker at `kafka:9092` via the compose network.

short “problems I hit” section if you like (the Docker Hub pull limit and the switch to quay.io are good material), since teachers usually like that.