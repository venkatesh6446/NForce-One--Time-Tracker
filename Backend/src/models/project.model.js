import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Project = sequelize.define(
  "Project",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE", "COMPLETED"),
      defaultValue: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

export default Project;