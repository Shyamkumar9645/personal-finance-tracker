import React from 'react';

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-8 py-6">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </td>
    <td className="px-8 py-6">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </td>
    <td className="px-8 py-6">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
    </td>
    <td className="px-8 py-6 text-right">
      <div className="h-4 bg-gray-200 rounded w-1/4 ml-auto"></div>
    </td>
    <td className="px-8 py-6 text-right">
      <div className="flex items-center justify-end space-x-2">
        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
      </div>
    </td>
  </tr>
);

export default SkeletonRow;
