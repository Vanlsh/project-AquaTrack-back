import { WaterCollection } from '../db/models/water.js';

export const createWater = async (payload) => {
  const { amount, date, norm } = payload;
  const percentage = ((amount / (norm * 1000)) * 100).toFixed(2);
  const contact = await WaterCollection.create({
    amount,
    date,
    norm,
    percentage,
  });

  const { _id, ...other } = contact._doc;
  const data = { id: _id, ...other };
  return data;
};

export const getWaterById = async (waterId, userId) => {
  const contact = await WaterCollection.findOne({ _id: waterId, userId });

  if (!contact) return null;

  const { _id, ...other } = contact._doc;
  const data = { id: _id, ...other };
  return data;
};

export const updateWaterById = async (
  waterId,
  // userId,
  payload,
  options = {},
) => {
  // const water = await getWaterById(waterId, userId);
  const water = await getWaterById(waterId);

  const {
    amount = water.amount,
    date = water.date,
    norm = water.norm,
  } = payload;

  const percentage = ((amount / (norm * 1000)) * 100).toFixed(2);

  // const rawResult = await WaterCollection.findOneAndUpdate(
  //   { _id: waterId, owner: userId },
  //   { amount, date, norm, percentage },
  //   {
  //     new: true,
  //     includeResultMetadata: true,
  //     ...options,
  //   },
  // );

  const rawResult = await WaterCollection.findOneAndUpdate(
    { _id: waterId },
    { amount, date, norm, percentage },
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  const { _id, ...other } = rawResult.value._doc;
  const data = { id: _id, ...other };
  return data;
};

export const deleteWaterById = async (waterId, userId) => {
  const water = await WaterCollection.findOneAndDelete({
    _id: waterId,
    // owner: userId,
  });

  if (!water) return null;

  const { _id, ...other } = water._doc;
  const data = { id: _id, ...other };
  return data;
};
