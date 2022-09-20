import express from "express";
import cors from "cors";

import { PrismaClient } from "@prisma/client";
import { convertHoursStringToMinutes } from "./utils/convert-hours-string-to-minutes";
import { convertMinutesToHoursString } from "./utils/convert-minutes-string-to-hours";

const app = express();
const prisma = new PrismaClient({
    log: ["query"],
});

app.use(express.json());
app.use(cors());

/**
 * @description List games
 */
app.get("/games", async (request, response) => {
    const games: any = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true,
                },
            },
        },
    });
    return response.status(200).json(games);
});

/**
 * @description Get Games By Ad
 */
app.get("/ads/:id/games", async (request, response) => {
    const gameId: any = request.params.id;
    const ads: any = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hoursStart: true,
            hoursEnd: true,
        },
        where: {
            gameId: gameId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return response.status(200).json(
        ads.map((ad: any) => {
            return {
                ...ad,
                weekDays: ad.weekDays.split(","),
                hoursStart: convertMinutesToHoursString(ad.hoursStart),
                hoursEnd: convertMinutesToHoursString(ad.hoursEnd),
            };
        })
    );
});

/**
 * @description Get Discord By Ad
 */
app.get("/ads/:id/discord", async (request, response) => {
    const adId: any = request.params.id;
    const ad: any = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true,
        },
        where: {
            id: adId,
        },
    });
    return response.status(200).json({
        discord: ad.discord,
    });
});

/**
 * @description List ads
 */
app.get("/ads", async (request, response) => {
    const ads: any = await prisma.ad.findMany({
        include: {
            game: true,
        },
    });
    return response.status(200).json(ads);
});

/**
 * @description Create Ad
 */
app.post("/games/:id/ads", async (request, response) => {
    const gameId: any = request.params.id;
    const body: any = request.body;
    console.log(body);

    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(","),
            hoursStart: convertHoursStringToMinutes(body.hoursStart),
            hoursEnd: convertHoursStringToMinutes(body.hoursEnd),
            useVoiceChannel: body.useVoiceChannel,
        },
    });
    return response.status(201).json(ad);
});

/**
 * @description Get Game
 */
app.get("/games/:id/ads", async (request, response) => {
    const gameId: any = request.params.id;
    const ads: any = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hoursStart: true,
            hoursEnd: true,
        },
        where: {
            gameId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return response.status(200).json(ads);
});

app.listen(3333);
