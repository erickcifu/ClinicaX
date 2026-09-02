import {
  getActiveRoles,
} from "./roles.service.js";

export async function listRolesController(
  req,
  res,
  next
) {
  try {
    const roles =
      await getActiveRoles();

    return res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    next(error);
  }
}