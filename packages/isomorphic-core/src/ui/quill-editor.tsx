import dynamic from "next/dynamic";
import { FieldError, Loader } from "rizzui";
import cn from "../utils/class-names";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[200px] w-full items-center justify-center rounded-md border border-muted">
      <Loader size="lg" />
    </div>
  ),
});

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
  toolbarPosition?: "top" | "bottom";
  placeholder?: string;
}

export default function QuillEditor({
  label,
  error,
  className,
  labelClassName,
  errorClassName,
  toolbarPosition = "top",
  ...props
}: QuillEditorProps) {
  const quillModules = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["clean"],
    ],
  };

  return (
    <div className={cn(className)}>
      {label && <label className={cn("mb-1.5 block", labelClassName)}>{label}</label>}
      <ReactQuill
        modules={quillModules}
        className={cn(
          "react-quill",
          toolbarPosition === "bottom" && "react-quill-toolbar-bottom relative",
          className
        )}
        {...props}
      />
      {error && (
        <FieldError
          size="md"
          error={error}
          className={errorClassName}
        />
      )}
    </div>
  );
}
