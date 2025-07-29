const getTwoLinesOfDescription = (html = "", charLimit = 100) => {
  if (!html) return "";

  // Strip HTML tags using regex
  const textContent = html.replace(/<\/?[^>]+(>|$)/g, "");
  const preview = textContent.trim().slice(0, charLimit);

  return charLimit < textContent.length ? preview + "..." : preview;
};

export default getTwoLinesOfDescription;
