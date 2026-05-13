import { initTradux, setLanguage as setTraduxLanguage } from 'https://esm.sh/tradux@1.5.10/browser';

const supportedLanguages = ['en', 'pt'];
const urlParams = new URLSearchParams(window.location.search);
const requestedLang = supportedLanguages.includes(urlParams.get('lang')) ? urlParams.get('lang') : null;
const tradux = await initTradux(requestedLang);
let lang = tradux.currentLanguage;
const t = tradux.t;

document.documentElement.lang = lang;
document.title = t.meta.title;
document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description);
document.querySelector('[data-i18n="survey.success"]')?.replaceChildren(t.survey.success);
document.querySelector('[data-i18n="survey.close"]')?.replaceChildren(t.survey.close);

const langOptions = [
    { code: 'en', label: t.language.en },
    { code: 'pt', label: t.language.pt }
];

function createLangSwitcher() {
    const switcher = document.createElement('div');
    switcher.className = 'lang-switcher';

    const label = document.createElement('span');
    label.textContent = t.language.label;
    label.className = 'lang-switcher-label';
    switcher.appendChild(label);

    langOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt.label;
        btn.className = 'lang-switcher-btn' + (lang === opt.code ? ' active' : '');
        btn.addEventListener('click', async () => {
            if (lang !== opt.code) {
                await setTraduxLanguage(opt.code);
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

// Helper to render a question and return its wrapper
function renderQuestion(q, parentBlock, data, insertAfterElem = null) {
    const wrapper = document.createElement('div');
    wrapper.className = 'question';
    wrapper.dataset.qid = q.id;

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

    // --- SINGLE CHOICE WITH BRANCHING ---
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

        // Branching logic
        if (q.branches && Array.isArray(q.branches)) {
            optionsDiv.addEventListener('change', function (e) {
                // Remove any previously rendered branch questions for this parent
                let nextElem = wrapper.nextSibling;
                while (nextElem && nextElem.classList && nextElem.classList.contains('branch-question')) {
                    let toRemove = nextElem;
                    nextElem = nextElem.nextSibling;
                    toRemove.remove();
                }

                // Find selected value
                const selected = optionsDiv.querySelector('input[type="radio"]:checked');
                if (!selected) return;
                const selectedValue = selected.value;
                // Find branch for this value
                const branch = q.branches.find(b => b.when && b.when.equals === selectedValue);
                if (branch && branch.goto) {
                    // Find the question to branch to
                    let branchQ = null;
                    for (const blk of data.blocks) {
                        branchQ = blk.questions.find(qq => qq.id === branch.goto);
                        if (branchQ) break;
                    }
                    if (branchQ) {
                        const branchWrapper = renderQuestion(branchQ, parentBlock, data);
                        branchWrapper.classList.add('branch-question');
                        // Insert after current wrapper
                        if (wrapper.nextSibling) {
                            wrapper.parentNode.insertBefore(branchWrapper, wrapper.nextSibling);
                        } else {
                            wrapper.parentNode.appendChild(branchWrapper);
                        }
                    }
                }
            });
        }
    }

    // --- (rest of question types unchanged, copy-paste from previous logic) ---
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
        instructionDiv.textContent = t.survey.rankedInstruction;
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
        input.placeholder = t.survey.emailPlaceholder;

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
        input.placeholder = t.survey.phonePlaceholder;

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

    return wrapper;
}



// Fetch survey JSON and render questions after data is loaded

fetch('./surveys/consumer_survey.json')
    .then(res => res.json())
    .then(data => {
        const form = document.getElementById('survey');
        // Find all branch target question IDs
        const branchTargets = new Set();
        data.blocks.forEach(block => {
            block.questions.forEach(q => {
                if (q.branches && Array.isArray(q.branches)) {
                    q.branches.forEach(br => {
                        if (br.goto) branchTargets.add(br.goto);
                    });
                }
            });
        });

        // Helper to shuffle an array (Fisher-Yates)
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        // Render all questions, randomizing only the 'Shopping & Consumption' section
        data.blocks.forEach(b => {
            const section = document.createElement('section');
            const title = document.createElement('h3');
            title.textContent = t.survey.blocks[b.blockId] || b.title;
            section.appendChild(title);

            let questionsToRender = b.questions;
            if (b.title && b.randomizeQuestions) {
                // Make a shallow copy to avoid mutating original
                questionsToRender = b.questions.slice();
                shuffleArray(questionsToRender);
            }

            questionsToRender.forEach(q => {
                if (!branchTargets.has(q.id)) {
                    const wrapper = renderQuestion(q, b, data);
                    section.appendChild(wrapper);
                }
            });
            form.appendChild(section);
        });

        // Error form
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
        errorMessage.textContent = t.survey.formError;
        errorForm.appendChild(errorMessage);
        form.appendChild(errorForm);

        // Add submit button
        const sectionButton = document.createElement('section');
        sectionButton.className = 'submit-section';
        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.textContent = t.survey.submit;
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
        showError(errorDiv, t.validation.emailRequired);
        return false;
    } else if (!emailRegex.test(value)) {
        showError(errorDiv, t.validation.emailInvalid);
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
        showError(errorDiv, t.validation.phoneRequired);
        return false;
    } else if (!phoneRegex.test(value)) {
        showError(errorDiv, t.validation.phoneInvalid);
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


function validateRequiredRadios(wrapper, errorDiv) {
    const radios = wrapper.querySelectorAll('input[type="radio"]');
    if (radios.length > 0) {
        const name = radios[0].name;
        const checked = wrapper.querySelector(`input[type="radio"][name="${name}"]:checked`);
        if (!checked) {
            errorDiv.textContent = t.validation.required;
            errorDiv.style.display = 'block';
            return false;
        }
        return true;
    }
    return null;
}

function validateRequiredCheckboxes(wrapper, errorDiv) {
    const checkboxes = wrapper.querySelectorAll('input[type="checkbox"]');
    if (checkboxes.length > 0) {
        const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
        if (!anyChecked) {
            errorDiv.textContent = t.validation.checkboxRequired;
            errorDiv.style.display = 'block';
            return false;
        }
        return true;
    }
    return null;
}

function validateMatrix(wrapper, errorDiv) {
    const table = wrapper.querySelector('table');
    if (table) {
        const rows = table.querySelectorAll('tr');
        for (let i = 1; i < rows.length; i++) {
            const rowRadios = rows[i].querySelectorAll('input[type="radio"]');
            const name = rowRadios.length > 0 ? rowRadios[0].name : null;
            if (name && !table.querySelector(`input[type="radio"][name="${name}"]:checked`)) {
                errorDiv.textContent = t.validation.matrixRequired;
                errorDiv.style.display = 'block';
                return false;
            }
        }
        return true;
    }
    return null;
}

function validateForm() {
    let isValid = true;
    const allQuestions = document.querySelectorAll('.question');
    allQuestions.forEach(wrapper => {
        const asterisk = wrapper.querySelector('.required-asterisk');
        if (!asterisk) return;
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

        // Radios
        const radiosResult = validateRequiredRadios(wrapper, errorDiv);
        if (radiosResult === false) { isValid = false; return; }
        if (radiosResult === true) return;

        // Checkboxes
        const checkboxesResult = validateRequiredCheckboxes(wrapper, errorDiv);
        if (checkboxesResult === false) { isValid = false; return; }
        if (checkboxesResult === true) return;

        // Matrix
        const matrixResult = validateMatrix(wrapper, errorDiv);
        if (matrixResult === false) { isValid = false; return; }
        if (matrixResult === true) return;

        // Ranked
        const ranked = wrapper.querySelector('.ranked-group');
        if (ranked) {
            const hiddenInputs = ranked.querySelectorAll('input[type="hidden"]');
            if (hiddenInputs.length === 0 || Array.from(hiddenInputs).some(inp => !inp.value)) {
                errorDiv.textContent = t.validation.rankedRequired;
                errorDiv.style.display = 'block';
                isValid = false;
            }
            return;
        }

        // Consent
        const consent = wrapper.querySelector('input[type="checkbox"]');
        if (consent && !consent.checked) {
            errorDiv.textContent = t.validation.consentRequired;
            errorDiv.style.display = 'block';
            isValid = false;
            return;
        }

        // Text, email, phone, etc.
        const textInput = wrapper.querySelector('input[type="text"], textarea');
        if (textInput && textInput.value.trim() === '') {
            errorDiv.textContent = t.validation.required;
            errorDiv.style.display = 'block';
            isValid = false;
        }
    });
    return isValid;
}
