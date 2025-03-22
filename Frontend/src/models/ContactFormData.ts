export type ContactFormData = {
    name: string;
    email: string;
    message: string;
  };
  
  export type Errors = Partial<Record<keyof ContactFormData, string>>;