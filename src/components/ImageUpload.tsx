"use client";

import { XIcon } from "lucide-react";
import React from "react";
import { UploadButton } from "@/lib/uploadthing";

type ImageUploadProps = {
  endpoint: "postImage";
  onChange: (url: string) => void;
  value: string;
};

export default function ImageUpload({
  endpoint,
  onChange,
  value,
}: ImageUploadProps) {
  if (value) {
    return (
      <div className="relative size-40">
        <img
          src={value}
          alt="Upload"
          className="rounded-md size-40 object-cover"
        />
        <button
          onClick={() => onChange("")}
          className="absolute top-0 right-0 p-1 bg-red-500 rounded-full shadow-sm"
          type="button">
          <XIcon className="h-4 w-4 text-white" />
        </button>
      </div>
    );
  }

  return (
    <UploadButton
      appearance={{
        button: "bg-blue-500 text-white px-4 py-2 rounded",
      }}
      content={{
        button: "Choose Files",
      }}
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        // Do something with the response
        console.log("Files: ", res);
        onChange(res[0].ufsUrl);
        alert("Upload Completed");
      }}
      onUploadError={(error: Error) => {
        // Do something with the error.
        alert(`ERROR! ${error.message}`);
      }}
    />
  );
}
