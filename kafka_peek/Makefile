.PHONY: build up down logs test

build:
	podman compose build

up:
	podman compose up -d --build

down:
	podman compose down

logs:
	podman compose logs -f

test:
	@echo "Testing backend API..."
	curl -X POST localhost:8000/produce -H "Content-Type: application/json" -d '{"sensor_id":"kitchen-1","value":21.5,"message":"test reading"}'
	curl localhost:8000/messages
	@echo ""
	@echo "Frontend available at: http://localhost:3000"
	@echo "Kafka UI available at: http://localhost:8080"