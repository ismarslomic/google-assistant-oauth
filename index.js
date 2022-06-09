"use strict";

const {OAuth2Client} = require('google-auth-library');
const http = require('http');
const url = require('url');
const open = require('open');
const destroyer = require('server-destroy');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const clientSecretPath = process.env.CLIENT_SECRET || '/usr/src/config/client_secret.json';
let clientSecret;
const savedTokensPath = '/usr/src/config/tokens.json';

async function main() {
  validateClientSecretFile();
  clientSecret = require(clientSecretPath);
  const oAuth2Client = await getAuthenticatedClient();
  await oAuth2Client.getTokenInfo(oAuth2Client.credentials.access_token);
}

/**
 * Create a new OAuth2Client, and go through the OAuth2 content
 * workflow.  Return the full client to the callback.
 */
function getAuthenticatedClient() {
  const port = 3005;
  const serverBasePath = `http://localhost:${port}`;
  const callBackPath = '/oauth2callback';
  const callBackUrl = `${serverBasePath}${callBackPath}`

  return new Promise((resolve, reject) => {
    // Create an oAuth client to authorize the API call.
    const oAuth2Client = new OAuth2Client(clientSecret.installed.client_id,
        clientSecret.installed.client_secret, callBackUrl);

    // Generate the url that will be used for the consent dialog.
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/assistant-sdk-prototype',
    });

    const saveTokens = (tokens) => {
      // Save retrieved tokens
      mkdirp(path.dirname(savedTokensPath))
      .then(() => {
        fs.writeFile(savedTokensPath, JSON.stringify(tokens), () => {
          console.info(`Tokens saved to ${savedTokensPath}.`)
        });
      })
      .catch((error) => {
        console.error('Error saving tokens:', error.message);
      });
    };

    // Open a http server to accept the oauth callback.
    // The only request to our webserver is to /oauth2callback?code=<code>
    const server = http
    .createServer(async (req, res) => {
      try {
        if (req.url.indexOf(callBackPath) > -1) {
          // acquire the code from the querystring, and close the web server.
          const qs = new url.URL(req.url, serverBasePath).searchParams;
          const code = qs.get('code');

          console.log(`Code is ${code}`);

          // Inform user in their browser to return back to the console
          res.end('Authentication successful! Please return to the console.');

          // Destroy the http server
          server.destroy();

          // Now that we have the code, use that to acquire tokens.
          const r = await oAuth2Client.getToken(code);
          // Make sure to set the credentials on the OAuth2 client.
          oAuth2Client.setCredentials(r.tokens);

          console.info('Tokens acquired.');

          saveTokens(r.tokens);

          resolve(oAuth2Client);
        }
      } catch (e) {
        reject(e);
      }
    })
    .listen(port, () => {
      // Open the browser to the authorize url to start the workflow
      console.info('Go to this URL in your browser:', authorizeUrl);
      open(authorizeUrl, {wait: false}).then(cp => cp.unref());
    });
    destroyer(server);
  });
}

const checkFileExistsSync = (filepath) => {
  let exists = true;

  try {
    fs.accessSync(filepath, fs.constants.F_OK);
  } catch (e) {
    exists = false;
  }

  return exists;
};

const exitAndLogError = (errorMsg) => {
  console.log(`[ERROR] ${errorMsg}`)
  process.exit(1)
}

const readJsonFile = (filepath) => {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (e) {
    console.log(e);
    exitAndLogError(`Failed reading JSON file at path ${filepath}`)
  }
}

const validateClientSecretFile = () => {
  if (!checkFileExistsSync(clientSecretPath)) {
    exitAndLogError(
        `Client Secret file at path '${clientSecretPath}' does not exist.`)
  }

  const secretFileContent = readJsonFile(clientSecretPath).installed;

  if (secretFileContent.token_uri !== "https://oauth2.googleapis.com/token") {
    exitAndLogError(
        `The Client Secret file at path '${clientSecretPath}' has invalid 'token_uri' value. Expecting value 'https://oauth2.googleapis.com/token', but was '${secretFileContent.token_uri}'. Please make sure you download OAuth client file from GCP Console / API & Services / Credentials.`)
  }

  if (!secretFileContent.redirect_uris) {
    exitAndLogError(
        `The Client Secret file at path '${clientSecretPath}' is missing 'redirect_uris' property. Please make sure you download OAuth client file from GCP Console / API & Services / Credentials.`)
  }
}

main().catch(console.error);
