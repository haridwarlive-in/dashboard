"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { AdvertisementDialog } from "./advertisement-dialog"
import { useToast } from "@/hooks/use-toast"
import { Advertisement } from "@/types"
import axios from "axios";
import { DataTableColumnHeader } from "@/components/data-table/column-header"
import useAuthStore from "@/store"

const columns: ColumnDef<Advertisement>[] = [
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


export default function AdvertisementPage() {

  const [data, setData] = useState<Advertisement[]>([])
  const [open, setOpen] = useState(false)
  const [selectedAdvertisement, setSelectedAdvertisement] = useState<Advertisement | null>(null)
  const { toast } = useToast();
  const {token} = useAuthStore();

  const fetchData = async () => {
    try{
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/advertisements`)
      const data = response.data
      
      setData(data)
    } catch (error) {
      console.error(error)
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [])

  if(!token) return null;

  const handleCreate = async (newAdvertisement: Omit<Advertisement, "id" | "createdAt">) => {
    try{
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/advertisements`, newAdvertisement, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        withCredentials: true
      })
      toast({
        title: "Advertisement created",
        description: "The advertisement entry has been created successfully.",
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

  const handleUpdate = async (updatedAdvertisement: Advertisement) => {
    try{
      await axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}/advertisements/${updatedAdvertisement._id}`, updatedAdvertisement, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        withCredentials: true
      })
      toast({
        title: "Advertisement updated",
        description: "The advertisement entry has been updated successfully.",
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
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/advertisements/${id}`, {
        headers: {
          "Authorization": "Bearer " + token
        },
        withCredentials: true
      })
      toast({
        title: "Advertisement entry deleted",
        description: "The advertisement entry has been deleted successfully.",
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
          <h2 className="text-3xl font-bold tracking-tight">Advertisements</h2>
          <p className="text-muted-foreground">
            Manage tourism news and updates
          </p>
        </div>
        <Button onClick={() => {
          setSelectedAdvertisement(null)
          setOpen(true)
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Advertisement
        </Button>
      </div>
      <DataTable 
        columns={columns} 
        data={data}
        onEdit={(advertisement: Advertisement) => {
          setSelectedAdvertisement(advertisement)
          setOpen(true)
        }}
        onDelete={handleDelete}
      />
      <AdvertisementDialog 
        open={open}
        onOpenChange={setOpen}
        onSubmit={selectedAdvertisement ? handleUpdate : handleCreate}
        defaultValues={selectedAdvertisement}
      />
    </div>
  )
}