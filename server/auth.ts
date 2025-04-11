import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, RegisterUser, loginUserSchema, registerUserSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

declare global {
  namespace Express {
    // Extend Express User interface with our User type
    interface User {
      id: number;
      username: string;
      password: string;
      email: string;
      fullName: string;
      role: 'user' | 'agent' | 'admin';
      subscriptionTier: 'free' | 'premium' | 'enterprise';
      subscriptionExpiresAt?: Date | null;
      profileImage?: string | null;
      bio?: string | null;
      phone?: string | null;
      createdAt: Date;
      updatedAt: Date;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  // Check if we have a plain text password (temporary for testing)
  if (!stored.includes('.')) {
    return supplied === stored;
  }
  
  // Handle properly hashed passwords
  try {
    const [hashed, salt] = stored.split(".");
    if (!salt) {
      console.error("Invalid password format, no salt found");
      return false;
    }
    
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "foundation-realestate-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Add Firebase authentication handler
  app.post("/api/firebase-auth", async (req, res, next) => {
    try {
      // Extract Firebase user data
      const { firebaseUid, email, displayName, photoURL } = req.body;
      
      if (!firebaseUid || !email) {
        return res.status(400).json({ message: "Firebase UID and email are required" });
      }
      
      console.log("Processing Firebase authentication for:", email);
      
      // Check if user already exists by email
      let user = await storage.getUserByEmail(email);
      let isNewUser = false;
      
      if (user) {
        // User exists - update Firebase info
        console.log("Firebase user exists, updating:", email);
        user = await storage.updateUser(user.id, {
          firebaseUid: firebaseUid,
          profileImage: user.profileImage || photoURL || null,
          lastLoginAt: new Date()
        });
      } else {
        // Create new user
        isNewUser = true;
        console.log("Creating new user from Firebase:", email);
        
        // Generate a secure password that the user doesn't need to know
        const securePassword = await hashPassword(`firebase_${firebaseUid}`);
        
        // Create user
        user = await storage.createUser({
          email,
          username: email.split('@')[0] + '_' + Math.floor(Math.random() * 1000), // Generate random username
          password: securePassword,
          fullName: displayName || email.split('@')[0],
          profileImage: photoURL || null,
          role: 'user', 
          subscriptionTier: 'free',
        });
      }
      
      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        
        return res.status(isNewUser ? 201 : 200).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Firebase auth error:", error);
      next(error);
    }
  });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // Create a safe user object
        const safeUser = {
          ...user,
          // Add virtual properties for compatibility with existing code
          subscriptionStatus: 'active', // Virtual property
          stripeCustomerId: 'cust_mock', // Virtual property
          stripeSubscriptionId: 'sub_mock', // Virtual property
        };
        
        return done(null, safeUser);
      } catch (error) {
        console.error("Auth error:", error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      
      // Create a safe user object
      const safeUser = {
        ...user,
        // Add virtual properties for compatibility with existing code
        subscriptionStatus: 'active', // Virtual property
        stripeCustomerId: 'cust_mock', // Virtual property
        stripeSubscriptionId: 'sub_mock', // Virtual property
      };
      
      done(null, safeUser);
    } catch (error) {
      console.error("Deserialize error:", error);
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate request body
      const validatedData = registerUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Create user with hashed password
      const hashedPassword = await hashPassword(validatedData.password);
      const userData: RegisterUser = {
        ...validatedData,
        password: hashedPassword,
      };
      
      const user = await storage.createUser(userData);

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: fromZodError(error).message 
        });
      }
      if (error instanceof Error && error.message === 'Email already exists') {
        return res.status(400).json({ message: error.message });
      }
      console.error("Registration error:", error);
      next(error);
    }
  });

  // Track login attempts per IP
  const loginAttempts = new Map<string, { count: number, lastAttempt: number }>();
  const MAX_ATTEMPTS = 5;
  const COOLDOWN_PERIOD = 30000; // 30 seconds

  app.post("/api/login", (req, res, next) => {
    const ip = req.ip || "unknown";
    const now = Date.now();
    
    // Get or initialize attempt tracker for this IP
    const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
    
    // If in cooldown period, reject immediately
    if (attempts.count >= MAX_ATTEMPTS && (now - attempts.lastAttempt) < COOLDOWN_PERIOD) {
      console.log(`[RATE LIMIT] Blocking login attempt from ${ip}. Too many attempts.`);
      return res.status(429).json({ 
        message: "Too many login attempts. Please try again later.",
        retryAfter: Math.ceil((COOLDOWN_PERIOD - (now - attempts.lastAttempt)) / 1000)
      });
    }
    
    // Update attempt counter
    attempts.count = (now - attempts.lastAttempt > COOLDOWN_PERIOD) ? 1 : attempts.count + 1;
    attempts.lastAttempt = now;
    loginAttempts.set(ip, attempts);
    
    // If this is an automated request with empty credentials, reject it
    if (!req.body.username && !req.body.password) {
      console.log(`[SECURITY] Rejecting empty credential login attempt from ${ip}`);
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    // Proceed with authentication
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        // Reset attempts on successful login
        loginAttempts.set(ip, { count: 0, lastAttempt: now });
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Return user without password
    const { password, ...userWithoutPassword } = req.user as User;
    res.json(userWithoutPassword);
  });

  // User preferences update
  app.patch("/api/user/preferences", (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const { preferredLanguage } = req.body;
      
      if (preferredLanguage) {
        // Update user's language preference
        storage.updateUser(req.user!.id, { 
          preferredLanguage 
        }).then(updatedUser => {
          if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
          }
          
          // Return user without password
          const { password, ...userWithoutPassword } = updatedUser;
          return res.json(userWithoutPassword);
        });
      } else {
        return res.status(400).json({ message: "No valid preference updates provided" });
      }
    } catch (error) {
      console.error("Error updating user preferences:", error);
      next(error);
    }
  });
}
