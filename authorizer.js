const { CognitoJwtVerifier } = require("aws-jwt-verify");

// Verifier that expects valid access tokens:
const verifier = CognitoJwtVerifier.create({
  userPoolId: "us-east-1_M5JX6Jr7S",
  tokenUse: "id", // "access" or "id"
  clientId: "3flg1d1o7ppo10qfkhsuu0c41f",
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
    console.log("Token is valid. Payload:", JSON.stringify(payload));
    callback(null, generatePolicy("user", "Allow", event.methodArn));
  } catch (error) {
    console.log("Token not valid!");
    callback("Error: Invalid Token", JSON.stringify(error));
  }

  //   switch (token) {
  //     case "allow":
  //       callback(null, generatePolicy("user", "Allow", event.methodArn));
  //       break;
  //     case "deny":
  //       callback(null, generatePolicy("user", "Deny", event.methodArn));
  //       break;
  //     default:
  //       callback("Error: Invalid Token");
  //   }
};
