import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatters';

const RecentTransactionsList = ({ transactions }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'transactionDate', direction: 'descending' });

  const sortedTransactions = useMemo(() => {
    if (!transactions) return [];
    let sortableItems = [...transactions];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [transactions, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  if (!transactions || transactions.length === 0) {
    return <p className="text-gray-500 italic">No recent transactions</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('transactionDate')}>
              <div className="flex items-center">
                Date
                {sortConfig.key === 'transactionDate' && (
                  <span className="ml-2">
                    {sortConfig.direction === 'ascending' ? '🔼' : '🔽'}
                  </span>
                )}
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Person
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedTransactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(transaction.transactionDate)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <Link
                  to={`/people/${transaction.personId}`}
                  className="text-blue-600 hover:text-blue-900 hover:underline text-sm font-medium"
                >
                  {transaction.Person?.name || 'Unknown'}
                </Link>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {transaction.description || '-'}
              </td>
              <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium text-right ${
                transaction.isMoneyReceived ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.isMoneyReceived ? '+' : '-'} {formatCurrency(Math.abs(transaction.amount))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentTransactionsList;
