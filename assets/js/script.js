if (typeof NodeList.prototype.forEach !== 'function') {
  NodeList.prototype.forEach = Array.prototype.forEach;
}

// Theme management
const theme = (window.localStorage.getItem('theme') ?? 'light');
const toggle_theme = document.querySelector('#toggle-theme');
document.querySelector('html').setAttribute('theme', theme);
toggle_theme.onclick = () => {
  const newTheme = (window.localStorage.getItem('theme') ?? 'light') === 'dark' ? 'light' : 'dark';
  document.querySelector('html').setAttribute('theme', newTheme);
  window.localStorage.setItem('theme', newTheme);
};

const elements = {
  container: document.getElementById("container"),
  header: document.getElementById("header"),
  types: document.getElementById("types"),
  providerName: document.getElementById("provider-name"),
  providerNameSub: document.getElementById("provider-name-sub"),
  update: document.getElementById("update"),
  connect: document.getElementById("connect"),
  next: document.getElementById("next"),
  image: document.getElementById("image")
};

let mtproto_pointer = 0;
let mtproto_data = [];

const setBackground = color => elements.header.style.setProperty('--background-gur', color);
const showNextButton = show => elements.next.style.display = show ? 'block' : 'none';
const updateProviderInfo = (provider, sub, updateText, buttonText, buttonAction) => {
  elements.providerName.innerHTML = provider;
  elements.providerNameSub.innerHTML = sub;
  elements.update.innerHTML = updateText;
  elements.connect.innerHTML = buttonText;
  elements.connect.onclick = buttonAction;
};

function fetchData(url, callback) {
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => callback(data))
    .catch(error => {
      console.error('Fetch error:', error);
      elements.providerName.innerHTML = "Error fetching data";
      elements.providerNameSub.innerHTML = error.message;
    });
}

function fetchTextData(url, callback) {
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(data => callback(data))
    .catch(error => {
      console.error('Fetch error:', error);
      elements.providerName.innerHTML = "Error fetching data";
      elements.providerNameSub.innerHTML = error.message;
    });
}

function mtproto() {
  elements.providerName.innerHTML = "Connecting ...";
  elements.image.src = "assets/img/mtproto.png";
  showNextButton(true);
  setBackground("rgb(173, 203, 224)");

  if (mtproto_data.length === 0) {
    fetchData('https://raw.githubusercontent.com/rah-nejat/Azadi/main/mtproto/mtproto.json', data => {
      mtproto_data = data;
      flushMtproto(mtproto_data.result[mtproto_pointer]);
    });
  } else {
    flushMtproto(mtproto_data.result[mtproto_pointer]);
  }
}

function flushMtproto(item) {
  const updateTime = Math.ceil((mtproto_data.response_time - item.time) / 60) + " minutes ago";
  updateProviderInfo(item.provider + " #" + item.priority, '', updateTime, "Connect", () => window.open(item.data));

  elements.next.onclick = () => {
    if (elements.types.value === "mtproto") {
      mtproto_pointer = (mtproto_pointer + 1) % mtproto_data.result.length;
      flushMtproto(mtproto_data.result[mtproto_pointer]);
    }
  };
}

function setupConnection(type, url, provider, sub) {
  elements.providerName.innerHTML = "Connecting ...";
  elements.image.src = `assets/img/${type}.png`;
  
  if (type === "singbox") {
    setBackground("rgb(84, 110, 122)"); 
  } else if (type === "clash") {
    setBackground("rgb(33, 79, 135)"); 
  } else if (type === "meta") {
    setBackground("rgb(43, 188, 211)");
  } else if (type === "surfboard") {
    setBackground("rgb(0, 147, 130)");
  } else {
    setBackground("rgba(103, 177, 104, 0.37)");  
  }

  showNextButton(false);

  fetchTextData(url, item => {
    updateProviderInfo(provider, sub, "", "Copy", () => {
      navigator.clipboard.writeText(item);
      elements.connect.innerHTML = "Copied";
      setTimeout(() => elements.connect.innerHTML = "Copy", 2000);
    });
  });
}


document.addEventListener('DOMContentLoaded', () => {
  const typeList = {
    "mtproto": "MTProto",
    "xray": "v2ray",
    "xrayb64": "v2raybase64",
    "singbox": "singbox",
    "clash": "clash",
    "meta": "meta",
    "surfboard": "Surfboard"
  };

  Object.entries(typeList).forEach(([value, text]) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.text = text;
    elements.types.add(opt);
  });

  mtproto(); // Initial call

  elements.types.addEventListener("change", () => {
    switch (elements.types.value) {
      case "mtproto": mtproto(); break;
      case "xray": setupConnection("xray", "https://raw.githubusercontent.com/rah-nejat/Azadi/main/xray/normal/mix", "v2ray", "sub link"); break;
      case "xrayb64": setupConnection("xray", "https://raw.githubusercontent.com/rah-nejat/Azadi/main/xray/base64/mix", "v2ray base64", "sub link"); break;
      case "singbox": setupConnection("singbox", "https://raw.githubusercontent.com/rah-nejat/Azadi/main/singbox/mix.json", "singbox", "sub link"); break;
      case "clash": setupConnection("clash", "https://raw.githubusercontent.com/rah-nejat/Azadi/main/clash/mix", "clash", "sub link"); break;
      case "meta": setupConnection("meta", "https://raw.githubusercontent.com/rah-nejat/Azadi/main/meta/mix", "meta", "sub link"); break;
      case "surfboard": setupConnection("surfboard", "https://raw.githubusercontent.com/rah-nejat/Azadi/main/surfboard/mix", "clash", "sub link"); break;
    }
  });
});
