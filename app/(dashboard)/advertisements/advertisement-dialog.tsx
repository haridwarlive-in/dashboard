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
import { Advertisement, Temple, TempleFormDataType } from "@/types";
import { DialogDescription } from "@radix-ui/react-dialog";
import Tiptap from "@/components/Editor/Editor";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import useAuthStore from "@/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdvertisementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  defaultValues?: Advertisement | null;
}

export function AdvertisementDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: AdvertisementDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
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
    } catch (e) {
      console.log("Error submitting form:", e);
      alert("Failed to submit form");
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
            {defaultValues ? "Edit Advertisement Page" : "Add Advertisement Page"}
          </DialogTitle>
          <DialogDescription>
            {defaultValues ? "Edit the Advertisement entry" : "Add a new Advertisement entry"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              defaultValue={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter Advertisement Title"
              required
            />
          </div>

          <div>
            <Label>Upload Image</Label>
            <Input id="image" type="file" onChange={handleFileChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Advertisement URL</Label>

            <Input
              type="url"
              defaultValue={formData.url}
              onChange={(e) => {
                setFormData({ ...formData, url: e.target.value });
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              defaultValue={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value as Advertisement["status"] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Expiry Date</Label>

            <Input
              type="date"
              defaultValue={formData.expiry}
              onChange={(e) => {
                setFormData({ ...formData, expiry: e.target.value });
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Duration (seconds)</Label>

            <Input
              type="number"
              defaultValue={formData.duration}
              onChange={(e) => {
                setFormData({ ...formData, duration: e.target.value });
              }}
              required
            />
          </div>
          
          <DialogFooter>
            <Button disabled={loading} type="submit">
              {
                loading ? "Processing..." :
                defaultValues ? "Update" : "Create"
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
