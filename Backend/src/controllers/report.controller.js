import * as reportService from "../services/report.service.js";

export const getEmployeeHoursReport = async (req, res) => {
  try {
    const report = await reportService.getEmployeeHoursReport(req.query);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectHoursReport = async (req, res) => {
  try {
    const report = await reportService.getProjectHoursReport(req.query);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUtilizationReport = async (req, res) => {
  try {
    const report = await reportService.getUtilizationReport(req.query);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBillingSummary = async (req, res) => {
  try {
    const report = await reportService.getBillingSummary(req.query);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTimesheetStatusReport = async (req, res) => {
  try {
    const report = await reportService.getTimesheetStatusReport(req.query);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await reportService.getDashboardStats(req.user.id, req.user.role);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
