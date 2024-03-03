setup: install db-migrate

install:
	npm install

db-migrate:
	npx knex migrate:latest

db-rollback:
	npx knex migrate:rollback --all

build:
	npm run build

start:
	heroku local -f Procfile.dev

start-backend:
	npm start -- --watch --verbose-watch --ignore-watch='node_modules .git .sqlite'

start-frontend:
	npx webpack --watch --progress

lint:
	npx eslint .
	
test-coverage:
	npm test -- --coverage --coverageProvider=v8

test:
	npm test -s
