import type { Model, Document } from 'mongoose';

export interface ADPBaseSchema {
  _id: string | { toString(): string };
}

export type ADPBaseModel = Model<ADPBaseSchema & Document & any>;
