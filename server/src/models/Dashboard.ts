import mongoose, { Document, Schema } from 'mongoose';

export interface IDashboardWidget {
  id: string;
  type: string;
  title: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  dataSource: string;
  config: any;
}

export interface IDashboard extends Document {
  name: string;
  description: string;
  isPublic: boolean;
  owner: mongoose.Types.ObjectId;
  widgets: IDashboardWidget[];
  createdAt: Date;
  updatedAt: Date;
}

const DashboardSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    widgets: [
      {
        id: String,
        type: {
          type: String,
          enum: ['line', 'bar', 'area', 'pie', 'map', 'grid', 'number'],
          required: true,
        },
        title: String,
        position: {
          x: Number,
          y: Number,
          w: Number,
          h: Number,
        },
        dataSource: String,
        config: Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDashboard>('Dashboard', DashboardSchema);