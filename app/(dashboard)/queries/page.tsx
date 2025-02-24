"use client";

import { DataTable } from "@/components/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import useAuthStore from "@/store";

type Query = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

const columns: ColumnDef<Query>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => (
      <span>{new Date(row.original.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
    )
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "subject",
    header: "Subject",
  },
];

export default function QueriesPage() {
  const [data, setData] = useState<Query[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<Query | null>(null);

  const {token} = useAuthStore();
  
  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/queries`, {
        withCredentials: true,
        headers: {
          "Authorization": "Bearer " + token
        }
      });
      const data = response.data;
      setData(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Queries</h2>
        <p className="text-muted-foreground">
          Manage tourist queries and support tickets
        </p>
      </div>
      <DataTable
        columns={columns}
        data={data}
        isQueryTable={true}
        onEdit={(query: Query) => {
          setQuery(query);
          setOpen(true);
        }}
      />
      <QueryView open={open} setOpen={setOpen} query={query as Query} />
    </div>
  );
}

const QueryView = ({
  open,
  setOpen,
  query,
}: {
  open: boolean;
  setOpen: (x: boolean) => void;
  query: Query;
}) => {
  if (!query) return null;

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 p-16 h-screen w-screen justify-center items-center ${
        open ? "flex" : "hidden"
      }`}
    >
      <div className="flex flex-col gap-2 w-auto max-h-[500px] rounded-lg bg-gray-50 shadow-xl border p-4 [&>div]:p-1 [&>div]:rounded-lg">
        {query.createdAt ? <div>{query.createdAt}</div> : null}
        <strong>Name</strong>
        <div>{query.name}</div>
        <strong>Email</strong>
        <div>{query.email}</div>
        <strong>Subject</strong>
        <div>{query.subject}</div>
        <strong>Message</strong>
        <div className="overflow-scroll">{query.message}</div>
        <div className="w-full flex justify-end">
          <Button
            onClick={() => setOpen(false)}
            className="mt-4 w-fit"
          >        
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
