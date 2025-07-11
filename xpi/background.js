// define sort options
const sorts = [
  { id: "title-asc", title: "Title (A → Z)" },
  { id: "title-dec", title: "Title (Z → A)" },
  { id: "url-asc",   title: "URL (A → Z)" },
  { id: "url-dec",   title: "URL (Z → A)" }
];

// create parent menu
browser.contextMenus.create({
  id: "sort-selected-tabs-parent",
  title: "Sort selected tabs by...",
  contexts: ["tab"]
});

// create child sort menu items (always visible)
for (const sort of sorts) {
  browser.contextMenus.create({
    id: sort.id,
    parentId: "sort-selected-tabs-parent",
    title: sort.title,
    contexts: ["tab"]
  });
}

// handle menu click
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  const sortId = info.menuItemId;

  if (!sorts.some(s => s.id === sortId)) return;

  const tabs = await browser.tabs.query({
    windowId: tab.windowId,
    highlighted: true
  });

  if (tabs.length < 2) {
    // show a notification or alert
    await browser.notifications.create({
      "type":    "basic",
      "iconUrl": browser.runtime.getURL("seltabsort.svg"),
      "title":   "Cannot sort tabs",
      "message": "Select at least 2 tabs to sort."
    });
    return;
  }

  let sortedTabs;

  switch (sortId) {
    case "title-asc":
      sortedTabs = [...tabs].sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "title-dec":
      sortedTabs = [...tabs].sort((a, b) => b.title.localeCompare(a.title));
      break;
    case "url-asc":
      sortedTabs = [...tabs].sort((a, b) => a.url.localeCompare(b.url));
      break;
    case "url-dec":
      sortedTabs = [...tabs].sort((a, b) => b.url.localeCompare(a.url));
      break;
    default:
      return;
  }

  const minIndex = Math.min(...tabs.map(t => t.index));
  const tabIds = sortedTabs.map(t => t.id);

  await browser.tabs.move(tabIds, { index: minIndex });
});
