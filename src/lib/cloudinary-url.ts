export const getCloudinaryUrl = (
  url?: string | null,
  width: number = 800,
  height: number = 600
) => {
  if (!url) return "/placeholder.jpg";

  // If not cloudinary image, return as it is
  if (!url.includes("res.cloudinary.com")) return url;

  return url.replace(
    "/upload/",
    `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`
  );
};