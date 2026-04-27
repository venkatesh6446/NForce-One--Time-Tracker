import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Client = sequelize.define("Client", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  phone: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
    defaultValue: "ACTIVE",
  },
}, {
  timestamps: true,
});

export default Client;