#!/bin/zsh

rm -rf ./node_modules && 
rm -rf ./dist &&
rm -rf ./packages/constants/node_modules &&
rm -rf ./packages/constants/docs &&
rm -f ./packages/constants/yarn.lock &&
rm -rf ./packages/utils/node_modules &&
rm -rf ./packages/utils/dist &&
rm -f ./packages/utils/yarn.lock &&
rm -rf ./packages/core/node_modules &&
rm -rf ./packages/core/dist &&
rm -f ./packages/core/yarn.lock &&
rm -rf ./doc &&
rm -rf ./tmp &&
rm -f ./yarn-error.log &&
rm -f ./yarn.lock