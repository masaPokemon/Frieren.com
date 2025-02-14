var spaceMethods = {
  init: function (parameter) {
    initSpaceDialog();
    window.spaceFullscreen = 0;
  },
  alert: function (parameter) {
    window.alert(parameter.message);
  },
  spaceTest: function (parameter) {
    console.log("spaceTest:");
    console.log(parameter);
    window.unityInstance.SendMessage(
      parameter.callbackGameObjectName,
      parameter.callbackFunctionName,
      "spaceTestReturn"
    );
  },
  fullscreen: function (parameter) {
    const enable = parseInt(parameter.enable);
    if (enable < 0) {
      enable = (window.spaceFullscreen === 0 ? 1 : 0);
    }
    if (window.spaceFullscreen != enable) {
      window.spaceFullscreen = enable;
      window.unityInstance.SetFullscreen(enable !== 0 ? 1 : 0);
    }
  },
  openNewTab: function (parameter) {
    const u = window.navigator.userAgent.toLowerCase();
    if(u.indexOf("iphone") !== -1 || u.indexOf("ipad") !== -1) { // ios
      window.location.href = parameter.url;
    } else {
      window.open(parameter.url);
    }
  },
  openNewPage: function (parameter) {
    window.location.href = parameter.url;
  },
  downloadTexture: function (parameter) {
    const bin = atob(parameter.base64);
    let buffer = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) {
      buffer[i] = bin.charCodeAt(i);
    }

    try {
      var blob = new Blob([buffer.buffer], {
        type: "image/png",
      });
    } catch (e) {
      console.log(e);
      return;
    }

    const url = window.URL || window.webkitURL;
    const dataUrl = url.createObjectURL(blob);

    const a = document.createElement("a");
    a.download = parameter.filename + ".png";
    a.href = dataUrl;

    a.click();
  },
  openVideoDialog: function (parameter) {
    // unset fullscreen
    spaceMethods.fullscreen({enable:"0"});

    // open dialog
    openVideoDialog(parameter.video, parameter.execIdx);
  },
  openSignageDialog: function (parameter) {
    // open dialog
    openSignageDialog(parameter.signages, parameter.execIdx);
  },
  openTutorialDialog: function (parameter) {
    const pics = [
      "TemplateData/image/Guide.png",
      "TemplateData/image/Tutorial_1.png",
      "TemplateData/image/Tutorial_2.png",
      "TemplateData/image/Tutorial_3.png",
      "TemplateData/image/Guide_Hankyu.png"
    ];
    // open dialog
    openTutorialDialog(pics[Math.min(Math.max(parameter.idx, 0), pics.length- 1)], parameter.execIdx);
  },
  openCoverDialog: function (parameter) {
    // open dialog
    openCoverDialog(parameter.pic, parameter.execIdx);
  },
  openBeautyDialog: function (parameter) {
    // open dialog
    openBeautyDialog(parameter.title, parameter.text, parameter.link, parameter.linkText, parameter.gtagParams, parameter.execIdx);
  }
};

function receiveMessage(event) {
  const data = JSON.parse(event.detail);
  if (spaceMethods[data.methodName] != undefined) {
    let parameter = data.parameter;
    try {
      parameter = JSON.parse(parameter);
      parameter.execIdx = data.execIdx;
    } catch (e) {
      parameter = null;
    }
    spaceMethods[data.methodName](parameter);
  } else {
    console.log("method not found. " + data.methodName);
  }
}

// listen spaceMessage
window.addEventListener("spaceMessage", receiveMessage, false);
