FROM denoland/deno:alpine-1.18.0
WORKDIR /app
COPY . /app
RUN deno install -qAn vr https://deno.land/x/velociraptor@1.4.0/cli.ts
EXPOSE 80
RUN deno cache server.ts
CMD [ "vr run start" ]