"use client";

import { DataTable } from "@/components/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "next/navigation";
import { Hotel } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { HotelDialog } from "./hotel-dialog";
import { Edit } from "lucide-react";
import useAuthStore from "@/store";

type Booking = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  totalDays: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  message: string;
  createdAt: Date;
  hotelId: {
    id: string;
    title: string;
  };
};

const columns: ColumnDef<Booking>[] = [
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
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "date",
    header: "Check-in",
  },
  {
    accessorKey: "totalDays",
    header: "Total Stay",
    cell: ({row}) => (
      <span>{row.original.totalDays} days</span>
    )
  },
  {
    accessorKey: "status",
    header: () => <div>Status</div>,
    cell: ({ row }) => (
      <span
      className={`w-fit p-2 text-sm font-medium rounded ${
        row.original.status === "PENDING"
          ? "bg-yellow-300"
          : row.original.status === "CONFIRMED"
          ? "bg-green-400"
          : "bg-red-400"
      }`}
      >
        {row.original.status}
      </span>
    ),
  },
];


export default function BookingsPage() {
  const params = useParams();
  const hotelId = params.hotelId;
  
  const {toast} = useToast()

  const [data, setData] = useState<Booking[]>([]);
  const [hotel, setHotel] = useState<Hotel>()
  const [open, setOpen] = useState(false);
  const [bookingViewOpen, setBookingViewOpen] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);

  const {token} = useAuthStore();

  
  const fetchData = async () => {
    try {
      const hotelData = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/hotels/${hotelId}`, {
        withCredentials: true,
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      const hotel = hotelData.data;
      setHotel(hotel)

      const bookings = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/bookings/hotel/${hotelId}`, {
        withCredentials: true,
        headers: {
          Authorization: "Bearer " + token
        },
      });
      
      setData(bookings.data);
    } catch (error) {
      console.log(error);
    }
  };
  
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hotelData = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/hotels/${hotelId}`, {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + token,
          },
        });
        const hotel = hotelData.data;
        setHotel(hotel)
  
        const bookings = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/bookings/hotel/${hotelId}`, {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + token
          },
        });
        
        setData(bookings.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  
  }, [hotelId, token]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{hotel?.title}</h2>
        <p className="text-muted-foreground">Manage hotel bookings</p>
      </div>
      <Button onClick={() => {
          setOpen(true)
        }}>
          <Edit className="mr-2 h-4 w-4" />
          Update Hotel Data
        </Button>
      <DataTable
        columns={columns}
        data={data}
        isQueryTable={true}
        onEdit={(booking: Booking) => {
          setBooking(booking);
          setBookingViewOpen(true);
        }}
      />
      <BookingView
        open={bookingViewOpen}
        setOpen={setBookingViewOpen}
        booking={booking as Booking}
        fetchData={fetchData}
      />
      <HotelDialog 
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleUpdate}
        defaultValues={hotel}
      />
    </div>
  );
}

type STATUS = 'PENDING'|'CONFIRMED'|'CANCELLED'

const BookingView = ({
  open,
  setOpen,
  booking,
  fetchData,
}: {
  open: boolean;
  setOpen: (x: boolean) => void;
  booking: Booking;
  fetchData: () => void;
}) => {

  const [status, setStatus] = useState<STATUS | null>(null);
  const {token} = useAuthStore();
  
  const updateStatus = async () => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/bookings/${booking._id}/status`,
        {
          status,
        },
        {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + token
          },
        }
      );
    } catch (error) {
      console.log(error);
    } finally {
      setStatus(null);
      fetchData();
      setOpen(false)
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_URL}/bookings/${booking._id}`,
      {
        withCredentials: true,
        headers: {
          Authorization: "Bearer " + token
        },
      }
    );
    } catch (error) {
      console.log(error);
    } finally {
      setStatus(null);
      fetchData();
      setOpen(false)
    }
  }

  const handleChange = (value: STATUS) => {
    setStatus(value); 
  };

  if (!booking) return null;

  return (
    <div
      className={`fixed top-0 bottom-0 bg-opacity-20 left-0 right-0 p-16 h-screen w-screen justify-center items-center ${
        open ? "flex" : "hidden"
      }`}
    >
      <div className="grid grid-cols-2 items-center gap-2 w-auto rounded-lg min-w-[500px] max-h-[700px] bg-white shadow-xl border p-4 [&>div]:p-1 [&>div]:rounded-lg">
        <strong>Created On</strong>
        {booking.createdAt ? (
          <div>
            {new Date(booking.createdAt as Date).toLocaleDateString("en-IN", {
              timeZone: "Asia/Kolkata",
            })}
          </div>
        ) : null}
        <strong>Name</strong>
        <div>{booking.name}</div>
        <strong>Email</strong>
        <div>{booking.email}</div>
        <strong>Phone</strong>
        <div>{booking.phone}</div>
        <strong>Message</strong>
        <div className="overflow-scroll">{booking.message||'--'}</div>
        <strong>Check-in Date</strong>
        <div>{booking.date}</div>
        <strong>Total days of stay</strong>
        <div>{booking.totalDays}</div>

        <strong>Status</strong>
        <div className="flex flex-col gap-2 justify-start items-start">
          <div
            className={`w-fit p-2 text-sm font-medium rounded ${
              booking.status === "PENDING"
                ? "bg-yellow-300"
                : booking.status === "CONFIRMED"
                ? "bg-green-400"
                : "bg-red-400"
            }`}
          >
            {booking.status}
          </div>
          <Select onValueChange={handleChange} value={status as STATUS}>
            <SelectTrigger>
              <SelectValue>{status}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="PENDING" value="PENDING">
                PENDING
              </SelectItem>
              <SelectItem key="CANCELLED" value="CANCELLED">
                CANCELLED
              </SelectItem>
              <SelectItem key="CONFIRMED" value="CONFIRMED">
                CONFIRMED
              </SelectItem>
            </SelectContent>
          </Select>
          <button className="border w-full rounded-md bg-gray-50 text-sm p-2" onClick={updateStatus}>
            Confirm
          </button>
        </div>

        <div></div>
        <div className="w-full hidden justify-end flex-row items-center gap-2">
          <Button
          variant={"destructive"}
          onClick={handleDelete}
          disabled
          >
            Delete
          </Button>
          <Button onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
