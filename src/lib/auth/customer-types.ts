export type CustomerAuthField = "name" | "email" | "password";

export type CustomerAuthState = {
  error?: string;
  fieldErrors?: Partial<Record<CustomerAuthField, string>>;
};
