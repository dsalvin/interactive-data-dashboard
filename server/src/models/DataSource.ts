import mongoose, { Document, Schema } from 'mongoose';

export interface IDataSource extends Document {
  name: string;
  type: 'api' | 'static' | 'database' | 'websocket';
  description: string;
  config: {
    url?: string;
    refreshInterval?: number;
    method?: string;
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
    staticData?: any;
    transformFunction?: string;
  };
  owner: mongoose.Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DataSourceSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['api', 'static', 'database', 'websocket'],
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    config: {
      url: String,
      refreshInterval: {
        type: Number,
        default: 60, // 60 seconds
      },
      method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'DELETE'],
        default: 'GET',
      },
      headers: {
        type: Map,
        of: String,
      },
      queryParams: {
        type: Map,
        of: String,
      },
      staticData: Schema.Types.Mixed,
      transformFunction: String, // JavaScript function as string to transform data
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDataSource>('DataSource', DataSourceSchema);