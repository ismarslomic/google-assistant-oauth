# google-assistant-oauth

[![Docker Image CI](https://github.com/ismarslomic/google-assistant-oauth/actions/workflows/docker-image.yml/badge.svg?branch=main)](https://github.com/ismarslomic/google-assistant-oauth/actions/workflows/docker-image.yml)
> Simple utility wrapped in Docker image for retrieving the OAuth 2.0 tokens for access to
> [Google Assistant Service](https://developers.google.com/assistant/sdk/overview#google_assistant_service).

## About

In order to access the
[Google Assistant Service](https://developers.google.com/assistant/sdk/overview#google_assistant_service)
you need to retrieve access and refresh tokens by using Google OAuth2 implementation, this is
explained in
[Google Authorization and Authentication documentation](https://developers.google.com/identity/protocols/oauth2/openid-connect)
.

This utility simplifies going through the OAuth2 flow and was created in the context of implementing
embedded Google Assistant for broadcasting message to Google Assistant enabled speakers,
see [ismarslomic/google-assistant-broadcast](https://github.com/ismarslomic/google-assistant-broadcast)
.

## Setup

### Prerequisites

- **docker** - you need to have Docker installed on your machine,
  read [Get Docker](https://docs.docker.com/get-docker/) for more information.
- **Google OAuth 2.0 Client ID** - in order to authenticate yourself and get access to your Google
  Assistant.
    - Follow steps **1-5**
      in [Configure an Actions Console project](https://developers.google.com/assistant/sdk/guides/service/python/embed/config-dev-project-and-account)
    - Make sure that you choose **"Device registration"** when creating new project in **Actions
      Console**
    - Rename the downloaded file **from** `client_secret_****.apps.googleusercontent.com.json` **
      to** `client_secret.json`

### Run docker container with `docker run`
Replace `/path/to/auth-folder` with full path to the folder where your `client_secret.json` file is
located. 

When docker container is terminated and the OAuth2 flow finished, you will find `tokens.json`
file produced in the same folder.

```bash
docker run --rm \
-p 3005:3005 \
-v /path/to/auth-folder:/usr/src/config \
ismarslomic/google-assistant-oauth:latest
```

Click on the URL provided in the console output from the Docker container.


