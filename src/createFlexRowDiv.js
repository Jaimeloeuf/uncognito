export function createFlexRowDiv(...childNodes) {
  const flexRowDiv = document.createElement("div");
  flexRowDiv.style.display = "flex";
  flexRowDiv.style.flexDirection = "row";
  flexRowDiv.style.justifyContent = "space-between";
  flexRowDiv.style.gap = "1rem";

  for (const childNode of childNodes) {
    flexRowDiv.appendChild(childNode);
  }

  return flexRowDiv;
}
