import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/admin.js";
import {
  getOverview,
  listUsers,
  getUserDetail,
  getAIUsage,
  getSubscriptions,
  getReports,
  getAuditLogs,
  suspendUserAction,
  activateUserAction
} from "../controllers/admin.controller.js";

const router = Router();

// All admin routes require authentication and admin role
router.use(requireAuth);
router.use(requireAdmin);

// Overview
router.get("/overview", getOverview);

// Users
router.get("/users", listUsers);
router.get("/users/:userId", getUserDetail);
router.post("/users/:userId/suspend", suspendUserAction);
router.post("/users/:userId/activate", activateUserAction);

// AI Usage
router.get("/ai-usage", getAIUsage);

// Subscriptions
router.get("/subscriptions", getSubscriptions);

// Reports
router.get("/reports", getReports);

// Audit Logs
router.get("/audit-logs", getAuditLogs);

export default router;
