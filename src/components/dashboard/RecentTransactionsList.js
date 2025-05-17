import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatters';

const RecentTransactionsList = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <p className="text-gray-500 italic">No recent transactions</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
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
          {transactions.map((transaction) => (
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
