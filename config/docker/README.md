# Official ReDoc Docker Image

## Usage

### Docker

Serve remote spec by URL:

    docker run -it --rm -p 80:80 \
      -e SPEC_URL='http://localhost:8000/swagger.yaml' redocly/redoc

Serve local file:

    docker run -it --rm -p 80:80 \
      -v $(pwd)/demo/swagger.yaml:/usr/share/nginx/html/swagger.yaml \
      -e SPEC_URL=swagger.yaml redocly/redoc

Serve local file and watch for updates:

    docker run -it --rm -p 80:80 \
      -v $(pwd)/demo/:/usr/share/nginx/html/swagger/ \
      -e SPEC_URL=swagger/swagger.yaml redocly/redoc

### OpenShift

To quote [OpenShift Container Platform-Specific Guidelines](https://docs.openshift.com/container-platform/3.11/creating_images/guidelines.html#openshift-specific-guidelines):

> Support Arbitrary User IDs
>
> By default, OpenShift Container Platform runs containers using an arbitrarily assigned user ID. This provides additional security against processes escaping the container due to a container engine vulnerability and thereby achieving escalated permissions on the host node.
>
> For an image to support running as an arbitrary user, directories and files that may be written to by processes in the image should be owned by the root group and be read/writable by that group. Files to be executed should also have group execute permissions.

To comply with those requirements the `Dockerfile` contains instructions to adapt the rights for the folders:

- `/etc/nginx` because the `docker-run.sh` script modifies it at startup time
- `/usr/share/nginx/html` because the `docker-run.sh` script modifies it at startup time
- `/var/cache/nginx` because the Nginx process writes to it
- `/var/log/nginx` because the Nginx process writes to it
- `/var/run` because the Nginx process writes to it

Another issue with OpenShift is that the default exposed port `80` cannot be used as it is restricted. So one needs to use another port like `8080` (using the `PORT` configuration as described below), and then to configure the `container spec` accordingly.

## Runtime configuration options

- `PAGE_TITLE` (default `"ReDoc"`) - page title
- `PAGE_FAVICON` (default `"favicon.png"`) - URL to page favicon
- `BASE_PATH` (optional) - prepend favicon & standalone bundle with this path
- `SPEC_URL` (default `"http://petstore.swagger.io/v2/swagger.json"`) - URL to spec
- `PORT` (default `80`) - nginx port
- `REDOC_OPTIONS` (optional) - [`<redoc>` tag attributes](https://github.com/Redocly/redoc#redoc-tag-attributes)

## Build

    docker build -t redocly/redoc .
