import { prisma } from '../src/lib/prisma';

async function seed() {
    await prisma.event.create({
        data: {
            id: 'f1dc56a2-2490-4db8-94ad-8c4d71fdcfcc',
            title: 'Niver da Bia 21',
            slug: 'niver-da-bia-21',
            details: 'aniversário de 21 anos da Bia',
            maximumAtendees: 10,

        }
    })
}

seed().then(() => {
    console.log('Database Seeded!')
    prisma.$disconnect()
})