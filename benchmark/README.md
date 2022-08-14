# Benchmark

A wise man once said:

> Not trying to measure our members, so to speak, but you must log more data next time. @jets-fool, 2022.

And actions prove more than words, here are my numbers:

## About the suits

[NpmPrune](./npm-prune.js):

- Clean the dependencies with `npm prune --production`
- Zip the node_modules with `archiver`
- Restore the dependencies back (this can be skipped if you run on CI/CD)

[NpmPrune (skipping restore)](./npm-prune.js):

- Clean the dependencies with `npm prune --production`
- Zip the node_modules with `archiver`

[Node Modules Packer](./node-modules-packer.js):

- Just zip the node_modules, that's it.

## How to Run

First, install dependencies and build the library with:

```bash
# inside root folder
npm ci
npm run build
# inside benchmark folder
npm ci
```

Then run this script:

```bash
npm run benchmark
```

## Results

Setup: Ryzen 3 2200g, 32 GB 3200MHz, SSD m2 3500MB/s read, 3000MB/s write.

Npm Prune Results:

| (index) | endTime | outputSize |
|---------|---------|------------|
| 0       | 38.24s  | 29.31 MB   |
| 1       | 39.64s  | 29.31 MB   |
| 2       | 40.44s  | 29.31 MB   |
| 3       | 41.91s  | 29.31 MB   |
| 4       | 35.80s  | 29.31 MB   |

Npm Prune (skipping restore) Results:

| (index) | endTime | outputSize |
|---------|---------|------------|
| 0       | 23.56s  | 29.31 MB   |
| 1       | 28.76s  | 29.31 MB   |
| 2       | 23.43s  | 29.31 MB   |
| 3       | 23.22s  | 29.31 MB   |
| 4       | 23.09s  | 29.31 MB   |

Node Modules Packer Results:

| (index) | endTime | outputSize |
|---------|---------|------------|
| 0       | 7.48s   | 17.44 MB   |
| 1       | 7.07s   | 17.44 MB   |
| 2       | 7.04s   | 17.44 MB   |
| 3       | 7.28s   | 17.44 MB   |
| 4       | 7.39s   | 17.44 MB   |

Node Modules Packer (minified) Results:

| (index) | endTime | outputSize |
|---------|---------|------------|
| 0       | 10.13s  | 13.19 MB   |
| 1       | 10.03s  | 13.19 MB   |
| 2       | 9.99s   | 13.19 MB   |
| 3       | 10.45s  | 13.19 MB   |
| 4       | 10.38s  | 13.19 MB   |

Summary:

| suite                          | endTime (mean)       | outputSize (mean)       |
|--------------------------------|----------------------|-------------------------|
| Npm Prune                      | 39.21s               | 29.31 MB                |
| Npm Prune (skipping restore)   | 24.41s (61% faster)  | 29.31 MB (0% lighter)   |
| Node Modules Packer            | 7.25s (441% faster)  | 17.44 MB (~40% lighter) |
| Node Modules Packer (minified) | 10.20s (284% faster) | 13.19 MB (~55% lighter) |

So running this library without doing any optimization can give you a speed improvement of 441% (284% minified) and
reducing your zip file by ~40% (~55% minified), you can further reduce the size of the zip [with a few more tweaks](./README.md#examples).

But, I don't know about you, but for me the big benefit is not having to run `npm prune --production`,
I use Webstorm and this command makes my Webstorm re-index all node_modules making me lose more seconds of my life .
