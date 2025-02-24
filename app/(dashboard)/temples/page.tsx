"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { TempleDialog } from "./temple-dialog"
import { useToast } from "@/hooks/use-toast"
import { Temple } from "@/types"
import axios from "axios";
import { DataTableColumnHeader } from "@/components/data-table/column-header"

const columns: ColumnDef<Temple>[] = [
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
]


export default function TemplePage() {
  const [data, setData] = useState<Temple[]>([])
  const [open, setOpen] = useState(false)
  const [selectedTemple, setSelectedTemple] = useState<Temple | null>(null)
  const { toast } = useToast()

  const fetchData = async () => {
    try{
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/temples`)
      const data = response.data
      
      setData(data)
    } catch (error) {
      console.error(error)
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async (newTemple: Omit<Temple, "id" | "createdAt">) => {
    try{
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/temples`, newTemple, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token") 
        },
        withCredentials: true
      })
      toast({
        title: "Temple page created",
        description: "The temple entry has been created successfully.",
      })
      setOpen(false)
    } catch (error: any) { 
      console.error(error)
      toast({
        title: "Error",
        description: error.message
      })
    } finally {
      fetchData()
    }
  }

  const handleUpdate = async (updatedTemple: Temple) => {
    try{
      await axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}/temples/${updatedTemple._id}`, updatedTemple, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token") 
        },
        withCredentials: true
      })
      toast({
        title: "Temple page updated",
        description: "The temple entry has been updated successfully.",
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
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/temples/${id}`, {
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("token") 
        },
        withCredentials: true
      })
      toast({
        title: "Temple entry deleted",
        description: "The temple entry has been deleted successfully.",
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
          <h2 className="text-3xl font-bold tracking-tight">Temples</h2>
          <p className="text-muted-foreground">
            Manage tourism news and updates
          </p>
        </div>
        <Button onClick={() => {
          setSelectedTemple(null)
          setOpen(true)
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Temple
        </Button>
      </div>
      <DataTable 
        columns={columns} 
        data={data}
        onEdit={(temple: Temple) => {
          setSelectedTemple(temple)
          setOpen(true)
        }}
        onDelete={handleDelete}
      />
      <TempleDialog 
        open={open}
        onOpenChange={setOpen}
        onSubmit={selectedTemple ? handleUpdate : handleCreate}
        defaultValues={selectedTemple}
      />
    </div>
  )
}