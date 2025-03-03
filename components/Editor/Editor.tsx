import { Editor, EditorContent, useEditor } from "@tiptap/react";
import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import BulletList from "@tiptap/extension-bullet-list";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Paragraph from '@tiptap/extension-paragraph';
import Image from "@tiptap/extension-image"; // Added Image extension
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1Icon,
  TextIcon,
  ListIcon,
  ListOrdered,
  ImageIcon,
} from "lucide-react";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect, useRef } from "react";
import "./editor.scss";
import { Toggle } from "../ui/toggle";
import { Button } from "../ui/button";
import { NewsFormDataType, TempleFormDataType } from "@/types";
import axios from "axios"; // Added for API requests
import useAuthStore from "@/store";

// Function to handle AWS S3 image upload
const uploadImageToS3 = async (file: File, token: string): Promise<string | null> => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/upload/generate-presigned-url`,
      { fileName: file.name, fileType: file.type },
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );

    if (response.status !== 200) throw new Error("Failed to get pre-signed URL");

    const { uploadURL, key } = response.data;
    await axios.put(uploadURL, file, { headers: { "Content-Type": file.type } });

    return `https://https://haridwar-live.s3.ap-south-1.amazonaws.com/${key}`;
  } catch (error) {
    console.error("Image upload failed:", error);
    return null;
  }
};

export const MenuBar = ({
  editor,
  setPreviewOpen,
  triggerImageUpload,
}: {
  editor: Editor;
  setPreviewOpen: (x: boolean) => void;
  triggerImageUpload: () => void;
}) => {
  if (!editor) return null;

  return (
    <div className="mb-2 rounded p-1 sticky top-0 z-50 bg-gray-50 shadow w-full">
      <div className="flex flex-row gap-2 [&>div]:border">
        <Toggle onPressedChange={() => editor.chain().focus().toggleBold().run()} pressed={editor.isActive("bold")}>
          <Bold size={16} />
        </Toggle>
        <Toggle onPressedChange={() => editor.chain().focus().toggleItalic().run()} pressed={editor.isActive("italic")}>
          <Italic size={16} />
        </Toggle>
        <Toggle onPressedChange={() => editor.chain().focus().toggleUnderline().run()} pressed={editor.isActive("underline")}>
          <u className="underline">U</u>
        </Toggle>
        <Toggle onPressedChange={() => editor.chain().focus().toggleStrike().run()} pressed={editor.isActive("strike")}>
          <Strikethrough size={16} />
        </Toggle>
        <Toggle onPressedChange={() => editor.chain().focus().setParagraph().run()} pressed={editor.isActive("paragraph")}>
          <TextIcon size={16} />
        </Toggle>
        <Toggle onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} pressed={editor.isActive("heading", { level: 1 })}>
          <Heading1Icon size={16} />
        </Toggle>
        <Toggle onPressedChange={() => editor.chain().focus().toggleBulletList().run()} pressed={editor.isActive("bulletList")}>
          <ListIcon size={16} />
        </Toggle>
        <Toggle onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} pressed={editor.isActive("orderedList")}>
          <ListOrdered size={16} />
        </Toggle>
        <Button type="button" variant={"outline"} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          Divider
        </Button>
        <Button type="button" variant={"outline"} onClick={triggerImageUpload}>
          <ImageIcon size={16} />
        </Button>
        <Button type="button" variant={"outline"} onClick={() => setPreviewOpen(true)}>
          Preview
        </Button>
      </div>
    </div>
  );
};

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  StarterKit.configure({
    bulletList: { keepMarks: true, keepAttributes: false },
    orderedList: { keepMarks: true, keepAttributes: false },
    heading: { levels: [1, 2, 3], HTMLAttributes: { class: "text-2xl font-bold" } },
  }),
  OrderedList.configure({ HTMLAttributes: { class: "list-decimal ml-4" } }),
  BulletList.configure({ HTMLAttributes: { class: "list-disc ml-4" } }),
  HorizontalRule.configure({ HTMLAttributes: { class: "border-t border-gray-300 my-8" } }),
  Underline,
  Paragraph.configure({ HTMLAttributes: { class: "leading-relaxed" } }),
  Image,
];

const Tiptap = ({
  content,
  setContent,
  formData,
  setFormData,
  isNewsForm,
}: {
  content: string;
  setContent: (x: string) => void;
  formData: NewsFormDataType | TempleFormDataType;
  setFormData: (x: NewsFormDataType | TempleFormDataType) => void;
  isNewsForm?: boolean;
}) => {
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions,
    autofocus: true,
    content,
    editable: true,
    editorProps: { attributes: { class: "min-h-[300px] rounded-md p-4" } },
    onBlur({ editor }) {
      setContent(editor.getHTML());
      if (isNewsForm) {
        setFormData({ ...formData, content: editor.getHTML() });
      } else {
        setFormData({ ...formData, description: editor.getHTML() });
      }
    },
  });

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);
  const {token} = useAuthStore();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = await uploadImageToS3(file, token as string);
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl }).run();
    }
  };

  return (
    <div>
      <MenuBar editor={editor as Editor} setPreviewOpen={setPreviewOpen} triggerImageUpload={() => fileInputRef.current?.click()} />
      <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileUpload} />
      <EditorContent editor={editor} />
      <Preview content={content} previewOpen={previewOpen} setPreviewOpen={setPreviewOpen} />
    </div>
  );
};

const Preview = ({ content, previewOpen, setPreviewOpen }: { content: string; previewOpen: boolean; setPreviewOpen: (x: boolean) => void }) => (
  <div className={`flex flex-col p-4 gap-4 items-center justify-center bg-white text-black z-50 shadow-lg ${previewOpen ? "fixed inset-0" : "hidden"}`}>
    <div dangerouslySetInnerHTML={{ __html: content }} className="p-4 text-black rounded-md w-full h-full overflow-scroll"></div>
    <Button variant={"outline"} className="bg-transparent" type="button" onClick={() => setPreviewOpen(false)}>Close</Button>
  </div>
);

export default Tiptap;
