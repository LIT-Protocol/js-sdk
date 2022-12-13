#!/bin/zsh

rm -rf ./node_modules && 
rm -rf ./dist &&
rm -rf ./packages/constants/node_modules &&
rm -rf ./packages/constants/docs &&
rm -f ./packages/constants/yarn.lock &&

rm -rf ./packages/utils/node_modules &&
rm -rf ./packages/utils/dist &&
rm -f ./packages/utils/yarn.lock &&

rm -rf ./packages/core-browser/node_modules &&
rm -rf ./packages/core-browser/dist &&
rm -f ./packages/core-browser/yarn.lock &&

rm -rf ./apps/e2e/node_modules &&

rm -rf ./doc &&
rm -rf ./tmp &&
rm -f ./yarn-error.log &&
rm -f ./yarn.lock &&
rm -f ./package-lock.json &&
rm -f ./lerna-debug.log && 

rm -rf ./apps/demo-contracts-sdk-react/node_modules &&
rm -rf ./apps/demo-encrypt-decrypt-react/node_modules &&
rm -rf ./apps/demo-pkp-ethers-react/node_modules 