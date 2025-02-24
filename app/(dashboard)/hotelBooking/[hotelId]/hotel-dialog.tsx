"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Hotel } from "@/types"
import { DialogDescription } from "@radix-ui/react-dialog"
import { Textarea } from "@/components/ui/textarea"

interface HotelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  defaultValues?: Hotel | null
}

export function HotelDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: HotelDialogProps) {

  const [formData, setFormData] = useState<Hotel|null>(null)
  const [showPassword, setShowPassword] = useState(false)
  
  useEffect(()=>{
    setFormData(defaultValues as Hotel)
  }, [defaultValues])

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  onSubmit(formData)
  onOpenChange(false)
  setFormData(null)
}
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[90vw] max-h-[85vh] overflow-scroll">
        <DialogHeader>
          <DialogTitle>Edit Hotel Data</DialogTitle>
          <DialogDescription>
            Edit the hotel entry
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">

        <div className="border rounded-lg p-4 gap-4">
            <h2 className="font-semibold text-lg mb-4">Hotel Account</h2>

            <div className="mb-4 space-y-2">
              <Label htmlFor="title mb-2">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={formData?.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value } as Hotel)}
                placeholder="Create hotel email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                type={showPassword?"text":"password"}
                placeholder="Create hotel password"
                defaultValue={formData?.password}
                onChange={(e)=>setFormData({ ...formData, password: e.target.value } as Hotel)}
                required
              />
              <div className="flex ml-1 flex-row gap-1 items-center mt-2">
                <Input 
                  className="justify-start h-4 w-4"
                  type="checkbox"
                  onClick={(e)=>{setShowPassword(!showPassword)}}
                />
                <p className="text-xs">Show Password</p>
              </div>
              
            </div>

          </div>

          <div className="border rounded-lg p-4 flex flex-col gap-4">
            <h2 className="font-semibold text-lg">About</h2>

            <div>
              <Label>Upload Image</Label>
              <Input
                id="image"
                type="file"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                defaultValue={formData?.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value } as Hotel)}
                placeholder="Enter Hotel name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Description</Label>
              <Textarea 
                rows={2}
                defaultValue={formData?.description}
                onChange={(e)=>setFormData({ ...formData, description: e.target.value } as Hotel)}
              />
            </div>

            <div>
              <Label>Amenities</Label>
              <Input 
                id="amenities"
                defaultValue={formData?.amenities} 
                onChange={(e) => {
                  const amenitiesString = e.target.value
                  const amenitiesArray = amenitiesString.split(',')
                  setFormData({ ...formData, amenities: amenitiesArray } as Hotel)
                }}
                placeholder="Enter comma-separated amenities: Amenity1,Amenity2,Amenity3 ..."
                required
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 flex flex-col gap-4">
          <h2 className="font-semibold text-lg">Location</h2>
            <div className="space-y-2">
              <Label htmlFor="content">Address</Label>
              
              <Textarea 
              rows={2}
              defaultValue={formData?.address}
              onChange={(e)=>{setFormData({...formData, address: e.target.value} as Hotel)}}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Location Map URL</Label>
              
              <Input 
              type="url"
              defaultValue={formData?.locationUrl}
              onChange={(e)=>{setFormData({...formData, locationUrl: e.target.value} as Hotel)}}
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 flex flex-col gap-4">
          <h2 className="font-semibold text-lg">Contact Information</h2>
            <div className="space-y-2">
              <Label htmlFor="content">Phone</Label>
              
              <Input 
              defaultValue={formData?.contact.phone}
              onChange={(e)=>{setFormData({...formData, contact: { ...formData?.contact, phone: e.target.value }} as Hotel)}}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Email</Label>
              
              <Input 
              type="email"
              defaultValue={formData?.contact.email}
              onChange={(e)=>{setFormData({...formData, contact: { ...formData?.contact, email: e.target.value }} as Hotel)}}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Website (Optional)</Label>
              
              <Input 
              type="url"
              defaultValue={formData?.contact.website}
              onChange={(e)=>{setFormData({...formData, contact: { ...formData?.contact, website: e.target.value }} as Hotel)}}
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 flex flex-col gap-4">
          <h2 className="font-semibold text-lg">Additional</h2>
            <div className="space-y-2">
              <Label htmlFor="content">Rooms Available</Label>
              
              <Input 
              type="number"
              defaultValue={formData?.roomsAvailable}
              onChange={(e)=>{setFormData({...formData, roomsAvailable: Number(e.target.value)} as Hotel)}}
              />
            </div>
          </div>
        
          <DialogFooter>
            <Button type="submit">Update</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}