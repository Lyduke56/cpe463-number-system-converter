// DOM Elements
const numInputsEl = document.getElementById('num-inputs');
const generateBtn = document.getElementById('generate-btn');
const inputsContainer = document.getElementById('inputs-container');
const processBtn = document.getElementById('process-btn');
const opButtons = document.querySelectorAll('.op-btn');
const presetButtons = document.querySelectorAll('.preset-btn');

const resultsSection = document.getElementById('results-section');
const expressionDisplay = document.getElementById('expression-display');
const decimalFormula = document.getElementById('decimal-formula');
const finalBinEl = document.getElementById('final-bin');
const finalOctEl = document.getElementById('final-oct');
const finalDecEl = document.getElementById('final-dec');
const finalHexEl = document.getElementById('final-hex');

// application state
let currentOperation = '+'; // '+', '-', '*', '/'

// base subscript map for mathematical expression rendering
const BASE_SUBSCRIPTS = {
    '2': '₂',
    '8': '₈',
    '10': '₁₀',
    '16': '₁₆'
};

// operator display symbols
const OP_SYMBOLS = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷'
};

// operator buttons event listeners
opButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        opButtons.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
        currentOperation = btn.dataset.op;
    });
});

// create DOM structure for a single input row
function createInputRow(index) {
    const row = document.createElement('div');
    row.className = 'input-row';
    row.id = `row-${index}`;

    row.innerHTML = `
        <div class="row-header">
            <h3>Input Number ${index}</h3>
            <span class="row-indicator" id="ind-${index}">Base 10</span>
        </div>

        <div class="form-group">
            <div class="select-wrapper">
                <label for="base-${index}" class="sr-only">Base for input ${index}</label>
                <select class="base-selector" id="base-${index}" data-row="${index}">
                    <option value="2">Binary (Base 2)</option>
                    <option value="8">Octal (Base 8)</option>
                    <option value="10" selected>Decimal (Base 10)</option>
                    <option value="16">Hexadecimal (Base 16)</option>
                </select>
            </div>

            <div class="input-wrapper flex-grow">
                <label for="val-${index}" class="sr-only">Value for input ${index}</label>
                <input type="text" class="value-input" id="val-${index}" placeholder="Enter valid digits for selected base..." spellcheck="false" autocomplete="off">
            </div>
        </div>

        <div class="error-message" id="err-${index}">Invalid digits for the selected base.</div>

        <!-- Per-Input 4-Base Conversion Result Grid -->
        <div class="conversion-matrix">
            <div class="matrix-title">Individual Conversion (All Bases)</div>
            <div class="matrix-grid">
                <div class="matrix-cell">
                    <span class="matrix-base">BIN (2)</span>
                    <span class="matrix-value" id="conv-bin-${index}">-</span>
                </div>
                <div class="matrix-cell">
                    <span class="matrix-base">OCT (8)</span>
                    <span class="matrix-value" id="conv-oct-${index}">-</span>
                </div>
                <div class="matrix-cell">
                    <span class="matrix-base">DEC (10)</span>
                    <span class="matrix-value" id="conv-dec-${index}">-</span>
                </div>
                <div class="matrix-cell">
                    <span class="matrix-base">HEX (16)</span>
                    <span class="matrix-value" id="conv-hex-${index}">-</span>
                </div>
            </div>
        </div>
    `;

    // listen to base change to update label indicator and validate
    const selectEl = row.querySelector(`#base-${index}`);
    const indEl = row.querySelector(`#ind-${index}`);
    selectEl.addEventListener('change', (e) => {
        const baseName = e.target.options[e.target.selectedIndex].text.split(' ')[0];
        indEl.innerText = `${baseName} (Base ${e.target.value})`;
        validateRow(index);
    });

    // listen to input changes for live validation
    const inputEl = row.querySelector(`#val-${index}`);
    inputEl.addEventListener('input', () => {
        validateRow(index);
    });

    return row;
}

// render dynamic rows according to input count (Min 3), preserving existing values
function renderInputs(count = null) {
    if (count === null) {
        count = parseInt(numInputsEl.value, 10);
    }

    if (count < 3 || isNaN(count)) {
        count = 3;
        numInputsEl.value = 3;
    }

    // capture existing input data so user work isnt lost on count adjustment
    const existingData = [];
    const currentRows = inputsContainer.querySelectorAll('.input-row');
    currentRows.forEach((row, i) => {
        const idx = i + 1;
        const baseEl = document.getElementById(`base-${idx}`);
        const valEl = document.getElementById(`val-${idx}`);
        if (baseEl && valEl) {
            existingData.push({ base: baseEl.value, val: valEl.value });
        }
    });

    inputsContainer.innerHTML = '';
    for (let i = 1; i <= count; i++) {
        inputsContainer.appendChild(createInputRow(i));

        // restore previous data if available
        if (existingData[i - 1]) {
            const selectEl = document.getElementById(`base-${i}`);
            const inputEl = document.getElementById(`val-${i}`);
            const indEl = document.getElementById(`ind-${i}`);
            selectEl.value = existingData[i - 1].base;
            inputEl.value = existingData[i - 1].val;
            const baseName = selectEl.options[selectEl.selectedIndex].text.split(' ')[0];
            indEl.innerText = `${baseName} (Base ${existingData[i - 1].base})`;
        }
    }

    // hide previous results when regenerating
    resultsSection.style.display = 'none';
}

// validate input characters against the selected base
function isValidNumber(value, base) {
    if (!value) return false;

    // support optional leading negative sign for input
    const cleanVal = value.startsWith('-') ? value.slice(1) : value;
    if (!cleanVal) return false;

    const regexMap = {
        '2': /^[01]+$/,
        '8': /^[0-7]+$/,
        '10': /^[0-9]+$/,
        '16': /^[0-9A-Fa-f]+$/
    };

    return regexMap[base] ? regexMap[base].test(cleanVal) : false;
}

// helper: convert integer string from a given base into decimal
function parseToDecimal(valueStr, base) {
    const isNeg = valueStr.startsWith('-');
    const cleanStr = isNeg ? valueStr.slice(1) : valueStr;
    const decimal = parseInt(cleanStr, parseInt(base, 10));
    return isNeg ? -decimal : decimal;
}

// helper: convert a decimal number (integer or fractional) into target base string
function formatBase(num, base, precision = 6) {
    if (isNaN(num)) return 'NaN';
    if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

    const isNegative = num < 0;
    const absNum = Math.abs(num);
    const intPart = Math.floor(absNum);
    let fracPart = absNum - intPart;

    let intStr = intPart.toString(base).toUpperCase();
    if (fracPart === 0 || precision <= 0) {
        return (isNegative ? '-' : '') + intStr;
    }

    let fracStr = '';
    let count = 0;
    // compute fractional digits up to given precision
    while (fracPart > 0 && count < precision) {
        fracPart *= base;
        const digit = Math.floor(fracPart);
        fracStr += digit.toString(base).toUpperCase();
        fracPart -= digit;
        count++;
    }

    return (isNegative ? '-' : '') + intStr + '.' + fracStr;
}

// validate a single row and clear/show error styles
function validateRow(index) {
    const base = document.getElementById(`base-${index}`).value;
    const inputField = document.getElementById(`val-${index}`);
    const errorMsg = document.getElementById(`err-${index}`);
    const val = inputField.value.trim();

    if (!val) {
        inputField.classList.remove('error');
        errorMsg.style.display = 'none';
        clearRowConversions(index);
        return false;
    }

    if (!isValidNumber(val, base)) {
        inputField.classList.add('error');
        errorMsg.innerText = `Invalid character for Base ${base}. Allowed: ${getAllowedChars(base)}`;
        errorMsg.style.display = 'block';
        clearRowConversions(index);
        return false;
    }

    inputField.classList.remove('error');
    errorMsg.style.display = 'none';
    return true;
}

// return human-readable allowed characters for error message
function getAllowedChars(base) {
    switch (base) {
        case '2': return '0, 1';
        case '8': return '0 through 7';
        case '10': return '0 through 9';
        case '16': return '0-9, A-F (case-insensitive)';
        default: return '';
    }
}

// clear individual conversion row values
function clearRowConversions(index) {
    document.getElementById(`conv-bin-${index}`).innerText = '-';
    document.getElementById(`conv-oct-${index}`).innerText = '-';
    document.getElementById(`conv-dec-${index}`).innerText = '-';
    document.getElementById(`conv-hex-${index}`).innerText = '-';
}

// display converted values for a single row
function displayRowConversions(index, decVal) {
    document.getElementById(`conv-bin-${index}`).innerText = formatBase(decVal, 2, 0);
    document.getElementById(`conv-oct-${index}`).innerText = formatBase(decVal, 8, 0);
    document.getElementById(`conv-dec-${index}`).innerText = decVal.toString(10);
    document.getElementById(`conv-hex-${index}`).innerText = formatBase(decVal, 16, 0);
}

// main calculation and processing function
function processCalculation() {
    // read actual rendered rows from DOM to avoid out-of-sync count
    const rows = inputsContainer.querySelectorAll('.input-row');
    const count = rows.length;
    let allValid = true;
    const decimalValues = [];
    const originalTokens = [];
    const decimalTokens = [];

    // phase 1: validate and convert each individual input
    for (let i = 1; i <= count; i++) {
        const base = document.getElementById(`base-${i}`).value;
        const inputField = document.getElementById(`val-${i}`);
        const errorMsg = document.getElementById(`err-${i}`);
        const rawVal = inputField.value.trim();

        if (!rawVal) {
            inputField.classList.add('error');
            errorMsg.innerText = 'Input cannot be empty.';
            errorMsg.style.display = 'block';
            clearRowConversions(i);
            allValid = false;
            continue;
        }

        if (!isValidNumber(rawVal, base)) {
            inputField.classList.add('error');
            errorMsg.innerText = `Invalid character for Base ${base}. Allowed: ${getAllowedChars(base)}`;
            errorMsg.style.display = 'block';
            clearRowConversions(i);
            allValid = false;
            continue;
        }

        // valid: convert to standard decimal
        inputField.classList.remove('error');
        errorMsg.style.display = 'none';

        const decVal = parseToDecimal(rawVal, base);
        decimalValues.push(decVal);
        displayRowConversions(i, decVal);

        // store formatted token for mathematical expression (e.g. 1010₂ or 4A₁₆)
        const subscript = BASE_SUBSCRIPTS[base] || `(${base})`;
        originalTokens.push(`${rawVal.toUpperCase()}${subscript}`);
        decimalTokens.push(decVal >= 0 ? `${decVal}` : `(${decVal})`);
    }

    if (!allValid || decimalValues.length < count) {
        resultsSection.style.display = 'none';
        return;
    }

    // phase 2: common base calculation (sequential chain evaluation)
    const opSymbol = OP_SYMBOLS[currentOperation] || currentOperation;
    let computedResult = decimalValues[0];
    let isDivByZero = false;
    let divZeroIndex = null;

    for (let i = 1; i < decimalValues.length; i++) {
        const nextVal = decimalValues[i];
        switch (currentOperation) {
            case '+':
                computedResult += nextVal;
                break;
            case '-':
                computedResult -= nextVal;
                break;
            case '*':
                computedResult *= nextVal;
                break;
            case '/':
                if (nextVal === 0) {
                    isDivByZero = true;
                    divZeroIndex = i + 1;
                    break;
                }
                computedResult /= nextVal;
                break;
        }
        if (isDivByZero) break;
    }

    // if division by zero occurred, flag the offending row
    if (isDivByZero && divZeroIndex !== null) {
        const divField = document.getElementById(`val-${divZeroIndex}`);
        const divErr = document.getElementById(`err-${divZeroIndex}`);
        if (divField && divErr) {
            divField.classList.add('error');
            divErr.innerText = 'Math Error: Division by zero is undefined.';
            divErr.style.display = 'block';
        }
    }

    // phase 3: display arithmetic expression with original values
    const expressionString = originalTokens.join(` ${opSymbol} `);
    expressionDisplay.innerText = expressionString;

    // display decimal breakdown formula
    const decimalFormulaString = decimalTokens.join(` ${opSymbol} `) + (isDivByZero ? ` = Undefined (Division by Zero at Input ${divZeroIndex})` : ` = ${computedResult}`);
    decimalFormula.innerText = decimalFormulaString;

    // phase 4: final multi-base results display
    if (isDivByZero) {
        finalBinEl.innerText = 'Undefined (Div by 0)';
        finalOctEl.innerText = 'Undefined (Div by 0)';
        finalDecEl.innerText = 'Undefined (Div by 0)';
        finalHexEl.innerText = 'Undefined (Div by 0)';
    } else {
        finalBinEl.innerText = formatBase(computedResult, 2, 6);
        finalOctEl.innerText = formatBase(computedResult, 8, 6);
        finalDecEl.innerText = formatBase(computedResult, 10, 6);
        finalHexEl.innerText = formatBase(computedResult, 16, 6);
    }

    // reveal results card with smooth appearance
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// preset test cases handler
const PRESETS = {
    '1': [ // binary + octal + decimal
        { base: '2', val: '1010' }, // 10
        { base: '8', val: '12' },   // 10
        { base: '10', val: '5' }    // 5
    ],
    '2': [ // binary + decimal + hexadecimal
        { base: '2', val: '1111' }, // 15
        { base: '10', val: '20' },  // 20
        { base: '16', val: 'A' }    // 10
    ],
    '3': [ // octal + decimal + hexadecimal
        { base: '8', val: '30' },   // 24
        { base: '10', val: '16' },  // 16
        { base: '16', val: '4' }    // 4
    ],
    '4': [ // binary + octal + hexadecimal
        { base: '2', val: '1100' }, // 12
        { base: '8', val: '10' },   // 8
        { base: '16', val: '2' }    // 2
    ],
    '5': [ // binary + octal + decimal + hexadecimal (all 4)
        { base: '2', val: '1010' }, // 10
        { base: '8', val: '12' },   // 10
        { base: '10', val: '25' },  // 25
        { base: '16', val: '1F' }   // 31
    ]
};

function loadPreset(presetKey) {
    const data = PRESETS[presetKey];
    if (!data) return;

    numInputsEl.value = data.length;
    renderInputs(data.length);

    data.forEach((item, index) => {
        const rowNum = index + 1;
        const selectEl = document.getElementById(`base-${rowNum}`);
        const inputEl = document.getElementById(`val-${rowNum}`);
        const indEl = document.getElementById(`ind-${rowNum}`);

        if (selectEl && inputEl) {
            selectEl.value = item.base;
            inputEl.value = item.val;
            const baseName = selectEl.options[selectEl.selectedIndex].text.split(' ')[0];
            indEl.innerText = `${baseName} (Base ${item.base})`;
        }
    });

    processCalculation();
}

presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const presetId = btn.dataset.preset;
        loadPreset(presetId);
    });
});

// event listeners for primary buttons
generateBtn.addEventListener('click', () => {
    renderInputs();
});

processBtn.addEventListener('click', () => {
    processCalculation();
});

// initialize on page load
renderInputs(3);