
function initSpaceDialog() {
  window.dialogIdx = -1;
  window.signages = [];
  window.signageIdx = 0;
  MicroModal.init();

  const leftlm = document.getElementById("modal-signage-left");
  leftlm.addEventListener("click", onSignageLeft);
  const rightlm = document.getElementById("modal-signage-right");
  rightlm.addEventListener("click", onSignageRight);
  const modalLabel = document.getElementById("modal-beauty-link-a");
  modalLabel.addEventListener("click", onBeautyLink);

}

function openVideoDialog(src, dialogIdx) {
  window.dialogIdx = dialogIdx;
  // create video
  const video = document.createElement("video");
  video.src = src;
  video.autoplay = true;
  // video.playsInline = true;
  video.setAttribute("controls", "");
  // video.width = parameter.width;
  // video.height = parameter.height;

  // remove and add video
  var elm = document.getElementById("modal-video-content");
  while (elm.firstChild) {
    elm.removeChild(elm.firstChild);
  }
  elm.appendChild(video);

  // open modal
  MicroModal.show("modal-video", {
    onClose: function (modal) {
      video.pause();
      window.dialogIdx = -1;
    },
  });
}

function openSignageDialog(signages, dialogIdx) {
  window.dialogIdx = dialogIdx;
  // set parameters
  window.signages = signages;

  // show/hide arrow
  const isShow = signages.length > 1;
  const leftlm = document.getElementById("modal-signage-left");
  leftlm.style.display = isShow ? "block" : "none";
  const rightlm = document.getElementById("modal-signage-right");
  rightlm.style.display = isShow ? "block" : "none";

  // update signage
  updateSignage(0);

  // open modal
  MicroModal.show("modal-signage", {
    onClose: function (modal) {
      window.dialogIdx = -1;
    },
  });
}

function onSignageLeft(event) {
  updateSignage(window.signageIdx- 1);
}

function onSignageRight(event) {
  updateSignage(window.signageIdx+ 1);
}

function updateSignage(idx) {
  if (window.signages.length == 0) return;
  if (idx < 0) idx = window.signages.length- 1;
  if (idx >= window.signages.length) idx = 0;

  // set parameters
  const contentlm = document.getElementById("modal-signage-content");
  const titlelm = document.getElementById("modal-signage-title");
  if (window.signages[idx].name) {
    const titlpelm = document.getElementById("modal-signage-title-p");
    titlpelm.textContent = window.signages[idx].name;
    contentlm.setAttribute("class", "modal_signage_content");
    titlelm.style.display = "block";
  } else {
    contentlm.setAttribute("class", "modal_signage_content2");
    titlelm.style.display = "none";
  }
  const imagelm = document.getElementById("modal-signage-image");
  imagelm.src = window.signages[idx].pic;

  const linkelm = document.getElementById("modal-signage-link");
  if (window.signages[idx].link) {
    const linkaelm = document.getElementById("modal-signage-link-a");
    linkaelm.href = window.signages[idx].link;
    if (window.signages[idx].linkText) {
      linkaelm.textContent = window.signages[idx].linkText;
    } else {
      linkaelm.textContent = "詳しく見る";
    }
    linkelm.style.display = "block";
  } else {
    linkelm.style.display = "none";
  }

  window.signageIdx = idx;
}

function openTutorialDialog(tutorial, dialogIdx) {
  window.dialogIdx = dialogIdx;
  // set parameter
  const image = document.getElementById("modal-tutorial-image");
  image.src = tutorial;

  // open modal
  MicroModal.show('modal-tutorial', {
    onClose: function(modal) {
      window.dialogIdx = -1;
    }
  });
}

function openCoverDialog(cover, dialogIdx) {
  window.dialogIdx = dialogIdx;
  // set parameter
  const image = document.getElementById("modal-cover-image");
  image.src = cover;

  // open modal
  MicroModal.show('modal-cover', {
    onClose: function(modal) {
      window.dialogIdx = -1;
    }
  });
}

function openBeautyDialog(title, text, link, linkText, gtagParams, dialogIdx) {
  window.dialogIdx = dialogIdx;
  // set parameter
  const modalTitle = document.getElementById("modal-beauty-title");
  if (title) {
    modalTitle.style.display = "block";
    const modalTitleP = document.getElementById("modal-beauty-title-p");
    modalTitleP.innerText = title;
  } else {
    modalTitle.style.display = "none";
  }
  const modalText = document.getElementById("modal_beauty_content_p");
  modalText.innerText = text;
  const modalLabel = document.getElementById("modal-beauty-link-a");
  if (link) {
    modalLabel.innerText = linkText;
    modalLabel.href = link;
  } else {
    const modalLinkBtn = document.getElementById("modal-beauty-link")
    modalLinkBtn.style.display = "none";
  }
  window.beautyLinkParams = gtagParams;

  // open modal
  MicroModal.show('modal-beauty', {
    onClose: function(modal) {
      window.dialogIdx = -1;
    }
  });
}

function onBeautyLink() {
  const params = window.beautyLinkParams;
  if (params) {
    gtag("event", "go", JSON.parse(params));
  }
}
