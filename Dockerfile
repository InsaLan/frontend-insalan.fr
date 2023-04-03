FROM alpine:latest

RUN apk --no-cache add wget nodejs

# CMD [ "cat", "/etc/resolv.conf" ]

RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -

RUN cat "$HOME/.shrc"

# Build from source
COPY . /src
WORKDIR /src
# TODO: freeze installed pnpm version (broken because of version incompability)
# RUN source "$HOME/.shrc" && pnpm i --frozen-lockfile && pnpm run notsc-build
RUN source "$HOME/.shrc" && pnpm i && pnpm run notsc-build

RUN cp -r /src/dist /dist
