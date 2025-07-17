// const currentTime = document.querySelector("h1"),
// content = document.querySelector(".content"),
// selectMenu = document.querySelectorAll("select"),
// setAlarmBtn = document.querySelector("button");

// let alarmTime, isAlarmSet,
//  ringtone = new Audio("/assets/files/ringtone.mp3");


// for (let i = 12; i > 0; i--) {
//     i = i < 10 ? `0${i}` : i;
//     let option = `<option value="${i}">${i}</option>`;
//     selectMenu[0].firstElementChild.insertAdjacentHTML("afterend", option);
// }

// for (let i = 59; i >= 0; i--) {
//     i = i < 10 ? `0${i}` : i;
//     let option = `<option value="${i}">${i}</option>`;
//     selectMenu[1].firstElementChild.insertAdjacentHTML("afterend", option);
// }

// for (let i = 2; i > 0; i--) {
//     let ampm = i == 1 ? "AM" : "PM";
//     let option = `<option value="${ampm}">${ampm}</option>`;
//     selectMenu[2].firstElementChild.insertAdjacentHTML("afterend", option);
// }

// setInterval(() => {
//     let date = new Date(),
//     h = date.getHours(),
//     m = date.getMinutes(),
//     s = date.getSeconds(),
//     ampm = "AM";
//     if(h >= 12) {
//         h = h - 12;
//         ampm = "PM";
//     }
//     h = h == 0 ? h = 12 : h;
//     h = h < 10 ? "0" + h : h;
//     m = m < 10 ? "0" + m : m;
//     s = s < 10 ? "0" + s : s;
//     currentTime.innerText = `${h}:${m}:${s} ${ampm}`;

//     if (alarmTime === `${h}:${m} ${ampm}`) {
//         ringtone.play();
//         ringtone.loop = true;
//     }
// });

// function setAlarm() {
//     if (isAlarmSet) {
//         alarmTime = "";
//         ringtone.pause();
//         content.classList.remove("disable");
//         setAlarmBtn.innerText = "Set Alarm";
//         return isAlarmSet = false;
//     }

//     let time = `${selectMenu[0].value}:${selectMenu[1].value} ${selectMenu[2].value}`;
//     if (time.includes("Hour") || time.includes("Minute") || time.includes("AM/PM")) {
//         return alert("Please, select a valid time to set Alarm!");
//     }
//     alarmTime = time;
//     isAlarmSet = true;
//     content.classList.add("disable");
//     setAlarmBtn.innerText = "Clear Alarm";
// }

// setAlarmBtn.addEventListener("click", setAlarm);



const currentTime = document.querySelector("#current-time"),
  content = document.querySelector(".content"),
  selectMenu = document.querySelectorAll("select"),
  setAlarmBtn = document.querySelector("button"),
  alarmAudio = document.querySelector("#alarm-audio");

let alarmTime = "", isAlarmSet = false;

// Insert dropdown options
for (let i = 12; i > 0; i--) {
  let val = i < 10 ? `0${i}` : `${i}`;
  let option = `<option value="${val}">${val}</option>`;
  selectMenu[0].insertAdjacentHTML("beforeend", option);
}

for (let i = 59; i >= 0; i--) {
  let val = i < 10 ? `0${i}` : `${i}`;
  let option = `<option value="${val}">${val}</option>`;
  selectMenu[1].insertAdjacentHTML("beforeend", option);
}

["AM", "PM"].forEach(ampm => {
  let option = `<option value="${ampm}">${ampm}</option>`;
  selectMenu[2].insertAdjacentHTML("beforeend", option);
});

// Ticking clock + alarm match check
setInterval(() => {
  const now = new Date();
  let h = now.getHours(),
    m = now.getMinutes(),
    s = now.getSeconds(),
    ampm = h >= 12 ? "PM" : "AM";

  h = h % 12 || 12;
  h = h < 10 ? "0" + h : h;
  m = m < 10 ? "0" + m : m;
  s = s < 10 ? "0" + s : s;

  const timeString = `${h}:${m}:${s} ${ampm}`;
  currentTime.innerText = timeString;

  const alarmCompare = alarmTime + ":00";
  if (alarmTime && timeString === alarmCompare) {
    alarmAudio.play();
    alarmAudio.loop = true;
  }
}, 1000);

// Set/Clear Alarm
function setAlarm() {
  if (isAlarmSet) {
    alarmTime = "";
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
    content.classList.remove("disable");
    setAlarmBtn.innerText = "Set Alarm";
    isAlarmSet = false;
    return;
  }

  const time = `${selectMenu[0].value}:${selectMenu[1].value} ${selectMenu[2].value}`;
  if (time.includes("Hour") || time.includes("Minute") || time.includes("AM/PM")) {
    alert("Please select a valid time to set Alarm!");
    return;
  }

  alarmTime = time;
  isAlarmSet = true;
  content.classList.add("disable");
  setAlarmBtn.innerText = "Clear Alarm";
}

setAlarmBtn.addEventListener("click", setAlarm);

