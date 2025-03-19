# Online Java Compiler

A powerful, browser-based Java compiler with real-time code execution, AI assistance, and advanced code analysis features.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue)](https://online-java-compiler-s2jv.onrender.com/)

## 🎥 Demo Video

https://github.com/yourusername/java-compiler/assets/video/demo.mp4

## ✨ Features

### 🚀 Core Features
- Real-time Java code compilation and execution
- Advanced code editor with syntax highlighting
- Intelligent code autocompletion
- Smart code formatting
- Line numbers and bracket matching
- Code folding capabilities
- Error highlighting and reporting

### 🤖 AI Assistant Features
- Code explanation
- Improvement suggestions
- Debugging assistance
- Example code generation
- Complexity analysis

### ⌨️ Keyboard Shortcuts
- `Ctrl + Enter`: Run code
- `Ctrl + Shift + F`: Format code
- `Ctrl + L`: Clear editor
- `Ctrl + P`: Insert System.out.println()
- `Ctrl + /`: Toggle comment
- `Ctrl + Space`: Trigger autocompletion

## 🛠️ Technical Stack

- **Frontend**:
  - HTML5/CSS3
  - JavaScript
  - CodeMirror editor
  - Font Awesome icons
  - Marked.js for markdown rendering

- **Backend**:
  - Node.js
  - Express.js
  - Java Runtime Environment (JRE)
  - Java Development Kit (JDK)

- **Deployment**:
  - Docker containerization
  - Render cloud platform

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Java Development Kit (JDK 17)
- Docker (optional)

### Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/java-compiler.git
cd java-compiler
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Visit `http://localhost:3000` in your browser

### Docker Setup

1. Build the Docker image:
```bash
docker build -t java-compiler .
```

2. Run the container:
```bash
docker run -p 3000:3000 java-compiler
```

## 🔧 Configuration

The application can be configured through environment variables:

- `PORT`: Server port (default: 3000)
- `JAVA_HOME`: Java installation path
- `NODE_ENV`: Environment mode (development/production)

## 🔒 Security Features

- Code execution size limits
- Memory usage restrictions
- Execution timeout protection
- Secure file handling
- Input sanitization

## 💡 Usage Examples

### Basic Hello World
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

### Working with Arrays
```java
public class Main {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5};
        for (int num : numbers) {
            System.out.println(num);
        }
    }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Shashi Kumar Singh**
- Website: [Your Website]
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn]

## 🙏 Acknowledgments

- [CodeMirror](https://codemirror.net/) for the powerful code editor
- [Font Awesome](https://fontawesome.com/) for the beautiful icons
- [Render](https://render.com/) for hosting the application

## 📊 Project Status

The project is actively maintained and regularly updated with new features and improvements. Feel free to report issues or suggest enhancements through the GitHub issues page.

---
