# Sidetree ION
This repository contains both Ion and Sidetree, along with a Dockerfile to create a Docker image for the Ion project that depends on the Sidetree project.

```
.
├── ion/
│   ├── ... (Ion project files and directories)
├── sidetree/
│   ├── ... (Sidetree project files and directories)
└── Dockerfile
```

## Dockerfile Overview
The Dockerfile does the following:

* Builds the Sidetree project by installing its dependencies, copying the source code, running the build process, and creating a tarball using npm pack.
* Builds the Ion project by installing its dependencies, copying the Sidetree tarball from the previous stage, installing the Sidetree package from the tarball, copying the Ion source code, and running the build process.
* Creates the final Ion image by installing the production dependencies and copying the built Ion project from the previous stage.



## Building the Docker Image
```
docker buildx build --platform linux/amd64 -f ./Dockerfile -t ion:1.0.6 . --load
```

After building the image, you can run a container from it and test the application as needed.

## To Test Locally

After building the image from the top level dockerfile, recall the tag that you generated for it.

In /ion/docker/docker-compose.yml change the image: to be your tag, eg - image: ion:1.0.6

To start ion with your local image running on the testnet run:
```
docker-compose -f docker-compose.yml -f docker-compose.testnet-override.yml up --build
```



