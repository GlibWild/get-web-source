function getAllImages() {
  const imgTags = Array.from(document.querySelectorAll("img")).map(
    (img) => img.src
  );
  const bgImages = Array.from(document.querySelectorAll("*"))
    .map((el) => getComputedStyle(el).backgroundImage)
    .filter((t) => t && t.startsWith("url"))
    .map((bg) => bg.replace(/url\(["']?(.*?)["']?\)/, "$1"));
  return [...new Set([...imgTags, ...bgImages])];
}

function getAllColor() {
  const bgColors = [];
  const fontColors = [];
  const backgrounds = [];
  const allEle = Array.from(document.querySelectorAll("*"));
  allEle.forEach((el) => {
    const bgColor = getComputedStyle(el).backgroundColor;
    const fontColor = getComputedStyle(el).color;
    if (
      bgColor &&
      bgColor !== "rgba(0, 0, 0, 0)" &&
      bgColor !== "rgb(0, 0, 0)" &&
      bgColor !== "transparent"
    ) {
      bgColors.push(bgColor);
    }

    const bgImage = getComputedStyle(el).background;
    if (bgImage && bgImage !== "none" && !(bgImage.includes("rgba(0, 0, 0, 0)") && !bgImage.includes("url")) 
     && !(bgImage.includes("rgb(255, 255, 255) none") && !bgImage.includes("url"))
    ) {
      var height = getComputedStyle(el).height;
      var width = getComputedStyle(el).width;
      //   const gradientColors = bgColor.match(
      //     /rgba?\((\d+), (\d+), (\d+)(?:, (\d+))?\)/g
      //   );
      //   if (gradientColors) {
      //     gradientColors.forEach((color) => {
      //       if (color !== "rgba(0, 0, 0, 0)" && color !== "rgb(0, 0, 0)")
      //         bgColors.push(color);
      //     });
      //   }
      // }
      // if(bgImage && bgImage.startsWith("linear-gradient")) {

      var bgStyle = {
        bgImage: bgImage,
        width: width,
        height: height,
      };
      backgrounds.push(bgStyle);
    }

    if (
      fontColor &&
      fontColor !== "rgba(0, 0, 0, 0)" &&
      fontColor !== "transparent"
    ) {
      fontColors.push(fontColor);
    }
  });
  return {
    bgColors: [...new Set(bgColors)],
    fontColors: [...new Set(fontColors)],
    backgrounds: [...new Set(backgrounds)],
  };
}

function getDominantColor(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // 处理跨域问题
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;
      let r = 0,
        g = 0,
        b = 0,
        count = 0;

      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }

      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);

      if (r >= 0 && g >= 0 && b >= 0) {
        resolve({ rgb: `rgb(${r}, ${g}, ${b})`, hex: rgbToHex(r, g, b) });
      } else {
        resolve({ rgb: "rgb(0, 0, 0)", hex: "error" }); // 如果加载失败，返回黑色
      }
    };
    img.onerror = () => {
      resolve({ rgb: "rgb(0, 0, 0)", hex: "error" }); // 如果加载失败，返回黑色
    };
  });
}

function rgbToHex(r, g, b) {
  const toHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

async function getSource() {
  console.log("🔍 开始提取页面图片和颜色信息...");
  const images = getAllImages();
  const colors = await Promise.all(images.map(getDominantColor));
  const { bgColors, fontColors, backgrounds } = getAllColor();
  chrome.runtime.sendMessage({
    images,
    colors,
    bgColors,
    fontColors,
    backgrounds,
  });
}

// getSource();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "run") {
    getSource();
    sendResponse({ status: "running" });
  }
});
