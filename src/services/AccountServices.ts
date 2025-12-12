import https from "@/services/http";

export const update = (data: any) => {
  return https.put("/account/update-details", data);
};

export const useracc = (signal = null) => {
  return https.get("/account/me");
};
