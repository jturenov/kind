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
	curl -X POST localhost:8000/produce -H "Content-Type: application/json" -d '{"message":"hello,jolie"}'
	curl localhost:8000/messages