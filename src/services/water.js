import { WaterCollection } from '../db/models/water.js';

export const createWater = async (payload) => {
  let { amount, date, norm, userId, userNorm } = payload;

  if (!norm) {
    norm = userNorm;
  }

  const percentage = ((amount / (norm * 1000)) * 100).toFixed(2);
  const contact = await WaterCollection.create({
    amount,
    date,
    norm,
    percentage,
    owner: userId,
  });

  const { _id, owner, ...other } = contact._doc;
  const data = { id: _id, ...other };
  return data;
};

export const getWaterById = async (waterId, userId) => {
  const contact = await WaterCollection.findOne({
    _id: waterId,
    owner: userId,
  });

  if (!contact) return null;

  const { _id, owner, ...other } = contact._doc;
  const data = { id: _id, ...other };
  return data;
};

export const updateWaterById = async (
  waterId,
  userId,
  payload,
  options = {},
) => {
  const water = await getWaterById(waterId, userId);

  const {
    amount = water.amount,
    date = water.date,
    norm = water.norm,
  } = payload;

  const percentage = ((amount / (norm * 1000)) * 100).toFixed(2);

  const rawResult = await WaterCollection.findOneAndUpdate(
    { _id: waterId, owner: userId },
    { amount, date, norm, percentage },
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  const { _id, owner, ...other } = rawResult.value._doc;
  const data = { id: _id, ...other };
  return data;
};

export const deleteWaterById = async (waterId, userId) => {
  const water = await WaterCollection.findOneAndDelete({
    _id: waterId,
    owner: userId,
  });

  if (!water) return null;

  const { _id, owner, ...other } = water._doc;
  const data = { id: _id, ...other };
  return data;
};

export const getWaterPrDay = async (userId, timestamp) => {
  const date = new Date(timestamp * 1000);
  // We get the start of the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  // We get the end of the day
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Convert back to Unix timestamp
  const startOfDayTimestamp = Math.floor(startOfDay.getTime() / 1000);
  const endOfDayTimestamp = Math.floor(endOfDay.getTime() / 1000);

  const PerDay = await WaterCollection.find({
    owner: userId,
    date: {
      $gte: startOfDayTimestamp,
      $lte: endOfDayTimestamp,
    },
  }).lean();

  if (!PerDay || PerDay.length === 0) {
    return null;
  }

  // Remove the owner field
  const value = PerDay.map(({ _id, owner, ...rest }) => {
    return { id: _id, ...rest };
  });

  // Calculate the total values of amount and percentage
  const totalAmount = PerDay.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPercentage = PerDay.reduce(
    (acc, curr) => acc + curr.percentage,
    0,
  );

  return {
    value,
    totalAmount,
    totalPercentage,
  };
};

// Функція для отримання останнього дня місяця з урахуванням високосного року
const getLastDayOfMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getWaterPrMonth = async (userId, timestamp) => {
  const date = new Date(timestamp * 1000);

  // Отримуємо перший день місяця
  const firstDayOfMonth = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    1,
  );

  // Отримуємо останній день місяця з урахуванням високосного року
  const lastDayOfMonth = getLastDayOfMonth(
    date.getUTCFullYear(),
    date.getUTCMonth(),
  );

  // Конвертуємо в Unix timestamp
  const startOfDayOfMonthTimestamp = Math.floor(
    firstDayOfMonth.getTime() / 1000,
  );
  const endOfDayOfMonthTimestamp = Math.floor(
    new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      lastDayOfMonth,
    ).getTime() / 1000,
  );

  // Знаходимо записи для даного користувача за місяць
  const perDay = await WaterCollection.find({
    owner: userId,
    date: {
      $gte: startOfDayOfMonthTimestamp,
      $lte: endOfDayOfMonthTimestamp,
    },
  }).lean();

  // Якщо немає записів, повертаємо порожні значення
  if (!perDay || perDay.length === 0) {
    // Формуємо масив результатів з порожніми значеннями
    const result = Array.from({ length: lastDayOfMonth }, (_, i) => {
      const day = i + 1;
      return {
        date: Math.floor(
          new Date(
            Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), day),
          ).getTime() / 1000,
        ).toString(),
        amount: 0,
        percent: 0,
      };
    });

    return { result, length: result.length };
  }

  // Групуємо записи за днями
  const groupedByDate = {};
  perDay.forEach(({ date, amount, percentage }) => {
    const day = new Date(date * 1000).getUTCDate();
    if (!groupedByDate[day]) {
      groupedByDate[day] = {
        amount: 0,
        date: date,
        percent: 0,
      };
    }
    groupedByDate[day].amount += amount;
    groupedByDate[day].percent += percentage; // Додаємо відсоток для кожного прийому
  });

  // Формуємо масив результатів на основі кількості днів у місяці
  const result = Array.from({ length: lastDayOfMonth }, (_, i) => {
    const day = i + 1;
    const dayData = groupedByDate[day] || {
      amount: 0,
      date: Math.floor(
        new Date(
          Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), day),
        ).getTime() / 1000,
      ),
      percent: 0,
    };
    return {
      date: dayData.date.toString(),
      amount: dayData.amount,
      percent: parseFloat(dayData.percent.toFixed(2)), // Перетворюємо значення відсотка на число
    };
  });

  return { result, length: result.length };
};
