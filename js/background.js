// background.js

chrome.runtime.onInstalled.addListener(() => {
  console.log("🔧 插件已安装或更新,后台脚本启动");
});

//使用default_popup时无法触发click事件
// chrome.action.onClicked.addListener(async (tab) => {
//   await chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     files: ["content.js"],
//   });
//   console.log("✅ content.js 注入成功");
//   chrome.tabs.sendMessage(tab.id, { action: "run" }, function (response) {
//     console.log("来自 content.js 的响应:", response);
//   });
//   console.log("🔄 开始提取...");
// });
