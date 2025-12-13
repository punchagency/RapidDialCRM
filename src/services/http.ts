import axios from "axios";

const https =
  process.env.NODE_ENV === "production"
    ? axios.create({
        baseURL: "",
        withCredentials: true,
      })
    : axios.create({
        baseURL: "http://localhost:5000/api/",
        withCredentials: true,
      });

export default https;
