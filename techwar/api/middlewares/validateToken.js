import { CustomError } from "../utils/functions.js";
import jwt from "jsonwebtoken"
import "dotenv/config"

const jwtSecret = process.env.JWT_SECRET;

export const validateToken = async (req, res, next)=>{
  const bearerToken = req.headers.authorization;
  if (!bearerToken) return next(CustomError(400, "Token is missing"));
  if (!bearerToken.startsWith('Bearer ')) return next(CustomError(401, "Invalid token."));
  const token = bearerToken.split(" ")[1];
  try {
    const decoded = jwt.verify(token, jwtSecret);
    const { teamId, lobbyId } = decoded;
    if (!teamId || !lobbyId) return next(CustomError(401, "Invalid token payload"));
    req.teamId = teamId;
    req.lobbyId = lobbyId;
    return next();
  } catch(error){
    return next(error);
  }
}