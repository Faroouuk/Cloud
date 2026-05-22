const {
  CognitoJwtVerifier,
} = require("aws-jwt-verify");

const verifier =
  CognitoJwtVerifier.create({
    userPoolId:
      "us-east-1_Q0fPIyORi",

    tokenUse: "id",

    clientId:
      "2hg6q80qu32gjt1pel0b0kmbhc",
  });

const authMiddleware = async (
  req,
  res,
  next
) => {
  try {
    const authHeader =
      req.headers.authorization;

    // Check Authorization header
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message:
          "Missing bearer token",
      });
    }

    // Extract token
    const token =
      authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message:
          "Missing bearer token",
      });
    }

    console.log("TOKEN:", token);

    // Verify JWT with Cognito
    const payload =
      await verifier.verify(token);

    console.log(
      "PAYLOAD:",
      payload
    );
    

    // Attach user to request
    req.user = payload;

    next();
  } catch (error) {
    console.error(
      "JWT ERROR:",
      error
    );

    return res.status(401).json({
      message: "Unauthorized",
      error: error.message,
    });
  }
};

module.exports = authMiddleware;