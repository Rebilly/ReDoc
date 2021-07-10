# To run:
# docker build -t redoc .
# docker run -it --rm -p 80:80 -e SPEC_URL='http://localhost:8000/swagger.yaml' redoc
# Ensure http://localhost:8000/swagger.yaml is served with cors. A good solution is:
# npm i -g http-server
# http-server -p 8000 --cors

FROM node:alpine

RUN apk update && apk add --no-cache git

# Install dependencies
WORKDIR /build
COPY package.json package-lock.json /build/
RUN npm ci --no-optional --ignore-scripts

# copy only required for the build files
COPY src /build/src
COPY webpack.config.ts tsconfig.json custom.d.ts /build/
COPY typings/styled-patch.d.ts /build/typings/styled-patch.d.ts

RUN npm run bundle:standalone

FROM nginx:alpine

ENV PAGE_TITLE="ReDoc"
ENV PAGE_FAVICON="favicon.png"
ENV BASE_PATH=
ENV SPEC_URL="http://petstore.swagger.io/v2/swagger.json"
ENV PORT=80
ENV REDOC_OPTIONS=

# copy files to the nginx folder
COPY --from=0 build/bundles /usr/share/nginx/html
COPY config/docker/index.tpl.html /usr/share/nginx/html/index.html
COPY demo/favicon.png /usr/share/nginx/html/
COPY config/docker/nginx.conf /etc/nginx/
COPY config/docker/docker-run.sh /usr/local/bin

# Provide rights to the root group to write to nginx repositories (needed to run in OpenShift)
RUN chgrp -R 0 /etc/nginx && \
    chgrp -R 0 /usr/share/nginx/html && \
    chgrp -R 0 /var/cache/nginx && \
    chgrp -R 0 /var/log/nginx && \
    chgrp -R 0 /var/run && \
    chmod -R g+rwX /etc/nginx && \
    chmod -R g+rwX /usr/share/nginx/html && \
    chmod -R g+rwX /var/cache/nginx && \
    chmod -R g+rwX /var/log/nginx && \
    chmod -R g+rwX /var/run

EXPOSE 80

CMD ["sh", "/usr/local/bin/docker-run.sh"]
