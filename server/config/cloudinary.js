import { v2 as cloudinary } from "cloudinary";

/**
 * Configure Cloudinary with sanitized credentials
 */
const getCloudinaryConfig = () => {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const api_key = process.env.CLOUDINARY_API_KEY?.trim();
  const api_secret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (cloud_name && api_key && api_secret) {
    cloudinary.config({
      cloud_name,
      api_key,
      api_secret,
    });
    return { cloud_name, api_key, api_secret };
  }
  return null;
};

/**
 * Resilient upload buffer to Cloudinary with timeout and graceful fallback
 * @param {Buffer} buffer 
 * @param {string} originalName 
 * @param {string} folder 
 * @returns {Promise<{url: string, public_id: string}>}
 */
export const uploadBufferToCloudinary = (buffer, originalName = "document", folder = "pocket_mentor_notes") => {
  return new Promise((resolve) => {
    const config = getCloudinaryConfig();

    if (!config) {
      console.warn("[Cloudinary] Incomplete or missing credentials. Skipping remote file upload.");
      return resolve({
        url: "",
        public_id: `local_${Date.now()}_${originalName}`,
      });
    }

    // Strict 8-second timeout prevents network hangs or client request timeout
    const timeout = setTimeout(() => {
      console.warn("[Cloudinary] Upload timed out after 8s. Continuing note processing without remote storage.");
      resolve({
        url: "",
        public_id: `timeout_${Date.now()}_${originalName}`,
      });
    }, 8000);

    try {
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
          public_id: `${Date.now()}_${sanitizedName}`,
        },
        (error, result) => {
          clearTimeout(timeout);
          if (error) {
            console.warn("[Cloudinary Upload Warning]", error.message || error);
            // Graceful fallback: Do not fail the student's study note if Cloudinary has permissions/rate issues
            return resolve({
              url: "",
              public_id: `fallback_${Date.now()}_${sanitizedName}`,
            });
          }

          resolve({
            url: result?.secure_url || result?.url || "",
            public_id: result?.public_id || "",
          });
        }
      );

      uploadStream.on("error", (streamErr) => {
        clearTimeout(timeout);
        console.warn("[Cloudinary Stream Error]", streamErr.message || streamErr);
        resolve({
          url: "",
          public_id: `stream_err_${Date.now()}_${sanitizedName}`,
        });
      });

      uploadStream.end(buffer);
    } catch (err) {
      clearTimeout(timeout);
      console.warn("[Cloudinary Exception]", err.message || err);
      resolve({
        url: "",
        public_id: `exception_${Date.now()}_${originalName}`,
      });
    }
  });
};

export default cloudinary;
