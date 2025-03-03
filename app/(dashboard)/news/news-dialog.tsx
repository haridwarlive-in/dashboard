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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { News, NewsFormDataType } from "@/types";
import { DialogDescription } from "@radix-ui/react-dialog";
import Tiptap from "@/components/Editor/Editor";
import axios from "axios";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import useAuthStore from "@/store";

interface NewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  defaultValues?: News | null;
}

export function NewsDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: NewsDialogProps) {
  const [content, setContent] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedFile, setSelectedFile] = useState<File|null>();
  const [isChecked, setIsChecked] = useState<CheckedState>(
    (defaultValues?.isBreakingNews as boolean) ?? false
  );
  const [loading, setLoading] = useState(false);
  const {token} = useAuthStore();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

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
      } else if (!defaultValues && !content) {
        alert("Please enter news content");
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
              isBreakingNews: isChecked,
            }
          : { ...formData, key, isBreakingNews: isChecked, date: new Date() }
      );
      onOpenChange(false);
      setFormData({});
      setContent("");
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setSelectedFile(null)
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[90vw] max-h-[90vh] overflow-scroll backdrop-blur-lg">
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Edit News" : "Add News"}</DialogTitle>
          <DialogDescription>
            {defaultValues ? "Edit the news entry" : "Add a new news entry"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              defaultValue={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
              placeholder="Enter Author name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              defaultValue={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter news title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">English Title for URL</Label>
            <Input
              id="title"
              defaultValue={formData.urlTitle}
              onChange={(e) => {
                
                const value = e.target.value
                const title = value.trim().toLowerCase().replace(/\s+/g, '-').replace(/\.-/g, '-');
                setFormData({ ...formData, urlTitle: title })
              }}
              placeholder="Enter title for url in english"
              required
            />
          </div>

          <div>
            <Label>Upload Image</Label>
            <Input id="image" type="file" onChange={handleFileChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>

            <div className="border rounded-md p-1 min-h-[600px] overflow-scroll">
              <Tiptap
                isNewsForm={true}
                content={defaultValues ? formData.content : content}
                setContent={setContent}
                formData={formData as NewsFormDataType}
                setFormData={setFormData}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="isBreakingNews">Breaking News</Label>

            <div className="flex items-center space-x-2">
              <Label>Check the box to set as breaking news</Label>
              <Checkbox checked={isChecked} onCheckedChange={setIsChecked} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              defaultValue={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="overflow-y-scroll">
                <SelectItem value="Local News">Local News</SelectItem>
                <SelectItem value="Events">Events</SelectItem>
                <SelectItem value="Business & Economy">
                  Business & Economy
                </SelectItem>
                <SelectItem value="Health & Wellness">
                  Health & Wellness
                </SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
                <SelectItem value="Weather">Weather</SelectItem>
                <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Transportation">Transportation</SelectItem>
                <SelectItem value="Real Estate">Real Estate</SelectItem>
                <SelectItem value="Tourism">Tourism</SelectItem>
                <SelectItem value="Crime & Safety">Crime & Safety</SelectItem>
                <SelectItem value="Environment">Environment</SelectItem>
                <SelectItem value="Politics">Politics</SelectItem>
                <SelectItem value="Human Interest">Human Interest</SelectItem>
                <SelectItem value="Opinion">Opinion</SelectItem>
                <SelectItem value="Business Directory">
                  Business Directory
                </SelectItem>
                <SelectItem value="Community">Community</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              defaultValue={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value as News["status"] })
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
              {loading ? "Processing..." : defaultValues ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
