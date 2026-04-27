import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.model.js"; // ✅ ADD THIS

const TimeEntry = sequelize.define(
  "TimeEntry",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // ✅ KEEP EXISTING FIELDS (NO CHANGE)
    project: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    task: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    entryDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    hours: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
    },

    isBillable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    status: {
      type: DataTypes.ENUM("DRAFT", "SUBMITTED", "APPROVED", "REJECTED"),
      defaultValue: "DRAFT",
    },
  },
  {
    tableName: "time_entries",
    timestamps: true,
  }
);

// ✅ 🔥 ADD RELATION HERE (VERY IMPORTANT)
TimeEntry.belongsTo(User, { foreignKey: "userId" });

export default TimeEntry;