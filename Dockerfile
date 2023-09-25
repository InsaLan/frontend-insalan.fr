FROM alpine:latest

RUN apk --no-cache add wget nodejs npm

# CMD [ "cat", "/etc/resolv.conf" ]

# Build from source
COPY . /src
WORKDIR /src
# TODO: freeze installed pnpm version (broken because of version incompability)
# RUN source "$HOME/.shrc" && pnpm i --frozen-lockfile && pnpm run notsc-build

RUN cp -r /src/dist /dist
