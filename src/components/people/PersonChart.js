// PersonChart.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const PersonChart = ({ data }) => {
  const chartData = data.reduce((acc, transaction) => {
    const month = new Date(transaction.transactionDate).toLocaleString('default', { month: 'short' });
    const amount = parseFloat(transaction.amount);

    const entry = acc.find(e => e.month === month) || { month, received: 0, given: 0 };
    if (transaction.isMoneyReceived) {
      entry.received += amount;
    } else {
      entry.given += amount;
    }

    return acc.includes(entry) ? acc : [...acc, entry];
  }, []);

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis dataKey="month" />
          <YAxis tickFormatter={value => formatCurrency(value)} />
          <Tooltip formatter={value => formatCurrency(value)} />
          <Bar dataKey="received" fill="#4ade80" name="Received" />
          <Bar dataKey="given" fill="#f87171" name="Given" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PersonChart;
