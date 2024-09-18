#!/usr/bin/env bash
# exit on error
set -o errexit

# 설치
npm install

npx puppeteer browsers install chrome


npm run build  # 빌드가 필요한 경우 주석을 해제합니다.

# Puppeteer 캐시를 빌드 캐시에서 불러오기 또는 저장하기
if [[ ! -d $PUPPETEER_CACHE_DIR ]]; then
  echo "...Copying Puppeteer Cache from Build Cache"
  cp -R $XDG_CACHE_HOME/puppeteer/ $PUPPETEER_CACHE_DIR
else
  echo "...Storing Puppeteer Cache in Build Cache"
  cp -R $PUPPETEER_CACHE_DIR $XDG_CACHE_HOME
fi
