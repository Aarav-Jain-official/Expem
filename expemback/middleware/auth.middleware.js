// middleware/auth.middleware.js - IMPROVED VERSION
import { ApiError } from "../utils/apierr.js";
import { asyncHandler } from "../utils/asynch.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Enhanced token extraction with better error messages
        let token = req.cookies?.accessToken || 
                   req.header("Authorization")?.replace("Bearer ", "");

        console.log('🔐 Auth check - Token present:', !!token);
        console.log('🔐 Headers:', req.headers.authorization ? 'Authorization header found' : 'No auth header');
        console.log('🔐 Cookies:', req.cookies?.accessToken ? 'Access token cookie found' : 'No access token cookie');

        if (!token) {
            console.log('❌ No token provided');
            throw new ApiError(401, "Access token is required");
        }

        // Verify environment variable exists
        if (!process.env.ACCESS_TOKEN_SECRET) {
            console.error('❌ ACCESS_TOKEN_SECRET not found in environment variables');
            throw new ApiError(500, "Server configuration error");
        }

        console.log('🔐 Verifying token...');
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log('✅ Token decoded successfully:', { 
            id: decodedToken.id || decodedToken._id,
            exp: decodedToken.exp 
        });

        // Handle both 'id' and '_id' properties from different JWT implementations
        const userId = decodedToken.id || decodedToken._id;
        
        if (!userId) {
            console.log('❌ No user ID in token payload');
            throw new ApiError(401, "Invalid token payload");
        }

        console.log('🔐 Looking up user:', userId);
        const user = await User.findById(userId).select("-password -refreshToken");

        if (!user) {
            console.log('❌ User not found in database:', userId);
            throw new ApiError(401, "Invalid access token - user not found");
        }

        console.log('✅ User authenticated successfully:', user.email || user.username);
        req.user = user;
        next();
        
    } catch (error) {
        console.error('❌ JWT verification failed:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, "Invalid access token format");
        } else if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, "Access token has expired");
        } else if (error instanceof ApiError) {
            throw error; // Re-throw our custom errors
        } else {
            throw new ApiError(401, "Authentication failed");
        }
    }
});

// Optional: Create a middleware for optional authentication
export const optionalJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || 
                     req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            // No token provided, continue without user
            req.user = null;
            return next();
        }

        // If token exists, verify it
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userId = decodedToken.id || decodedToken._id;
        
        if (userId) {
            const user = await User.findById(userId).select("-password -refreshToken");
            req.user = user || null;
        }
        
        next();
    } catch (error) {
        // On error, continue without user (don't throw)
        console.log('⚠️ Optional JWT verification failed, continuing without auth');
        req.user = null;
        next();
    }
});
