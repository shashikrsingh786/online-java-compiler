document.addEventListener('DOMContentLoaded', () => {
    // Sample starter Java code
    const starterCode = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
        
        // Write your code here
    }
}`;

    // Initialize CodeMirror with enhanced options
    const codeEditor = CodeMirror.fromTextArea(document.getElementById('codeEditor'), {
        mode: 'text/x-java',
        theme: 'dracula',
        lineNumbers: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        fontSize: "14px",
        lineHeight: "1.5",
        indentWithTabs: false,
        lineWrapping: true,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        styleActiveLine: true,
        extraKeys: {
            "Ctrl-Space": "autocomplete",
            "Tab": function(cm) {
                if (cm.somethingSelected()) {
                    cm.indentSelection("add");
                } else {
                    cm.replaceSelection("    ", "end", "+input");
                }
            },
            "Ctrl-/": "toggleComment",
            "Ctrl-J": function(cm) {
                // Auto-trigger hints as user types
                cm.showHint({hint: CodeMirror.hint.java, completeSingle: false});
            },
            // Add shortcut for System.out.println()
            "Ctrl-P": function(cm) {
                cm.replaceSelection("System.out.println();");
                // Move cursor between the parentheses
                const cursor = cm.getCursor();
                cm.setCursor({line: cursor.line, ch: cursor.ch - 2});
            }
        },
        hintOptions: {
            hint: CodeMirror.hint.java,
            completeSingle: false
        },
        viewportMargin: Infinity
    });
    
    // Set initial content
    codeEditor.setValue(starterCode);
    codeEditor.focus();
    
    // Track cursor position
    const lineColDisplay = document.getElementById('line-col');
    codeEditor.on("cursorActivity", function() {
        if (lineColDisplay) {
            const cursor = codeEditor.getCursor();
            lineColDisplay.textContent = `Line: ${cursor.line + 1}, Col: ${cursor.ch + 1}`;
        }
    });
    
    // UI elements
    const compileButton = document.getElementById('compileButton');
    const formatButton = document.getElementById('formatButton');
    const clearButton = document.getElementById('clearButton');
    const output = document.getElementById('output');
    const loader = document.getElementById('loader');
    const statusDisplay = document.getElementById('status');
    const statusIndicator = document.querySelector('.status-indicator');
    const copyOutputBtn = document.getElementById('copyOutputBtn');
    const clearOutputBtn = document.getElementById('clearOutputBtn');
    const toggleWidthBtn = document.getElementById('toggleWidth');
    const executionTimeDisplay = document.getElementById('execution-time');
    const complexityBadge = document.getElementById('complexity-badge');
    const complexityText = document.getElementById('complexity-text');
    const complexityLoader = document.getElementById('complexity-loader');
    
    let isExpanded = false;
    
    // Update status with icon
    function updateStatus(message, type = 'default') {
        if (!statusDisplay) return;
        
        statusDisplay.innerHTML = `<i class="fas fa-circle status-indicator"></i> ${message}`;
        
        // Update status indicator color
        const indicator = statusDisplay.querySelector('.status-indicator');
        if (!indicator) return;
        
        if (type === 'success') {
            indicator.style.color = 'var(--success-color)';
        } else if (type === 'error') {
            indicator.style.color = 'var(--danger-color)';
        } else if (type === 'working') {
            indicator.style.color = 'var(--warning-color)';
        } else {
            indicator.style.color = 'var(--success-color)';
        }
    }
    
    // Compile and run code
    compileButton.addEventListener('click', () => {
        updateStatus('Compiling...', 'working');
        output.textContent = 'Compiling...';
        output.className = '';
        loader.style.display = 'block';
        
        // Reset and hide complexity information
        complexityBadge.classList.add('hidden');
        executionTimeDisplay.innerHTML = '<i class="fas fa-clock"></i> --ms';
        
        const startTime = performance.now();
        
        fetch('/compile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: codeEditor.getValue() })
        })
        .then(response => response.json())
        .then(data => {
            loader.style.display = 'none';
            const executionTime = Math.round(performance.now() - startTime);
            updateExecutionTime(executionTime);
            
            if (data.error) {
                updateStatus('Compilation Failed', 'error');
                output.textContent = 'Error:\n' + data.error;
                output.className = 'error';
            } else {
                updateStatus('Execution Successful', 'success');
                output.textContent = data.output || 'Program executed with no output.';
                output.className = 'success';
                
                // Start complexity analysis if compilation was successful
                analyzeCodeComplexity();
            }
        })
        .catch(err => {
            loader.style.display = 'none';
            updateStatus('Error', 'error');
            output.textContent = 'An unexpected error occurred.';
            output.className = 'error';
            console.error(err);
        });
    });
    
    // Simple code formatting
    formatButton.addEventListener('click', () => {
        const totalLines = codeEditor.lineCount();
        for (let i = 0; i < totalLines; i++) {
            codeEditor.indentLine(i);
        }
        updateStatus('Code formatted', 'success');
        
        // Add animation effect
        formatButton.classList.add('active');
        setTimeout(() => {
            formatButton.classList.remove('active');
        }, 300);
    });
    
    // Clear code and output
    clearButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the code?')) {
            codeEditor.setValue('');
            output.textContent = '// Your code output will appear here';
            output.className = '';
            updateStatus('Ready');
        }
    });
    
    // Copy output to clipboard
    copyOutputBtn.addEventListener('click', () => {
        const outputText = output.textContent;
        navigator.clipboard.writeText(outputText).then(() => {
            // Show temporary success message
            const originalHTML = copyOutputBtn.innerHTML;
            copyOutputBtn.innerHTML = '<i class="fas fa-check"></i>';
            copyOutputBtn.style.color = 'var(--success-color)';
            
            setTimeout(() => {
                copyOutputBtn.innerHTML = originalHTML;
                copyOutputBtn.style.color = '';
            }, 1500);
        });
    });
    
    // Clear output
    clearOutputBtn.addEventListener('click', () => {
        output.textContent = '// Your code output will appear here';
        output.className = '';
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter to compile and run
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            compileButton.click();
        }
        // Ctrl+L to clear
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            clearButton.click();
        }
        // Ctrl+Shift+F to format
        if (e.ctrlKey && e.shiftKey && e.key === 'F') {
            e.preventDefault();
            formatButton.click();
        }
    });
    
    // Initialize
    updateStatus('Ready');
    
    // Add resize functionality
    let isResizing = false;
    let startX;
    let startWidth;
    
    // Adjust panel sizes on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
            // Reset any inline styles that might have been set
            document.querySelector('.code-panel').style.width = '';
            document.querySelector('.output-panel').style.width = '';
        }
    });

    // Add auto-complete on keyup with slight delay to avoid performance issues
    let autoCompleteTimeout;
    codeEditor.on("keyup", function(cm, event) {
        // Simplify the condition to avoid errors
        const isLetter = event.keyCode >= 65 && event.keyCode <= 90;
        const isDot = event.keyCode === 190;
        const isDelete = event.keyCode === 8;
        
        if (!cm.somethingSelected() && (isLetter || isDot || isDelete)) {
            clearTimeout(autoCompleteTimeout);
            autoCompleteTimeout = setTimeout(() => {
                try {
                    cm.showHint({
                        hint: CodeMirror.hint.java, 
                        completeSingle: false,
                        alignWithWord: true
                    });
                } catch(e) {
                    console.log("Hint error:", e);
                }
            }, 150);
        }
    });

    // Initialize AI Assistant with Gemini API key
    const aiAssistant = new AIAssistant('AIzaSyC3fWERUnoNUrfOws4h36rrZ0fbsuVA1ws');
    const aiFloatingBtn = document.getElementById('aiFloatingBtn');
    const aiModal = document.getElementById('aiModal');
    const aiModalBody = document.getElementById('aiModalBody');
    const aiModalTitle = document.getElementById('aiModalTitle');
    const aiModalClose = document.getElementById('aiModalClose');
    const explainCodeBtn = document.getElementById('explainCodeBtn');
    const suggestImprovementsBtn = document.getElementById('suggestImprovementsBtn');
    const debugHelpBtn = document.getElementById('debugHelpBtn');
    const generateExampleBtn = document.getElementById('generateExampleBtn');
    const complexityAnalysisBtn = document.getElementById('complexityAnalysisBtn');

    // Function to show/hide AI modal
    function openAiModal(title) {
        aiModalTitle.textContent = title;
        aiModalBody.innerHTML = `<div class="bars-loader">
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                </div>`;
        aiModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
    }

    function closeAiModal() {
        aiModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Close modal when clicking the X or outside the modal
    aiModalClose.addEventListener('click', closeAiModal);
    aiModal.addEventListener('click', (e) => {
        if (e.target === aiModal) closeAiModal();
    });

    // Function to display AI response
    function displayAIResponse(response) {
        // Use the marked library to render markdown
        aiModalBody.innerHTML = marked.parse(response);
        
        // Add syntax highlighting to code blocks
        document.querySelectorAll('pre code').forEach((block) => {
            block.className = 'language-java';
            
            // Add a "Copy" button to code blocks
            const copyBtn = document.createElement('button');
            copyBtn.className = 'code-copy-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.title = 'Copy code';
            copyBtn.onclick = function() {
                navigator.clipboard.writeText(block.textContent)
                    .then(() => {
                        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                        setTimeout(() => {
                            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                        }, 2000);
                    });
            };
            
            // Wrap the pre in a container div
            const preElement = block.parentElement;
            const codeContainer = document.createElement('div');
            codeContainer.className = 'code-container';
            preElement.parentNode.insertBefore(codeContainer, preElement);
            codeContainer.appendChild(preElement);
            codeContainer.appendChild(copyBtn);
        });
        
        // If the response contains a code block, offer to use it
        const codeMatch = response.match(/```java\n([\s\S]*?)```/);
        if (codeMatch && codeMatch[1]) {
            const useExampleBtn = document.createElement('button');
            useExampleBtn.textContent = 'Use This Code';
            useExampleBtn.className = 'primary-btn';
            useExampleBtn.style.marginTop = '20px';
            useExampleBtn.addEventListener('click', () => {
                if (confirm('This will replace your current code. Continue?')) {
                    codeEditor.setValue(codeMatch[1].trim());
                    closeAiModal();
                }
            });
            aiModalBody.appendChild(useExampleBtn);
        }
    }

    // AI button event listeners
    explainCodeBtn.addEventListener('click', async () => {
        const code = codeEditor.getValue();
        if (code.trim() === '') {
            alert('Please write some code first.');
            return;
        }
        
        openAiModal('Code Explanation');
        try {
            const explanation = await aiAssistant.explainCode(code);
            displayAIResponse(explanation);
        } catch (error) {
            aiModalBody.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    });

    suggestImprovementsBtn.addEventListener('click', async () => {
        const code = codeEditor.getValue();
        if (code.trim() === '') {
            alert('Please write some code first.');
            return;
        }
        
        openAiModal('Code Improvements');
        try {
            const suggestions = await aiAssistant.suggestImprovements(code);
            displayAIResponse(suggestions);
        } catch (error) {
            aiModalBody.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    });

    debugHelpBtn.addEventListener('click', async () => {
        const code = codeEditor.getValue();
        const outputText = output.textContent;
        
        if (code.trim() === '') {
            alert('Please write some code first.');
            return;
        }
        
        openAiModal('Debug Help');
        try {
            const debugHelp = await aiAssistant.debugHelp(code, outputText);
            displayAIResponse(debugHelp);
        } catch (error) {
            aiModalBody.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    });

    generateExampleBtn.addEventListener('click', async () => {
        // Prompt user for a topic
        const topic = prompt('What Java topic would you like an example of?', 'arrays');
        if (!topic) return;
        
        openAiModal(`Java Example: ${topic}`);
        try {
            const example = await aiAssistant.generateExample(topic);
            displayAIResponse(example);
        } catch (error) {
            aiModalBody.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    });

    complexityAnalysisBtn.addEventListener('click', async () => {
        const code = codeEditor.getValue();
        if (code.trim() === '') {
            alert('Please write some code first.');
            return;
        }
        
        openAiModal('Code Complexity Analysis');
        try {
            aiModalBody.innerHTML = '<div class="ai-loading"><div class="ai-spinner"></div></div>';
            
            const result = await aiAssistant.analyzeComplexity(code);
            
            let analysisHtml = `
                <h1>Code Complexity Analysis</h1>
                <div class="complexity-summary">
                    <div class="complexity-item">
                        <h3>Time Complexity</h3>
                        <div class="complexity-value ${getComplexityClass(result.timeComplexity)}">${result.timeComplexity}</div>
                    </div>
                    <div class="complexity-item">
                        <h3>Space Complexity</h3>
                        <div class="complexity-value ${getComplexityClass(result.spaceComplexity)}">${result.spaceComplexity}</div>
                    </div>
                </div>
                <h2>Explanation</h2>
                <p>${result.explanation}</p>
                
                <h2>What does this mean?</h2>
                <p>Time complexity describes how the runtime grows as the input size increases. Space complexity describes memory usage growth.</p>
                <ul>
                    <li><strong>O(1)</strong>: Constant - Excellent! Runtime/memory doesn't increase with input size.</li>
                    <li><strong>O(log n)</strong>: Logarithmic - Very good! Increases slowly as input grows.</li>
                    <li><strong>O(n)</strong>: Linear - Good. Runtime/memory increases proportionally with input.</li>
                    <li><strong>O(n log n)</strong>: Log-linear - Decent. Common in efficient sorting algorithms.</li>
                    <li><strong>O(n²)</strong>: Quadratic - Caution! May become slow with larger inputs.</li>
                    <li><strong>O(2^n), O(n!)</strong>: Exponential/Factorial - Warning! Only suitable for very small inputs.</li>
                </ul>
            `;
            
            aiModalBody.innerHTML = analysisHtml;
        } catch (error) {
            aiModalBody.innerHTML = `<p class="error">Error analyzing complexity: ${error.message}</p>`;
        }
    });

    // Helper function to determine CSS class for complexity
    function getComplexityClass(complexity) {
        if (complexity.includes('1') || complexity.includes('log')) {
            return 'good-complexity';
        } else if (complexity.includes('n ') || complexity.includes('n)')) {
            return 'normal-complexity';
        } else if (complexity.includes('n²') || complexity.includes('n^2') || complexity.includes('n log n')) {
            return 'warning-complexity';
        } else {
            return 'bad-complexity';
        }
    }

    // Toggle AI options with click as well (for mobile)
    aiFloatingBtn.querySelector('.ai-icon').addEventListener('click', () => {
        aiFloatingBtn.classList.toggle('active');
    });

    // Replace the existing toggle width functionality with this improved version
    toggleWidthBtn.addEventListener('click', () => {
        const codePanel = document.querySelector('.code-panel');
        const outputPanel = document.querySelector('.output-panel');
        
        isExpanded = !isExpanded;
        
        if (isExpanded) {
            codePanel.classList.add('expanded');
            outputPanel.classList.add('collapsed');
            toggleWidthBtn.innerHTML = '<i class="fas fa-compress"></i>';
            toggleWidthBtn.title = "Restore split view";
        } else {
            codePanel.classList.remove('expanded');
            outputPanel.classList.remove('collapsed');
            toggleWidthBtn.innerHTML = '<i class="fas fa-expand"></i>';
            toggleWidthBtn.title = "Expand code editor";
        }
        
        // Ensure CodeMirror refreshes properly by using a longer timeout
        // and triggering window resize event to force recalculation
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            codeEditor.refresh();
            
            // Sometimes a second refresh is needed after elements have fully adjusted
            setTimeout(() => {
                codeEditor.refresh();
            }, 200);
        }, 100);
    });

    // Add this after initialization to set custom styling
    codeEditor.getWrapperElement().style.fontSize = '14px';
    codeEditor.refresh();

    // Add this function to update the execution time
    function updateExecutionTime(timeMs) {
        executionTimeDisplay.innerHTML = `<i class="fas fa-clock"></i> ${timeMs}ms`;
        executionTimeDisplay.style.color = timeMs > 1000 ? 'var(--warning-color)' : 'var(--success-color)';
    }

    // Add this function to update the complexity display
    function updateComplexityDisplay(timeComplexity, spaceComplexity) {
        // Determine complexity level for styling
        let complexityLevel = 'good';
        
        if (timeComplexity.includes('n²') || 
            timeComplexity.includes('n^2') || 
            timeComplexity.includes('n*n')) {
            complexityLevel = 'warning';
        } else if (
            timeComplexity.includes('n³') || 
            timeComplexity.includes('n^3') || 
            timeComplexity.includes('2^n') || 
            timeComplexity.includes('n!')) {
            complexityLevel = 'bad';
        }
        
        // Update the display
        complexityText.textContent = `${timeComplexity} / ${spaceComplexity}`;
        complexityBadge.className = complexityLevel;
        complexityLoader.classList.add('hidden');
        complexityBadge.classList.remove('hidden');
        
        // Show tooltip with full details
        complexityBadge.title = `Time: ${timeComplexity}, Space: ${spaceComplexity}`;
    }

    // Add a function to analyze code complexity
    function analyzeCodeComplexity() {
        const code = codeEditor.getValue();
        
        // Show loader for complexity analysis
        complexityLoader.classList.remove('hidden');
        
        // Request complexity analysis from AI
        aiAssistant.analyzeComplexity(code)
            .then(result => {
                updateComplexityDisplay(
                    result.timeComplexity, 
                    result.spaceComplexity
                );
            })
            .catch(error => {
                console.error('Complexity analysis error:', error);
                complexityLoader.classList.add('hidden');
            });
    }

    // Add this code right after your CodeMirror initialization
    window.addEventListener('resize', () => {
        // Force CodeMirror to update its dimensions when window is resized
        setTimeout(() => codeEditor.refresh(), 100);
    });
});