const formatUrlAdIds = (value) => {
  return value
    .toLowerCase()                 // remove uppercase
    .replace(/\s+/g, '-')          // replace spaces with -
    .replace(/[^\x00-\x7F]/g, '')  // remove Bangla & other Unicode
    .replace(/[^a-z0-9-]/g, '')    // allow only a-z, 0-9, -
    .replace(/-+/g, '-')           // remove multiple --
};
export default formatUrlAdIds;