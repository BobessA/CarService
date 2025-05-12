// src/components/orders/OrderTable.tsx

import React from 'react';
import { flexRender, ColumnDef, useReactTable } from "@tanstack/react-table";
import { OrderDetails } from "./OrderDetails";
import { OrderHeadersDTO } from "../../models/OrderHeadersDTO";
import { OfferDTO } from "../../models/offerDTO";
import { OrderItemsByOrderId } from "../../lib/types";

interface Props {
  table: ReturnType<typeof useReactTable<OrderHeadersDTO>>;
  columns: ColumnDef<OrderHeadersDTO>[];
  expandedOrderIds: number[];
  orderItemsByOrderId: OrderItemsByOrderId;
  selectedOffer: OfferDTO | null;
  onRowClick: (orderId: number, offerId: number) => void;
  onAddItemClick: (orderId: number) => void;
  currentUserId?: string;
}

export const OrderTable = ({
  table,
  columns,
  expandedOrderIds,
  orderItemsByOrderId,
  selectedOffer,
  onRowClick,
  onAddItemClick,
  currentUserId
}: Props) => {
  return (
    <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
      <thead className="bg-gray-100 text-gray-700">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className="px-4 py-3 font-medium cursor-pointer select-none"
                onClick={
                  header.column.getCanSort()
                    ? header.column.getToggleSortingHandler()
                    : undefined
                }
              >
                <div className="flex items-center">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {{
                    asc: " 🔼",
                    desc: " 🔽"
                  }[header.column.getIsSorted() as string] ?? null}
                </div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="text-gray-800">
        {table.getRowModel().rows.map((row) => (
          <React.Fragment key={row.id}>
            <tr
              className="even:bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
              onClick={() =>
                onRowClick(row.original.id, row.original.offerId)
              }
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2 whitespace-nowrap bg-red">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>

            {expandedOrderIds.includes(row.original.id) && (
              <tr>
                <td colSpan={columns.length}>
                  <OrderDetails
                    currUserId={currentUserId}
                    order={row.original}
                    selectedOffer={selectedOffer}
                    orderItems={orderItemsByOrderId[row.original.id]}
                    onAddItemClick={() => onAddItemClick(row.original.id)}
                  />
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}

        {table.getRowModel().rows.length === 0 && (
          <tr>
            <td
              colSpan={columns.length}
              className="px-4 py-6 text-center text-gray-500"
            >
              Nincs találat.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
