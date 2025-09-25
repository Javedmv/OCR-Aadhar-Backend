export function validateOcrFiles(files: any) {
  if (!files || !files.front || !files.front[0]) {
    return { valid: false, error: "Front image is required" };
  }
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
  const frontType = files.front[0].mimetype;
  if (!allowedTypes.includes(frontType)) {
    return { valid: false, error: "Front image must be PNG or JPEG" };
  }
  if (files.back && files.back[0]) {
    const backType = files.back[0].mimetype;
    if (!allowedTypes.includes(backType)) {
      return { valid: false, error: "Back image must be PNG or JPEG" };
    }
  }
  return { valid: true };
}