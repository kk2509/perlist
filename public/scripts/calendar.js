document.addEventListener("DOMContentLoaded", () => {
  const monthYear = document.getElementById("monthYear");
  const calendarDates = document.getElementById("calendarDates");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");

  const date = new Date();
  let currentMonth = date.getMonth();
  let currentYear = date.getFullYear();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  function renderCalendar(month, year) {
    const firstDay = new Date(year, month).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calendarDates.innerHTML = "";
    monthYear.textContent = `${months[month]} ${year}`;

    // Empty slots for days before month starts
    for (let i = 0; i < firstDay; i++) {
      calendarDates.innerHTML += `<div></div>`;
    }

    // Fill actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday =
        d === date.getDate() &&
        month === date.getMonth() &&
        year === date.getFullYear();
      calendarDates.innerHTML += `<div class="${isToday ? "today" : ""}">${d}</div>`;
    }
  }

  prevBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
  });

  nextBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
  });

  renderCalendar(currentMonth, currentYear);
});
