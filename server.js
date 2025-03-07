const express = require('express');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf'); // Use rimraf for synchronous directory removal
const { execSync } = require('child_process');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json()); // Parse JSON request bodies

app.post('/compile', async (req, res) => {
    const code = req.body.code;

    // Basic Security Check: Limit code size
    if (code.length > 10000) {
        return res.status(400).json({ error: 'Code is too long!' });
    }

    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 10000);
    // Use a subdirectory to avoid filename collisions
    const folderName = `temp_${timestamp}_${randomId}`;
    const folderPath = path.join(__dirname, folderName);
    const filePath = path.join(folderPath, 'Main.java'); // Always use Main.java

    try { // Use a try/catch block for better error handling
        fs.mkdirSync(folderPath); // Synchronous directory creation
        fs.writeFileSync(filePath, code); // Synchronous file writing

        // const compile = spawn('javac', [filePath]);
        const compile = spawn('javac', ['-J-Xmx128m', filePath]); // Limit Java heap size

        let compileError = '';

        compile.stderr.on('data', (data) => {
            compileError += data.toString();
        });

        const compileResult = await new Promise((resolve) => { // Await compilation
            compile.on('close', resolve);
        });

        if (compileResult !== 0) {
            rimraf.sync(folderPath); // Synchronous directory removal
            return res.json({ error: compileError });
        }

        // const run = spawn('java', ['-cp', folderPath, 'Main']); // Use -cp
        const run = spawn('java', ['-XX:+TieredCompilation', '-XX:TieredStopAtLevel=1', '-cp', folderPath, 'Main']); // Fast execution mode

        let output = '';
        let runError = '';

        run.stdout.on('data', (data) => {
            output += data.toString();
        });

        run.stderr.on('data', (data) => {
            runError += data.toString();
        });

        const runResult = await new Promise((resolve) => { // Await execution
            const timeout = setTimeout(() => {
                run.kill();
                resolve(-1); // Resolve with -1 to indicate timeout
            }, 5000);

            run.on('close', (code) => {
                clearTimeout(timeout); // Clear the timeout if the process finishes first
                resolve(code);
            });
        });

        rimraf.sync(folderPath); // Synchronous directory removal

        if (runResult === -1) {
            return res.json({ error: 'Execution timed out.' });
        }

        if (runResult !== 0) {
            return res.json({ error: runError });
        }

        res.json({ output: output });

    } catch (error) {
        console.error("An error occurred:", error);
        // Ensure cleanup even if an unexpected error occurs
        if (fs.existsSync(folderPath)) {
            rimraf.sync(folderPath);
        }
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});

// Add this function for Java verification
const verifyJava = () => {
  try {
    console.log('Checking Java installation...', process.env.JAVA_HOME, process.env.PORT);
    
    
    
    return true;
  } catch (error) {
    console.error('⚠️ Java verification failed:', error.message);
    return false;
  }
};

// Modify your server.listen to include verification
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  if (!verifyJava()) {
    console.error('⚠️ WARNING: Java is not properly configured');
  }
});