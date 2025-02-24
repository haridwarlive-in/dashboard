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
import { Temple, TempleFormDataType } from "@/types";
import { DialogDescription } from "@radix-ui/react-dialog";
import Tiptap from "@/components/Editor/Editor";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";

interface TempleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  defaultValues?: Temple | null;
}

export function TempleDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: TempleDialogProps) {
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedFile, setSelectedFile] = useState<File|null>();

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
            Authorization: "Bearer " + localStorage.getItem("token"),
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
      } else if (!defaultValues && !description) {
        alert("Please enter temple description");
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
      setDescription("");
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
            {defaultValues ? "Edit Temple Page" : "Add Temple Page"}
          </DialogTitle>
          <DialogDescription>
            {defaultValues ? "Edit the temple entry" : "Add a new temple entry"}
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
              placeholder="Enter temple name"
              required
            />
          </div>

          <div>
            <Label>Upload Image</Label>
            <Input id="image" type="file" onChange={handleFileChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Description</Label>

            <div className="border rounded-md p-1 h-[300px] overflow-scroll">
              <Tiptap
                content={defaultValues ? formData.description : description}
                setContent={setDescription}
                formData={formData as TempleFormDataType}
                setFormData={setFormData}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Address</Label>

            <Textarea
              rows={2}
              defaultValue={formData.location}
              onChange={(e) => {
                setFormData({ ...formData, location: e.target.value });
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Location Map URL</Label>

            <Input
              type="url"
              defaultValue={formData.locationUrl}
              onChange={(e) => {
                setFormData({ ...formData, locationUrl: e.target.value });
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Tags</Label>
            <Input
              id="tags"
              defaultValue={formData.tags}
              onChange={(e) => {
                const tagsString = e.target.value;
                let tagsArray = tagsString.split(",");

                setFormData({ ...formData, tags: tagsArray });
              }}
              placeholder="Enter comma-separated tags: Tag1, Tag2, Tag3, ..."
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
