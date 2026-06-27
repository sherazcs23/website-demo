/* ==========================================================================
   Chronos JavaScript - Real-Time Logic & Calculations
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const birthDateTimeInput = document.getElementById('birthDateTime');
  const userNameInput = document.getElementById('userName');
  const calculateBtn = document.getElementById('calculateBtn');
  const resultsSection = document.getElementById('resultsSection');
  const welcomeMessage = document.getElementById('welcomeMessage');
  const themeToggle = document.getElementById('themeToggle');

  // Initialize theme from localStorage or system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  
  if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
    document.body.classList.add('light-theme');
  }

  // Theme toggle click handler
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });

  // DOM elements for standard duration
  const valYears = document.getElementById('valYears');
  const valMonths = document.getElementById('valMonths');
  const valDays = document.getElementById('valDays');
  const valHours = document.getElementById('valHours');
  const valMinutes = document.getElementById('valMinutes');
  const valSeconds = document.getElementById('valSeconds');

  // DOM elements for metric grids
  const totalYears = document.getElementById('totalYears');
  const totalDays = document.getElementById('totalDays');
  const totalMinutes = document.getElementById('totalMinutes');
  const totalSeconds = document.getElementById('totalSeconds');

  // DOM elements for birthday countdown
  const cdDays = document.getElementById('cdDays');
  const cdHours = document.getElementById('cdHours');
  const cdMins = document.getElementById('cdMins');
  const cdSecs = document.getElementById('cdSecs');
  const nextAgeText = document.getElementById('nextAgeText');

  // DOM elements for estimates
  const statHeartbeats = document.getElementById('statHeartbeats');
  const statBreaths = document.getElementById('statBreaths');
  const statSleep = document.getElementById('statSleep');

  let updateInterval = null;

  // Set maximum selectable date to current date/time to prevent future selections
  const setMaxDateTime = () => {
    const now = new Date();
    // Offset local timezone to get proper format YYYY-MM-DDTHH:MM
    const tzOffset = now.getTimezoneOffset() * 60000; 
    const localISOTime = (new Date(now - tzOffset)).toISOString().slice(0, 16);
    birthDateTimeInput.max = localISOTime;
  };
  
  setMaxDateTime();
  // Keep max date time updated
  setInterval(setMaxDateTime, 60000);

  // Form submit / calculation button
  calculateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    const birthVal = birthDateTimeInput.value;
    if (!birthVal) {
      birthDateTimeInput.reportValidity();
      return;
    }

    const birthDate = new Date(birthVal);
    const now = new Date();

    if (birthDate > now) {
      alert("Please select a birth date and time in the past.");
      return;
    }

    // Personalize welcome banner
    const name = userNameInput.value.trim();
    if (name) {
      welcomeMessage.innerText = `Welcome to your timeline, ${name}!`;
    } else {
      welcomeMessage.innerText = "Welcome to your timeline!";
    }

    // Reveal results section with smooth scroll
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Start live updates
    if (updateInterval) clearInterval(updateInterval);
    updateAge(birthDate);
    updateInterval = setInterval(() => updateAge(birthDate), 50);
  });

  // Calculate and render all metrics
  function updateAge(birthDate) {
    const now = new Date();
    const totalMs = now - birthDate;

    // Safety check (if birth date is somehow set to future post-start)
    if (totalMs < 0) {
      clearInterval(updateInterval);
      resultsSection.classList.add('hidden');
      return;
    }

    /* 1. Calculate Standard Calendar Age */
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    let days = now.getDate() - birthDate.getDate();
    let hours = now.getHours() - birthDate.getHours();
    let minutes = now.getMinutes() - birthDate.getMinutes();
    let seconds = now.getSeconds() - birthDate.getSeconds();

    // Adjust negative seconds
    if (seconds < 0) {
      seconds += 60;
      minutes--;
    }
    // Adjust negative minutes
    if (minutes < 0) {
      minutes += 60;
      hours--;
    }
    // Adjust negative hours
    if (hours < 0) {
      hours += 24;
      days--;
    }
    // Adjust negative days (taking month lengths into account)
    if (days < 0) {
      // Get number of days in the month preceding the current month
      const prevMonthDate = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonthDate.getDate();
      months--;
    }
    // Adjust negative months
    if (months < 0) {
      months += 12;
      years--;
    }

    // Update UI for Clock
    valYears.innerText = padZero(years);
    valMonths.innerText = padZero(months);
    valDays.innerText = padZero(days);
    valHours.innerText = padZero(hours);
    valMinutes.innerText = padZero(minutes);
    valSeconds.innerText = padZero(seconds);


    /* 2. Calculate Cumulative Totals */
    // Average year duration: 365.2425 days (accounts for leap years)
    const msInYear = 1000 * 60 * 60 * 24 * 365.2425;
    const decimalYears = totalMs / msInYear;

    const totalDaysVal = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    const totalMinsVal = Math.floor(totalMs / (1000 * 60));
    const totalSecsVal = Math.floor(totalMs / 1000);

    // Update UI for Totals
    totalYears.innerText = decimalYears.toFixed(9);
    totalDays.innerText = formatNumber(totalDaysVal);
    totalMinutes.innerText = formatNumber(totalMinsVal);
    totalSeconds.innerText = formatNumber(totalSecsVal);


    /* 3. Calculate Next Birthday Countdown */
    let nextBdayYear = now.getFullYear();
    let nextBday = new Date(nextBdayYear, birthDate.getMonth(), birthDate.getDate(), birthDate.getHours(), birthDate.getMinutes(), birthDate.getSeconds());

    // If birthday already happened this year, set to next year
    if (nextBday < now) {
      nextBdayYear++;
      nextBday = new Date(nextBdayYear, birthDate.getMonth(), birthDate.getDate(), birthDate.getHours(), birthDate.getMinutes(), birthDate.getSeconds());
    }

    const bdayDiffMs = nextBday - now;
    const nextAge = nextBdayYear - birthDate.getFullYear();

    const cdDaysVal = Math.floor(bdayDiffMs / (1000 * 60 * 60 * 24));
    const cdHoursVal = Math.floor((bdayDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const cdMinsVal = Math.floor((bdayDiffMs % (1000 * 60 * 60)) / (1000 * 60));
    const cdSecsVal = Math.floor((bdayDiffMs % (1000 * 60)) / 1000);

    // Update UI for Countdown
    cdDays.innerText = padZero(cdDaysVal);
    cdHours.innerText = padZero(cdHoursVal);
    cdMins.innerText = padZero(cdMinsVal);
    cdSecs.innerText = padZero(cdSecsVal);

    if (cdDaysVal === 0 && cdHoursVal === 0 && cdMinsVal === 0 && cdSecsVal === 0) {
      nextAgeText.innerText = `🎂 Happy Birthday! You are turning ${nextAge} today! 🎉`;
    } else {
      nextAgeText.innerText = `You will turn ${nextAge} years old.`;
    }


    /* 4. Calculate Lifetime Estimates */
    // Average resting heart rate: 80 beats per minute
    const heartbeatsEst = totalMinsVal * 80;
    // Average breathing rate: 16 breaths per minute
    const breathsEst = totalMinsVal * 16;
    // Average sleep: 8 hours per day (approx. 1/3 of life)
    const sleepHoursEst = Math.round(totalDaysVal * 8);

    // Update UI for Estimates
    statHeartbeats.innerText = formatNumber(heartbeatsEst);
    statBreaths.innerText = formatNumber(breathsEst);
    statSleep.innerText = formatNumber(sleepHoursEst);
  }

  // Formatting helpers
  function padZero(num) {
    return num < 10 ? `0${num}` : num;
  }

  function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
  }
});
