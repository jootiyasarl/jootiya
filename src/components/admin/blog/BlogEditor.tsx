import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";
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
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState, useCallback } from "react";

interface BlogEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const BlogEditor = ({ content, onChange }: BlogEditorProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        // Configure Smart Paste defaults
        codeBlock: false,
        code: false,
      }),
      Underline,
      Typography,
      Dropcursor.configure({
        color: '#f97316',
        width: 2,
      }),
      Gapcursor,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "text-orange-500 underline decoration-orange-500/30 underline-offset-4 font-medium transition-colors hover:text-orange-600",
        },
        validate: href => /^https?:\/\//.test(href),
      }).extend({
        // Enhanced Smart Paste for Links: ensure external links are nofollow
        addAttributes() {
          return {
            ...this.parent?.(),
            target: {
              default: '_blank',
            },
            rel: {
              default: null,
              parseHTML: element => element.getAttribute('rel'),
              renderHTML: attributes => {
                const isExternal = attributes.href && !attributes.href.includes('jootiya.com');
                return isExternal ? { rel: 'noopener noreferrer nofollow' } : {};
              },
            },
          };
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-[2rem] border border-zinc-800 shadow-2xl mx-auto my-8 max-w-full cursor-pointer hover:ring-4 hover:ring-orange-500/20 transition-all",
        },
      }),
      Placeholder.configure({
        placeholder: "Commencez à rédiger votre article ici (le copier-coller intelligent est activé)...",
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-lg md:prose-xl prose-orange dark:prose-invert max-w-none p-8 md:p-20 min-h-[600px] outline-none selection:bg-orange-500/30",
      },
      // Smart Paste Implementation
      transformPastedHTML(html) {
        // 1. Remove style attributes (cleans colors, fonts, margins from source)
        let cleaned = html.replace(/ style="[^"]*"/g, "");
        
        // 2. Remove class attributes (cleans source site specific styling)
        cleaned = cleaned.replace(/ class="[^"]*"/g, "");
        
        // 3. Remove script and style tags completely
        cleaned = cleaned.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
        cleaned = cleaned.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "");
        
        // 4. Flatten spans but keep content (removes nested wrappers that often carry font data)
        cleaned = cleaned.replace(/<span\b[^>]*>([\s\S]*?)<\/span>/gim, "$1");

        // 5. SEO Optimization: Replace <b> with <strong> and <i> with <em>
        cleaned = cleaned.replace(/<b\b[^>]*>([\s\S]*?)<\/b>/gim, "<strong>$1</strong>");
        cleaned = cleaned.replace(/<i\b[^>]*>([\s\S]*?)<\/i>/gim, "<em>$1</em>");
        
        return cleaned;
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
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of Array.from(items)) {
            if (item.type.startsWith("image/")) {
              const file = item.getAsFile();
              if (file) {
                handleImageUpload(file);
                return true;
              }
            }
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      // Outputs clean HTML for Database storage
      onChange(editor.getHTML());
    },
  });

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: "image/webp",
      };

      const compressedFile = await imageCompression(file, options);
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.webp`;
      const filePath = `blog/content/${fileName}`;

      const bucketName = "ad-images";
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

  const triggerImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleImageUpload(file);
    };
    input.click();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="group relative border border-zinc-800 rounded-[3rem] overflow-hidden bg-zinc-950/50 backdrop-blur-sm shadow-2xl transition-all duration-500 focus-within:border-orange-500/30 focus-within:ring-8 focus-within:ring-orange-500/5">
      
      {/* Main Top Bar (Fixed Toolbar) */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/40 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 bg-zinc-950/50 p-1 rounded-xl border border-zinc-800">
            <Button
              variant="ghost" size="sm" type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={cn("h-8 w-8 p-0", editor.isActive("heading", { level: 1 }) ? "text-orange-500 bg-orange-500/10" : "text-zinc-500")}
              title="Titre 1 (H1)"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" size="sm" type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={cn("h-8 w-8 p-0", editor.isActive("heading", { level: 2 }) ? "text-orange-500 bg-orange-500/10" : "text-zinc-500")}
              title="Titre 2 (H2)"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" size="sm" type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={cn("h-8 w-8 p-0", editor.isActive("heading", { level: 3 }) ? "text-orange-500 bg-orange-500/10" : "text-zinc-500")}
              title="Titre 3 (H3)"
            >
              <Heading3 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 bg-zinc-950/50 p-1 rounded-xl border border-zinc-800">
            <Button
              variant="ghost" size="sm" type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn("h-8 w-8 p-0", editor.isActive("bold") ? "text-orange-500 bg-orange-500/10" : "text-zinc-500")}
              title="Gras"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" size="sm" type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn("h-8 w-8 p-0", editor.isActive("italic") ? "text-orange-500 bg-orange-500/10" : "text-zinc-500")}
              title="Italique"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" size="sm" type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={cn("h-8 w-8 p-0", editor.isActive("underline") ? "text-orange-500 bg-orange-500/10" : "text-zinc-500")}
              title="Souligné"
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 bg-zinc-950/50 p-1 rounded-xl border border-zinc-800">
            <Button
              variant="ghost" size="sm" type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={cn("h-8 w-8 p-0", editor.isActive("bulletList") ? "text-orange-500 bg-orange-500/10" : "text-zinc-500")}
              title="Liste à puces"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" size="sm" type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={cn("h-8 w-8 p-0", editor.isActive("orderedList") ? "text-orange-500 bg-orange-500/10" : "text-zinc-500")}
              title="Liste ordonnée"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" size="sm" type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={cn("h-8 w-8 p-0", editor.isActive("blockquote") ? "text-orange-500 bg-orange-500/10" : "text-zinc-500")}
              title="Citation"
            >
              <Quote className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 bg-zinc-950/50 p-1 rounded-xl border border-zinc-800">
            <Button
              variant="ghost" size="sm" type="button"
              onClick={() => {
                const url = window.prompt("URL");
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }}
              className={cn("h-8 w-8 p-0", editor.isActive("link") ? "text-orange-500 bg-orange-500/10" : "text-zinc-500")}
              title="Lien"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" size="sm" type="button"
              onClick={triggerImageUpload}
              className="h-8 w-8 p-0 text-zinc-500 hover:text-white"
              title="Insérer une image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 bg-zinc-950/50 p-1 rounded-xl border border-zinc-800">
            <Button
              variant="ghost" size="sm" type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="h-8 w-8 p-0 text-zinc-500 hover:text-white"
              title="Annuler (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" size="sm" type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="h-8 w-8 p-0 text-zinc-500 hover:text-white"
              title="Rétablir (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="hidden lg:flex flex-col items-end">
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Smart Paste Active</span>
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
            <span>{editor.getText().split(/\s+/).filter(w => w.length > 0).length} mots</span>
          </div>
        </div>
      </div>
      
      {isUploading && (
        <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-30 animate-in fade-in duration-300">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
          <span className="text-sm font-black uppercase tracking-widest animate-pulse">
            Optimisation SEO de l'image...
          </span>
        </div>
      )}

      <div className="relative min-h-[600px] cursor-text">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
