export const validateMarkdownFile = (file: File): boolean => {
  const validExtensions = ['.md', '.markdown'];
  const fileName = file.name.toLowerCase();
  return validExtensions.some(ext => fileName.endsWith(ext));
};

export const uploadToS3 = async (
  url: string,
  fields: Record<string, string>,
  file: File
): Promise<void> => {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  formData.append('file', file);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`S3 upload failed: ${response.statusText}`);
  }
};
