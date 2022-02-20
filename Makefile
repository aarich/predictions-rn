RELEASE_NUM = 1-2
CHANNEL = prod-$(RELEASE_NUM)
DEST = NONE

build-finish:
	@echo "Resetting app.json"
	node scripts/resetConfig.js

build-prep:
	@echo "***************************"
	@echo " App Version Number: $(RELEASE_NUM)"
	@echo " Release Channel: $(CHANNEL)"
	@echo "***************************"
	@echo

	@echo "Updating app.json"
	node scripts/updateConfig.js $(RELEASE_NUM) $(DEST)

build-web:
	$(MAKE) build-prep DEST=WEB
	cp ./web/index.php ./web/index.html
	cp ./assets/images/icon.png ./web/banner.png
	-expo build:web
	mv ./web-build/index.html ./web-build/index.php
	rm ./web/index.html
	rm ./web/banner.png
	@osascript -e 'display notification "See terminal" with title "Attention Required"'
	-bash scripts/deploy.sh
	$(MAKE) build-finish

build-ios:
	$(MAKE) build-prep DEST=IOS
	-eas build -p ios --profile production --auto-submit --non-interactive --no-wait
	$(MAKE) build-finish

build-android:
	$(MAKE) build-prep DEST=ANDROID
	-eas build -p android --profile production --auto-submit --non-interactive --no-wait
	$(MAKE) build-finish

publish: build-prep
	expo publish --release-channel $(CHANNEL)
	$(MAKE) build-finish