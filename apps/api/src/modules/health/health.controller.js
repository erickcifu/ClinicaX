import {
  getApiHealth,
  getDatabaseHealth,
} from "./health.service.js";

export function healthController(req, res) {
  const health = getApiHealth();

  return res.status(200).json({
    success: true,
    data: health,
  });
}

export async function databaseHealthController(req, res, next) {
  try {
    const health = await getDatabaseHealth();

    return res.status(200).json({
      success: true,
      data: health,
    });
  } catch (error) {
    next(error);
  }
}