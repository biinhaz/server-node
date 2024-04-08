import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { generateSlug } from "../utils/generate-slug"
import { prisma } from "../lib/prisma"
import { FastifyInstance } from "fastify"
import { BadRequest } from "./_errors/bad-request"

export async function registerForEvent(app: FastifyInstance) {
    app.
    withTypeProvider<ZodTypeProvider>().
        post('/events/:eventId/attendees', {
            schema: {
                summary: 'Register an attendee',
                tags: ['attendees'],
                body: z.object({
                    name: z.string().min(4),
                    email: z.string().email(),
                }),
                params: z.object({
                    eventId: z.string().uuid(),
                }),
            response: {
                201: z.object({
                    attendeeId: z.number(),
                })
            }
        }
    }, async (request, reply) => {
    const { eventId } = request.params
    const { name, email } = request.body

    const attendeeByEmail = await prisma.attendee.findUnique({
        where: {
            eventId_email: {
                email,
                eventId
            }
        }
    })

    if (attendeeByEmail !== null) {
        throw new BadRequest('Email já cadastrado nesse evento.')
    }

    const [ event, amoutOfAttendeesForEvents ] = await Promise.all([
        prisma.event.findUnique({
            where: {
            id: eventId,
        }
    }),

    prisma.attendee.count({
        where: {
            eventId,
        }
    }),

    ])

    const attendee = await prisma.attendee.create({
        data: {
            name,
            email,
            eventId,
        }
    })

    if(event?.maximumAttendees && amoutOfAttendeesForEvents >= event?.maximumAttendees) {
        throw new BadRequest('Vagas esgotadas para esse evento.')
    }

    return reply.status(201).send({ attendeeId: attendee.id })

})
}