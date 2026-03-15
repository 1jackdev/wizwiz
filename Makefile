SERVER_PORT=8054

.PHONY: install setup lint check-types test run-http create-migration migrate db-reset mobile-install mobile mobile-lint mobile-test

install:
	pdm install --no-self

setup: install pdm run pre-commit install

lint:
	pdm run pre-commit run --all-files

check-types:
	pdm run mypy src/app

test:
	cd src && pdm run pytest .

run-http:
	cd src && pdm run uvicorn app.http.main:app --reload --port $(SERVER_PORT)

create-migration:
	cd src && pdm run alembic revision --autogenerate -m "$(message)"

migrate:
	cd src && pdm run alembic upgrade head

db-reset:
	rm -f src/wizwiz.db && cd src && pdm run alembic upgrade head

mobile-install:
	cd mobile && npm install

mobile:
	cd mobile && npx expo start

mobile-lint:
	cd mobile && npm run lint

mobile-test:
	cd mobile && npm test -- --watchAll=false
