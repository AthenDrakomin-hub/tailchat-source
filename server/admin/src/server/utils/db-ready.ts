import mongoose from 'mongoose';

export function isDbReady() {
  return mongoose.connection.readyState === 1;
}
