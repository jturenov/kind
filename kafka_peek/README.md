# topic_peek

Web application with a Flask backend and HTML/JS frontend for sending messages to a Kafka topic and viewing the latest messages.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Compose Network                  │
│                                                              │
│  ┌──────────────────────┐          ┌───────────────────┐   │
│  │   Flask App (8000)   │          │   Kafka Broker    │   │
│  │                      │          │   (kraft mode)    │   │
│  │  GET  /              │          │                   │   │
│  │  GET  /health        │          │   Topic: "peek"   │   │
│  │  POST /produce       │◄────────►│                   │   │
│  │  GET  /messages      │          │   Port: 9092      │   │
│  │                      │          │                   │   │
│  └──────────────────────┘          └───────────────────┘   │
│           ▲                                                  │
│           │                                                  │
└───────────┼──────────────────────────────────────────────────┘
            │
            │ Port: 8000
            ▼
     ┌──────────────┐
     │   Client     │
     │   (curl)     │
     └──────────────┘
```

**Flow:**
1. Client sends POST to `/produce` with message
2. Flask app produces message to Kafka topic "peek"
3. Client requests GET `/messages`
4. Flask app consumes last 10 messages from Kafka and returns them

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

## Project Structure

```
kafka_peek/
├── backend/          # Flask API
│   ├── main.py      # API endpoints: /health, POST /produce, GET /messages
│   ├── requirements.txt  # flask, flask-cors, kafka-python
│   └── Dockerfile   # Python 3.12 slim image
├── frontend/        # Web UI
│   ├── index.html   # Main HTML page
│   ├── style.css    # Styling
│   ├── app.js       # Frontend logic (no Kafka dependency)
│   └── Dockerfile   # Nginx alpine image
└── compose.yaml     # Orchestrates kafka, backend, and frontend
```

## Features

**Frontend (http://localhost:3000)**
- Send custom messages to Kafka via form input
- View the last 10 messages from the topic
- Refresh messages on demand
- Clean, responsive UI

**Backend API (http://localhost:8000)**
- `GET /health` - Health check
- `POST /produce` - Send message to Kafka
- `GET /messages` - Retrieve last 10 messages

**Note:** Frontend communicates with Kafka only through the backend API - no direct Kafka dependency.

## Building and Running

**Requirements:** podman/docker with compose

```bash
# Build and start all services (kafka, backend, frontend)
make up

# Test the backend API
make test

# View logs
make logs

# Stop all services
make down
```

## Access Points

- **Frontend UI:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Kafka broker:** kafka:9092 (internal to compose network)

## Backend API Examples

```bash
# Send a custom message
curl -X POST http://localhost:8000/produce \
  -H “Content-Type: application/json” \
  -d '{“message”:”Hello Kafka!”}'

# Retrieve messages
curl http://localhost:8000/messages
```