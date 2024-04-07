import {
  generateSlug
} from "./chunk-677O5SV4.mjs";
import {
  prisma
} from "./chunk-JV6GRE7Y.mjs";
import {
  BadRequest
} from "./chunk-JRO4E4TH.mjs";

// src/routes/create-event.ts
import { z } from "zod";
async function createEvent(app) {
  app.withTypeProvider().post("/events", {
    schema: {
      summary: "Create an event",
      tags: ["events"],
      body: z.object({
        title: z.string().min(4),
        details: z.string().nullable(),
        maximumAtendees: z.number().int().positive().nullable()
      }),
      response: {
        201: z.object({
          eventId: z.string().uuid()
        })
      }
    }
  }, async (request, reply) => {
    const {
      title,
      details,
      maximumAtendees
    } = request.body;
    const slug = generateSlug(title);
    const eventsWithSameSlug = await prisma.event.findUnique({
      where: {
        slug
      }
    });
    if (eventsWithSameSlug !== null) {
      throw new BadRequest("J\xE1 existe um evento com esse t\xEDtulo.");
    }
    const event = await prisma.event.create({
      data: {
        title,
        details,
        maximumAtendees,
        slug
      }
    });
    return reply.status(201).send({ eventId: event.id });
  });
}

export {
  createEvent
};
