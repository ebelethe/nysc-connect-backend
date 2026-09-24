
import jwt from "jsonwebtoken";
import { isTokenBlocked } from "../modules/auth/auth.model.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const blocked = await isTokenBlocked(token);
    if (blocked) {
      return res.status(401).json({ success: false, message: "Token has been logged out" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.token = token; // needed later if this same request wants to log out
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};