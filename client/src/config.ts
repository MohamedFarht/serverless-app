// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '07qwc0m114'
export const apiEndpoint = `https://${apiId}.execute-api.eu-central-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-x3ybeq6m.auth0.com', // Auth0 domain
  clientId: 'bjjNc0M9p4iWXj1C2dbyRwmG52TGrR08', // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
