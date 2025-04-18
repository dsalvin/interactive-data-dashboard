import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export type ChartType = 'line' | 'bar' | 'area' | 'pie';

interface ChartProps {
  type: ChartType;
  data: any[];
  xKey: string;
  yKeys: {
    key: string;
    color: string;
    name?: string;
  }[];
  title?: string;
  height?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Chart: React.FC<ChartProps> = ({
  type,
  data,
  xKey,
  yKeys,
  height = 300
}) => {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {yKeys.map((yKey, index) => (
              <Line
                key={yKey.key}
                type="monotone"
                dataKey={yKey.key}
                stroke={yKey.color || COLORS[index % COLORS.length]}
                name={yKey.name || yKey.key}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {yKeys.map((yKey, index) => (
              <Bar
                key={yKey.key}
                dataKey={yKey.key}
                fill={yKey.color || COLORS[index % COLORS.length]}
                name={yKey.name || yKey.key}
              />
            ))}
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {yKeys.map((yKey, index) => (
              <Area
                key={yKey.key}
                type="monotone"
                dataKey={yKey.key}
                fill={yKey.color || COLORS[index % COLORS.length]}
                stroke={yKey.color || COLORS[index % COLORS.length]}
                name={yKey.name || yKey.key}
              />
            ))}
          </AreaChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius="90%"
              fill="#8884d8"
              dataKey={yKeys[0].key}
              nameKey={xKey}
              label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;