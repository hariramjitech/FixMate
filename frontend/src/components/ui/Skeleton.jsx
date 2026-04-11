import React from 'react';

export const SkeletonRow = ({ cols = 5 }) => (
  <tr className="animate-pulse">
    {[...Array(cols)].map((_, i) => (
      <td key={i} className="py-4 px-6">
        <div className="h-4 bg-gray-100 rounded-lg w-full" />
      </td>
    ))}
  </tr>
);

export const SkeletonCard = ({ className }) => (
  <div className={`animate-pulse bg-gray-100 rounded-[2rem] ${className || 'h-32'}`} />
);

export const SkeletonList = ({ rows = 5, cols = 5 }) => (
  <tbody className="divide-y divide-gray-50">
    {[...Array(rows)].map((_, i) => (
      <SkeletonRow key={i} cols={cols} />
    ))}
  </tbody>
);

export default { SkeletonRow, SkeletonCard, SkeletonList };
