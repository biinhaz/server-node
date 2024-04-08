import {
  prisma
} from "./chunk-JV6GRE7Y.mjs";
import {
  BadRequest
} from "./chunk-JRO4E4TH.mjs";

// src/routes/register-for-event.ts
import { z } from "zod";
async function registerForEvent(app) {
  app.withTypeProvider().post("/events/:eventId/attendees", {
    schema: {
      summary: "Register an attendee",
      tags: ["attendees"],
      body: z.object({
        name: z.string().min(4),
        email: z.string().email()
      }),
      params: z.object({
        eventId: z.string().uuid()
      }),
      response: {
        201: z.object({
          attendeeId: z.number()
        })
      }
    }
  }, async (request, reply) => {
    const { eventId } = request.params;
    const { name, email } = request.body;
    const attendeeByEmail = await prisma.attendee.findUnique({
      where: {
        eventId_email: {
          email,
          eventId
        }
      }
    });
    if (attendeeByEmail !== null) {
      throw new BadRequest("Email j\xE1 cadastrado nesse evento.");
    }
    const [event, amoutOfAttendeesForEvents] = await Promise.all([
      prisma.event.findUnique({
        where: {
          id: eventId
        }
      }),
      prisma.attendee.count({
        where: {
          eventId
        }
      })
    ]);
    const attendee = await prisma.attendee.create({
      data: {
        name,
        email,
        eventId
      }
    });
    if (event?.maximumAttendees && amoutOfAttendeesForEvents >= event?.maximumAttendees) {
      throw new BadRequest("Vagas esgotadas para esse evento.");
    }
    return reply.status(201).send({ attendeeId: attendee.id });
  });
}

export {
  registerForEvent
};
