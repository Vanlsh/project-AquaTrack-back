import createHttpError from 'http-errors';
import {
  createWater,
  getWaterById,
  updateWaterById,
  deleteWaterById,
} from '../services/water.js';

export const createWaterController = async (req, res) => {
  // const data = { ...req.body, userId: req.user.id };
  const data = { ...req.body };

  const water = await createWater(data);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a water!',
    data: water,
  });
};

export const getWaterByIdController = async (req, res, next) => {
  const { id } = req.params;
  // const userId = req.user.id;

  // const water = await getWaterById(id, userId);
  const water = await getWaterById(id);

  if (!water) {
    next(createHttpError(404, 'Water not found'));
    return;
  }

  res.status(200).json({
    status: 200,
    data: water,
    message: `Successfully found water with id ${id}!`,
  });
};

export const updateWaterController = async (req, res, next) => {
  const { id } = req.params;
  // const userId = req.user.id;
  const data = { ...req.body };

  // const result = await updateWaterById(id, userId, data);
  const result = await updateWaterById(id, data);

  if (!result) {
    next(createHttpError(404, 'Water not found'));
    return;
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully update a water!',
    data: result,
  });
};

export const deleteWaterController = async (req, res, next) => {
  const { id } = req.params;
  // const userId = req.user.id;

  // const water = await deleteWaterById(id, userId);
  const water = await deleteWaterById(id);

  if (!water) {
    next(createHttpError(404, 'Water not found'));
    return;
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully delete a water!',
    data: water,
  });
};
