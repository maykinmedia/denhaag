FROM mhart/alpine-node:14

ARG TZ=Europe/Amsterdam
ENV TZ Europe/Amsterdam

# Use `--no-cache` to get a smaller image, by removing unused files afterwards.
# The packages are sorted, one per line, to have better diffs in Git.
RUN \
    apk add --no-cache \
        bash \
        nano \
    && command -v bash \
    && command -v nano \
    && echo "$TZ" > /etc/timezone

ENV SHELL /bin/bash

ARG NPM_REGISTRY
ARG NPM_STRICT_SSL

RUN yarn config set enable-scripts false \
    && yarn config set enable-telemetry false \
    && yarn config set no-progress true \
    && ( test "${NPM_REGISTRY}" && yarn config set registry "${NPM_REGISTRY}" || true ) \
    && ( test "${HTTP_PROXY}" && yarn config set http-proxy "${HTTP_PROXY}" || true ) \
    && ( test "${HTTPS_PROXY}" && yarn config set https-proxy "${HTTPS_PROXY}" || true ) \
    && yarn cache clean --all 2> /dev/null

RUN mkdir -p /var/www \
    && addgroup -g 1000 node \
    && adduser \
        -D \
        -G node \
        -h /var/www \
        -s /bin/sh \
        -u 1000 \
        node \
    && chown -R node:node /var/www

USER node

WORKDIR /var/www

ADD --chown=node:node package.json yarn.lock ./

ARG NODE_ENV
ARG NPM_TOKEN
ARG HUSKY_SKIP_INSTALL=true

# For development, install `devDependencies`.

RUN if test "$NODE_ENV" = 'development'; \
then \
    yarn config set npm-auth-token "${NPM_TOKEN}" \
    && yarn install --frozen-lockfile \
    && yarn cache clean --all 2> /dev/null \
; fi
# TODO: remove auth token
    # && cp .yarnrc.backup .yarnrc \

# Altering the build directories should not trigger `yarn install`,
# that's why these are not in the same `mkdir` command.

RUN mkdir -p \
    /var/www/dist \
    /var/www/src

# A change in the codebase codebase should not cause a Docker cache miss during development,
# that would mean `yarn install` runs after every tiny change. Only changes to `yarn.lock`
# are relevant for development builds.

ADD --chown=node:node ./ /var/www/

# After building the application, remove the `devDependencies`
# for when NODE_ENV is "production" using a production mode install,
# leaving only the packages needed for production.

RUN if test "$NODE_ENV" != 'development'; \
then \
    echo "//registry.npmjs.org/:_authToken=\"${NPM_TOKEN}"\" > .npmrc \
    && NODE_ENV=development yarn install --frozen-lockfile \
    && yarn bootstrap \
    && yarn build \
    && NODE_ENV=development yarn install --frozen-lockfile --production \
    && rm .npmrc \
    && yarn cache clean --all 2> /dev/null \
; fi

# Build and remove the devDependencies in one Docker layer to keep image size small
# For production, install `devDependencies` to be able to execute `npm run build`,
# but remove the `devDependencies` immediately afterwards to keep the Docker layer small.

ARG BUILD_DATE
ARG VCS_REF
ARG VERSION

LABEL \
    org.label-schema.build-date="${BUILD_DATE}" \
    org.label-schema.description="Storybook for Den Haag Design System" \
    org.label-schema.name="den-haag-storybook" \
    org.label-schema.schema-version="1.0" \
    org.label-schema.url="https://github.com/nl-design-system/denhaag" \
    org.label-schema.usage="https://github.com/nl-design-system/denhaag/blob/master/README.md" \
    org.label-schema.vcs-ref="${VCS_REF}" \
    org.label-schema.vcs-url="https://github.com/nl-design-system/denhaag" \
    org.label-schema.vendor="Municipality of The Hague" \
    org.label-schema.version="${VERSION}"

# Add lowercase proxy settings for compatibility,
# but use uppercase exports for shellcheck compatibility.
# https://unix.stackexchange.com/a/212972
ENV \
    HTTP_PROXY=$HTTP_PROXY \
    HTTPS_PROXY=$HTTPS_PROXY \
    NO_PROXY=$NO_PROXY \
    http_proxy=$HTTP_PROXY \
    https_proxy=$HTTPS_PROXY \
    no_proxy=$NO_PROXY

ENTRYPOINT ["npm", "run"]

CMD ["start"]

