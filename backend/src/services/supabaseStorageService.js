const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const BUCKET_NAME = "bugvision-datasets";

const uploadFile = async (filePath, storagePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: "text/csv",
        upsert: true
      });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Supabase upload error:", error.message);
    throw new Error("Failed to upload dataset to Supabase.");
  }
};

const downloadFile = async (storagePath, destinationPath) => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(storagePath);

    if (error) {
      throw error;
    }

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    fs.writeFileSync(destinationPath, buffer);

    return destinationPath;
  } catch (error) {
    console.error("Supabase download error:", error.message);
    throw new Error("Failed to download dataset from Supabase.");
  }
};

const deleteFile = async (storagePath) => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Supabase delete error:", error.message);
    throw new Error("Failed to delete dataset from Supabase.");
  }
};

module.exports = {
  uploadFile,
  downloadFile,
  deleteFile
};