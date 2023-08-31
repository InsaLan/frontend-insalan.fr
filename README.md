# Run the frontend in local

Install packages
`pnpm i`
Run the dev server
`pnpm run dev`

# Deploy the frontend

- (Temporary?) Add InsaLan trailer (or any video) as `src/assets/trailer.mp4`
- To use Docker, you will need to mount a volume to `/dist`
- ???
- Deploy the content of the volume you mounted as a static website!

## Copy-paste style

```sh
cp ~/Downloads/video.mp4 ./src/assets/trailer.mp4
docker build . -t insalan/frontend
docker run --rm -v dist:/dist insalan/frontend
docker run -p 8080:80 -v dist:/usr/share/nginx/html:ro nginx
```

You can now connect to [http://localhost:8080] and get your website o/
