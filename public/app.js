const urlParams = new URLSearchParams(window.location.search);
const lang = urlParams.get('lang') || "en";

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

                section.appendChild(wrapper);
            });
            form.appendChild(section);
        });

        // Add submit button
        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.textContent = 'Submit Survey';
        form.appendChild(submitBtn);

        // Add form validation on submit
        form.addEventListener('submit', function (e) {
            if (!validateForm()) {
                e.preventDefault();
                alert('');
            }
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

    return isValid;
}
