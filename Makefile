help:
	@grep -P '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

start-demo: run

run-demo: ## Run the webpack-dev-server
	npm run start-demo

build: clear ## Rollup build the project
	npm run build

clear: ## Clear dist directory
	npm run clear

test: ## Run whole tests
	npm run test

test-watch: ## Watch whole test suites
	npm run test:watch

lint: ## lint the code and check coding conventions
	echo "Running linter..."
	npm run lint

format: ## prettify the source code using prettier
	echo "Running prettier..."
	npm run format

serve: build ## Serve dist directory
	npm run serve
