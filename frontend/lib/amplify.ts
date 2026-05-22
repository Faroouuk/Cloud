import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_Q0fPIyORi",

      userPoolClientId: "2hg6q80qu32gjt1pel0b0kmbhc",

      loginWith: {
        email: true,
      },
    },
  },
});