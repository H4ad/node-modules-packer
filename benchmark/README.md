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

First, install dependencies with:

```bash
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
| 0       | 39.13s  | 29.31 MB   |
| 1       | 37.59s  | 29.31 MB   |
| 2       | 36.18s  | 29.31 MB   |
| 3       | 36.36s  | 29.31 MB   |
| 4       | 36.09s  | 29.31 MB   |

Npm Prune (skipping restore) Results:

| (index) | endTime | outputSize |
|---------|---------|------------|
| 0       | 24.25s  | 29.31 MB   |
| 1       | 24.10s  | 29.31 MB   |
| 2       | 23.79s  | 29.31 MB   |
| 3       | 23.66s  | 29.31 MB   |
| 4       | 23.96s  | 29.31 MB   |

Node Modules Packer Results:

| (index) | endTime | outputSize |
|---------|---------|------------|
| 0       | 7.12s   | 17.44 MB   |
| 1       | 7.04s   | 17.44 MB   |
| 2       | 6.91s   | 17.44 MB   |
| 3       | 6.92s   | 17.44 MB   |
| 4       | 6.80s   | 17.44 MB   |

Summary:

| suite                        | endTime (mean)      | outputSize (mean)      |
|------------------------------|---------------------|------------------------|
| Npm Prune                    | 37.07s              | 29.31 MB               |
| Npm Prune (skipping restore) | 23.96s (55% faster) | 29.31 MB (0% lighter)  |
| Node Modules Packer          | 6.96s (432% faster) | 17.44 MB (68% lighter) |

So running this library without doing any optimization can give you a speed improvement of 432% and
reducing your zip file by 68%, you can further reduce the size of the zip [with a few more tweaks](./README.md#examples).

But, I don't know about you, but for me the big benefit is not having to run `npm prune --production`, 
I use Webstorm and this command makes my Webstorm re-index all node_modules making me lose more seconds of my life .
