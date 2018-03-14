# To run:
# docker build -t redoc .
# docker run -it --rm -p 8080:8080 -e API_URL='http://localhost:8000/swagger.yaml' redoc
# Ensure http://localhost:8000/swagger.yaml is served with cors. A good solutino is:
# npm i -g http-server
# http-server -p 8000 --cors

FROM node:carbon

ENV API_TITLE "ReDoc"
ENV API_URL "http://petstore.swagger.io/v2/swagger.json"
ENV PORT 8080

# install nginx
RUN apt-get update
RUN apt-get install nginx -y

# generate bundle
WORKDIR /build
RUN npm install -g yarn --loglevel=warn
COPY . /build
RUN yarn install --frozen-lockfile --ignore-optional --ignore-scripts
RUN npm run bundle

# copy files to the nginx folder
RUN cp bundles/* /usr/share/nginx/html
COPY index.tpl.html /usr/share/nginx/html/index.html
COPY nginx.conf /etc/nginx/
COPY docker-run.sh /usr/share/nginx/

EXPOSE 8080

CMD ["sh", "/usr/share/nginx/docker-run.sh"]
