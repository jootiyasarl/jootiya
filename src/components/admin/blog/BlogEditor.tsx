"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Heading1,
  Heading2,
  Quote,
  Undo,
  Redo,
  AlignCenter,
  AlignLeft,
  AlignRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BlogEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("Enter image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const url = window.prompt("Enter URL");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const ToolbarButton = ({ 
    onClick, 
    active, 
    children, 
    className 
  }: { 
    onClick: () => void; 
    active?: boolean; 
    children: React.ReactNode;
    className?: string;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "h-8 w-8 p-0 rounded-md transition-all duration-200",
        active 
          ? "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 hover:text-orange-600" 
          : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
        className
      )}
    >
      {children}
    </Button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-3 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-1 px-1.5 py-1 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
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

      <div className="flex items-center gap-1 px-1.5 py-1 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })}>
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="flex items-center gap-1 px-1.5 py-1 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
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

      <div className="flex items-center gap-1 px-1.5 py-1 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
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

      <div className="flex items-center gap-1 px-1.5 py-1 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
        <ToolbarButton onClick={setLink} active={editor.isActive("link")}>
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1 px-1.5 py-1 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </div>
  );
};

export const BlogEditor = ({ content, onChange }: BlogEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-orange-500 underline decoration-orange-500/30 underline-offset-4 font-medium',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-2xl border border-zinc-800 shadow-2xl mx-auto',
        },
      }),
      Placeholder.configure({
        placeholder: "Commencez à écrire votre chef-d'œuvre ici...",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="group relative border border-zinc-800 rounded-[2rem] overflow-hidden bg-zinc-950 shadow-2xl transition-all duration-300 focus-within:border-orange-500/50 focus-within:ring-4 focus-within:ring-orange-500/10">
      <MenuBar editor={editor} />
      
      {editor && (
        <div className="bubble-menu-wrapper">
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn("h-8 w-8 p-0 rounded-lg", editor.isActive("bold") ? "text-orange-500 bg-orange-500/10" : "text-zinc-400")}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn("h-8 w-8 p-0 rounded-lg", editor.isActive("italic") ? "text-orange-500 bg-orange-500/10" : "text-zinc-400")}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={cn("h-8 w-8 p-0 rounded-lg", editor.isActive("heading", { level: 2 }) ? "text-orange-500 bg-orange-500/10" : "text-zinc-400")}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
          </BubbleMenu>
        </div>
      )}

      <EditorContent 
        editor={editor} 
        className="prose prose-lg md:prose-xl prose-orange dark:prose-invert max-w-none p-8 md:p-12 min-h-[500px] outline-none
          prose-headings:font-black prose-headings:tracking-tight
          prose-p:leading-relaxed prose-p:text-zinc-300
          prose-strong:text-white prose-strong:font-bold
          prose-img:rounded-3xl prose-img:shadow-2xl
          prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:bg-zinc-900/50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic" 
      />
      
      <div className="absolute bottom-4 right-6 text-[10px] font-bold text-zinc-600 uppercase tracking-widest pointer-events-none">
        Jootiya Professional Editor v2.0
      </div>
    </div>
  );
};
