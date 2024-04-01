import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyD0h_IDW-wafqs-bW5D8SlqYYGdbqxv63o";
const genAI = new GoogleGenerativeAI(API_KEY);
const userInput = document.getElementById("userInput");
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro-latest" });

// DOM Elements
const heading = document.querySelector(".heading");
const cards_box = document.querySelector(".cards_box");
const response_box = document.querySelector(".response_box");
const chatHistory_wrapper = document.querySelector(".recentChat_text");
let historyObj = {};

const storeHistory_In_Obj = (Input) => {
  const response_box = document.querySelector(".response_box");
  const userInput = `${Input.substring(0, 20)}...`;
  historyObj[userInput] = response_box.innerHTML;
  localStorage.setItem("chatHistory", JSON.stringify(historyObj));
  clearInput();
};

// IFFE for loading previous questions if present

(() => {
  const isPreviousChatExist = JSON.parse(
    localStorage.getItem("previouseQuestion")
  );
  if (isPreviousChatExist) {
    chatHistory_wrapper.innerHTML = isPreviousChatExist;
  }
})();

const appendPrevious_res = (previousPrompt) => {
  const getHistory_from_LocatStrorage = JSON.parse(
    localStorage.getItem("chatHistory")
  );
  if (getHistory_from_LocatStrorage) {
    response_box.innerHTML =
      getHistory_from_LocatStrorage[previousPrompt.trim()];
    hideHomeView();
  }
};

// code to display get the data from localStorage and display it on screen

chatHistory_wrapper.addEventListener("click", (e) => {
  if (e.target.tagName === "SPAN" || e.target.tagName === "A") {
    if (e.target.tagName === "A") {
      const previousPrompt = e.target.querySelector("#userRecent_Question")
        .textContent;
      appendPrevious_res(previousPrompt);
    } else {
      const previousPrompt = e.target.parentElement.querySelector(
        "#userRecent_Question"
      ).textContent;
      appendPrevious_res(previousPrompt);
    }
  }
});

// fun to update questionsHistory

const updateQuestion = (userInput) => {
  // ------------------- getting node Copy -------------------
  const questionsHistory = document
    .querySelector(".questionsHistory")
    .content.cloneNode(true);
  const question = questionsHistory.querySelector("#userRecent_Question");

  question.innerHTML = ` <i class="fa-regular fa-message"></i>
      ${userInput.substring(0, 20)}...`;

  chatHistory_wrapper.append(questionsHistory);
  localStorage.setItem(
    "previouseQuestion",
    JSON.stringify(chatHistory_wrapper.innerHTML)
  );
};

// function to hide heading and cards

const hideHomeView = () => {
  heading.classList.add("none");
  cards_box.classList.add("none");
};
const showHomeView = () => {
  heading.classList.remove("none");
  cards_box.classList.remove("none");
};
// removeIntro

const removeIntro = () => {
  // cloning html nodes
  const responseNode = document
    .querySelector(".onUserInput")
    .content.cloneNode(true);

  const loader_temp = document
    .querySelector(".loader_temp")
    .content.cloneNode(true);

  // ------------------ removing heading & card container ------------------
  hideHomeView();
  response_box.append(responseNode);

  const output = response_box.querySelector("#server_response");
  const prompt = response_box.querySelector("#userPrompt");
  //   adding rotaion class to rotate the logo during requestion data from the server
  const GemeinLogo = response_box.querySelector(
    ".server_response #google_logo"
  );
  GemeinLogo.classList.add("rotaion");
  GemeinLogo.style.alignSelf = "baseline";

  prompt.textContent = userInput.value;
  output.innerHTML = "";
  output.append(loader_temp);
  return output;
};

// typingAffect
const typingAffect = (index, nextWord, element, newResponseLength) => {
  setTimeout(() => {
    element.innerHTML += nextWord;
    if (index >= newResponseLength - 1) {
      storeHistory_In_Obj(userInput.value);
    }
  }, 20 * index);
};

//-------------------- formatData --------------------
let formatData = (data, element) => {
  let splitarr = data.split("**");
  let addBoldTag = "";
  for (let i = 0; i < splitarr.length; i++) {
    if (i % 2 === 0) {
      addBoldTag += splitarr[i];
    } else {
      addBoldTag += "<b>" + splitarr[i] + "</b>";
    }
  }
  const newResponse = addBoldTag.split("*").join("</br>").split(" ");
  for (let i = 0; i < newResponse.length; i++) {
    const newWord = newResponse[i];
    typingAffect(i, newWord + " ", element, newResponse.length);
  }
};
// fun to clear input clearInput
const clearInput = () => {
  userInput.value = "";
};

async function requestData() {
  response_box.innerHTML = "";
  const output_element = removeIntro();
  try {
    model
      .generateContent(userInput.value)
      .then((result) => result.response)
      .then((response) => response.text())
      .then((data) => {
        output_element.innerHTML = "";
        formatData(data, output_element);
        const GemeinLogo = document.querySelector(
          ".server_response #google_logo"
        );
        GemeinLogo.classList.remove("rotaion");
      });
  } catch (err) {
    alert(`Server Error ${err}`);
  }
}

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (userInput.value === "") {
      hideArrowImg();
      return;
    } else {
      updateQuestion(userInput.value);
      requestData();
      displayArrowImg();
    }
  }
});

const arrow_img = document.querySelector(".imgs_box .fa-caret-right");

userInput.addEventListener("input", (e) => {
  if (userInput.value !== "") {
    displayArrowImg();
  }
});
arrow_img.addEventListener("click", () => {
  if (userInput.value === "") return;
  else {
    requestData();
  }
});

const cards = document.querySelectorAll(".card ");

cards.forEach((card) => {
  card.addEventListener("click", (e) => {
    let prompt;
    e.target.tagName === "P"
      ? (prompt = e.target.parentElement.querySelector(".prompt"))
      : (prompt = e.target.querySelector(".prompt"));
    userInput.value = prompt.textContent.replace(/\s{2,}/g, " ").trim();
    userInput.focus();
  });
});

const reSetChat = () => {
  response_box.innerHTML = "";
  showHomeView();
  clearInput();
};

const newChat = document.getElementById("newChat");
newChat.onclick = reSetChat;

// code to display maun dots on hovering question

chatHistory_wrapper.addEventListener("mouseover", (e) => {
  if (e.target.tagName === "A") {
    const chatDots = e.target.querySelector("#ChatManue");
    chatDots.classList.add("visible");
  }
});

// function to update localStorage on deleting previous Chat_btn

const updateLocatStorage_of_previousChat = () => {
  localStorage.setItem(
    "previouseQuestion",
    JSON.stringify(chatHistory_wrapper.innerHTML)
  );
};

// function to remove chat btn on click

chatHistory_wrapper.addEventListener("click", (e) => {
  if (e.target.classList.contains("fa-ellipsis-vertical")) {
    const del_btn = e.target.nextElementSibling;
    del_btn.classList.toggle("block");
    del_btn.onclick = (e) => {
      e.target.parentElement.remove();
      updateLocatStorage_of_previousChat();
      reSetChat();
    };
  }
});

const side_bar = document.querySelector(".side_bar");

side_bar.addEventListener("mouseover", (e) => {
  if (
    e.target.tagName !== "A" &&
    e.target.tagName !== "SPAN" &&
    e.target.tagName !== "I"
  ) {
    const chatDots = document.querySelectorAll(".fa-ellipsis-vertical");
    chatDots.forEach((dot) => dot.classList.remove("visible"));
  }
});

const hideArrowImg = () => {
  arrow_img.style.display = "none";
};
const displayArrowImg = () => {
  arrow_img.style.display = "block";
};
// displaying arrow img on loose focus
userInput.addEventListener("focus", () => {
  if (userInput.value !== "") {
    displayArrowImg();
  }
});
// hide arrow img on losing focus on userInput
userInput.addEventListener("blur", () => {
  if (userInput.value === "") {
    hideArrowImg();
  }
});

const gemini_plan = document.getElementById("gemini_plan");
gemini_plan.onclick = (e) => {
  if (e.target.tagName === "I") return;
  else {
    e.target.nextElementSibling.classList.toggle("grid");
    gsap.fromTo(
      e.target.nextElementSibling,
      { y: "-20px", duration: 0.25 },
      { y: "0" }
    );
  }
};

const manu_btn = document.getElementById("manu");
let isSidebarAnimat = false;
const setting_txt = document.querySelectorAll(".setting_txt");

// recentChat_container
let recentChat_container = document.querySelector("#chatHistoryWrapper");

const hideSidebar_Elements = (userLocation, gemin_plan, newChat) => {
  userLocation.classList.toggle("none");
  gemin_plan.classList.toggle("none");
  newChat.classList.toggle("none");
  recentChat_container.classList.toggle("none");
  if (!isSidebarAnimat) {
    isSidebarAnimat = true;
  } else {
    isSidebarAnimat = false;
  }
};
// hideLocation when the side_bar is shrink

const isShowUser_Location = () => {
  const userLocation = document.querySelector(".userLocation");
  const gemin_plan = document.querySelector(".gemini_plan");
  const newChat = document.querySelector(".newChat_Text");

  hideSidebar_Elements(userLocation, gemin_plan, newChat);
};
const showSidebarText = () => {
  const setting_txts = Array.from(setting_txt).slice(0, setting_txt.length - 1);
  if (!isSidebarAnimat) {
    const propertiesArr = [
      `<i class="fa-regular fa-circle-question"></i>`,
      `<i class="fa-solid fa-clock-rotate-left"></i>
    `,
      `<i class="fa-solid fa-gear"></i>
    `,
    ];
    const setting_txts = document.querySelectorAll(".setting_txt");
    for (let i = 0; i < setting_txts.length - 1; i++) {
      setting_txts[i].innerHTML = propertiesArr[i];
      setting_txts[i].parentElement.style.justifyContent = "flex-start";
    }
    isShowUser_Location();
  } else {
    const propertiesArr = [
      `<i class="fa-regular fa-circle-question"></i> Help`,
      `<i class="fa-solid fa-clock-rotate-left"></i>
    Activity`,
      `<i class="fa-solid fa-gear"></i>
    Settings`,
    ];

    for (let i = 0; i < setting_txts.length; i++) {
      setting_txts[i].innerHTML = propertiesArr[i];
      setting_txts[i].parentElement.style.justifyContent = "space-between";
    }
    isShowUser_Location();
    isSidebarAnimat = false;
  }
};

// function for shrinkSideBar
const shrinkSideBar = () => {
  gsap.fromTo(
    side_bar,
    { width: "22rem", ease: "power2.inOut", duration: 0.5 },
    { width: "6rem" }
  );
  showSidebarText();
};

const expandSideBar = () => {
  gsap.fromTo(
    side_bar,
    {
      width: "6rem",
      ease: "power2.inOut",
      duration: 0.5,
      delay: 0.25,
    },
    { width: "22rem" }
  );
  setTimeout(() => {
    showSidebarText();
  }, 400);
};
// for animting sidebar on clincking sidebar_btn

manu_btn.onclick = () => {
  if (!isSidebarAnimat) {
    shrinkSideBar();
  } else {
    expandSideBar();
  }
};

(() => {
  if (window.innerWidth < 840) {
    shrinkSideBar();
  }
})();

const loadAnimation = (selector) => {
  gsap.fromTo(
    selector,
    { y: 0, opacity: 0, duration: 2.5 },
    { y: "100%", opacity: 1 }
  );
};

window.addEventListener("load", () => {
  setTimeout(() => {
    const animation_heading = document.querySelector(".animation_heading");
    loadAnimation(animation_heading);
  }, 500);
  setTimeout(() => {
    const load_animation_box = document.querySelector(".load_animation");
    loadAnimation(load_animation_box);
  }, 1500);
});
