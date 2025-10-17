FROM node:20-alpine

# Build from source
COPY . /src
WORKDIR /src

ENTRYPOINT ["./entrypoint.sh"]
