import { NextFunction, Request, Response } from "express";
import usersService from "../services/users.service";
import { sendJsonSuccess, httpStatus } from "../helpers/response.helper";
import { CustomRequest } from "../helpers/multer.helper";
/**
 * Controller:
 * - Nhận request từ route
 * - NHận kết quả từ revice tương ứng
 * - Response lai cho client
 * - Không nên xử lý logic nghiệp vụ ở controller
 */
// Get all users
const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await usersService.getAll(req.query);
    sendJsonSuccess(
      res,
      users,
      httpStatus.OK.statusCode,
      httpStatus.OK.message
    );
  } catch (error) {
    next(error);
  }
};
//  Get user by id
const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    const { id } = req.params;
    const user = await usersService.getById(id);
    sendJsonSuccess(res, user, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};

// Create user
const Create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    const user = await usersService.create(payload);
    sendJsonSuccess(
      res,
      user,
      httpStatus.CREATED.statusCode,
      httpStatus.CREATED.message
    );
  } catch (error) {
    next(error);
  }
};
// Update user
const Update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const user = await usersService.updateById(id, payload);
    sendJsonSuccess(res, user, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};
// Delete user
const Delete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await usersService.deleteById(id);
    res.status(204).json({
      user,
      message: "users deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.fileValidationError) {
      res.status(400).json({ message: req.fileValidationError });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'File not uploaded' });
      return;
    }

    const { id } = req.params;
    const avatarUrl = `/uploads/${req.params.collectionName}/${req.file.filename}`;

    const updatedUser = await usersService.updateById(id, { avatarUrl });
    sendJsonSuccess(res, updatedUser, 200, "Avatar updated successfully");
  } catch (err) {
    next(err);
  }
};

export default {
  getAll,
  getById,
  Create,
  Update,
  Delete,
  uploadAvatar,
};
