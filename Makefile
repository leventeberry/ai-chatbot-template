SHELL := /bin/sh

.PHONY: docker-dev docker-dev-build docker-up docker-down docker-logs

docker-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up

docker-dev-build:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

docker-up:
	docker compose up --build

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f
