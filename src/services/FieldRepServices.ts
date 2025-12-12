import https from "./http";
import { FieldRep } from "@/lib/types";

export const listFieldReps = () => {
  return https.get<FieldRep[]>("/field-reps");
};
