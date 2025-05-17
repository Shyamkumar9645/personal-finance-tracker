// src/components/people/PersonChart.js
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { getMonthName } from '../../utils/formatters';

const PersonChart = ({ data }) => {
  const [chartType, setChartType] = useState('bar');

  // Process data for chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group data by month
    const monthlyData = {};

    data.forEach(item => {
      if (!item.transactionDate) return;

      const date = new Date(item.transactionDate);
      const month = date.toISOString().substring(0, 7); // Format: YYYY-MM

      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          received: 0,
          given: 0,
          net: 0
        };
      }

      const amount = parseFloat(item.amount || 0);
      if (item.isMoneyReceived) {
        monthlyData[month].received += amount;
      } else {
        monthlyData[month].given += amount;
      }

      // Calculate net amount
      monthlyData[month].net = monthlyData[month].received - monthlyData[month].given;
    });

    // Convert to array and sort by month
    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(item => ({
        ...item,
        // Add formatted month name for display
        monthName: getMonthName(new Date(item.month)),
        // Add short month name for display in small screens
        shortMonth: getMonthName(new Date(item.month)).substring(0, 3)
      }));
  }, [data]);

  if (chartData.length === 0) {
    return <p className="text-secondary-500 text-center py-4">No transaction data available for charting</p>;
  }

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="monthName"
                stroke="#64748b"
                tick={{ fontSize: 12 }}
                tickFormatter={(value, index) => window.innerWidth < 768 ? chartData[index].shortMonth : value}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${Math.abs(value)}`}
              />
              <Tooltip
                formatter={(value) => [`$${Math.abs(value).toFixed(2)}`, '']}
                labelFormatter={(value) => `${value}`}
                contentStyle={{
                  borderRadius: '0.5rem',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  fontSize: '0.875rem'
                }}
              />
              <Legend />
              <Bar dataKey="received" name="Money Received" fill="#22c55e" />
              <Bar dataKey="given" name="Money Given" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="monthName"
                stroke="#64748b"
                tick={{ fontSize: 12 }}
                tickFormatter={(value, index) => window.innerWidth < 768 ? chartData[index].shortMonth : value}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${Math.abs(value)}`}
              />
              <Tooltip
                formatter={(value) => [`$${Math.abs(value).toFixed(2)}`, '']}
                labelFormatter={(value) => `${value}`}
                contentStyle={{
                  borderRadius: '0.5rem',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  fontSize: '0.875rem'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="net" name="Net Balance" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="monthName"
                stroke="#64748b"
                tick={{ fontSize: 12 }}
                tickFormatter={(value, index) => window.innerWidth < 768 ? chartData[index].shortMonth : value}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${Math.abs(value)}`}
              />
              <Tooltip
                formatter={(value) => [`$${Math.abs(value).toFixed(2)}`, '']}
                labelFormatter={(value) => `${value}`}
                contentStyle={{
                  borderRadius: '0.5rem',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  fontSize: '0.875rem'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="received"
                name="Money Received"
                stackId="1"
                stroke="#22c55e"
                fill="#dcfce7"
              />
              <Area
                type="monotone"
                dataKey="given"
                name="Money Given"
                stackId="1"
                stroke="#ef4444"
                fill="#fee2e2"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex space-x-2 mb-4 justify-end">
        <button
          type="button"
          onClick={() => setChartType('bar')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md ${
            chartType === 'bar'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
          }`}
        >
          Bar
        </button>
        <button
          type="button"
          onClick={() => setChartType('line')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md ${
            chartType === 'line'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
          }`}
        >
          Line
        </button>
        <button
          type="button"
          onClick={() => setChartType('area')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md ${
            chartType === 'area'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
          }`}
        >
          Area
        </button>
      </div>
      {renderChart()}
    </div>
  );
};

export default PersonChart;