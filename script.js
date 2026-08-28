// DOM Elements
const numInputsEl = document.getElementById('num-inputs');
const generateBtn = document.getElementById('generate-btn');
const inputsContainer = document.getElementById('inputs-container');
const processBtn = document.getElementById('process-btn');

// Function to generate the UI for a single input block
function createInputRow(index) {
    const row = document.createElement('div');
    row.className = 'input-row';
    row.id = `row-${index}`;

    // Notice we now have a "from-base" and a "to-base" dropdown
    row.innerHTML = `
        <h3>Input Number ${index}</h3>
        <div class="form-group">
            <select class="base-selector" id="from-base-${index}">
                <option value="2">Binary</option>
                <option value="8">Octal</option>
                <option value="10" selected>Decimal</option>
                <option value="16">Hexadecimal</option>
            </select>
            
            <span style="color: var(--text-muted); font-weight: bold;">TO</span>
            
            <select class="base-selector" id="to-base-${index}">
                <option value="2">Binary</option>
                <option value="8">Octal</option>
                <option value="10">Decimal</option>
                <option value="16" selected>Hexadecimal</option>
            </select>

            <input type="text" class="flex-grow value-input" id="val-${index}" placeholder="Enter number...">
        </div>
        <div class="error-message" id="err-${index}">Invalid input for the selected starting base.</div>
        
        <div class="single-result">
            <div class="result-label">Converted Result:</div>
            <div class="result-value" id="res-${index}">-</div>
        </div>
    `;
    return row;
}

// Generate the specified number of inputs (Min 3)
function renderInputs() {
    inputsContainer.innerHTML = '';
    let count = parseInt(numInputsEl.value);
    
    if (count < 3 || isNaN(count)) {
        count = 3;
        numInputsEl.value = 3;
    }

    for (let i = 1; i <= count; i++) {
        inputsContainer.appendChild(createInputRow(i));
    }
}

// Bouncer: Checks if the characters match the starting base
function isValidNumber(value, base) {
    if (!value) return false;
    
    const regexMap = {
        '2': /^[01]+$/,
        '8': /^[0-7]+$/,
        '10': /^[0-9]+$/,
        '16': /^[0-9A-Fa-f]+$/
    };
    
    return regexMap[base].test(value);
}

// Erase previous results/errors
function clearResults(index) {
    document.getElementById(`res-${index}`).innerText = '-';
    
    const inputField = document.getElementById(`val-${index}`);
    const errorMsg = document.getElementById(`err-${index}`);
    inputField.classList.remove('error');
    errorMsg.style.display = 'none';
}

// Process Data: Validate and Convert
processBtn.addEventListener('click', () => {
    const count = parseInt(numInputsEl.value);

    for (let i = 1; i <= count; i++) {
        // We now grab BOTH the "From" base and the "To" base
        const fromBase = document.getElementById(`from-base-${i}`).value;
        const toBase = document.getElementById(`to-base-${i}`).value;
        
        const inputField = document.getElementById(`val-${i}`);
        const errorMsg = document.getElementById(`err-${i}`);
        const value = inputField.value.trim();

        clearResults(i);

        // Validation Check (checks against the "FROM" base)
        if (!isValidNumber(value, fromBase)) {
            inputField.classList.add('error');
            errorMsg.style.display = 'block';
            continue; 
        }

        // 1. Convert the input into a standard Decimal (Base 10) integer
        const decimalValue = parseInt(value, parseInt(fromBase));

        // 2. Shape-shift that decimal into whatever the "TO" base is
        let convertedValue = decimalValue.toString(parseInt(toBase));
        
        // 3. Make Hex letters uppercase to look nice, then slap it in the HTML
        if (toBase === '16') {
            convertedValue = convertedValue.toUpperCase();
        }

        document.getElementById(`res-${i}`).innerText = convertedValue;
    }
});

// Boot it up
renderInputs();
generateBtn.addEventListener('click', renderInputs);