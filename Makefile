watch:
	./node_modules/webpack-dev-server/bin/webpack-dev-server.js --colors --progress --host=0.0.0.0

setup:
	npm install

build:
	NODE_ENV=production ./node_modules/webpack/bin/webpack.js -p
