import {useReactTable,} from "@tanstack/react-table";
import { OrderHeadersDTO } from "../../models/OrderHeadersDTO";

export const Pagination = ({ table }: { table: ReturnType<typeof useReactTable<OrderHeadersDTO>> }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
      <div className="mb-2 sm:mb-0">
        Oldal {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
      </div>
      <div className="space-x-2">
        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Előző
        </button>
        <button
          className="px-4 py-1 bg-gray-200 rounded disabled:opacity-50"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Következő
        </button>
      </div>
    </div>
  );
};