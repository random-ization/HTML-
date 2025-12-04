export interface SavedFile {
  id: string;
  name: string;
  code: string;
  lastModified: number;
}

export interface CompilerError {
  line?: number;
  message: string;
}

// Defining the shape of the library scope we pass to the dynamic component
export type LibraryScope = {
  [key: string]: any;
};
