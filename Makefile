sync-db:
	yarn typeorm:generate
	yarn typeorm:migrate

run-prod:
	docker-compose build
	docker-compose up -d