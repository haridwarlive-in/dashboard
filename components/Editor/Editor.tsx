import { CustomChainedCommands, Editor, EditorContent, useEditor } from "@tiptap/react";
import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import BulletList from "@tiptap/extension-bullet-list";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Paragraph from "@tiptap/extension-paragraph";
import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1Icon,
  TextIcon,
  ListIcon,
  ListOrdered,
  ImageIcon,
  VideoIcon,
  X,
} from "lucide-react";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect, useRef, useState } from "react";
import "./editor.scss";
import { Toggle } from "../ui/toggle";
import { Button } from "../ui/button";
import { NewsFormDataType, TempleFormDataType } from "@/types";
import axios from "axios";
import useAuthStore from "@/store";

import {
  Node,
  mergeAttributes,
  RawCommands,
  CommandProps,
  Editor as CoreEditor,
} from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    insertVideo: (src: string) => ReturnType;
    xHandle: {
      insertXHandle: (handle: string) => ReturnType;
    };
  }

  interface CustomChainedCommands {
    insertVideo: (src: string) => CustomChainedCommands;
    insertXHandle: (src: string) => CustomChainedCommands;
  }
}

interface CustomCommands extends RawCommands {
  insertVideo: (src: string) => (props: CommandProps) => boolean;
  insertXHandle: (src: string) => (props: CommandProps) => boolean;
}

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: () => void;
      };
    };
  }
}


const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "video" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(HTMLAttributes, {
        controls: true,
        class: "w-1/2 rounded-md my-2 space-y-2",
      }),
    ];
  },

  addCommands(): Partial<RawCommands & CustomCommands> {
    return {
      insertVideo:
        (src) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: "video",
              attrs: { src },
            })
            .run();
        },
    };
  },
});

const uploadFileToS3 = async (
  file: File,
  token: string
): Promise<string | null> => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/upload/generate-presigned-url`,
      { fileName: file.name, fileType: file.type },
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );

    if (response.status !== 200)
      throw new Error("Failed to get pre-signed URL");

    const { uploadURL, key } = response.data;
    await axios.put(uploadURL, file, {
      headers: { "Content-Type": file.type },
    });

    return `https://haridwarlive-storage.s3.ap-south-1.amazonaws.com/${key}`;
  } catch (error) {
    console.error("File upload failed:", error);
    return null;
  }
};

export const MenuBar = ({
  editor,
  triggerImageUpload,
  triggerVideoUpload,
}: {
  editor: Editor;
  triggerImageUpload: () => void;
  triggerVideoUpload: () => void;
}) => {
  if (!editor) return null;

  return (
    <div className="mb-2 rounded p-1 sticky top-0 z-50 bg-gray-50 shadow w-full">
      <div className="flex flex-row gap-2 [&>div]:border">
        <Toggle
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          pressed={editor.isActive("bold")}
        >
          <Bold size={16} />
        </Toggle>
        <Toggle
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          pressed={editor.isActive("italic")}
        >
          <Italic size={16} />
        </Toggle>
        <Toggle
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          pressed={editor.isActive("underline")}
        >
          <u className="underline">U</u>
        </Toggle>
        <Toggle
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          pressed={editor.isActive("strike")}
        >
          <Strikethrough size={16} />
        </Toggle>
        <Toggle
          onPressedChange={() => editor.chain().focus().setParagraph().run()}
          pressed={editor.isActive("paragraph")}
        >
          <TextIcon size={16} />
        </Toggle>
        <Toggle
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          pressed={editor.isActive("heading", { level: 1 })}
        >
          <Heading1Icon size={16} />
        </Toggle>
        <Toggle
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          pressed={editor.isActive("bulletList")}
        >
          <ListIcon size={16} />
        </Toggle>
        <Toggle
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          pressed={editor.isActive("orderedList")}
        >
          <ListOrdered size={16} />
        </Toggle>
        <Button
          type="button"
          variant="outline"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          Divider
        </Button>
        <Button type="button" variant="outline" onClick={triggerImageUpload}>
          <ImageIcon size={16} />
        </Button>
        <Button type="button" variant="outline" onClick={triggerVideoUpload}>
          <VideoIcon size={16} />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const url = prompt("Enter Tweet URL: ");
            editor.chain().focus().insertXHandle(url as string).run()
          }}
        >
          Insert X Handle
        </Button>
      </div>
    </div>
  );
};

const CustomVideo = Video.extend({
  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      {
        ...HTMLAttributes,
        class: "my-4 mx-auto", // Adds vertical margin (Tailwind utility for spacing)
      },
    ];
  },
})

const CustomImage = Image.extend({
  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      {
        ...HTMLAttributes,
        class: "my-4 mx-auto", // Adds vertical margin (Tailwind utility for spacing)
      },
    ];
  },
});

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
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuthStore();

  const editor = useEditor({
    extensions: [
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      StarterKit,
      Video,
      OrderedList,
      BulletList,
      HorizontalRule,
      Underline,
      Paragraph,
      CustomImage,
      XHandle
    ],
    autofocus: true,
    content,
    onBlur({ editor }) {
      console.log(content)
      setContent(editor.getHTML());
      setFormData(
        isNewsForm
          ? { ...formData, content: editor.getHTML() }
          : { ...formData, description: editor.getHTML() }
      );
    },
  });

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileUrl = await uploadFileToS3(file, token as string);
    if (fileUrl) {
      if (type === "image") {
        editor?.chain().focus().setImage({ src: fileUrl }).run();
      } else if (type === "video") {
        // @ts-expect-error
        editor?.chain().focus().insertVideo(fileUrl).run();
      }
    }
  };
  console.log(editor?.getHTML());
  return (
    <div>
      <MenuBar
        editor={editor as Editor}
        triggerImageUpload={() => imageInputRef.current?.click()}
        triggerVideoUpload={() => videoInputRef.current?.click()}
      />
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e, "image")}
      />
      <input
        type="file"
        ref={videoInputRef}
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e, "video")}
      />
      <EditorContent editor={editor} />
    </div>
  );
};

const XEmbedComponent = (props: any) => {
  const tweetUrl = props.node.attrs.tweetUrl;

  useEffect(() => {
    // Wait for the component to mount, then load Twitter widgets
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load();
    }
  }, []);

  return (
    <NodeViewWrapper className="my-4">
      <blockquote className="twitter-tweet">
        <a href={tweetUrl}></a>
      </blockquote>
    </NodeViewWrapper>
  );
};

const XHandle = Node.create({
  name: "xHandle",
  group: "block", // Block element (new line)
  atom: true, // Non-editable

  addAttributes() {
    return {
      tweetUrl: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "blockquote.twitter-tweet",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "blockquote",
      mergeAttributes(HTMLAttributes, {
        class: "twitter-tweet",
      }),
      ["a", { href: HTMLAttributes.tweetUrl }, ""], // Properly formatted <a> tag
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(XEmbedComponent);
  },

  addCommands() {
    return {
      insertXHandle:
        (tweetUrl: string) =>
        ({ chain }: CommandProps) => {
          return chain()
            .insertContent({
              type: "xHandle",
              attrs: { tweetUrl },
            })
            .run();
        },
    };
  },
});

export default Tiptap;
