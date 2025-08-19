chrome.runtime.onMessage.addListener((request) => {
  //   console.log("🔍 接收到图片和颜色数据:", request);
  const { images, colors, bgColors, fontColors, backgrounds } = request;
  const imgContainer = document.getElementById("images");
  const colorContainer = document.getElementById("colors");
  const bgColorContainer = document.getElementById("bgColors");
  const fontColorContainer = document.getElementById("fontColors");
  const backgroundContainer = document.getElementById("backgrounds");

  images.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.width = 100;
    imgContainer.appendChild(img);

    if (colors[i].hex != "error") {
      const container = document.createElement("div");
      container.className = "container";

      const colorBox = document.createElement("div");
      colorBox.textContent = colors[i].rgb + "-" + colors[i].hex;
      colorBox.style.color = getFontColor(colors[i].rgb);
      colorBox.style.background = colors[i].rgb;
      colorBox.className = "color-box";
      container.appendChild(colorBox);

      const copyButton = document.createElement("button");
      copyButton.textContent = "复制";
      copyButton.style.marginLeft = "10px";
      copyButton.style.cursor = "pointer";
      copyButton.style.height = "30px";
      copyButton.addEventListener("click", () => {
        copyText(color + "");
      });
      container.appendChild(copyButton);

      colorContainer.appendChild(container);
    }
  });
  bgColors.forEach((color) => {
    const container = document.createElement("div");
    container.className = "container";

    const bgColorBox = document.createElement("div");
    bgColorBox.textContent = color + "";
    bgColorBox.style.color = getFontColor(color);
    bgColorBox.style.background = color;
    bgColorBox.className = "color-box";
    container.appendChild(bgColorBox);

    const copyButton = document.createElement("button");
    copyButton.textContent = "复制";
    copyButton.style.marginLeft = "10px";
    copyButton.style.cursor = "pointer";
    copyButton.style.height = "30px";
    copyButton.addEventListener("click", () => {
      copyText(color + "");
    });
    container.appendChild(copyButton);

    bgColorContainer.appendChild(container);
  });

  fontColors.forEach((color) => {
    const container = document.createElement("div");
    container.className = "container";

    const fontColorBox = document.createElement("div");
    fontColorBox.textContent = color + "";
    fontColorBox.style.color = getFontColor(color);
    fontColorBox.style.background = color;
    fontColorBox.className = "color-box";
    container.appendChild(fontColorBox);

    const copyButton = document.createElement("button");
    copyButton.textContent = "复制";
    copyButton.style.marginLeft = "10px";
    copyButton.style.cursor = "pointer";
    copyButton.style.height = "30px";
    copyButton.addEventListener("click", () => {
      copyText(color + "");
    });
    container.appendChild(copyButton);

    fontColorContainer.appendChild(container);
  });

  backgrounds.forEach((bg, i) => {
    const container = document.createElement("div");
    container.className = "background-container";

    const imgBox = document.createElement("div");
    imgBox.style.flex = "1";

    const img = document.createElement("div");
    img.style.background = bg.bgImage;
    // img.style.display = "inline-flex";
    // img.style.textWrap = "nowrap";
    // img.width = 100;
    // img.style.flex = "1";
    // img.style.minHeight = "50px";
    img.style.height = bg.height;
    img.style.width = bg.width;
    img.style.maxWidth = "277px";
    img.style.maxHeight = "120px";
    // img.style.lineHeight = "50px";
    // img.style.textAlign = "center";
    // img.textContent = bg;
    img.style.color = getFontColor(bg.bgImage);
    imgBox.appendChild(img);
    container.appendChild(imgBox);

    const copyButton = document.createElement("button");
    copyButton.textContent = "复制";
    copyButton.style.marginLeft = "10px";
    copyButton.style.cursor = "pointer";
    copyButton.style.height = "30px";
    copyButton.addEventListener("click", () => {
      copyText(bg.bgImage + "");
    });
    container.appendChild(copyButton);

    backgroundContainer.appendChild(container);
    const divider = document.createElement("div");
    divider.style.height = "1px";
    divider.style.background = "#ccc";
    divider.style.margin = "3px 0";
    divider.style.width = "100%";
    backgroundContainer.appendChild(divider);
  });
});

function copyText(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      console.log("✅ 写入成功");
    })
    .catch((err) => {
      console.error("❌ 写入失败：", err);
    });
}

function extractRGBValues(input) {
  const regex =
    /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+))?\s*\)/;
  const match = input.match(regex);

  if (!match) return null;

  return {
    rgb: [
      parseInt(match[1], 10),
      parseInt(match[2], 10),
      parseInt(match[3], 10),
      match[4] !== undefined ? parseFloat(match[4]) : undefined,
    ],
  };
}

function getFontColor(bgColor) {
  const ret = extractRGBValues(bgColor);
  var rgb = ret ? ret.rgb : null;
  if (!rgb) return "#fff";
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  if (rgb[3] !== undefined) {
    // 如果有透明度，计算透明度对亮度的影响
    const alpha = rgb[3] / 255;
    const adjustedBrightness = brightness * (1 - alpha);
    return adjustedBrightness > 127 ? "#fff" : "#000";
  }
  return brightness > 127 ? "#000" : "#fff";
}

// document.getElementById("load").addEventListener("click", () => {
//   runScript();
// });

const runScript = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs[0];
    const url = tab.url;

    if (
      /^(chrome|edge):\/\//.test(url) ||
      /chrome\.google\.com\/webstore/.test(url)
    ) {
      console.warn("无法注入脚本到受保护页面：" + url);
      return;
    }
    await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ["/js/content.js"],
    });

    chrome.tabs.sendMessage(tabs[0].id, { action: "run" }, function (response) {
      //   console.log("来自 content.js 的响应:", response);
    });
    console.log("🔄 开始提取...");
  });
};

document.addEventListener("DOMContentLoaded", () => {
  runScript();
});
