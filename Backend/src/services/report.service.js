import TimeEntry from "../models/timeEntry.model.js";
import User from "../models/user.model.js";
import Project from "../models/project.model.js";
import Client from "../models/client.model.js";
import Task from "../models/task.model.js";
import Timesheet from "../models/timesheet.model.js";
import { Op } from "sequelize";

export const getEmployeeHoursReport = async (filters) => {
  const { startDate, endDate, userId, managerId, department, projectId } = filters;
  const whereClause = {};

  if (startDate && endDate) {
    whereClause.entryDate = { [Op.between]: [startDate, endDate] };
  }
  if (userId) whereClause.userId = userId;
  if (managerId) whereClause.managerId = managerId;
  if (projectId) whereClause.projectId = projectId;

  const entries = await TimeEntry.findAll({
    where: whereClause,
    include: [
      { model: User, attributes: ["id", "name", "email", "department"] },
      { model: User, as: "Manager", attributes: ["id", "name", "email"] },
      { model: Project, attributes: ["id", "name", "code"] },
      { model: Client, attributes: ["id", "name", "code"] },
      { model: Task, attributes: ["id", "title", "category"] },
    ],
    order: [["entryDate", "DESC"]],
  });

  return entries;
};

export const getProjectHoursReport = async (filters) => {
  const { startDate, endDate, projectId, clientId } = filters;
  const whereClause = {};

  if (startDate && endDate) {
    whereClause.entryDate = { [Op.between]: [startDate, endDate] };
  }
  if (projectId) whereClause.projectId = projectId;

  const entries = await TimeEntry.findAll({
    where: whereClause,
    include: [
      { model: Project, attributes: ["id", "name", "code", "status"] },
      { model: Client, attributes: ["id", "name", "code"] },
      { model: User, attributes: ["id", "name", "email"] },
    ],
    order: [["entryDate", "DESC"]],
  });

  return entries;
};

export const getUtilizationReport = async (filters) => {
  const { startDate, endDate, department } = filters;
  const whereClause = {};

  if (startDate && endDate) {
    whereClause.entryDate = { [Op.between]: [startDate, endDate] };
  }

  const users = await User.findAll({
    where: department ? { department } : {},
    include: [
      {
        model: TimeEntry,
        where: whereClause,
        required: false,
        attributes: ["hours", "isBillable"],
      },
    ],
  });

  const utilization = users.map((user) => {
    const entries = user.TimeEntries || [];
    const totalHours = entries.reduce((sum, e) => sum + Number(e.hours || 0), 0);
    const billableHours = entries
      .filter((e) => e.isBillable)
      .reduce((sum, e) => sum + Number(e.hours || 0), 0);
    const utilizationPercent = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
      totalHours,
      billableHours,
      nonBillableHours: totalHours - billableHours,
      utilizationPercent: Math.round(utilizationPercent * 100) / 100,
    };
  });

  return utilization;
};

export const getBillingSummary = async (filters) => {
  const { startDate, endDate, projectId, clientId } = filters;
  const whereClause = { isBillable: true };

  if (startDate && endDate) {
    whereClause.entryDate = { [Op.between]: [startDate, endDate] };
  }
  if (projectId) whereClause.projectId = projectId;
  if (clientId) whereClause.clientId = clientId;

  const entries = await TimeEntry.findAll({
    where: whereClause,
    include: [
      { model: Project, attributes: ["id", "name", "code"] },
      { model: Client, attributes: ["id", "name", "code"] },
    ],
  });

  const summary = {};
  entries.forEach((entry) => {
    const key = entry.clientId || "no-client";
    if (!summary[key]) {
      summary[key] = {
        clientId: entry.clientId,
        clientName: entry.Client?.name || "Unknown",
        projectId: entry.projectId,
        projectName: entry.Project?.name || "Unknown",
        totalHours: 0,
      };
    }
    summary[key].totalHours += Number(entry.hours || 0);
  });

  return Object.values(summary);
};

export const getTimesheetStatusReport = async (filters) => {
  const { startDate, endDate, userId, status } = filters;
  const whereClause = {};

  if (startDate && endDate) {
    whereClause.weekStartDate = { [Op.between]: [startDate, endDate] };
  }
  if (userId) whereClause.userId = userId;
  if (status) whereClause.status = status;

  return await Timesheet.findAll({
    where: whereClause,
    include: [
      { model: User, attributes: ["id", "name", "email", "department"] },
    ],
    order: [["weekStartDate", "DESC"]],
  });
};

export const getDashboardStats = async (userId, role) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let whereClause = {};
  let timesheetWhereClause = {};

  if (role === "EMPLOYEE") {
    whereClause.userId = userId;
    timesheetWhereClause.userId = userId;
  }

  const weekEntries = await TimeEntry.findAll({
    where: {
      ...whereClause,
      entryDate: { [Op.between]: [startOfWeek, endOfWeek] },
    },
  });

  const monthEntries = await TimeEntry.findAll({
    where: {
      ...whereClause,
      entryDate: { [Op.gte]: startOfMonth },
    },
  });

  const totalWeekHours = weekEntries.reduce((sum, e) => sum + Number(e.hours || 0), 0);
  const billableWeekHours = weekEntries
    .filter((e) => e.isBillable)
    .reduce((sum, e) => sum + Number(e.hours || 0), 0);
  const nonBillableWeekHours = totalWeekHours - billableWeekHours;

  const totalMonthHours = monthEntries.reduce((sum, e) => sum + Number(e.hours || 0), 0);

  const draftCount = weekEntries.filter((e) => e.status === "DRAFT").length;

  let pendingApprovals = 0;
  let teamData = [];

  if (role === "MANAGER" || role === "ADMIN") {
    const submittedEntries = await TimeEntry.findAll({
      where: { status: "SUBMITTED" },
      include: [{ model: User, attributes: ["id", "name", "email"] }],
    });
    pendingApprovals = submittedEntries.length;

    if (role === "MANAGER") {
      const teamMembers = await User.findAll({
        where: { managerId: userId },
        attributes: ["id", "name", "email"],
      });

      teamData = await Promise.all(
        teamMembers.map(async (member) => {
          const memberEntries = await TimeEntry.findAll({
            where: {
              userId: member.id,
              entryDate: { [Op.between]: [startOfWeek, endOfWeek] },
            },
          });
          const memberHours = memberEntries.reduce(
            (sum, e) => sum + Number(e.hours || 0),
            0
          );
          return {
            userId: member.id,
            name: member.name,
            email: member.email,
            weekHours: memberHours,
            entriesCount: memberEntries.length,
          };
        })
      );
    }
  }

  let adminStats = {};
  if (role === "ADMIN") {
    const totalUsers = await User.count({ where: { isActive: true } });
    const totalProjects = await Project.count({ where: { status: "ACTIVE" } });
    const totalClients = await Client.count({ where: { status: "ACTIVE" } });

    const allWeekEntries = await TimeEntry.findAll({
      where: { entryDate: { [Op.between]: [startOfWeek, endOfWeek] } },
    });
    const orgTotalHours = allWeekEntries.reduce(
      (sum, e) => sum + Number(e.hours || 0),
      0
    );

    adminStats = {
      totalUsers,
      totalProjects,
      totalClients,
      orgTotalHours,
    };
  }

  return {
    totalWeekHours: Math.round(totalWeekHours * 100) / 100,
    billableWeekHours: Math.round(billableWeekHours * 100) / 100,
    nonBillableWeekHours: Math.round(nonBillableWeekHours * 100) / 100,
    totalMonthHours: Math.round(totalMonthHours * 100) / 100,
    draftEntries: draftCount,
    pendingApprovals,
    teamData,
    ...adminStats,
  };
};
