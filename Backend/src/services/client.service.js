import Client from "../models/client.model.js";

// CREATE
export const createClient = async (data) => {
  return await Client.create(data);
};

// GET ALL
export const getAllClients = async () => {
  return await Client.findAll();
};

// UPDATE
export const updateClient = async (id, data) => {
  const client = await Client.findByPk(id);

  if (!client) {
    throw new Error("Client not found");
  }

  await client.update(data);
  return client;
};

// DELETE
export const deleteClient = async (id) => {
  const client = await Client.findByPk(id);

  if (!client) {
    throw new Error("Client not found");
  }

  await client.destroy();
  return { message: "Client deleted successfully" };
};