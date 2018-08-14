help:
	@grep -P '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

run: ## Run the webpack-dev-server
	npm start

build: ## Webpack build the project
	rm -rf dist/
	mkdir -p dist
	npm run build
