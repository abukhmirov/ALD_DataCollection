let currentBranch = 'MA'; // Default branch on page load
let interactionIdCounter = 0; // Counter to generate unique IDs

window.onload = function() {
    changeBranch(); // Load counts and update total for the default branch
    interactionIdCounter = parseInt(localStorage.getItem(currentBranch + '_counter') || '0');
};

function changeBranch() {
    currentBranch = document.getElementById('branchSelector').value;
    loadCounts();
    updateTotal();
}

function saveInteraction(category, countChange, note) {
    interactionIdCounter++;
    localStorage.setItem(currentBranch + '_counter', interactionIdCounter.toString());
    let interactions = JSON.parse(localStorage.getItem(currentBranch + '_' + category + '_interactions') || '[]');
    interactions.push({ id: interactionIdCounter, change: countChange, note: note });
    localStorage.setItem(currentBranch + '_' + category + '_interactions', JSON.stringify(interactions));
}

function loadCounts() {
    let categories = ['printing', 'patron', 'library'];
    categories.forEach(category => {
        let interactions = JSON.parse(localStorage.getItem(currentBranch + '_' + category + '_interactions') || '[]');
        let totalCount = interactions.reduce((sum, interaction) => sum + interaction.change, 0);
        document.getElementById(category).textContent = totalCount;
    });
}

function updateTotal() {
    const printingCount = parseInt(document.getElementById('printing').textContent);
    const patronCount = parseInt(document.getElementById('patron').textContent);
    const libraryCount = parseInt(document.getElementById('library').textContent);
    document.getElementById('total').textContent = printingCount + patronCount + libraryCount;
}

function increment(category) {
    const element = document.getElementById(category);
    let currentCount = parseInt(element.textContent);
    const noteText = prompt("Enter note for " + category + " interaction:");
    saveInteraction(category, 1, noteText);
    element.textContent = currentCount + 1;
    updateTotal();
}

function decrement(category) {
    const element = document.getElementById(category);
    let currentCount = parseInt(element.textContent);
    if (currentCount > 0) {
        const noteText = prompt("Enter note for " + category + " interaction:");
        saveInteraction(category, -1, noteText);
        element.textContent = currentCount - 1;
        updateTotal();
    }
}

function resetBranchCounters() {
    ['printing', 'patron', 'library'].forEach(category => {
        document.getElementById(category).textContent = '0';
        localStorage.removeItem(currentBranch + '_' + category + '_interactions');
    });
    updateTotal();
}

function finalizeData() {
    const categories = ['printing', 'patron', 'library'];
    const outputContainer = document.getElementById('outputContainer');
    outputContainer.innerHTML = '';
    const now = new Date(); // Get the current date and time
    const timestamp = now.toLocaleString(); // Format it as a readable string

    categories.forEach(category => {
        let interactions = JSON.parse(localStorage.getItem(currentBranch + '_' + category + '_interactions') || '[]');
        let totalCount = interactions.reduce((sum, interaction) => sum + interaction.change, 0);
        let notes = interactions.map(interaction => interaction.note).filter(note => note).join(", ");
        const dataString = `Branch: ${currentBranch}\tCategory: ${category}\tTotal Count: ${totalCount}\tNotes: ${notes}\tFinalized: ${timestamp}`;
        const output = document.createElement('textarea');
        output.value = dataString;
        output.rows = Math.max(1, dataString.split('\n').length + 1); // Set rows based on number of lines
        output.cols = 100; // Width of the textarea
        output.readOnly = true;
        output.onclick = function() {
            output.select();
        };
        outputContainer.appendChild(output);
    });
    document.body.appendChild(outputContainer);
}
