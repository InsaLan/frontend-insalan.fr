FROM alpine:latest

RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -

RUN ENV="$HOME/.shrc" SHELL="$(which sh)" pnpm i && pnpm build

CMD sh
