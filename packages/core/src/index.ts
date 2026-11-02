export * from "../../../schemas";

export interface SystemEngine {
  name: string;
  version: string;
  healthCheck(): Promise<boolean>;
}
