
export interface UploadViewStatus {
  title: string;
  description: string;
  tags: string[];
  currentTag: string;
  audioFile: File | null;
  imageFile: File | null;
  isUploading: boolean;
  uploadSuccess: boolean;
  uploadError: string | null;
  audioDuration: string;
}
