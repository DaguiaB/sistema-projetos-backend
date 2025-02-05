const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const multer = require("multer");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*"
    }
});

app.use(cors());
app.use(express.json());

const users = [{ username: "admin", password: "1234" }];
const comments = [];
const projects = [];

// Configuração do upload de arquivos
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Autenticação de login
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// Comentários em tempo real
io.on("connection", (socket) => {
    socket.on("mensagem", (msg) => {
        comments.push(msg);
        io.emit("mensagem", msg);
    });
});

// Upload de projetos
app.post("/projetos", upload.single("arquivo"), (req, res) => {
    const { nome } = req.body;
    const arquivo = req.file.filename;
    projects.push({ nome, arquivo, status: "Fase Inicial" });
    res.json({ success: true });
});

// Servir arquivos da pasta uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
