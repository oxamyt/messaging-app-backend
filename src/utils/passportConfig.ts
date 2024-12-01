import {
  Strategy as JwtStrategy,
  ExtractJwt,
  JwtFromRequestFunction,
} from "passport-jwt";
import { PrismaClient } from "@prisma/client";
import { PassportStatic } from "passport";
import "dotenv/config";

const prisma = new PrismaClient();
const jwtSecret = process.env.PASSPORT_SECRET!;

const opts: { jwtFromRequest: JwtFromRequestFunction; secretOrKey: string } = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

const jwtStrategy = new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: jwt_payload.sub },
    });

    if (user) {
      return done(null, user);
    } else {
      return done(null, false, { message: "User not found" });
    }
  } catch (err) {
    console.error("Error during JWT validation:", err);
    return done(err, false);
  }
});

export const initializePassport = (passport: PassportStatic) => {
  passport.use(jwtStrategy);
};
