import TimeEntry from "../models/timeEntry.model.js";
import User from "../models/user.model.js"; // ✅ ADD THIS

// ================= CREATE =================
export const createTimeEntry = async (data) => {
  return await TimeEntry.create(data);
};

// ================= GET ALL =================
export const getAllTimeEntries = async () => {
  return await TimeEntry.findAll({
    include: [
      {
        model: User,
        attributes: ["id", "name"], // ✅ FETCH USER NAME
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

// ================= GET BY USER =================
export const getEntriesByUser = async (userId) => {
  return await TimeEntry.findAll({
    where: { userId },
    include: [
      {
        model: User,
        attributes: ["id", "name"], // ✅ SAME HERE
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

// ================= GET BY ID =================
export const getTimeEntryById = async (id) => {
  return await TimeEntry.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ["id", "name"],
      },
    ],
  });
};

// ================= UPDATE =================
export const updateTimeEntry = async (id, data) => {
  const entry = await TimeEntry.findByPk(id);

  if (!entry) {
    throw new Error("Time entry not found");
  }

  await entry.update(data);
  return entry;
};

// ================= DELETE =================
export const deleteTimeEntry = async (id) => {
  const entry = await TimeEntry.findByPk(id);

  if (!entry) {
    throw new Error("Time entry not found");
  }

  await entry.destroy();
  return { message: "Time entry deleted successfully" };
};