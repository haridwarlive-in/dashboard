"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hotel, HotelFormDataType, OwnerFormDataType } from "@/types";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import useAuthStore from "@/store";

interface HotelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  defaultValues?: Hotel | null;
}

export function HotelDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: HotelDialogProps) {
  const [formData, setFormData] = useState<Record<string, any> | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File|null>();

  const {token} = useAuthStore();

  useEffect(() => {
    defaultValues ? setFormData(defaultValues) : setFormData({});
  }, [defaultValues]);

  const imageUpload = async (): Promise<string | undefined> => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/upload/generate-presigned-url`,
        {
          fileName: selectedFile?.name,
          fileType: selectedFile?.type,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
          },
          withCredentials: true,
        }
      );

      if (response.status !== 200)
        throw new Error("Failed to get pre-signed URL");

      const url = response.data.uploadURL;
      const key = response.data.key;

      await axios.put(url, selectedFile, {
        headers: {
          "Content-Type": selectedFile?.type,
        },
      });

      return key;
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      setLoading(true);
      if (!defaultValues && !selectedFile) {
        alert("Please upload an image");
        return;
      }
      e.preventDefault();

      const key = await imageUpload();
      onSubmit(
        defaultValues
          ? {
              ...formData,
              _id: defaultValues._id,
              key: key?.includes("undefined") ? defaultValues.key : key,
            }
          : { ...formData, key }
      );
      onOpenChange(false);
      setFormData({});
    } catch (error) {
      console.log(error);
      alert("Error creating hotel");
    } finally {
      setLoading(false);
      setSelectedFile(null)
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[90vw] max-h-[85vh] overflow-scroll">
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? "Edit Hotel Entry" : "Add Hotel"}
          </DialogTitle>
          <DialogDescription>
            {defaultValues ? "Edit the hotel entry" : "Add a new hotel entry"}
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
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  } as HotelFormDataType)
                }
                placeholder="Create hotel email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create hotel password"
                defaultValue={formData?.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  } as HotelFormDataType)
                }
                required
              />
              <div className="flex ml-1 flex-row gap-1 items-center mt-2">
                <Input
                  className="justify-start h-4 w-4"
                  type="checkbox"
                  onClick={(e) => {
                    setShowPassword(!showPassword);
                  }}
                />
                <p className="text-xs">Show Password</p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 flex flex-col gap-4">
            <h2 className="font-semibold text-lg">About</h2>

            <div>
              <Label>Upload Image</Label>
              <Input id="image" type="file" onChange={handleFileChange}/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                defaultValue={formData?.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value,
                  } as HotelFormDataType)
                }
                placeholder="Enter Hotel name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Description</Label>
              <Textarea
                rows={2}
                defaultValue={formData?.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  } as HotelFormDataType)
                }
              />
            </div>

            <div>
              <Label>Amenities</Label>
              <Input
                id="amenities"
                defaultValue={formData?.amenities}
                onChange={(e) => {
                  const amenitiesString = e.target.value;
                  const amenitiesArray = amenitiesString.split(",");
                  setFormData({
                    ...formData,
                    amenities: amenitiesArray,
                  } as HotelFormDataType);
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
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    address: e.target.value,
                  } as HotelFormDataType);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Location Map URL</Label>

              <Input
                type="url"
                defaultValue={formData?.locationUrl}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    locationUrl: e.target.value,
                  } as HotelFormDataType);
                }}
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 flex flex-col gap-4">
            <h2 className="font-semibold text-lg">Contact Information</h2>
            <div className="space-y-2">
              <Label htmlFor="content">Phone</Label>

              <Input
                defaultValue={formData?.contact?.phone}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    contact: { ...formData?.contact, phone: e.target.value },
                  } as HotelFormDataType);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Email</Label>

              <Input
                type="email"
                defaultValue={formData?.contact?.email}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    contact: { ...formData?.contact, email: e.target.value },
                  } as HotelFormDataType);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Website (Optional)</Label>

              <Input
                type="url"
                defaultValue={formData?.contact?.website}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    contact: { ...formData?.contact, website: e.target.value },
                  } as HotelFormDataType);
                }}
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 flex flex-col gap-4">
            <h2 className="font-semibold text-lg">Additional</h2>
            <div className="space-y-2">
              <Label htmlFor="content">Likes</Label>

              <Input
                type="number"
                defaultValue={formData?.likes}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    likes: Number(e.target.value),
                  } as HotelFormDataType);
                }}
              />

              <Label htmlFor="content">Rooms Available</Label>

              <Input
                type="number"
                defaultValue={formData?.roomsAvailable}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    roomsAvailable: Number(e.target.value),
                  } as HotelFormDataType);
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">{
              loading ? defaultValues ? "Update" : "Create" : "Processing..."
            }</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
