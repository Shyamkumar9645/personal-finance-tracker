import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getMonthName } from '../../utils/formatters';

const PersonChart = ({ data }) => {
  // Process data for chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group data by month
    const monthlyData = {};

    data.forEach(item => {
      const month = new Date(item.month).toISOString().substring(0, 7); // Format: YYYY-MM

      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          received: 0,
          given: 0
        };
      }

      if (item.isMoneyReceived) {
        monthlyData[month].received += parseFloat(item.total);
      } else {
        monthlyData[month].given += parseFloat(item.total);
      }
    });

    // Convert to array and sort by month
    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(item => ({
        ...item,
        // Add formatted month name for display
        monthName: getMonthName(new Date(item.month))
      }));
  }, [data]);

  if (chartData.length === 0) {
    return <p className="text-gray-500 text-center py-4">No transaction data available for charting</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="monthName" />
        <YAxis />
        <Tooltip
          formatter={(value) => [`$${value.toFixed(2)}`, '']}
          labelFormatter={(value) => `${value}`}
        />
        <Legend />
        <Bar dataKey="received" name="Money Received" fill="#10B981" />
        <Bar dataKey="given" name="Money Given" fill="#EF4444" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PersonChart;