require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const connectionString = process.env.DATABASE_URL;
console.log("DATABASE_URL:", connectionString ? "set" : "NOT SET");

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const generateAccessToken = (user) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    return jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '15m' }
    );
};

const generateRefreshToken = (user) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    return jwt.sign(
        { userId: user.id, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

const register = async (req, res) => {
    const { email, password } = req.body;
    console.log("Register attempt - email:", email, "password length:", password?.length);

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });

        res.status(201).json({
            id: user.id,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const JWT_SECRET = process.env.JWT_SECRET;
    console.log("Login attempt - email:", email, "password length:", password?.length);

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "User logged in successfully",
            accessToken,
            user: { id: user.id, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const refresh = async (req, res) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ error: "No refresh token provided" });
    }

    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET);

        if (decoded.type !== 'refresh') {
            return res.status(401).json({ error: "Invalid token type" });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true }
        });

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        const accessToken = generateAccessToken(user);

        return res.status(200).json({
            accessToken,
            user: { id: user.id, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("Refresh token error:", error);
        return res.status(401).json({ error: "Invalid refresh token" });
    }
}

const logout = async (req, res) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ error: "Invalid token" });
    }

    res.clearCookie('refreshToken');
    return res.status(200).json({ message: "Logged out successfully" });
}

const me = async (req, res) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true }
        });

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ error: "Invalid token" });
    }
}

module.exports = {
    register,
    login,
    refresh,
    logout,
    me
};
