import Timesheet from "../models/timesheet.model.js";
import TimeEntry from "../models/timeEntry.model.js";
import User from "../models/user.model.js";
import ApprovalHistory from "../models/approvalHistory.model.js";
import * as notificationService from "../services/notification.service.js";

// ================= GET ALL TIMESHEETS =================
export const getAllTimesheets = async (whereClause = {}) => {
  return await Timesheet.findAll({
    where: whereClause,
    include: [
      {
        model: User,
        attributes: ["id", "name", "email"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

// ================= GET TIMESHEET BY ID =================
export const getTimesheetById = async (id) => {
  return await Timesheet.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ["id", "name", "email"],
      },
    ],
  });
};

// ================= GET TIMESHEETS BY USER =================
export const getTimesheetsByUser = async (userId) => {
  return await getAllTimesheets({ userId });
};

// ================= CREATE OR UPDATE TIMESHEET =================
export const generateTimesheet = async (userId, weekStartDate) => {
  const existing = await Timesheet.findOne({
    where: { userId, weekStartDate },
  });

  if (existing) {
    return existing;
  }

  // Calculate week end date (7 days later)
  const startDate = new Date(weekStartDate);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  // Get all time entries for this week
  const entries = await TimeEntry.findAll({
    where: {
      userId,
      entryDate: {
        gte: weekStartDate,
        lte: endDate,
      },
    },
  });

  const totalHours = entries.reduce(
    (sum, e) => sum + Number(e.hours || 0),
    0
  );
  const billableHours = entries
    .filter((e) => e.isBillable)
    .reduce((sum, e) => sum + Number(e.hours || 0), 0);

  return await Timesheet.create({
    userId,
    weekStartDate,
    weekEndDate: endDate,
    totalHours,
    billableHours,
    status: "DRAFT",
  });
};

// ================= SUBMIT TIMESHEET =================
export const submitTimesheet = async (timesheetId, userId, comment) => {
  const timesheet = await Timesheet.findOne({
    where: { id: timesheetId, userId },
    include: [{ model: User, attributes: ["id", "name", "email", "managerId"] }],
  });

  if (!timesheet) {
    throw new Error("Timesheet not found");
  }

  if (timesheet.status !== "DRAFT") {
    throw new Error("Only draft timesheets can be submitted");
  }

  timesheet.status = "SUBMITTED";
  timesheet.comment = comment || null;
  await timesheet.save();

  // Log approval history
  await ApprovalHistory.create({
    timesheetId: timesheet.id,
    actorId: userId,
    action: "SUBMITTED",
    comment,
  });

  // 🔔 NOTIFICATION: Notify manager about new submission
  if (timesheet.User?.managerId) {
    await notificationService.notifyTimesheetSubmitted({
      ...timesheet.toJSON(),
      userId: timesheet.userId,
      managerId: timesheet.User.managerId,
      User: timesheet.User,
    });
  }

  return timesheet;
};

// ================= APPROVE TIMESHEET =================
export const approveTimesheet = async (timesheetId, managerId, comment) => {
  const timesheet = await Timesheet.findByPk(timesheetId, {
    include: [{ model: User, attributes: ["id", "name", "email"] }],
  });

  if (!timesheet) {
    throw new Error("Timesheet not found");
  }

  if (timesheet.status !== "SUBMITTED") {
    throw new Error("Only submitted timesheets can be approved");
  }

  timesheet.status = "APPROVED";
  await timesheet.save();

  // Update all entries in the timesheet
  await TimeEntry.update(
    { status: "APPROVED" },
    {
      where: {
        userId: timesheet.userId,
        entryDate: {
          gte: timesheet.weekStartDate,
          lte: timesheet.weekEndDate,
        },
      },
    }
  );

  // Log approval history
  await ApprovalHistory.create({
    timesheetId: timesheet.id,
    actorId: managerId,
    action: "APPROVED",
    comment,
  });

  // 🔔 NOTIFICATION: Notify employee about approval
  await notificationService.notifyTimesheetApproved({
    ...timesheet.toJSON(),
    User: timesheet.User,
  });

  return timesheet;
};

// ================= REJECT TIMESHEET =================
export const rejectTimesheet = async (timesheetId, managerId, comment) => {
  if (!comment) {
    throw new Error("Rejection comment is mandatory");
  }

  const timesheet = await Timesheet.findByPk(timesheetId, {
    include: [{ model: User, attributes: ["id", "name", "email"] }],
  });

  if (!timesheet) {
    throw new Error("Timesheet not found");
  }

  if (timesheet.status !== "SUBMITTED") {
    throw new Error("Only submitted timesheets can be rejected");
  }

  timesheet.status = "REJECTED";
  await timesheet.save();

  // Update all entries in the timesheet
  await TimeEntry.update(
    { status: "REJECTED" },
    {
      where: {
        userId: timesheet.userId,
        entryDate: {
          gte: timesheet.weekStartDate,
          lte: timesheet.weekEndDate,
        },
      },
    }
  );

  // Log approval history
  await ApprovalHistory.create({
    timesheetId: timesheet.id,
    actorId: managerId,
    action: "REJECTED",
    comment,
  });

  // 🔔 NOTIFICATION: Notify employee about rejection
  await notificationService.notifyTimesheetRejected({
    ...timesheet.toJSON(),
    User: timesheet.User,
  });

  return timesheet;
};

// ================= WITHDRAW TIMESHEET =================
export const withdrawTimesheet = async (timesheetId, userId) => {
  const timesheet = await Timesheet.findOne({
    where: { id: timesheetId, userId },
  });

  if (!timesheet) {
    throw new Error("Timesheet not found");
  }

  if (timesheet.status !== "SUBMITTED") {
    throw new Error("Only submitted timesheets can be withdrawn");
  }

  timesheet.status = "DRAFT";
  await timesheet.save();

  // Log approval history
  await ApprovalHistory.create({
    timesheetId: timesheet.id,
    actorId: userId,
    action: "WITHDRAWN",
  });

  return timesheet;
};

// ================= GET APPROVAL HISTORY =================
export const getApprovalHistory = async (timesheetId) => {
  return await ApprovalHistory.findAll({
    where: { timesheetId },
    include: [
      {
        model: User,
        as: "Actor",
        attributes: ["id", "name", "email"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};
