CHANGES:

## [1.2.2](https://github.com/H4ad/node-modules-packer/compare/v1.2.1...v1.2.2) (2022-10-23)


### Bug Fixes

* **graceful-fs:** added to solve issues with too many open files ([58609ca](https://github.com/H4ad/node-modules-packer/commit/58609ca18ba0f962efbaa53d523650e18e8d5001))

## [1.2.1](https://github.com/H4ad/node-modules-packer/compare/v1.2.0...v1.2.1) (2022-09-11)


### Bug Fixes

* **index:** issues with win32 paths ([3ddcf0e](https://github.com/H4ad/node-modules-packer/commit/3ddcf0e3d0d8504a07cd83a79359eb8a364ba6c1))

# [1.2.0](https://github.com/H4ad/node-modules-packer/compare/v1.1.0...v1.2.0) (2022-08-14)


### Features

* **transformer:** added initial draft for transformer uglify ([c505b7e](https://github.com/H4ad/node-modules-packer/commit/c505b7e8aa591cd13d553fddba38d630a7fd7ac0))
* **zip:** added implementation with promises ([4634c31](https://github.com/H4ad/node-modules-packer/commit/4634c314f8454164dd1dfc0d9cc21a4e192f3178))

# [1.1.0](https://github.com/H4ad/node-modules-packer/compare/v1.0.2...v1.1.0) (2022-08-14)


### Bug Fixes

* **bin:** fixed problem with executable permission of dev and run ([84dcb6b](https://github.com/H4ad/node-modules-packer/commit/84dcb6b83a5fe3a969a2af3993a68f8e406ea3ce))


### Features

* **run:** added path remapping for --include flag ([f199462](https://github.com/H4ad/node-modules-packer/commit/f19946262dd8472b6b00b940e728cd1c6cd3ab99))

## [1.0.2](https://github.com/H4ad/node-modules-packer/compare/v1.0.1...v1.0.2) (2022-07-28)

## [1.0.1](https://github.com/H4ad/node-modules-packer/compare/v1.0.0...v1.0.1) (2022-07-28)

# 1.0.0 (2022-07-28)


### Features

* **extensions:** added more useless file extensions ([0a3b5c7](https://github.com/H4ad/node-modules-packer/commit/0a3b5c7e368a8fdea562c6faa0784b1827fc569c))
* **node-modules-packer:** added initial version of the cli ([185bed6](https://github.com/H4ad/node-modules-packer/commit/185bed6c6f89cb6476481aae16def3e6ee93a913))


### Performance Improvements

* **archiver:** removed archiver for yazl & fixed memory leak in tests ([3dbc585](https://github.com/H4ad/node-modules-packer/commit/3dbc5852c7d619e76fa74c366f542b104e98d7a1))
* **zip:** refactored to use another lib instead archiver ([d4d06f5](https://github.com/H4ad/node-modules-packer/commit/d4d06f57bb785197e86cb00f69a8e8317a3a801e))
