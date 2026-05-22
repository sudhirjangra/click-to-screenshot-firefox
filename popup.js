const COUNTRIES = [
  "Albania", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Bangladesh", "Belgium",
  "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Bulgaria", "Canada", "Cape Verde",
  "Chile", "Colombia", "Costa Rica", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Dominican Republic",
  "Ecuador", "El Salvador", "Estonia", "Fiji", "Finland", "France", "Gambia", "Georgia", "Germany", "Ghana",
  "Greece", "Guyana", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Ireland", "Israel", "Italy",
  "Ivory Coast", "Jamaica", "Japan", "Kenya", "Latvia", "Lesotho", "Liberia", "Lithuania", "Luxembourg", "Madagascar",
  "Malawi", "Malaysia", "Malta", "Mauritius", "Mexico", "Moldova", "Mongolia", "Montenegro", "Namibia", "Nepal",
  "Netherlands", "New Zealand", "Nigeria", "North Macedonia", "Norway", "Panama", "Paraguay", "Peru", "Philippines",
  "Poland", "Portugal", "Romania", "Serbia", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "South Africa",
  "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland", "Taiwan", "Tanzania", "Thailand", "Timor-Leste",
  "Trinidad And Tobago", "Tunisia", "Turkey", "Uganda", "United Kingdom", "Uruguay", "Zambia",
];

const ATTRIBUTES = [
  "voting-dates", "how-to-vote", "voting-id-requirements", "polling-location", "how-to-vote-overseas",
  "how-to-vote-military", "Facebook", "election-authority", "candidate-information", "voting-procedures",
  "polling-place-hours", "election-results-information", "polling-place-mail", "how-to-vote-by-mail", "YouTube",
  "Twitter", "voter-registration", "registration-requirements", "voting-requirements", "Whatsapp", "voting-accessibility",
  "voter-info", "voter-registration-deadlines", "how-to-vote-by-proxy", "how-to-vote-online", "voter-registration-check",
  "how-to-vote-early", "voter-registration-online", "voter-registration-by-mail", "where-to-register-to-vote",
  "voter-id-registration-requirements", "how-to-vote-absentee", "polling-place-early", "ballot-tracking",
];

let countryHighlightIndex = -1;
let attributeHighlightIndex = -1;

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;

  if (type === 'success') {
    setTimeout(() => {
      status.textContent = '';
    }, 3000);
  }
}

function populateDropdownList(input, dropdown, items) {
  dropdown.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    li.className = 'dropdown-item';
    li.setAttribute('role', 'option');
    li.addEventListener('click', () => {
      input.value = item;
      dropdown.innerHTML = '';
      dropdown.classList.remove('active');
      resetHighlight(input.id === 'countrySearch' ? 'country' : 'attribute');
    });
    dropdown.appendChild(li);
  });

  if (items.length > 0) {
    dropdown.classList.add('active');
  } else {
    dropdown.classList.remove('active');
  }
}

function resetHighlight(type) {
  if (type === 'country') {
    countryHighlightIndex = -1;
  } else {
    attributeHighlightIndex = -1;
  }
}

function getHighlightIndex(type) {
  return type === 'country' ? countryHighlightIndex : attributeHighlightIndex;
}

function setHighlightIndex(type, index) {
  if (type === 'country') {
    countryHighlightIndex = index;
  } else {
    attributeHighlightIndex = index;
  }
}

function highlightItem(dropdown, index) {
  const items = dropdown.querySelectorAll('.dropdown-item');
  items.forEach(item => item.classList.remove('highlighted'));
  if (index >= 0 && index < items.length) {
    items[index].classList.add('highlighted');
    items[index].scrollIntoView({ block: 'nearest' });
  }
}

function selectHighlightedItem(dropdown, input) {
  const items = dropdown.querySelectorAll('.dropdown-item');
  const index = getHighlightIndex(input.id === 'countrySearch' ? 'country' : 'attribute');
  if (index >= 0 && index < items.length) {
    input.value = items[index].textContent;
    dropdown.innerHTML = '';
    dropdown.classList.remove('active');
    resetHighlight(input.id === 'countrySearch' ? 'country' : 'attribute');
  }
}

function setupKeyboardNavigation(input, dropdown, type, dataList) {
  input.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('.dropdown-item');
    const itemCount = items.length;

    if (!dropdown.classList.contains('active') || itemCount === 0) {
      return;
    }

    let currentIndex = getHighlightIndex(type);

    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentIndex === -1) {
        currentIndex = 0;
      }
      if (items[currentIndex]) {
        input.value = items[currentIndex].textContent;
        dropdown.innerHTML = '';
        dropdown.classList.remove('active');
        resetHighlight(type);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        currentIndex = currentIndex <= 0 ? itemCount - 1 : currentIndex - 1;
      } else {
        currentIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % itemCount;
      }
      setHighlightIndex(type, currentIndex);
      highlightItem(dropdown, currentIndex);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      currentIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % itemCount;
      setHighlightIndex(type, currentIndex);
      highlightItem(dropdown, currentIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      currentIndex = currentIndex <= 0 ? itemCount - 1 : currentIndex - 1;
      setHighlightIndex(type, currentIndex);
      highlightItem(dropdown, currentIndex);
    } else if (e.key === 'Escape') {
      dropdown.classList.remove('active');
      resetHighlight(type);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const floatingBtn = document.getElementById('floatingBtn');
  const optionsPanel = document.getElementById('optionsPanel');
  const countryDropdown = document.getElementById('countryDropdown');
  const attributeDropdown = document.getElementById('attributeDropdown');
  const countrySearch = document.getElementById('countrySearch');
  const attributeSearch = document.getElementById('attributeSearch');
  const captureBtn = document.getElementById('captureBtn');

  // Floating button toggle
  floatingBtn.addEventListener('click', () => {
    optionsPanel.classList.toggle('hidden');
  });

  // Country search with dropdown
  countrySearch.addEventListener('input', (e) => {
    const searchValue = e.target.value.toLowerCase();
    const filtered = searchValue ? COUNTRIES.filter(c =>
      c.toLowerCase().includes(searchValue)
    ) : COUNTRIES;
    populateDropdownList(countrySearch, countryDropdown, filtered);
    resetHighlight('country');
  });

  countrySearch.addEventListener('focus', () => {
    const searchValue = countrySearch.value.toLowerCase();
    const filtered = searchValue ? COUNTRIES.filter(c =>
      c.toLowerCase().includes(searchValue)
    ) : COUNTRIES;
    populateDropdownList(countrySearch, countryDropdown, filtered);
    resetHighlight('country');
  });

  setupKeyboardNavigation(countrySearch, countryDropdown, 'country', COUNTRIES);

  // Attribute search with dropdown
  attributeSearch.addEventListener('input', (e) => {
    const searchValue = e.target.value.toLowerCase();
    const filtered = searchValue ? ATTRIBUTES.filter(a =>
      a.toLowerCase().includes(searchValue)
    ) : ATTRIBUTES;
    populateDropdownList(attributeSearch, attributeDropdown, filtered);
    resetHighlight('attribute');
  });

  attributeSearch.addEventListener('focus', () => {
    const searchValue = attributeSearch.value.toLowerCase();
    const filtered = searchValue ? ATTRIBUTES.filter(a =>
      a.toLowerCase().includes(searchValue)
    ) : ATTRIBUTES;
    populateDropdownList(attributeSearch, attributeDropdown, filtered);
    resetHighlight('attribute');
  });

  setupKeyboardNavigation(attributeSearch, attributeDropdown, 'attribute', ATTRIBUTES);

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-dropdown-wrapper')) {
      countryDropdown.classList.remove('active');
      attributeDropdown.classList.remove('active');
      resetHighlight('country');
      resetHighlight('attribute');
    }
  });

  // Capture button
  captureBtn.addEventListener('click', async () => {
    const country = countrySearch.value;
    const attribute = attributeSearch.value;

    if (!country || !attribute) {
      showStatus('⚠️ Select country and attribute', 'error');
      return;
    }

    captureBtn.disabled = true;
    showStatus('⏳ Capturing screenshot...', 'loading');

    chrome.runtime.sendMessage({
      action: 'captureAndSave',
      country,
      attribute
    }, (response) => {
      captureBtn.disabled = false;

      if (response && response.success) {
        showStatus('✅ Screenshot saved successfully!', 'success');
      } else {
        const errorMsg = response ? response.error : 'Unknown error';
        showStatus(`❌ Error: ${errorMsg}`, 'error');
      }
    });
  });
});
