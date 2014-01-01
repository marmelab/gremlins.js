BUILD_DIR=build

build: clean
	@(cd $(BUILD_DIR) && r.js -o build.js)

clean:
	@(rm gremlins.js)
