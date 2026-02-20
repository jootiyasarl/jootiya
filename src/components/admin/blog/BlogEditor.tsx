"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabaseClient";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Heading2,
  Heading3,
  Heading4,
  Quote,
  Undo,
  Redo,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Type,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

interface BlogEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const MenuBar = ({ editor, onImageUpload }: { editor: any; onImageUpload: () => void }) => {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
  };

  const ToolbarButton = ({ 
    onClick, 
    active, 
    children, 
    disabled = false 
  }: { 
    onClick: () => void; 
    active?: boolean; 
    children: React.ReactNode;
    disabled?: boolean;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "h-9 w-9 p-0 rounded-xl transition-all duration-200",
        active 
          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
          : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
      )}
    >
      {children}
    </Button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-3 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-1 px-1.5 py-1 bg-zinc-950/50 rounded-2xl border border-zinc-800/50 mr-2">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="flex items-center gap-1 px-1.5 py-1 bg-zinc-950/50 rounded-2xl border border-zinc-800/50 mr-2">
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          active={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
          active={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} 
          active={editor.isActive("heading", { level: 4 })}
        >
          <Heading4 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="flex items-center gap-1 px-1.5 py-1 bg-zinc-950/50 rounded-2xl border border-zinc-800/50 mr-2">
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })}>
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })}>
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })}>
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="flex items-center gap-1 px-1.5 py-1 bg-zinc-950/50 rounded-2xl border border-zinc-800/50 mr-2">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
          <Quote className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="flex items-center gap-1 px-1.5 py-1 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
        <ToolbarButton onClick={setLink} active={editor.isActive("link")}>
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={onImageUpload}>
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1 px-1.5 py-1 bg-zinc-950/50 rounded-2xl border border-zinc-800/50 ml-2">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </div>
  );
};

export const BlogEditor = ({ content, onChange }: BlogEditorProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "text-orange-500 underline decoration-orange-500/30 underline-offset-4 font-medium transition-colors hover:text-orange-600",
          target: "_blank",
          rel: "noopener noreferrer nofollow",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-[2rem] border border-zinc-800 shadow-2xl mx-auto my-8 max-w-full",
        },
      }),
      Placeholder.configure({
        placeholder: "Racontez votre histoire, structurez-la avec des titres (H2-H4) pour un meilleur SEO...",
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-lg md:prose-xl prose-orange dark:prose-invert max-w-none p-8 md:p-12 min-h-[500px] outline-none",
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const options = {
        maxSizeMB: 0.2, // 200KB limit
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: "image/webp",
      };

      const compressedFile = await imageCompression(file, options);
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.webp`;
      const filePath = `blog/content/${fileName}`;

      const bucketName = "ad-images"; // Changed from blog_content to ad-images
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, compressedFile);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      editor?.chain().focus().setImage({ src: publicUrl }).run();
      toast.success("Image optimisée et insérée !");
    } catch (error: any) {
      console.error("Editor Image Upload Error:", error);
      toast.error("Échec de l'optimisation ou du téléchargement de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleImageUpload(file);
    };
    input.click();
  };

  // Word Count & Reading Time
  const text = editor?.getText() || "";
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="group relative border border-zinc-800 rounded-[2.5rem] overflow-hidden bg-zinc-950 shadow-2xl transition-all duration-300 focus-within:border-orange-500/50 focus-within:ring-4 focus-within:ring-orange-500/10">
      <MenuBar editor={editor} onImageUpload={triggerImageUpload} />
      
      {isUploading && (
        <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-30">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
          <span className="text-sm font-black uppercase tracking-widest animate-pulse">
            Traitement de l'image SEO...
          </span>
        </div>
      )}

      <EditorContent editor={editor} />
      
      <div className="px-6 py-4 bg-zinc-900/30 border-t border-zinc-800/50 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
        <div className="flex items-center gap-4 text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Type className="h-3 w-3 text-orange-500/50" />
            <span>{wordCount} Mots</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 text-emerald-500/50" />
            <span>{readingTime} Min de lecture</span>
          </div>
        </div>
        <div className="text-zinc-600">
          Jootiya Semantic Editor v2.0
        </div>
      </div>
    </div>
  );
};
