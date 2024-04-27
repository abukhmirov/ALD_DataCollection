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
    const now = new Date();
    const timestamp = now.toLocaleString();

    categories.forEach(category => {
        let interactions = JSON.parse(localStorage.getItem(currentBranch + '_' + category + '_interactions') || '[]');
        interactions.forEach(interaction => {
            let noteText = interaction.note || "No note";
            const dataString = `Branch: ${currentBranch}\tCategory: ${category}\tNote: ${noteText}\tFinalized: ${timestamp}`;
            const output = document.createElement('textarea');
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteInteraction(category, interaction.id);

            output.value = dataString;
            output.rows = 1; // Adjust row count appropriately
            output.cols = 100;
            output.readOnly = true;
            output.onclick = function() { output.select(); };

            const container = document.createElement('div');
            container.appendChild(output);
            container.appendChild(deleteButton);
            outputContainer.appendChild(container);
        });
    });
}


function finalizeAllInteractions() {
    const categories = ['printing', 'patron', 'library'];
    const outputContainer = document.getElementById('allInteractionsContainer');
    outputContainer.innerHTML = ''; // Clear previous data
    let allDataText = '';

    const now = new Date(); // Get the current date and time
    const timestamp = now.toLocaleString(); // Format it as a readable string

    categories.forEach(category => {
        let interactions = JSON.parse(localStorage.getItem(currentBranch + '_' + category + '_interactions') || '[]');
        interactions.forEach(interaction => {
            let noteText = interaction.note || "No note";
            allDataText += `Branch: ${currentBranch}\tCategory: ${category}\tNote: ${noteText}\tFinalized: ${timestamp}\n`;
        });
    });

    if (allDataText) {
        const output = document.createElement('textarea');
        output.value = allDataText;
        output.rows = 10; // Fixed number of rows for better control
        output.cols = 100; // Width of the textarea
        output.readOnly = true;
        output.onclick = function() { output.select(); };
        outputContainer.appendChild(output);
    }
}

function deleteInteraction(category, interactionId) {
    let interactions = JSON.parse(localStorage.getItem(currentBranch + '_' + category + '_interactions') || '[]');
    // Filter out the interaction to be deleted
    interactions = interactions.filter(interaction => interaction.id !== interactionId);
    localStorage.setItem(currentBranch + '_' + category + '_interactions', JSON.stringify(interactions));

    loadCounts(); // Reload the counts for all categories, which also updates their display
    updateTotal(); // Explicitly update the total count displayed

    // If the all-day interactions are displayed, update that as well
    if (document.getElementById('allInteractionsContainer').textContent) {
        finalizeAllInteractions(); // Refresh the Finalize Day data if it's already been generated
    }
}
