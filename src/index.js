import npyjs from "npyjs";

var dataStore = {};

const DATA_LENTH = 201 * 656;

const canvases = [
  document.getElementById("canvas0"),
  document.getElementById("canvas1"),
  document.getElementById("canvas2"),
];

const fileInputs = [
  document.getElementById("file0"),
  document.getElementById("file1"),
  document.getElementById("file2"),
];

const sliders = [
  { slider: "slider0", value: "sliderValue0" },
  { slider: "slider1", value: "sliderValue1" },
  { slider: "slider2", value: "sliderValue2" },
];

sliders.forEach(({ slider, value }) => {
  const sliderElement = document.getElementById(slider);
  const valueElement = document.getElementById(value);

  sliderElement.addEventListener("input", () => {
    valueElement.textContent = sliderElement.value;

    console.log("index:", slider, "value:", sliderElement.value);

    const data = processData();
    console.log(data);
    drawImage(data);
  });
});

function processData() {
  const data = new Float32Array(DATA_LENTH);
  // console.log("dataStore:", dataStore["data0"][0]);
  const normalizedData = dataStore["data0"].data.map((value) =>
    value * 255
  );
  const normalizedData1 = dataStore["data1"].data.map((value) =>
    value * 255
  );
  const normalizedData2 = dataStore["data2"].data.map((value) =>
    value * 255
  );
  // console.log(document.getElementById("slider0").value ,document.getElementById("slider1").value ,document.getElementById("slider2").value )
  console.log("res:",normalizedData, normalizedData1, normalizedData2);
  for (let i = 0; i < DATA_LENTH; i++) {
    data[i] =
      (normalizedData[i] * document.getElementById("slider0").value +
        normalizedData1[i] * document.getElementById("slider1").value +
        normalizedData2[i] * document.getElementById("slider2").value) /
      3;
  }
  return data;
}

fileInputs.forEach((fileInput, index) => {
  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".npy")) {
      const npy = new npyjs();
      const data = await loadNPYFile(file, npy);
      dataStore[`data${index}`] = data;
      if (data) {
        if (data.shape.length === 2 && data.shape[0] > 0 && data.shape[1] > 0) {
          console.log(data);
          updateCanvas(canvases[index], data.data, data.shape);
          if (Object.keys(dataStore).length == 3) {
            const finalData = processData();
            console.log(finalData);
            drawImage(finalData);
          }
        } else {
          alert("The .npy file does not contain a valid 2D array!");
        }
      } else {
        alert("Failed to load .npy file");
      }
    }
  });
});

async function loadNPYFile(file, npy) {
  try {
    const buffer = await file.arrayBuffer();
    return npy.parse(buffer);
  } catch (error) {
    console.error("Failed to parse .npy file:", error);
    return null;
  }
}

function updateCanvas(canvas, data, shape) {
  const ctx = canvas.getContext("2d");
  const [rows, cols] = shape;
  console.log("rows, cols", rows, cols);

  // Adjust canvas dimensions to match data shape
  canvas.width = cols;
  canvas.height = rows;

  // Create an ImageData object for rendering
  const imageData = ctx.createImageData(cols, rows);
  // Fill ImageData with grayscale values
  for (let i = 0; i < data.length; i++) {
    const value = data[i] * 255; // Convert normalized value [0, 1] to [0, 255]
    const idx = i * 4; // Each pixel requires 4 entries (R, G, B, A)
    imageData.data[idx] = value; // Red channel
    imageData.data[idx + 1] = value; // Green channel
    imageData.data[idx + 2] = value; // Blue channel
    imageData.data[idx + 3] = 255; // Alpha channel (fully opaque)
  }

  // Render the image data on the canvas
  ctx.putImageData(imageData, 0, 0);
}

function drawImage(data) {
  const canvas = document.getElementById("mainCanvas");
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const pixels = imageData.data;

  // Convert the normalized data to RGBA format for the canvas
  for (let i = 0; i < DATA_LENTH; i++) {
    const value = data[i]; // Scale to [0, 255]
    const pixelIndex = i * 4;
    pixels[pixelIndex] = value; // Red
    pixels[pixelIndex + 1] = value; // Green
    pixels[pixelIndex + 2] = value; // Blue
    pixels[pixelIndex + 3] = 255; // Alpha (opaque)
  }

  ctx.putImageData(imageData, 0, 0);
}
