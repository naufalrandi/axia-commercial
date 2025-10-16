const { verifyToken } = require("../helpers/func");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  const token = req.headers["x-access-token"] || req.headers["authorization"];
  if (!token) return res.status(401).json({ errors: "Unauthenticated" }).end();

  try {
    const split = token.split(" ");
    const actualToken = split.length === 2 ? split[1] : token;
    const decoded = await verifyToken(actualToken);

    req.user = decoded;
    req.token = actualToken;

    next();
    return;
  } catch (error) {
    res.status(401).json({ error: "Invalid token" }).end();
  }
};

module.exports = authMiddleware;
