import { CustomError } from "../utils/functions.js";
import adminModel from "../models/adminModel.js";

export const verifyAdmin = async (req, res, next)=>{
  const adminName = req.headers.adminname;
  if (!adminName) return next(CustomError(401, "Admin name is required"));
  try {
    const admin = await adminModel.findOne({ name: adminName});
    if (!admin) return next(CustomError(400, "Admin does not exist"));
    next();
  } catch(error){
    return next(error);
  }
}