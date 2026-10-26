.PHONY: build up up-tools down logs test

build:
	podman compose build

up:
	podman compose up -d --build

up-tools:
	podman compose --profile tools up -d --build

down:
	podman compose --profile tools down

logs:
	podman compose logs -f

test:
	@echo "Testing backend API..."
	curl -X POST localhost:8000/produce -H "Content-Type: application/json" -d '{"message":"hello,jolie"}'
	curl localhost:8000/messages
	@echo ""
	@echo "Frontend available at: http://localhost:3000"
	@echo "Kafka UI available at: http://localhost:8080 (if started with 'make up-tools')"