
const urlParams = new URLSearchParams(window.location.search);
let lang = urlParams.get('lang') || "en";

const langOptions = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'pt', label: 'Português' }
];


function createLangSwitcher() {
    const switcher = document.createElement('div');
    switcher.className = 'lang-switcher';

    const label = document.createElement('span');
    label.textContent = 'Language:';
    label.className = 'lang-switcher-label';
    switcher.appendChild(label);

    langOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt.label;
        btn.className = 'lang-switcher-btn' + (lang === opt.code ? ' active' : '');
        btn.addEventListener('click', () => {
            if (lang !== opt.code) {
                urlParams.set('lang', opt.code);
                window.location.search = urlParams.toString();
            }
        });
        switcher.appendChild(btn);
    });
    return switcher;
}

// Insert the language switcher at the top of the survey form
window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('survey');
    if (form) {
        const switcher = createLangSwitcher();
        form.parentNode.insertBefore(switcher, form);
    }
});

fetch('./surveys/consumer_survey.json')
    .then(res => res.json())
    .then(data => {
        const form = document.getElementById('survey');

        console.log("data: ", data);


        data.blocks.forEach(b => {
            const section = document.createElement('section');
            const title = document.createElement('h3');
            title.textContent = b.title;

            section.appendChild(title);

            b.questions.forEach(q => {
                const wrapper = document.createElement('div');
                wrapper.className = 'question';

                const titleQuestion = document.createElement('div');
                titleQuestion.textContent = q.label[lang];
                titleQuestion.className = 'question-title';

                // Add asterisk for required fields
                if (q.required === true) {
                    const asterisk = document.createElement('span');
                    asterisk.textContent = ' *';
                    asterisk.className = 'required-asterisk';
                    asterisk.style.color = 'red';
                    asterisk.style.fontWeight = 'bold';
                    titleQuestion.appendChild(asterisk);
                }

                wrapper.appendChild(titleQuestion);

                if (q.type === 'single') {
                    const optionsDiv = document.createElement('div');
                    optionsDiv.classList.add('radio-group');
                    q.options.forEach((opt, i) => {
                        const inputId = `${q.id}_${opt.value}`;
                        const input = document.createElement('input');
                        input.type = 'radio';
                        input.value = opt.value;
                        input.name = q.id;
                        input.id = inputId;

                        const label = document.createElement('label');
                        label.textContent = opt.label[lang];
                        label.htmlFor = inputId;

                        optionsDiv.appendChild(input);
                        optionsDiv.appendChild(label);
                    });
                    wrapper.appendChild(optionsDiv);
                }

                if (q.type === 'multiple') {
                    const optionsDiv = document.createElement('div');
                    optionsDiv.classList.add('checkbox-group');
                    q.options.forEach(opt => {
                        const inputId = `${q.id}_${opt.value}`;
                        const input = document.createElement('input');
                        input.type = 'checkbox';
                        input.value = opt.value;
                        input.name = q.id + '_' + opt.value;
                        input.id = inputId;

                        const label = document.createElement('label');
                        label.textContent = opt.label[lang];
                        label.htmlFor = inputId;

                        optionsDiv.appendChild(input);
                        optionsDiv.appendChild(label);
                    });
                    wrapper.appendChild(optionsDiv);
                }

                if (q.type === 'matrix') {
                    const table = document.createElement('table');
                    const header = document.createElement('tr');
                    header.innerHTML = `<th></th>${q.columns.map(col => `<th>${col.label[lang]}</th>`).join('')}`;
                    table.appendChild(header);

                    q.rows.forEach(row => {
                        const tr = document.createElement('tr');
                        const rowLabelCell = document.createElement('td');
                        rowLabelCell.textContent = row.label[lang];
                        tr.appendChild(rowLabelCell);

                        q.columns.forEach(col => {
                            const cell = document.createElement('td');
                            const inputId = `${q.id}_${row.value}_${col.value}`;

                            const input = document.createElement('input');
                            input.type = 'radio';
                            input.name = `${q.id}_${row.value}`;
                            input.value = col.value;
                            input.id = inputId;

                            const label = document.createElement('label');
                            label.htmlFor = inputId;
                            label.setAttribute('aria-label', `${row.label[lang]} - ${col.label[lang]}`);

                            cell.appendChild(input);
                            cell.appendChild(label);
                            tr.appendChild(cell);
                        });

                        table.appendChild(tr);
                    });

                    wrapper.appendChild(table);
                }

                if (q.type === 'ranked') {
                    const instructionDiv = document.createElement('div');
                    instructionDiv.classList.add('ranked-instruction');
                    instructionDiv.textContent = 'Drag and drop to reorder from most important (top) to least important (bottom)';
                    wrapper.appendChild(instructionDiv);

                    const rankedDiv = document.createElement('div');
                    rankedDiv.classList.add('ranked-group');
                    rankedDiv.setAttribute('data-question-id', q.id);

                    q.options.forEach((opt, index) => {
                        const itemDiv = document.createElement('div');
                        itemDiv.classList.add('ranked-item');
                        itemDiv.setAttribute('draggable', 'true');
                        itemDiv.setAttribute('data-value', opt.value);

                        const dragHandle = document.createElement('div');
                        dragHandle.classList.add('drag-handle');
                        dragHandle.innerHTML = '⋮⋮';

                        const rankNumber = document.createElement('div');
                        rankNumber.classList.add('rank-number');
                        rankNumber.textContent = index + 1;

                        const label = document.createElement('div');
                        label.textContent = opt.label[lang];
                        label.classList.add('ranked-label');

                        // Hidden input to store the ranking
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = `${q.id}_${opt.value}`;
                        input.value = index + 1;

                        itemDiv.appendChild(dragHandle);
                        itemDiv.appendChild(rankNumber);
                        itemDiv.appendChild(label);
                        itemDiv.appendChild(input);
                        rankedDiv.appendChild(itemDiv);
                    });

                    // Add drag and drop functionality
                    let draggedElement = null;

                    rankedDiv.addEventListener('dragstart', function (e) {
                        draggedElement = e.target.closest('.ranked-item');
                        draggedElement.classList.add('dragging');
                    });

                    rankedDiv.addEventListener('dragend', function (e) {
                        if (draggedElement) {
                            draggedElement.classList.remove('dragging');
                            draggedElement = null;
                        }
                    });

                    rankedDiv.addEventListener('dragover', function (e) {
                        e.preventDefault();
                        const afterElement = getDragAfterElement(rankedDiv, e.clientY);
                        if (afterElement == null) {
                            rankedDiv.appendChild(draggedElement);
                        } else {
                            rankedDiv.insertBefore(draggedElement, afterElement);
                        }
                        updateRankNumbers(rankedDiv);
                    });

                    function getDragAfterElement(container, y) {
                        const draggableElements = [...container.querySelectorAll('.ranked-item:not(.dragging)')];

                        return draggableElements.reduce((closest, child) => {
                            const box = child.getBoundingClientRect();
                            const offset = y - box.top - box.height / 2;

                            if (offset < 0 && offset > closest.offset) {
                                return { offset: offset, element: child };
                            } else {
                                return closest;
                            }
                        }, { offset: Number.NEGATIVE_INFINITY }).element;
                    }

                    function updateRankNumbers(container) {
                        const items = container.querySelectorAll('.ranked-item');
                        items.forEach((item, index) => {
                            const rankNumber = item.querySelector('.rank-number');
                            const hiddenInput = item.querySelector('input[type="hidden"]');
                            rankNumber.textContent = index + 1;
                            hiddenInput.value = index + 1;
                        });
                    }

                    wrapper.appendChild(rankedDiv);
                }

                if (q.type === 'email') {
                    const input = document.createElement('input');
                    input.name = q.id;
                    input.id = q.id;
                    input.type = 'email';
                    input.placeholder = 'Enter your email address';

                    // Create error message element
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'validation-error';
                    errorDiv.id = `${q.id}_error`;

                    // Add validation on blur and input events
                    input.addEventListener('blur', function () {
                        validateEmail(input, errorDiv);
                    });

                    input.addEventListener('input', function () {
                        if (errorDiv.style.display !== 'none') {
                            validateEmail(input, errorDiv);
                        }
                    });

                    wrapper.appendChild(input);
                    wrapper.appendChild(errorDiv);
                }

                if (q.type === 'phone') {
                    const input = document.createElement('input');
                    input.name = q.id;
                    input.id = q.id;
                    input.type = 'tel';
                    input.maxLength = 9;  //portugal phone numbers have 9 digits
                    input.placeholder = 'Enter 9-digit phone number';

                    // Create error message element
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'validation-error';
                    errorDiv.id = `${q.id}_error`;

                    // Add validation on blur and input events
                    input.addEventListener('blur', function () {
                        validatePhone(input, errorDiv);
                    });

                    input.addEventListener('input', function () {
                        if (errorDiv.style.display !== 'none') {
                            validatePhone(input, errorDiv);
                        }
                        // Only allow digits
                        input.value = input.value.replace(/[^0-9]/g, '');
                    });

                    wrapper.appendChild(input);
                    wrapper.appendChild(errorDiv);
                }

                if (q.type === 'consent') {
                    const consentWrapper = document.createElement('div');
                    consentWrapper.className = 'consent-wrapper';

                    const consentCheckbox = document.createElement('input');
                    consentCheckbox.type = 'checkbox';
                    consentCheckbox.id = `${q.id}_consent`;
                    consentCheckbox.name = `${q.id}_consent`;

                    const consentLabel = document.createElement('label');
                    consentLabel.htmlFor = consentCheckbox.id;
                    consentLabel.textContent = q.label[lang];

                    consentWrapper.appendChild(consentCheckbox);
                    consentWrapper.appendChild(consentLabel);
                    wrapper.appendChild(consentWrapper);
                }

                section.appendChild(wrapper);
            });
            form.appendChild(section);
        });

        const errorForm = document.createElement('div');
        errorForm.id = 'errorForm';
        const closeMessage = document.createElement('span');
        closeMessage.textContent = '✖';
        closeMessage.className = 'close-message';
        closeMessage.addEventListener('click', function () {
            errorForm.style.display = 'none';
        });
        errorForm.appendChild(closeMessage);
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'There are errors in the form. Please fix them before submitting.';
        errorForm.appendChild(errorMessage);

        form.appendChild(errorForm);

        // Add submit button
        const sectionButton = document.createElement('section');
        sectionButton.className = 'submit-section';
        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.textContent = 'Submit Survey';
        sectionButton.appendChild(submitBtn);
        form.appendChild(sectionButton);

        // Add form validation on submit
        form.addEventListener('submit', function (e) {
            if (!validateForm()) {
                e.preventDefault();
                errorForm.style.display = 'block';
                return;
            }
            // Collect all form data into a JSON object
            e.preventDefault();
            const formData = {};
            // Single and matrix radios
            const radios = form.querySelectorAll('input[type="radio"]');
            radios.forEach(radio => {
                if (radio.checked) {
                    formData[radio.name] = radio.value;
                }
            });
            // Checkboxes (multiple choice)
            const checkboxes = form.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                if (!formData[checkbox.name]) formData[checkbox.name] = [];
                if (checkbox.checked) {
                    formData[checkbox.name].push(checkbox.value || true);
                }
            });
            // Text, email, phone, textarea
            const textInputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');
            textInputs.forEach(input => {
                formData[input.name] = input.value;
            });
            // Ranked (hidden inputs)
            const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
            hiddenInputs.forEach(input => {
                formData[input.name] = input.value;
            });
            // Consent (checkbox)
            const consentInputs = form.querySelectorAll('input[type="checkbox"][name$="_consent"]');
            consentInputs.forEach(input => {
                formData[input.name] = input.checked;
            });

            // POST to server
            fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
                .then(res => {
                    if (res.ok) {
                        errorForm.style.display = 'none';
                        const successDialog = document.getElementById('successDialog');
                        successDialog.showModal();
                        form.reset();
                    } else {
                        errorForm.style.display = 'block';
                    }
                })
                .catch(() => {
                    errorForm.style.display = 'block';
                });
        });
    });

// Email validation function
function validateEmail(input, errorDiv) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const value = input.value.trim();

    if (value === '') {
        showError(errorDiv, 'Email address is required.');
        return false;
    } else if (!emailRegex.test(value)) {
        showError(errorDiv, 'Please enter a valid email address.');
        return false;
    } else {
        hideError(errorDiv);
        return true;
    }
}

// Phone validation function (Portuguese phone numbers)
function validatePhone(input, errorDiv) {
    const phoneRegex = /^[0-9]{9}$/;
    const value = input.value.trim();

    if (value === '') {
        showError(errorDiv, 'Phone number is required.');
        return false;
    } else if (!/^9/.test(value)) {
        showError(errorDiv, 'The first digit must be 9.');
        return false;
    } else if (!phoneRegex.test(value)) {
        showError(errorDiv, 'Please enter a valid 9-digit phone number.');
        return false;
    } else {
        hideError(errorDiv);
        return true;
    }
}

// Helper functions for error display
function showError(errorDiv, message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError(errorDiv) {
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
}

// Form validation function
function validateForm() {
    let isValid = true;

    // Validate all required questions (single, multiple, matrix, ranked, consent)
    const allQuestions = document.querySelectorAll('.question');
    allQuestions.forEach(wrapper => {
        // Find the question id from the first input or select in the wrapper
        let qid = null;
        const input = wrapper.querySelector('input, textarea, select');
        if (input) qid = input.name || input.id;
        // Find the asterisk span to check if required
        const asterisk = wrapper.querySelector('.required-asterisk');
        if (!asterisk) return; // not required

        // Remove any previous error
        let errorDiv = wrapper.querySelector('.validation-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'validation-error';
            errorDiv.style.color = 'white';
            errorDiv.style.fontSize = '14px';
            errorDiv.style.marginTop = '5px';
            wrapper.appendChild(errorDiv);
        }
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';

        // Check for different question types
        // 1. Single choice (radio)
        const radios = wrapper.querySelectorAll('input[type="radio"]');
        if (radios.length > 0) {
            const name = radios[0].name;
            const checked = wrapper.querySelector(`input[type="radio"][name="${name}"]:checked`);
            if (!checked) {
                errorDiv.textContent = 'This field is required.';
                errorDiv.style.display = 'block';
                isValid = false;
            }
            return;
        }
        // 2. Multiple choice (checkbox)
        const checkboxes = wrapper.querySelectorAll('input[type="checkbox"]');
        if (checkboxes.length > 0) {
            const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
            if (!anyChecked) {
                errorDiv.textContent = 'Please select at least one option.';
                errorDiv.style.display = 'block';
                isValid = false;
            }
            return;
        }
        // 3. Matrix (table of radios)
        const table = wrapper.querySelector('table');
        if (table) {
            const rows = table.querySelectorAll('tr');
            // skip header row
            for (let i = 1; i < rows.length; i++) {
                const rowRadios = rows[i].querySelectorAll('input[type="radio"]');
                const name = rowRadios.length > 0 ? rowRadios[0].name : null;
                if (name && !table.querySelector(`input[type="radio"][name="${name}"]:checked`)) {
                    errorDiv.textContent = 'Please answer all rows.';
                    errorDiv.style.display = 'block';
                    isValid = false;
                    break;
                }
            }
            return;
        }
        // 4. Ranked (drag and drop)
        const ranked = wrapper.querySelector('.ranked-group');
        if (ranked) {
            // Check if all hidden inputs have a value
            const hiddenInputs = ranked.querySelectorAll('input[type="hidden"]');
            if (hiddenInputs.length === 0 || Array.from(hiddenInputs).some(inp => !inp.value)) {
                errorDiv.textContent = 'Please rank all options.';
                errorDiv.style.display = 'block';
                isValid = false;
            }
            return;
        }
        // 5. Consent (checkbox)
        const consent = wrapper.querySelector('input[type="checkbox"]');
        if (consent && !consent.checked) {
            errorDiv.textContent = 'You must consent to continue.';
            errorDiv.style.display = 'block';
            isValid = false;
            return;
        }
        // 6. Text, email, phone, etc.
        const textInput = wrapper.querySelector('input[type="text"], textarea');
        if (textInput && textInput.value.trim() === '') {
            errorDiv.textContent = 'This field is required.';
            errorDiv.style.display = 'block';
            isValid = false;
        }

        // Validate all email inputs
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            const errorDiv = document.getElementById(input.id + '_error');
            if (!validateEmail(input, errorDiv)) {
                isValid = false;
            }
        });

        // Validate all phone inputs
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            const errorDiv = document.getElementById(input.id + '_error');
            if (!validatePhone(input, errorDiv)) {
                isValid = false;
            }
        });

    });

    return isValid;
}
