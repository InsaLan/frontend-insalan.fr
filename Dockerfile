FROM node:22-alpine

# Build from source
COPY . /src
WORKDIR /src

ENTRYPOINT ["./entrypoint.sh"]
