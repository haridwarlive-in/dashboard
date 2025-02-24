"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { NewsDialog } from "./news-dialog"
import { useToast } from "@/hooks/use-toast"
import { News } from "@/types"
import axios from "axios";
import { DataTableColumnHeader } from "@/components/data-table/column-header"

const columns: ColumnDef<News>[] = [
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
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
]


export default function NewsPage() {
  const [data, setData] = useState<News[]>([])
  const [open, setOpen] = useState(false)
  const [selectedNews, setSelectedNews] = useState<News | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState("1")
  const { toast } = useToast()

  const fetchData = async () => {
    try{
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/news?page=${page}&limit=${limit}`, {
        withCredentials: true,
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("token") 
        }
      })
      const data = response.data
      setData(data.news)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit])

  const handleCreate = async (newNews: Omit<News, "id" | "createdAt">) => {
    try{
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/news`, newNews, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token") 
        },
        withCredentials: true
      })
      toast({
        title: "News created",
        description: "The news entry has been created successfully.",
      })
      setOpen(false)
    } catch (error) { 
      console.error(error)
    } finally {
      fetchData()
    }
  }

  const handleUpdate = async (updatedNews: News) => {
    try{
      await axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}/news/${updatedNews._id}`, updatedNews, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token") 
        },
        withCredentials: true
      })
      toast({
        title: "News updated",
        description: "The news entry has been updated successfully.",
      })
      setOpen(false)
    } catch (error) {
      console.error(error)
    } finally{
      fetchData()
    }
  }

  const handleDelete = async (id: string) => {
    try{
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/news/${id}`, {
        withCredentials: true,
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("token") 
        }
      })
      toast({
        title: "News deleted",
        description: "The news entry has been deleted successfully.",
      })
    } catch (error) {
      console.error(error)
    } finally {
      fetchData()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">News</h2>
          <p className="text-muted-foreground">
            Manage tourism news and updates
          </p>
        </div>
        <Button onClick={() => {
          setSelectedNews(null)
          setOpen(true)
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add News
        </Button>
      </div>
      <DataTable 
        columns={columns} 
        data={data}
        onEdit={(news: News) => {
          setSelectedNews(news)
          setOpen(true)
        }}
        setPage={setPage}
        setLimit={setLimit}
        onDelete={handleDelete}
        totalPages={totalPages}
        page={page}
      />
      <NewsDialog 
        open={open}
        onOpenChange={setOpen}
        onSubmit={selectedNews ? handleUpdate : handleCreate}
        defaultValues={selectedNews}
      />
    </div>
  )
}