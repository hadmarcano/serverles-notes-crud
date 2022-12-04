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

exports.handler = (event, context, callback) => {
  // Lambda Authorizer code...
  let token = event.authorizationToken; // 'Allow' or 'Deny'
  switch (token) {
    case "allow":
      callback(null, generatePolicy("user", "Allow", event.methodArn));
      break;
    case "deny":
      callback(null, generatePolicy("user", "Deny", event.methodArn));
      break;
    default:
      callback("Error: Invalid Token");
  }
};
