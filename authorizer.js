const { CognitoJwtVerifier } = require("aws-jwt-verify");

const COGNITO_USERPOOL_ID = process.env.COGNITO_USERPOOL_ID;
const COGNITO_WEB_CLIENT_ID = process.env.COGNITO_WEB_CLIENT_ID;

// Verifier that expects valid access tokens:
const verifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USERPOOL_ID,
  tokenUse: "id", // "access" or "id"
  clientId: COGNITO_WEB_CLIENT_ID,
});

const generatePolicy = (principalId, effect, resource) => {
  let authResponse = {};

  authResponse.principalId = principalId;
  if (effect && resource) {
    let policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: effect,
          Action: "execute-api:Invoke",
          Resource: resource,
        },
      ],
    };

    authResponse.policyDocument = policyDocument;
  }

  authResponse.context = {
    foo: "bar",
  };

  console.log(JSON.stringify(authResponse));

  return authResponse;
};

exports.handler = async (event, context, callback) => {
  // Lambda Authorizer code...

  let token = event.authorizationToken; // 'Allow' or 'Deny'

  try {
    const payload = await verifier.verify(
      token // the JWT as string
    );
    console.log("TOKEN", token);
    console.log("ok COGNITO_USERPOOL_ID", COGNITO_USERPOOL_ID);
    console.log("ok COGNITO_WEB_CLIENT_ID", COGNITO_WEB_CLIENT_ID);
    console.log("Token is valid. Payload:", JSON.stringify(payload));
    callback(null, generatePolicy("user", "Allow", event.methodArn));
  } catch (error) {
    console.log("TOKEN", token);
    console.log("COGNITO_USERPOOL_ID", COGNITO_USERPOOL_ID);
    console.log("COGNITO_WEB_CLIENT_ID", COGNITO_WEB_CLIENT_ID);
    console.log("Token not valid!");
    callback("Error: Invalid Token", JSON.stringify(error));
  }
};
