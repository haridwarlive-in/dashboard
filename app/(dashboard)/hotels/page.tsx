"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Hotel, Owner, OwnerFormDataType, Temple } from "@/types"
import axios from "axios";
import { HotelDialog } from "./hotel-dialog"
import { DataTableColumnHeader } from "@/components/data-table/column-header"
import useAuthStore from "@/store"
import { redirect } from "next/navigation"

const columns: ColumnDef<Hotel>[] = [
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

export default function HotelsPage() {
  const [data, setData] = useState<Hotel[]>([])
  const [open, setOpen] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const { toast } = useToast()

  const {token, collaborator} = useAuthStore();

  const fetchData = async () => {
    try{
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/hotels`, {
        withCredentials: true,
        headers: {
          "Authorization": "Bearer " + token
        }
      })
      const data = response.data
      setData(data)
    } catch (error) {
      console.error(error)
    }
  }
  
  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if(collaborator) {
    redirect('/login')
  };

  const handleCreate = async (newHotel: Omit<Hotel, "id" | "createdAt">) => {
    try{
      const hotel = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/hotels`, newHotel, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        withCredentials: true
      })

      toast({
        title: "Hotel created",
        description: "The hotel entry has been created successfully.",
      })
      setOpen(false)
    } catch (error) { 
      console.error(error)
    } finally {
      fetchData()
    }
  }

  const handleUpdate = async (updatedHotel: Hotel) => {
    try{
      await axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}/hotels/${updatedHotel._id}`, updatedHotel, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        withCredentials: true
      })

      toast({
        title: "Hotel updated",
        description: "The hotel entry has been updated successfully.",
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
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/hotels/${id}`, {
        withCredentials: true,
        headers: {
          "Authorization": "Bearer " + token
        }
      })
      toast({
        title: "Hotel entry deleted",
        description: "The hotel entry has been deleted successfully.",
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
          <h2 className="text-3xl font-bold tracking-tight">Hotels</h2>
          <p className="text-muted-foreground">
            Manage hotels and bookings
          </p>
        </div>
        <Button onClick={() => {
          setSelectedHotel(null)
          setOpen(true)
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Hotel
        </Button>
      </div>
      <DataTable 
        columns={columns} 
        data={data}
        onEdit={(hotel: Hotel) => {
          setSelectedHotel(hotel)
          setOpen(true)
        }}
        onDelete={handleDelete}
      />

      <HotelDialog 
        open={open}
        onOpenChange={setOpen}
        onSubmit={selectedHotel ? handleUpdate : handleCreate}
        defaultValues={selectedHotel}
      />
    </div>
  )
}